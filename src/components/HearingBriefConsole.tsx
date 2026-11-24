'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, Printer, FileText, PencilLine } from 'lucide-react';
import { BudgetAnomalyResult } from '@/lib/budget-detector';
import { formatBudgetBriefToWA } from '@/lib/wa-formatter';

interface HearingBriefConsoleProps {
  targetForum: 'BANGGAR' | 'KOMISI';
  namaMitra: string;
  tahunAnggaran?: string;
  tanggalRapat?: string;
  ringkasanEksekutif: string;
  initialQuestions: string[];
  anomaliTerpilih: BudgetAnomalyResult[];
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

export default function HearingBriefConsole({
  targetForum,
  namaMitra,
  tahunAnggaran = 'TA 2026',
  tanggalRapat = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  ringkasanEksekutif,
  initialQuestions,
  anomaliTerpilih,
}: HearingBriefConsoleProps) {
  const [summary, setSummary] = useState<string>(ringkasanEksekutif);
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [copied, setCopied] = useState<boolean>(false);

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleCopyWA = async () => {
    const waText = formatBudgetBriefToWA({
      target_forum: targetForum,
      nama_mitra: namaMitra,
      tahun_anggaran: tahunAnggaran,
      ringkasan_eksekutif: summary,
      pertanyaan_kritis: questions,
      anomali_terpilih: anomaliTerpilih,
    });
    await navigator.clipboard.writeText(waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <section className="print:hidden flex flex-col h-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Panel Hearing Brief ({targetForum === 'BANGGAR' ? 'Banggar' : 'Komisi'})
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <PencilLine className="w-3 h-3 text-amber-400" />Sunting langsung
          </span>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Ringkasan Eksekutif
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-slate-700 p-3 text-xs leading-relaxed text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              5 Pertanyaan Kritis Siap Sidang
            </label>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-[#0f172a] border border-slate-700 p-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    className="w-full bg-transparent text-xs leading-relaxed text-slate-100 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700 bg-[#0f172a]/90 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 text-slate-100 text-xs font-semibold px-4 py-2.5"
          >
            <Printer className="w-4 h-4" /><span>Cetak Lembar Sidang</span>
          </button>

          <button
            type="button"
            onClick={handleCopyWA}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#e5a93c] hover:bg-amber-400 text-[#0f172a] text-xs font-bold px-5 py-2.5"
          >
            {copied ? <><Check className="w-4 h-4" /><span>Tersalin ke Clipboard!</span></> : <><Copy className="w-4 h-4" /><span>Salin Format WhatsApp</span></>}
          </button>
        </div>
      </section>

      <div className="hidden print:block bg-white text-black font-serif p-0">
        <header className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300">
              <Image src="/adapil-logo.webp" alt="Logo Adapil.ai" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-base font-bold uppercase text-slate-900">
                Lembar Kerja Sidang — {targetForum === 'BANGGAR' ? 'Badan Anggaran' : 'Rapat Kerja Komisi'}
              </h1>
              <p className="text-xs text-slate-700">Mitra Kerja: <strong>{namaMitra}</strong> | {tahunAnggaran}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold">Tanggal Rapat</p>
            <p>{tanggalRapat}</p>
          </div>
        </header>

        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase mb-1">I. Ringkasan Eksekutif</h2>
          <p className="text-xs leading-relaxed text-justify">{summary}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase mb-1.5">II. Temuan Anomali Anggaran Prioritas</h2>
          <table className="w-full border-collapse border border-slate-400 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-400 px-2 py-1">Kode Rekening</th>
                <th className="border border-slate-400 px-2 py-1">Uraian Belanja</th>
                <th className="border border-slate-400 px-2 py-1 text-right">Selisih (Rp)</th>
                <th className="border border-slate-400 px-2 py-1 text-right">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {anomaliTerpilih.slice(0, 5).map((item) => (
                <tr key={item.kode_rekening}>
                  <td className="border border-slate-400 px-2 py-1 font-mono">{item.kode_rekening}</td>
                  <td className="border border-slate-400 px-2 py-1">{item.uraian_belanja}</td>
                  <td className="border border-slate-400 px-2 py-1 text-right font-semibold">{formatRupiah(item.selisih_nominal)}</td>
                  <td className="border border-slate-400 px-2 py-1 text-right font-semibold">
                    {item.selisih_persen > 0 ? `+${item.selisih_persen}%` : `${item.selisih_persen}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase mb-2">III. 5 Pertanyaan Kritis (Siap Dibacakan)</h2>
          <ol className="list-decimal pl-5 space-y-2 text-xs leading-relaxed">
            {questions.map((q, idx) => <li key={idx}>{q}</li>)}
          </ol>
        </div>

        <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-600">
          <span className="font-semibold">Adapil.ai - Dewan Cerdas, Konstituen Puas</span>
          <span>Dicetak otomatis untuk keperluan rapat resmi DPRD</span>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { background: #ffffff !important; color: #000000 !important; }
          nav, aside, header.app-header, .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}
