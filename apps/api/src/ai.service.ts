import { Injectable, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { decrypt, encrypt, keyHint } from './crypto.util';

type AIFeature = 'tutor' | 'debugger' | 'reviewer' | 'coach';

interface AIRequest {
  feature: AIFeature;
  prompt: string;
  userId: string;
  plan: string;
  preferredProvider?: string;
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  isEnabled(): boolean {
    return process.env.AI_ENABLED === 'true';
  }

  async complete(req: AIRequest): Promise<{ text: string; provider: string; source: string }> {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException('AI is disabled. Core learning features work without AI.');
    }

    const keyInfo = await this.resolveKey(req.userId, req.plan, req.preferredProvider);
    if (!keyInfo) {
      throw new ForbiddenException('AI requires Pro plan or BYOK configuration in Settings → AI');
    }

    const text = await this.callProvider(keyInfo.provider, keyInfo.apiKey, req.prompt);

    await this.prisma.aIUsage.create({
      data: {
        userId: req.userId,
        provider: keyInfo.provider,
        feature: req.feature,
        tokens: Math.ceil(text.length / 4),
        usedKey: keyInfo.source,
      },
    });

    return { text, provider: keyInfo.provider, source: keyInfo.source };
  }

  async saveByokKey(userId: string, provider: string, apiKey: string) {
    const valid = await this.validateKey(provider, apiKey);
    if (!valid) throw new ForbiddenException('Invalid API key for provider');

    await this.prisma.bYOKKey.upsert({
      where: { userId_provider: { userId, provider } },
      create: {
        userId,
        provider,
        encryptedKey: encrypt(apiKey),
        keyHint: keyHint(apiKey),
      },
      update: {
        encryptedKey: encrypt(apiKey),
        keyHint: keyHint(apiKey),
        isActive: true,
      },
    });
    return { provider, keyHint: keyHint(apiKey) };
  }

  async listByokKeys(userId: string) {
    const keys = await this.prisma.bYOKKey.findMany({ where: { userId, isActive: true } });
    return keys.map((k) => ({ provider: k.provider, keyHint: k.keyHint }));
  }

  private async resolveKey(userId: string, plan: string, preferred?: string) {
    const providers = preferred
      ? [preferred, 'ANTHROPIC', 'OPENAI', 'GOOGLE']
      : ['ANTHROPIC', 'OPENAI', 'GOOGLE'];

    for (const provider of [...new Set(providers)]) {
      const byok = await this.prisma.bYOKKey.findUnique({
        where: { userId_provider: { userId, provider } },
      });
      if (byok?.isActive) {
        return { provider, apiKey: decrypt(byok.encryptedKey), source: 'BYOK' };
      }
    }

    if (plan === 'PRO' || plan === 'TEAM' || plan === 'ENTERPRISE') {
      const platformKey = this.getPlatformKey(preferred || 'ANTHROPIC');
      if (platformKey) {
        return { provider: preferred || 'ANTHROPIC', apiKey: platformKey, source: 'PLATFORM' };
      }
    }

    return null;
  }

  private getPlatformKey(provider: string): string | null {
    const map: Record<string, string | undefined> = {
      ANTHROPIC: process.env.ANTHROPIC_API_KEY,
      OPENAI: process.env.OPENAI_API_KEY,
      GOOGLE: process.env.GOOGLE_AI_API_KEY,
    };
    return map[provider] ?? null;
  }

  private async validateKey(provider: string, apiKey: string): Promise<boolean> {
    try {
      await this.callProvider(provider, apiKey, 'Reply with OK only.', 10);
      return true;
    } catch {
      return false;
    }
  }

  private async callProvider(provider: string, apiKey: string, prompt: string, maxTokens = 1000): Promise<string> {
    const suffix = ' Be encouraging, friendly, and concrete. No markdown headers.';

    if (provider === 'ANTHROPIC') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt + suffix }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text ?? 'No response';
    }

    if (provider === 'OPENAI') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt + suffix }],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? 'No response';
    }

    if (provider === 'GOOGLE') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt + suffix }] }],
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response';
    }

    throw new Error(`Unknown provider: ${provider}`);
  }
}
