import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) throw new ConflictException('Email or username already taken');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: { create: { displayName: username } },
        subscription: { create: { plan: 'FREE' } },
      },
      include: { profile: true },
    });

    return { user: this.sanitize(user), tokens: this.issueTokens(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { user: this.sanitize(user), tokens: this.issueTokens(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, subscription: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }

  issueTokens(user: { id: string; email: string; role: string; plan: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwt.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
    };
  }

  sanitize(user: { id: string; email: string; username: string; role: string; plan: string; profile?: unknown }) {
    const { id, email, username, role, plan, profile } = user;
    return { id, email, username, role, plan, profile };
  }
}
