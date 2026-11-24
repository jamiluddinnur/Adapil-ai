import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { BudgetAnomalyResult } from '@/lib/budget-detector';
import { formatBudgetBriefToWA } from '@/lib/wa-formatter';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateBudgetRequest {
  anomali: BudgetAnomalyResult[];
  target_forum: 'BANGGAR' | 'KOMISI';
  nama_mitra: string;
  tahun_anggaran?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBudgetRequest;
    const { anomali, target_forum, nama_mitra, tahun_anggaran = 'TA 2026' } = body;

    if (!anomali || anomali.length === 0) {
      return NextResponse.json({ error: 'Daftar pos anomali tidak boleh kosong.' }, { status: 400 });
    }

    const systemInstruction =
      target_forum === 'BANGGAR'
        ? `Anda adalah Tenaga Ahli Fraksi DPRD senior spesialis anggaran makro daerah (KUA-PPAS/APBD) untuk Rapat Banggar bersama ${nama_mitra}. Sorot rasio belanja pegawai/operasional vs belanja modal, defisit riil, dan pemborosan operasional.`
        : `Anda adalah Tenaga Ahli Komisi DPRD spesialis pengawasan teknis OPD (RKA-SKPD) untuk Rapat Kerja Komisi bersama ${nama_mitra}. Sorot inefisiensi pos belanja teknis dinas, kesesuaian target fisik di dapil, dan dasar regulasi pertanggungjawaban.`;

    const userPrompt = `Daftar anomali anggaran ${tahun_anggaran} untuk ${nama_mitra}:
${JSON.stringify(anomali, null, 2)}

Buat ringkasan eksekutif tepat 1 paragraf dan tepat 5 pertanyaan kritis bernada formal, tegas, berbasis angka, dan siap dibacakan saat rapat sidang.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ringkasan_eksekutif: { type: Type.STRING },
            pertanyaan_kritis: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['ringkasan_eksekutif', 'pertanyaan_kritis'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as {
      ringkasan_eksekutif: string;
      pertanyaan_kritis: string[];
    };

    const whatsapp_text = formatBudgetBriefToWA({
      target_forum,
      nama_mitra,
      tahun_anggaran,
      ringkasan_eksekutif: parsed.ringkasan_eksekutif,
      pertanyaan_kritis: parsed.pertanyaan_kritis,
      anomali_terpilih: anomali,
    });

    return NextResponse.json({
      success: true,
      data: {
        target_forum,
        nama_mitra,
        ringkasan_eksekutif: parsed.ringkasan_eksekutif,
        pertanyaan_kritis: parsed.pertanyaan_kritis,
        whatsapp_text,
      },
    });
  } catch (error) {
    console.error('[API /budget/generate Error]:', error);
    return NextResponse.json({ error: 'Gagal menghasilkan draf pertanyaan anggaran.' }, { status: 500 });
  }
}
