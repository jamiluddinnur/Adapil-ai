import ResesQuickIntake from '@/components/ResesQuickIntake';

export default function ResesPage() {
  return (
    <div>
      <div className="max-w-lg mx-auto mb-4">
        <h2 className="text-lg font-bold text-slate-100">Quick Intake Aspirasi Reses</h2>
        <p className="text-xs text-slate-400">Catat aspirasi warga secara cepat dengan deteksi kewenangan otomatis.</p>
      </div>
      <ResesQuickIntake />
    </div>
  );
}
