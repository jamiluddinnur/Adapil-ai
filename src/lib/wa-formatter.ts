import { BudgetAnomalyResult } from './budget-detector';

export interface WABriefPayload {
  target_forum: 'BANGGAR' | 'KOMISI';
  nama_mitra: string;
  tahun_anggaran?: string;
  ringkasan_eksekutif: string;
  pertanyaan_kritis: string[];
  anomali_terpilih: BudgetAnomalyResult[];
}

function formatRupiah(angka: number): string {
  const abs = Math.abs(angka);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(abs);
  return angka < 0 ? `-${formatted}` : `+${formatted}`;
}

function getBadgeEmoji(badge: BudgetAnomalyResult['badge']): string {
  switch (badge) {
    case 'MERAH': return '🔴';
    case 'BIRU': return '🔵';
    case 'KUNING': return '🟡';
    default: return '🟢';
  }
}

export function formatBudgetBriefToWA(payload: WABriefPayload): string {
  const {
    target_forum,
    nama_mitra,
    tahun_anggaran = 'TA 2026',
    ringkasan_eksekutif,
    pertanyaan_kritis,
    anomali_terpilih,
  } = payload;

  const forumLabel = target_forum === 'BANGGAR' ? 'RAPAT BADAN ANGGARAN (BANGGAR)' : 'RAPAT KERJA KOMISI';

  const topAnomaliLines = anomali_terpilih
    .slice(0, 5)
    .map((item) => {
      const emoji = getBadgeEmoji(item.badge);
      const tandaPersen = item.selisih_persen > 0 ? `+${item.selisih_persen}%` : `${item.selisih_persen}%`;
      return `${emoji} *${item.uraian_belanja}* (${item.kode_rekening})\n   ↳ Selisih: *${formatRupiah(item.selisih_nominal)}* (${tandaPersen})`;
    })
    .join('\n');

  const pertanyaanLines = pertanyaan_kritis
    .slice(0, 5)
    .map((q, idx) => `${idx + 1}. ${q.trim()}`)
    .join('\n\n');

  return [
    `🏛️ *BRIEFING ${forumLabel}*`,
    `📌 *Mitra Kerja:* ${nama_mitra}`,
    `📅 *Dokumen:* Pembahasan Anggaran ${tahun_anggaran}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📊 *RINGKASAN EKSEKUTIF*`,
    `${ringkasan_eksekutif.trim()}`,
    ``,
    `🚨 *TEMUAN ANOMALI PRIORITAS*`,
    topAnomaliLines,
    ``,
    `🎙️ *5 PERTANYAAN KRITIS (SIAP BACAKAN)*`,
    pertanyaanLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Disiapkan via Adapil.ai`,
    `"Dewan Cerdas, Konstituen Puas"`,
  ].join('\n');
}
