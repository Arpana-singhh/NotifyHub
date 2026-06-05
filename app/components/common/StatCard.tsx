type ValueVariant = 'default' | 'success' | 'primary' | 'error';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  valueVariant?: ValueVariant;
}

export default function StatCard({ label, value, sub, valueVariant = 'default' }: StatCardProps) {
  const cls = valueVariant !== 'default'
    ? `stat-card__value stat-card__value--${valueVariant}`
    : 'stat-card__value';

  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className={cls}>{value}</div>
      <div className="stat-card__sub">{sub}</div>
    </div>
  );
}
