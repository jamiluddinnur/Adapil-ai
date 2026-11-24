# Adapil.ai — Asisten Legislatif Digital

> **"Dewan Cerdas, Konstituen Puas"**

SaaS B2B intelijen data parlemen untuk Tenaga Ahli (TA) Anggota DPRD Provinsi/Kabupaten/Kota. Dibangun dengan Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Neon PostgreSQL, dan Google Gemini API.

## Fitur Utama
1. **Mobile Quick Intake Reses (`/reses`)**: Pencatatan aspirasi satu jempol, deteksi kewenangan real-time (`PROVINSI` / `KAB_KOTA` / `PUSAT`), dan dukungan *offline fallback* (`localStorage` auto-sync).
2. **Generator Pokir Bappeda/SIPD (`/pokir` & `/api/pokir/draft`)**: Penyusunan draf resmi Pokok-Pokok Pikiran DPRD.
3. **Budget Intelligence & Audit Anggaran (`/budget` & `/api/budget/generate`)**: Deteksi anomali 10%+ (`INFLASI_10_PLUS`, `LONJAKAN_20_PLUS`, `PEMOTONGAN_MODAL`), generator 5 pertanyaan kritis Banggar/Komisi, salin format WhatsApp, dan cetak lembar sidang A4 1 halaman.
4. **Multi-Tenancy & Keamanan**: Isolasi data berbasis `workspace_id` + PostgreSQL Row-Level Security (RLS).

## Instalasi & Deployment
```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

Jalankan `prisma/rls-migration.sql` di Neon SQL Editor untuk mengaktifkan Row-Level Security (RLS).
