const tones = {
  brand: 'bg-brand-light text-brand',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

export default function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`grid h-10 w-10 place-items-center rounded-full ${tones[tone] || tones.brand}`}>
            <Icon size={20} />
          </div>
        )}
        <div>
          <p className="text-xs uppercase text-gray-400">{label}</p>
          <p className="text-xl font-bold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}