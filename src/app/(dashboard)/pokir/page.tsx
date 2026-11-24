export default function PokirPage() {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-slate-100">Generator Naskah Pokir Bappeda / SIPD</h2>
      <p className="text-xs text-slate-400 mt-1">
        Kelompokkan aspirasi reses berdasarkan Kecamatan dan Sektor untuk menyusun draf resmi Pokir DPRD melalui endpoint <code className="text-amber-400">POST /api/pokir/draft</code>.
      </p>
    </div>
  );
}
