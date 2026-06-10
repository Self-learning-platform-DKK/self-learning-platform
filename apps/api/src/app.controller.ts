import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ChallengesService } from './challenges.service';
import { ProgressService } from './progress.service';
import { AchievementsService } from './achievements.service';
import { AiService } from './ai.service';
import { CertificatesService } from './certificates.service';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from './prisma.service';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

@Controller('v1')
export class AppController {
  constructor(
    private auth: AuthService,
    private challenges: ChallengesService,
    private progress: ProgressService,
    private achievements: AchievementsService,
    private ai: AiService,
    private certificates: CertificatesService,
    private analytics: AnalyticsService,
    private prisma: PrismaService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      version: '2.0.0',
      aiEnabled: this.ai.isEnabled(),
      coreWithoutAi: true,
    };
  }

  // ─── Auth ───────────────────────────────────────────────
  @Post('auth/register')
  register(@Body() body: { email: string; username: string; password: string }) {
    return this.auth.register(body.email, body.username, body.password);
  }

  @Post('auth/login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get('auth/me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: { user: { userId: string } }) {
    return this.auth.me(req.user.userId);
  }

  // ─── Paths ──────────────────────────────────────────────
  @Get('paths')
  async paths() {
    return this.prisma.learningPath.findMany({
      where: { isPublished: true },
      include: { modules: { include: { challenges: { select: { slug: true, title: true, difficulty: true } } } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─── Challenges ─────────────────────────────────────────
  @Get('challenges')
  listChallenges(@Query('difficulty') difficulty?: string, @Query('path') pathSlug?: string) {
    return this.challenges.list({ difficulty, pathSlug });
  }

  @Get('challenges/:slug')
  getChallenge(@Param('slug') slug: string) {
    return this.challenges.getBySlug(slug);
  }

  @Get('challenges/:slug/dataset')
  getDataset(@Param('slug') slug: string) {
    return this.challenges.getDatasetSeed(slug);
  }

  @Post('challenges/:slug/attempts')
  @UseGuards(OptionalJwtAuthGuard)
  async submitAttempt(
    @Param('slug') slug: string,
    @Body() body: { sql: string; result: { columns: string[]; rows: Record<string, unknown>[] }; hintLevel?: number; durationMs?: number; sessionId?: string },
    @Req() req: { user?: { userId: string; plan: string } },
  ) {
    const validation = await this.challenges.submitAttempt(slug, body.sql, body.result, {
      userId: req.user?.userId,
      sessionId: body.sessionId,
      hintLevel: body.hintLevel,
      durationMs: body.durationMs,
      plan: req.user?.plan ?? 'GUEST',
    });

    if (validation.passed && req.user?.userId) {
      const challenge = await this.prisma.challenge.findUnique({ where: { slug } });
      if (challenge) {
        await this.progress.markComplete(req.user.userId, challenge.id, validation.xpEarned, body.hintLevel ?? 0);
        const unlocked = await this.achievements.evaluateOnComplete(req.user.userId);
        return { ...validation, achievementsUnlocked: unlocked };
      }
    }

    return validation;
  }

  // ─── Progress ───────────────────────────────────────────
  @Get('progress')
  @UseGuards(AuthGuard('jwt'))
  getProgress(@Req() req: { user: { userId: string } }) {
    return this.progress.getSummary(req.user.userId);
  }

  @Post('progress/resume')
  @UseGuards(AuthGuard('jwt'))
  saveResume(@Req() req: { user: { userId: string } }, @Body() body: { track: string; challengeSlug: string }) {
    return this.progress.saveResume(req.user.userId, body.track, body.challengeSlug);
  }

  // ─── Achievements & Leaderboard ─────────────────────────
  @Get('achievements')
  @UseGuards(AuthGuard('jwt'))
  listAchievements(@Req() req: { user: { userId: string } }) {
    return this.achievements.listForUser(req.user.userId);
  }

  @Get('leaderboard')
  leaderboard() {
    return this.achievements.leaderboard();
  }

  // ─── Certificates ───────────────────────────────────────
  @Get('certificates')
  @UseGuards(AuthGuard('jwt'))
  myCertificates(@Req() req: { user: { userId: string } }) {
    return this.certificates.listForUser(req.user.userId);
  }

  @Get('certificates/verify/:code')
  verifyCert(@Param('code') code: string) {
    return this.certificates.verify(code);
  }

  @Post('certificates/exams/:slug/submit')
  @UseGuards(AuthGuard('jwt'))
  submitExam(@Req() req: { user: { userId: string } }, @Param('slug') slug: string, @Body() body: { score: number }) {
    return this.certificates.submitExam(req.user.userId, slug, body.score);
  }

  // ─── AI (Optional) ──────────────────────────────────────
  @Get('ai/status')
  aiStatus() {
    return { enabled: this.ai.isEnabled(), message: this.ai.isEnabled() ? 'AI available for Pro/BYOK' : 'AI disabled — core platform fully functional' };
  }

  @Post('ai/tutor')
  @UseGuards(AuthGuard('jwt'))
  aiTutor(@Req() req: { user: { userId: string; plan: string } }, @Body() body: { prompt: string; provider?: string }) {
    return this.ai.complete({ feature: 'tutor', prompt: body.prompt, userId: req.user.userId, plan: req.user.plan, preferredProvider: body.provider });
  }

  @Post('ai/debugger')
  @UseGuards(AuthGuard('jwt'))
  aiDebugger(@Req() req: { user: { userId: string; plan: string } }, @Body() body: { prompt: string; provider?: string }) {
    return this.ai.complete({ feature: 'debugger', prompt: body.prompt, userId: req.user.userId, plan: req.user.plan, preferredProvider: body.provider });
  }

  @Post('ai/keys')
  @UseGuards(AuthGuard('jwt'))
  saveByok(@Req() req: { user: { userId: string } }, @Body() body: { provider: string; apiKey: string }) {
    return this.ai.saveByokKey(req.user.userId, body.provider, body.apiKey);
  }

  @Get('ai/keys')
  @UseGuards(AuthGuard('jwt'))
  listByok(@Req() req: { user: { userId: string } }) {
    return this.ai.listByokKeys(req.user.userId);
  }

  @Delete('ai/keys/:provider')
  @UseGuards(AuthGuard('jwt'))
  async deleteByok(@Req() req: { user: { userId: string } }, @Param('provider') provider: string) {
    await this.prisma.bYOKKey.deleteMany({ where: { userId: req.user.userId, provider } });
    return { deleted: true };
  }

  // ─── Analytics ──────────────────────────────────────────
  @Post('analytics/events')
  ingest(@Body() body: { events: { event: string; sessionId: string; userId?: string; properties?: Record<string, unknown> }[] }) {
    return this.analytics.ingest(body.events ?? []);
  }

  @Get('admin/analytics/summary')
  adminAnalytics() {
    return this.analytics.adminSummary();
  }

  // ─── Datasets (workspace) ───────────────────────────────
  @Get('datasets')
  datasets() {
    return this.prisma.dataset.findMany({ where: { isPublic: true }, select: { slug: true, name: true, description: true } });
  }

  @Get('datasets/:slug')
  async dataset(@Param('slug') slug: string) {
    const d = await this.prisma.dataset.findUnique({ where: { slug } });
    if (!d) return { error: 'Not found' };
    return { slug: d.slug, name: d.name, seedSql: d.seedSql, schema: JSON.parse(d.schemaJson) };
  }
}
