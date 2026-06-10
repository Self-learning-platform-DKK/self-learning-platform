import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { exam: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { verifyCode: code },
      include: { exam: true, user: { select: { username: true, profile: true } } },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      valid: true,
      verifyCode: cert.verifyCode,
      examTitle: cert.exam.title,
      username: cert.user.username,
      score: cert.score,
      issuedAt: cert.issuedAt,
    };
  }

  async submitExam(userId: string, examSlug: string, score: number) {
    const exam = await this.prisma.exam.findUnique({ where: { slug: examSlug } });
    if (!exam) throw new NotFoundException('Exam not found');

    if (score < exam.passingScore) {
      return { passed: false, score, passingScore: exam.passingScore };
    }

    const verifyCode = `sqltutor-${uuidv4().slice(0, 12)}`;
    const cert = await this.prisma.certificate.create({
      data: { userId, examId: exam.id, verifyCode, score },
    });

    return { passed: true, score, certificate: cert };
  }
}
