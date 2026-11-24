'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FileSpreadsheet, FileText } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/reses', label: 'Reses Dapil', icon: ClipboardList },
  { href: '/budget', label: 'Audit Anggaran', icon: FileSpreadsheet },
  { href: '/pokir', label: 'Draf Pokir', icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-950/60 p-4 print:hidden">
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shrink-0">
            <Image src="/adapil-logo.webp" alt="Adapil.ai" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight">Adapil.ai</h1>
            <p className="text-[10px] text-amber-400 font-medium">Dewan Cerdas, Konstituen Puas</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-[#e5a93c] text-[#0f172a]'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden app-header sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3 print:hidden">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700">
          <Image src="/adapil-logo.webp" alt="Adapil.ai" fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-none">Adapil.ai</h1>
          <p className="text-[10px] text-amber-400 font-medium mt-0.5">Dewan Cerdas, Konstituen Puas</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex justify-around py-2 print:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium ${
                active ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
