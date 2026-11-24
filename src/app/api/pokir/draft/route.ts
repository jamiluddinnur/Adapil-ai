import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { LevelKewenangan } from '@/lib/kewenangan-filter';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AspirasiRecord {
  id?: string;
  nama_warga: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  sektor: 'Infrastruktur' | 'Pertanian' | 'Pendidikan' | 'Kesehatan' | 'Bansos';
  uraian_aspirasi: string;
  perkiraan_biaya?: number;
  kewenangan: LevelKewenangan;
  dinas_rujukan: string;
}

interface DraftPokirRequest {
  nama_dewan: string;
  dapil: string;
  tahun_rencana?: string;
  aspirasi_list: AspirasiRecord[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DraftPokirRequest;
    const { nama_dewan, dapil, tahun_rencana = 'RKPD 2027', aspirasi_list } = body;

    if (!aspirasi_list || aspirasi_list.length === 0) {
      return NextResponse.json({ error: 'Daftar aspirasi tidak boleh kosong.' }, { status: 400 });
    }

    const grouped: Record<string, Record<string, AspirasiRecord[]>> = {};
    for (const item of aspirasi_list) {
      const kec = item.kecamatan.trim();
      const sek = item.sektor;
      if (!grouped[kec]) grouped[kec] = {};
      if (!grouped[kec][sek]) grouped[kec][sek] = [];
      grouped[kec][sek].push(item);
    }

    const systemInstruction = `Anda adalah Tenaga Ahli DPRD yang berpengalaman menyusun dokumen resmi Pokok-Pokok Pikiran (Pokir) DPRD sesuai standar Bappeda dan sistem SIPD Kemendagri.
Ubah catatan aspirasi mentah warga menjadi naskah usulan birokrasi pemerintahan daerah yang baku, terukur, dan objektif.`;

    const userPrompt = `Susun draf naskah resmi Pokir DPRD untuk:
- Anggota Dewan: ${nama_dewan}
- Daerah Pemilihan: ${dapil}
- Dokumen Perencanaan: ${tahun_rencana}

Data Aspirasi Terkelompok:
${JSON.stringify(grouped, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul_dokumen: { type: Type.STRING },
            pengantar_resmi: { type: Type.STRING },
            daftar_usulan_pokir: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kecamatan: { type: Type.STRING },
                  sektor: { type: Type.STRING },
                  permasalahan: { type: Type.STRING },
                  usulan_kegiatan_sipd: { type: Type.STRING },
                  lokasi_spesifik: { type: Type.STRING },
                  kewenangan: { type: Type.STRING },
                  opd_tujuan: { type: Type.STRING },
                  estimasi_anggaran: { type: Type.NUMBER },
                  justifikasi_urgensi: { type: Type.STRING },
                },
                required: [
                  'kecamatan', 'sektor', 'permasalahan', 'usulan_kegiatan_sipd',
                  'lokasi_spesifik', 'kewenangan', 'opd_tujuan', 'justifikasi_urgensi',
                ],
              },
            },
          },
          required: ['judul_dokumen', 'pengantar_resmi', 'daftar_usulan_pokir'],
        },
      },
    });

    const draftPokir = JSON.parse(response.text || '{}');

    return NextResponse.json({
      success: true,
      meta: {
        total_aspirasi_diproses: aspirasi_list.length,
        total_kecamatan: Object.keys(grouped).length,
      },
      data: draftPokir,
    });
  } catch (error) {
    console.error('[API /pokir/draft Error]:', error);
    return NextResponse.json({ error: 'Gagal menyusun draf naskah Pokir.' }, { status: 500 });
  }
}
