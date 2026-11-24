'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapPin, Wifi, WifiOff, CheckCircle2, Building2, AlertTriangle, Send, Loader2, CloudUpload,
} from 'lucide-react';
import { analyzeKewenangan } from '@/lib/kewenangan-filter';

type SektorType = 'Infrastruktur' | 'Pertanian/Pupuk' | 'Pendidikan' | 'Bansos' | 'Kesehatan';

interface OfflineAspirasiPayload {
  id_lokal: string;
  nama_warga: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  sektor: SektorType;
  uraian_aspirasi: string;
  created_at: string;
}

const OFFLINE_STORAGE_KEY = 'adapil_reses_offline_queue';
const SEKTOR_LIST: SektorType[] = ['Infrastruktur', 'Pertanian/Pupuk', 'Pendidikan', 'Bansos', 'Kesehatan'];
const DAPIL_WILAYAH: Record<string, string[]> = {
  'Praya Tengah': ['Batunyala', 'Lajut', 'Pengadang', 'Pejanggik', 'Kelebuh'],
  'Pujut': ['Kuta', 'Sengkol', 'Tanak Awu', 'Rembitan', 'Mertak'],
  'Jonggat': ['Puyung', 'Nyerot', 'Sukarara', 'Ubung', 'Bonjeruk'],
};

export default function ResesQuickIntake() {
  const [kecamatan, setKecamatan] = useState<string>('Praya Tengah');
  const [desa, setDesa] = useState<string>('Batunyala');
  const [sektor, setSektor] = useState<SektorType>('Infrastruktur');
  const [uraian, setUraian] = useState<string>('');
  const [namaWarga, setNamaWarga] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'offline'; text: string } | null>(null);

  const kewenanganInfo = useMemo(() => {
    if (uraian.trim().length < 5) return null;
    return analyzeKewenangan(uraian);
  }, [uraian]);

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const listDesa = DAPIL_WILAYAH[newKec] || [];
    setDesa(listDesa[0] || '');
  };

  const syncOfflineQueue = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return;
    const queue: OfflineAspirasiPayload[] = JSON.parse(raw);
    if (queue.length === 0) return;

    setIsSyncing(true);
    const failedItems: OfflineAspirasiPayload[] = [];
    for (const item of queue) {
      try {
        const res = await fetch('/api/pokir/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) failedItems.push(item);
      } catch {
        failedItems.push(item);
      }
    }
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(failedItems));
    setOfflineCount(failedItems.length);
    setIsSyncing(false);
    if (failedItems.length === 0) {
      setToast({ type: 'success', text: `${queue.length} catatan lokal berhasil disinkronkan.` });
    }
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (raw) setOfflineCount(JSON.parse(raw).length);

    const handleOnline = () => { setIsOnline(true); syncOfflineQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const saveToOfflineQueue = (payload: OfflineAspirasiPayload) => {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    const existing: OfflineAspirasiPayload[] = raw ? JSON.parse(raw) : [];
    const updated = [...existing, payload];
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
    setOfflineCount(updated.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraian.trim()) return;

    const payload: OfflineAspirasiPayload = {
      id_lokal: crypto.randomUUID(),
      nama_warga: namaWarga.trim() || 'Warga Dapil',
      kabupaten: 'Lombok Tengah',
      kecamatan,
      desa,
      sektor,
      uraian_aspirasi: uraian.trim(),
      created_at: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      saveToOfflineQueue(payload);
      setUraian('');
      setNamaWarga('');
      setToast({ type: 'offline', text: 'Tersimpan Lokal (Offline). Otomatis terkirim saat online.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pokir/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Gagal');
      setUraian('');
      setNamaWarga('');
      setToast({ type: 'success', text: 'Aspirasi warga berhasil dicatat & diklasifikasi.' });
    } catch {
      saveToOfflineQueue(payload);
      setUraian('');
      setNamaWarga('');
      setToast({ type: 'offline', text: 'Koneksi tidak stabil. Tersimpan Lokal (Offline).' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-4 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium">
          {isOnline ? (
            <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-emerald-300">Terhubung (Online)</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-amber-400" /><span className="text-amber-300">Tersimpan Lokal (Offline)</span></>
          )}
        </div>
        {offlineCount > 0 && (
          <button
            type="button"
            onClick={syncOfflineQueue}
            disabled={!isOnline || isSyncing}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudUpload className="w-3 h-3" />}
            <span>{offlineCount} Antrean Lokal</span>
          </button>
        )}
      </div>

      {toast && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
          toast.type === 'success' ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-200' : 'bg-amber-950/70 border-amber-600/50 text-amber-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{toast.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /><span>Lokasi Reses Dapil</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Kecamatan</label>
              <select
                value={kecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value)}
                className="w-full rounded-xl bg-[#0f172a] border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(DAPIL_WILAYAH).map((kec) => <option key={kec} value={kec}>{kec}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Desa / Kelurahan</label>
              <select
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                className="w-full rounded-xl bg-[#0f172a] border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                {(DAPIL_WILAYAH[kecamatan] || []).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Sektor Aspirasi</label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {SEKTOR_LIST.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSektor(item)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition ${
                  sektor === item
                    ? 'bg-[#e5a93c] text-[#0f172a] border-[#e5a93c]'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
          <label htmlFor="uraian" className="block text-xs font-semibold text-slate-300">
            Catatan Aspirasi Warga (Kompatibel Voice-to-Text)
          </label>
          <textarea
            id="uraian"
            rows={4}
            required
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            placeholder="Catat keluhan warga secara spesifik..."
            className="w-full rounded-xl bg-[#0f172a] border border-slate-700 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none"
          />

          {kewenanganInfo && (
            <div className={`rounded-xl p-3 border text-xs flex items-start gap-2.5 ${
              kewenanganInfo.kewenangan === 'PROVINSI'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : kewenanganInfo.kewenangan === 'KAB_KOTA'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                : 'bg-slate-800/80 border-slate-600 text-slate-200'
            }`}>
              {kewenanganInfo.kewenangan === 'PROVINSI' ? (
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {kewenanganInfo.kewenangan === 'PROVINSI' && '[Kewenangan Provinsi]'}
                  {kewenanganInfo.kewenangan === 'KAB_KOTA' && '[Kewenangan Kab/Kota - Rekomendasikan ke Fraksi Daerah]'}
                  {kewenanganInfo.kewenangan === 'PUSAT' && '[Kewenangan Pemerintah Pusat]'}
                  {kewenanganInfo.kewenangan === 'PERLU_VERIFIKASI' && '[Perlu Verifikasi Teknis Bappeda]'}
                </p>
                <p className="text-[11px] opacity-85 mt-0.5">Rujukan OPD: {kewenanganInfo.dinas_rujukan}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="namaWarga" className="block text-[11px] text-slate-400 mb-1">Nama Warga / Tokoh (Opsional)</label>
            <input
              id="namaWarga"
              type="text"
              value={namaWarga}
              onChange={(e) => setNamaWarga(e.target.value)}
              placeholder="Misal: H. Lalu Ahmad (Kepala Dusun)"
              className="w-full rounded-xl bg-[#0f172a] border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 z-20 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              type="submit"
              disabled={isSubmitting || !uraian.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e5a93c] hover:bg-amber-400 disabled:opacity-50 text-[#0f172a] font-bold text-sm py-3.5 shadow-xl transition"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Aspirasi Reses'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
