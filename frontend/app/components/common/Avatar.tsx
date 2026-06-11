type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarColor = 'purple' | 'blue' | 'teal';

interface AvatarProps {
  initials: string;
  src?: string;
  size?: AvatarSize;
  color?: AvatarColor;
}

export default function Avatar({ initials, src, size = 'md', color = 'purple' }: AvatarProps) {
  if (src) {
    return (
      <span className={`nh-avatar nh-avatar--${size} nh-avatar--${color}`}>
        <img
          src={src}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </span>
    );
  }

  return (
    <span className={`nh-avatar nh-avatar--${size} nh-avatar--${color}`}>
      {initials}
    </span>
  );
}
