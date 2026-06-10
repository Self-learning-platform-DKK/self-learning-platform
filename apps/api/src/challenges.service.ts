import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { runValidation } from '@sql-tutor/validation';
import type { ValidationRuleConfig, SqlResult } from '@sql-tutor/shared';
import { GUEST_CHALLENGE_SLUGS } from '@sql-tutor/shared';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async list(filters?: { difficulty?: string; pathSlug?: string }) {
    const paths = filters?.pathSlug
      ? await this.prisma.learningPath.findUnique({ where: { slug: filters.pathSlug }, include: { modules: { include: { challenges: true } } } })
      : null;

    const challenges = paths
      ? paths.modules.flatMap((m) => m.challenges)
      : await this.prisma.challenge.findMany({
          where: { isPublished: true, ...(filters?.difficulty ? { difficulty: filters.difficulty } : {}) },
          orderBy: { createdAt: 'asc' },
        });

    return challenges.map((c) => this.summary(c));
  }

  async getBySlug(slug: string) {
    const c = await this.prisma.challenge.findUnique({
      where: { slug },
      include: { dataset: true, module: { include: { path: true } } },
    });
    if (!c?.isPublished) throw new NotFoundException('Challenge not found');
    return this.detail(c);
  }

  async getDatasetSeed(slug: string) {
    const c = await this.prisma.challenge.findUnique({
      where: { slug },
      include: { dataset: true },
    });
    if (!c) throw new NotFoundException();
    return {
      seedSql: c.dataset.seedSql,
      schema: JSON.parse(c.dataset.schemaJson),
    };
  }

  async submitAttempt(
    slug: string,
    sql: string,
    result: SqlResult,
    opts: { userId?: string; sessionId?: string; hintLevel?: number; durationMs?: number; plan?: string }
  ) {
    const challenge = await this.prisma.challenge.findUnique({ where: { slug } });
    if (!challenge) throw new NotFoundException();

    if (!opts.userId && !GUEST_CHALLENGE_SLUGS.includes(slug)) {
      throw new ForbiddenException('Sign up to attempt this challenge');
    }

    if (challenge.isPremium && opts.plan === 'FREE') {
      throw new ForbiddenException('Premium challenge — upgrade required');
    }

    const rules = JSON.parse(challenge.rulesJson) as ValidationRuleConfig[];
    const hintPenalty = (opts.hintLevel ?? 0) * 0.1;
    const validation = runValidation(sql, result, rules, {
      baseXp: challenge.xpReward,
      hintPenalty,
      successMsg: challenge.successMsg,
      errorMsg: challenge.errorMsg,
    });

    await this.prisma.attempt.create({
      data: {
        userId: opts.userId,
        sessionId: opts.sessionId,
        challengeId: challenge.id,
        sql,
        passed: validation.passed,
        validation: JSON.stringify(validation),
        hintLevel: opts.hintLevel ?? 0,
        durationMs: opts.durationMs,
      },
    });

    return validation;
  }

  summary(c: { id: string; slug: string; title: string; concept: string; difficulty: string; xpReward: number; isPremium: boolean }) {
    return { id: c.id, slug: c.slug, title: c.title, concept: c.concept, difficulty: c.difficulty, xpReward: c.xpReward, isPremium: c.isPremium };
  }

  detail(c: {
    id: string; slug: string; title: string; concept: string; instructions: string;
    difficulty: string; dialect: string; xpReward: number; isPremium: boolean;
    hintsJson: string; rulesJson: string; successMsg: string; errorMsg: string;
    aiPrompt: string | null; dataset: { slug: string; schemaJson: string };
    module?: { path: { slug: string; title: string } } | null;
  }) {
    return {
      ...this.summary(c),
      instructions: c.instructions,
      dialect: c.dialect,
      hints: JSON.parse(c.hintsJson),
      successMsg: c.successMsg,
      errorMsg: c.errorMsg,
      hasAiPrompt: !!c.aiPrompt,
      dataset: { slug: c.dataset.slug, schema: JSON.parse(c.dataset.schemaJson) },
      path: c.module?.path ? { slug: c.module.path.slug, title: c.module.path.title } : null,
    };
  }
}
