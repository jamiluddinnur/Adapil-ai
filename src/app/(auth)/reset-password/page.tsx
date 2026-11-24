'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLengthValid = newPassword.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) return setError('Token pemulihan tidak ditemukan.');
    if (!isLengthValid) return setError('Kata sandi minimal 8 karakter.');
    if (newPassword !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyetel ulang sandi.');
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Setel Ulang Kata Sandi</h2>
      <p className="text-xs text-slate-400 mb-5">Buat kata sandi baru minimal 8 karakter.</p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>{success}</span></div>
          <Link href="/login" className="inline-block font-semibold text-amber-400 underline">Masuk Sekarang</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Kata Sandi Baru</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <p className={`text-[11px] mt-1 ${isLengthValid ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isLengthValid ? '✓ Minimal 8 karakter terpenuhi' : 'Minimal 8 karakter'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-slate-700 pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e5a93c] hover:bg-amber-400 disabled:opacity-50 text-[#0f172a] font-semibold text-sm py-2.5"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Simpan Password Baru</span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/80">
            <Image src="/adapil-logo.webp" alt="Logo Adapil.ai" fill className="object-cover" priority />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-2">Adapil.ai</h1>
          <p className="text-xs text-amber-400 font-medium tracking-wide">Dewan Cerdas, Konstituen Puas</p>
        </div>
        <Suspense fallback={<div className="text-center text-xs text-slate-400">Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
