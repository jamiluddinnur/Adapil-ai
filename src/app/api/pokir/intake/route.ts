import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { analyzeKewenangan } from '@/lib/kewenangan-filter';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      nama_warga,
      no_hp_warga,
      kabupaten,
      kecamatan,
      desa,
      sektor,
      uraian_aspirasi,
    } = body;

    if (!kecamatan || !desa || !sektor || !uraian_aspirasi) {
      return NextResponse.json({ error: 'Data wilayah, sektor, dan uraian wajib diisi.' }, { status: 400 });
    }

    const analisis = analyzeKewenangan(uraian_aspirasi);
    const levelDb =
      analisis.kewenangan === 'PROVINSI'
        ? 'PROVINSI'
        : analisis.kewenangan === 'PUSAT'
        ? 'PUSAT'
        : 'KAB_KOTA';

    // Jika workspaceId tersedia, simpan ke Neon PostgreSQL
    let saved = null;
    if (workspaceId) {
      saved = await prisma.resesAspiration.create({
        data: {
          workspaceId,
          nama_warga: nama_warga || 'Warga Dapil',
          no_hp_warga: no_hp_warga || null,
          kabupaten: kabupaten || 'Lombok Tengah',
          kecamatan,
          desa,
          sektor,
          uraian_aspirasi,
          level_kewenangan: levelDb,
        },
      });
    }

    return NextResponse.json({
      success: true,
      analisis_kewenangan: analisis,
      data: saved,
    });
  } catch (error) {
    console.error('[API /pokir/intake Error]:', error);
    return NextResponse.json({ error: 'Gagal menyimpan aspirasi reses.' }, { status: 500 });
  }
}
