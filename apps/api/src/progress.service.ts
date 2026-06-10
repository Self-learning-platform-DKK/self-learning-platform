import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { xpToLevel } from '@sql-tutor/shared';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [profile, progress, paths] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.userProgress.findMany({
        where: { userId, completed: true },
        include: { challenge: true },
      }),
      this.prisma.learningPath.findMany({
        where: { isPublished: true },
        include: { modules: { include: { challenges: true } } },
      }),
    ]);

    const completedChallengeIds = new Set(progress.map((p) => p.challengeId));
    const pathProgress = paths.map((path) => {
      let total = 0;
      let done = 0;
      for (const m of path.modules) {
        total += m.challenges.length;
        for (const c of m.challenges) {
          if (completedChallengeIds.has(c.id)) {
            done++;
          }
        }
      }
      return { slug: path.slug, title: path.title, completed: done, total, percent: total ? Math.round((done / total) * 100) : 0 };
    });


    return {
      xp: profile?.xp ?? 0,
      level: profile?.level ?? 1,
      streak: profile?.streak ?? 0,
      completedChallenges: progress.length,
      completedSlugs: progress.map((p) => p.challenge.slug),
      pathProgress,
      resume: profile?.resumeTrack
        ? { track: profile.resumeTrack, challengeSlug: profile.resumeChallengeSlug }
        : null,
    };
  }

  async markComplete(userId: string, challengeId: string, xpEarned: number, hintsUsed: number) {
    const existing = await this.prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });

    if (existing?.completed) {
      return { alreadyCompleted: true, xpEarned: 0 };
    }

    await this.prisma.userProgress.upsert({
      where: { userId_challengeId: { userId, challengeId } },
      create: { userId, challengeId, completed: true, completedAt: new Date(), bestXp: xpEarned, hintsUsed, attempts: 1 },
      update: { completed: true, completedAt: new Date(), bestXp: xpEarned, hintsUsed, attempts: { increment: 1 } },
    });

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        xp: { increment: xpEarned },
        lastActive: new Date(),
      },
    });

    const level = xpToLevel(profile.xp);
    if (level !== profile.level) {
      await this.prisma.profile.update({ where: { userId }, data: { level } });
    }

    await this.updateStreak(userId);

    return { alreadyCompleted: false, xpEarned, totalXp: profile.xp + xpEarned, level };
  }

  async saveResume(userId: string, track: string, challengeSlug: string) {
    await this.prisma.profile.update({
      where: { userId },
      data: { resumeTrack: track, resumeChallengeSlug: challengeSlug },
    });
  }

  private async updateStreak(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = profile.lastActive?.toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = profile.streak;
    if (last === yesterday) streak += 1;
    else if (last !== today) streak = 1;
    await this.prisma.profile.update({ where: { userId }, data: { streak, lastActive: new Date() } });
  }
}
