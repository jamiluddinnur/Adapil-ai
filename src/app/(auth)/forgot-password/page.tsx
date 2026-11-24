'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) return setErrorMsg('Masukkan alamat email yang terdaftar.');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim tautan pemulihan.');
      setSuccessMsg('Tautan pemulihan telah dikirim ke email terdaftar. Periksa kotak masuk atau folder spam Anda.');
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg shadow-amber-500/10">
            <Image src="/adapil-logo.webp" alt="Logo Adapil.ai" fill className="object-cover" priority />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-2">Adapil.ai</h1>
          <p className="text-xs text-amber-400 font-medium tracking-wide">Dewan Cerdas, Konstituen Puas</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Kembali ke Halaman Masuk</span>
          </Link>

          <h2 className="text-lg font-semibold text-slate-100">Pemulihan Kata Sandi</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">Masukkan email akun Tenaga Ahli yang terdaftar.</p>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /><span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">Email Terdaftar</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ta.fraksi@dprd.go.id"
                  className="w-full rounded-xl bg-[#0f172a] border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e5a93c] hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-400 text-[#0f172a] font-semibold text-sm py-2.5 transition"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Mengirim...</span></> : cooldown > 0 ? <span>Kirim Ulang ({cooldown}d)</span> : <span>Kirim Tautan Reset</span>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
