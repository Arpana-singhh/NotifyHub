type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarColor = 'purple' | 'blue' | 'teal';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  color?: AvatarColor;
}

export default function Avatar({ initials, size = 'md', color = 'purple' }: AvatarProps) {
  return (
    <span className={`nh-avatar nh-avatar--${size} nh-avatar--${color}`}>
      {initials}
    </span>
  );
}
