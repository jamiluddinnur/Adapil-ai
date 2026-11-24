import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adapil.ai — Dewan Cerdas, Konstituen Puas',
  description: 'SaaS Intelijen Data Parlemen untuk Tenaga Ahli DPRD',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#0f172a] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
