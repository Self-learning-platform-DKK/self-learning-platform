import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    const [all, earned] = await Promise.all([
      this.prisma.achievement.findMany(),
      this.prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    ]);
    const earnedIds = new Set(earned.map((e) => e.achievementId));
    return all.map((a) => ({
      ...a,
      earned: earnedIds.has(a.id),
      earnedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt ?? null,
    }));
  }

  async evaluateOnComplete(userId: string) {
    const [completed, profile, earned] = await Promise.all([
      this.prisma.userProgress.count({ where: { userId, completed: true } }),
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);
    const earnedSlugs = new Set(
      (await this.prisma.achievement.findMany({ where: { id: { in: earned.map((e) => e.achievementId) } } })).map((a) => a.slug)
    );

    const unlocked: string[] = [];

    if (completed >= 1 && !earnedSlugs.has('first-query')) {
      await this.award(userId, 'first-query');
      unlocked.push('first-query');
    }
    if ((profile?.streak ?? 0) >= 7 && !earnedSlugs.has('streak-7')) {
      await this.award(userId, 'streak-7');
      unlocked.push('streak-7');
    }

    return unlocked;
  }

  private async award(userId: string, slug: string) {
    const achievement = await this.prisma.achievement.findUnique({ where: { slug } });
    if (!achievement) return;
    await this.prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    if (achievement.xpBonus > 0) {
      await this.prisma.profile.update({
        where: { userId },
        data: { xp: { increment: achievement.xpBonus } },
      });
    }
  }

  async leaderboard(limit = 100) {
    const profiles = await this.prisma.profile.findMany({
      where: { isPublic: true },
      orderBy: { xp: 'desc' },
      take: limit,
      include: { user: { select: { username: true } } },
    });
    return profiles.map((p, i) => ({
      rank: i + 1,
      username: p.user.username,
      xp: p.xp,
      level: p.level,
      streak: p.streak,
    }));
  }
}
