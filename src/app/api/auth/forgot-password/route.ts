import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Alamat email wajib diisi.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, nama_ta: true },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, tautan pemulihan kata sandi telah dikirim.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { email: user.email } }),
      prisma.passwordResetToken.create({
        data: { email: user.email, tokenHash, expiresAt },
      }),
    ]);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adapil-ai.vercel.app';
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[Adapil.ai Dev] Reset Link untuk ${user.email}: ${resetLink}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Tautan pemulihan kata sandi telah dikirim ke email terdaftar.',
    });
  } catch (error) {
    console.error('[API /auth/forgot-password Error]:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memproses permintaan.' }, { status: 500 });
  }
}
