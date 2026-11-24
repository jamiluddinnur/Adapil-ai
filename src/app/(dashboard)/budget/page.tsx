'use client';

import React, { useMemo, useState } from 'react';
import { detectBudgetAnomalies, BudgetItemInput } from '@/lib/budget-detector';
import HearingBriefConsole from '@/components/HearingBriefConsole';

const SAMPLE_ITEMS: BudgetItemInput[] = [
  {
    kode_rekening: '5.1.02.04.01.0001',
    uraian_belanja: 'Belanja Perjalanan Dinas Dalam Negeri & Luar Daerah',
    nominal_lalu: 1200000000,
    nominal_kini: 1620000000,
  },
  {
    kode_rekening: '5.2.04.01.01.0003',
    uraian_belanja: 'Belanja Modal Rehabilitasi Jalan Kabupaten & Jembatan',
    nominal_lalu: 18500000000,
    nominal_kini: 14800000000,
  },
  {
    kode_rekening: '5.1.02.01.01.0052',
    uraian_belanja: 'Belanja Makanan dan Minuman Rapat Koordinasi',
    nominal_lalu: 450000000,
    nominal_kini: 517500000,
  },
];

export default function BudgetPage() {
  const [targetForum, setTargetForum] = useState<'BANGGAR' | 'KOMISI'>('KOMISI');
  const [threshold, setThreshold] = useState<number>(10);

  const anomalies = useMemo(() => detectBudgetAnomalies(SAMPLE_ITEMS, threshold), [threshold]);
  const namaMitra = targetForum === 'BANGGAR' ? 'Sekretaris Daerah / TAPD' : 'Kepala Dinas PUPR';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Konsol Audit Anggaran</h2>
          <p className="text-xs text-slate-400">Deteksi anomali KUA-PPAS / RKA OPD & generator 5 pertanyaan kritis.</p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-700 p-1">
          <button
            type="button"
            onClick={() => setTargetForum('BANGGAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              targetForum === 'BANGGAR' ? 'bg-[#e5a93c] text-[#0f172a]' : 'text-slate-300'
            }`}
          >
            Mode Banggar (TAPD)
          </button>
          <button
            type="button"
            onClick={() => setTargetForum('KOMISI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              targetForum === 'KOMISI' ? 'bg-[#e5a93c] text-[#0f172a]' : 'text-slate-300'
            }`}
          >
            Mode Komisi (OPD)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 space-y-4 print:hidden">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Ambang Batas Anomali</span>
              <span className="font-bold text-amber-400">{threshold}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-[#e5a93c]"
            />
          </div>

          <div className="space-y-3">
            {anomalies.map((item) => (
              <div key={item.kode_rekening} className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{item.kode_rekening}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.badge === 'MERAH'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : item.badge === 'BIRU'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.selisih_persen > 0 ? `+${item.selisih_persen}%` : `${item.selisih_persen}%`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-100">{item.uraian_belanja}</p>
                <p className="text-xs text-slate-400">{item.alasan_deteksi}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <HearingBriefConsole
            targetForum={targetForum}
            namaMitra={namaMitra}
            ringkasanEksekutif="RKA TA 2026 menunjukkan ketimpangan prioritas anggaran: belanja operasional non-publik melonjak jauh di atas inflasi daerah, sementara belanja modal infrastruktur dasar mengalami pemotongan signifikan."
            initialQuestions={[
              `Saudara ${namaMitra}, apa dasar urgensi kenaikan Belanja Perjalanan Dinas sebesar Rp420 juta (+35%) di tengah mandat efisiensi belanja birokrasi?`,
              'Mengapa Belanja Modal Rehabilitasi Jalan justru dipotong Rp3,7 miliar (-20%), sementara aspirasi Pokir infrastruktur di Dapil masih mendesak?',
              'Mohon jelaskan ruas jalan dan jembatan mana saja yang terdampak pengurangan volume akibat pemotongan Rp3,7 miliar tersebut!',
              'Kenaikan Belanja Mamin sebesar 15% melampaui asumsi inflasi daerah 2-4%; apakah ini sesuai Standar Harga Satuan Regional (SHSR)?',
              'Apakah bersedia melakukan rasionalisasi pos operasional tersebut untuk dikembalikan ke belanja modal masyarakat?',
            ]}
            anomaliTerpilih={anomalies}
          />
        </div>
      </div>
    </div>
  );
}
