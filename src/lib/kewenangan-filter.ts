export type LevelKewenangan = 'PROVINSI' | 'KAB_KOTA' | 'PUSAT' | 'PERLU_VERIFIKASI';

export interface KewenanganResult {
  kewenangan: LevelKewenangan;
  confidence: number;
  dinas_rujukan: string;
  matched_keywords: string[];
}

interface KeywordRule {
  level: Exclude<LevelKewenangan, 'PERLU_VERIFIKASI'>;
  dinas: string;
  keywords: string[];
  weight: number;
}

const KEWENANGAN_RULES: KeywordRule[] = [
  {
    level: 'PROVINSI',
    dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Provinsi',
    keywords: ['jalan provinsi', 'jembatan provinsi', 'irigasi primer', 'irigasi lintas daerah', 'irigasi lintas kabupaten'],
    weight: 1.0,
  },
  {
    level: 'PROVINSI',
    dinas: 'Dinas Pendidikan dan Kebudayaan Provinsi',
    keywords: ['sma', 'smk', 'slb', 'sekolah menengah atas', 'sekolah menengah kejuruan', 'cagar budaya provinsi'],
    weight: 0.95,
  },
  {
    level: 'PROVINSI',
    dinas: 'Dinas Kelautan dan Perikanan Provinsi',
    keywords: ['kelautan', 'pesisir', '0-12 mil', 'pelabuhan perikanan pantai'],
    weight: 0.9,
  },
  {
    level: 'PROVINSI',
    dinas: 'Dinas Lingkungan Hidup dan Kehutanan (LHK) Provinsi',
    keywords: ['kehutanan', 'hutan lindung', 'kph', 'tahura', 'reboisasi hutan'],
    weight: 0.9,
  },
  {
    level: 'PROVINSI',
    dinas: 'Dinas Kesehatan Provinsi / RSUD Provinsi',
    keywords: ['rsud provinsi', 'rumah sakit provinsi', 'rumah sakit rujukan provinsi'],
    weight: 0.95,
  },
  {
    level: 'KAB_KOTA',
    dinas: 'Dinas PUPR / Dinas Perkim Kabupaten/Kota',
    keywords: [
      'jalan desa', 'jalan lingkungan', 'jalan gang', 'jalan kabupaten',
      'saluran tersier', 'drainase pemukiman', 'drainase lingkungan',
      'pju gang', 'pju desa', 'penerangan jalan umum',
    ],
    weight: 1.0,
  },
  {
    level: 'KAB_KOTA',
    dinas: 'Dinas Pendidikan Kabupaten/Kota',
    keywords: ['sd', 'sdn', 'smp', 'smpn', 'paud', 'tk', 'sekolah dasar', 'sekolah menengah pertama'],
    weight: 0.95,
  },
  {
    level: 'KAB_KOTA',
    dinas: 'Dinas Kesehatan Kabupaten/Kota',
    keywords: ['posyandu', 'puskesmas', 'pustu', 'puskesmas pembantu', 'polindes'],
    weight: 0.95,
  },
  {
    level: 'PUSAT',
    dinas: 'Kementerian PUPR (BBPJN / BWS)',
    keywords: ['jalan nasional', 'jalan tol', 'bendungan besar', 'psn', 'proyek strategis nasional'],
    weight: 1.0,
  },
  {
    level: 'PUSAT',
    dinas: 'Kemendikbudristek / Kementerian Agama',
    keywords: ['perguruan tinggi', 'universitas', 'kampus negeri', 'politeknik negeri'],
    weight: 0.95,
  },
  {
    level: 'PUSAT',
    dinas: 'Kementerian/Lembaga Vertikal (Polri / TNI / MA)',
    keywords: ['peradilan', 'pengadilan', 'kejaksaan', 'kepolisian', 'polres', 'polsek', 'tni', 'koramil', 'kodim'],
    weight: 0.95,
  },
];

export function analyzeKewenangan(uraianAspirasi: string): KewenanganResult {
  const normalizedText = uraianAspirasi.toLowerCase();
  let bestMatch: {
    level: Exclude<LevelKewenangan, 'PERLU_VERIFIKASI'>;
    dinas: string;
    score: number;
    matched: string[];
  } | null = null;

  for (const rule of KEWENANGAN_RULES) {
    const matched = rule.keywords.filter((kw) => {
      if (kw.length <= 4) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(normalizedText);
      }
      return normalizedText.includes(kw);
    });

    if (matched.length > 0) {
      const score = Math.min(1, rule.weight * (0.75 + matched.length * 0.12));
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { level: rule.level, dinas: rule.dinas, score, matched };
      }
    }
  }

  if (!bestMatch) {
    return {
      kewenangan: 'PERLU_VERIFIKASI',
      confidence: 0.2,
      dinas_rujukan: 'Bappeda (Perlu Verifikasi Teknis Kewenangan)',
      matched_keywords: [],
    };
  }

  return {
    kewenangan: bestMatch.level,
    confidence: Number(bestMatch.score.toFixed(2)),
    dinas_rujukan: bestMatch.dinas,
    matched_keywords: bestMatch.matched,
  };
}
