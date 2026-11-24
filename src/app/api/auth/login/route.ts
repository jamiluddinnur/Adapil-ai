import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { workspace: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Email atau kata sandi tidak sesuai.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau kata sandi tidak sesuai.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama_ta: user.nama_ta,
        workspaceId: user.workspaceId,
        workspaceName: user.workspace.nama_workspace,
      },
    });
  } catch (error) {
    console.error('[API /auth/login Error]:', error);
    return NextResponse.json({ error: 'Gagal memproses login.' }, { status: 500 });
  }
}
