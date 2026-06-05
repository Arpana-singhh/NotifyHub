type BadgeVariant =
  | 'info' | 'success' | 'warning' | 'error'
  | 'primary' | 'neutral'
  | 'role-user' | 'role-admin'
  | 'active' | 'blocked';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`nh-badge nh-badge--${variant}`}>
      {children}
    </span>
  );
}
