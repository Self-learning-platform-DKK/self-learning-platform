import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async ingest(events: { event: string; sessionId: string; userId?: string; properties?: Record<string, unknown> }[]) {
    await this.prisma.analyticsEvent.createMany({
      data: events.map((e) => ({
        event: e.event,
        sessionId: e.sessionId,
        userId: e.userId,
        properties: JSON.stringify(e.properties ?? {}),
      })),
    });
    return { accepted: events.length };
  }

  async adminSummary() {
    const [completions, attempts, registrations] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { event: 'challenge.completed' } }),
      this.prisma.attempt.count(),
      this.prisma.user.count(),
    ]);

    const failed = await this.prisma.attempt.count({ where: { passed: false } });
    const failRate = attempts ? Math.round((failed / attempts) * 100) : 0;

    return {
      registrations,
      challengeCompletions: completions,
      totalAttempts: attempts,
      failRate,
    };
  }
}
