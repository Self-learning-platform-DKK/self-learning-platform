import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ChallengesService } from './challenges.service';
import { ProgressService } from './progress.service';
import { AchievementsService } from './achievements.service';
import { AiService } from './ai.service';
import { CertificatesService } from './certificates.service';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    ChallengesService,
    ProgressService,
    AchievementsService,
    AiService,
    CertificatesService,
    AnalyticsService,
  ],
})
export class AppModule {}
