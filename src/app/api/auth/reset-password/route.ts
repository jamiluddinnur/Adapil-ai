import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; newPassword?: string };
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token dan kata sandi baru wajib diisi.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Kata sandi baru minimal 8 karakter.' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetRecord || resetRecord.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'Tautan pemulihan tidak valid atau telah kedaluwarsa.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetRecord.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk kembali.',
    });
  } catch (error) {
    console.error('[API /auth/reset-password Error]:', error);
    return NextResponse.json({ error: 'Gagal menyetel ulang kata sandi.' }, { status: 500 });
  }
}
