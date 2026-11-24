export interface BudgetItemInput {
  kode_rekening: string;
  uraian_belanja: string;
  nominal_lalu: number;
  nominal_kini: number;
}

export type AnomalyType = 'LONJAKAN_20_PLUS' | 'PEMOTONGAN_MODAL' | 'INFLASI_10_PLUS' | 'NORMAL';
export type AnomalyBadge = 'MERAH' | 'BIRU' | 'KUNING' | 'HIJAU';

export interface BudgetAnomalyResult extends BudgetItemInput {
  selisih_nominal: number;
  selisih_persen: number;
  kategori_anomali: AnomalyType;
  badge: AnomalyBadge;
  urgensi_rank: number;
  alasan_deteksi: string;
}

const OPERASIONAL_NON_PRIORITAS_KEYWORDS = [
  'operasional', 'barang dan jasa', 'barang/jasa', 'atk', 'alat tulis kantor',
  'perjalanan dinas', 'makan', 'minum', 'mamin', 'jasa konsultansi', 'konsultan',
  'rapat', 'koordinasi', 'sewa', 'honorarium', 'cetak', 'penggandaan',
];

const MODAL_INFRASTRUKTUR_BANSOS_KEYWORDS = [
  'belanja modal', 'jalan', 'jembatan', 'irigasi', 'drainase', 'infrastruktur',
  'bantuan sosial', 'bansos', 'bantuan masyarakat', 'hibah masyarakat',
  'pembangunan fisik', 'rehabilitasi jalan',
];

function containsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function detectBudgetAnomalies(
  items: BudgetItemInput[],
  thresholdPct = 10
): BudgetAnomalyResult[] {
  const analyzed: BudgetAnomalyResult[] = items.map((item) => {
    const selisih_nominal = item.nominal_kini - item.nominal_lalu;
    const selisih_persen =
      item.nominal_lalu === 0
        ? item.nominal_kini > 0 ? 100 : 0
        : Number(((selisih_nominal / item.nominal_lalu) * 100).toFixed(2));

    const isOperasional = containsKeyword(item.uraian_belanja, OPERASIONAL_NON_PRIORITAS_KEYWORDS);
    const isModalAtauBansos = containsKeyword(item.uraian_belanja, MODAL_INFRASTRUKTUR_BANSOS_KEYWORDS);

    let kategori_anomali: AnomalyType = 'NORMAL';
    let badge: AnomalyBadge = 'HIJAU';
    let urgensi_rank = 0;
    let alasan_deteksi = 'Perubahan anggaran dalam batas wajar.';

    if (selisih_persen >= 20 && isOperasional) {
      kategori_anomali = 'LONJAKAN_20_PLUS';
      badge = 'MERAH';
      urgensi_rank = 3;
      alasan_deteksi = `Lonjakan tajam +${selisih_persen}% pada pos belanja non-prioritas publik.`;
    } else if (selisih_persen <= -thresholdPct && isModalAtauBansos) {
      kategori_anomali = 'PEMOTONGAN_MODAL';
      badge = 'BIRU';
      urgensi_rank = 2;
      alasan_deteksi = `Pemotongan signifikan ${selisih_persen}% pada belanja modal infrastruktur/bantuan masyarakat.`;
    } else if (selisih_persen >= thresholdPct && selisih_persen < 20 && isOperasional) {
      kategori_anomali = 'INFLASI_10_PLUS';
      badge = 'KUNING';
      urgensi_rank = 1;
      alasan_deteksi = `Kenaikan +${selisih_persen}% pada pos operasional melampaui rata-rata inflasi daerah (2-4%).`;
    }

    return {
      ...item,
      selisih_nominal,
      selisih_persen,
      kategori_anomali,
      badge,
      urgensi_rank,
      alasan_deteksi,
    };
  });

  return analyzed
    .filter((item) => item.kategori_anomali !== 'NORMAL')
    .sort((a, b) => {
      if (b.urgensi_rank !== a.urgensi_rank) return b.urgensi_rank - a.urgensi_rank;
      return Math.abs(b.selisih_nominal) - Math.abs(a.selisih_nominal);
    });
}
