import Link from 'next/link';
import Avatar from '../common/Avatar';

interface NavbarProps {
  isAdmin?: boolean;
  userName?: string;
  userInitials?: string;
  unreadCount?: number;
}

export default function Navbar({
  isAdmin = false,
  userName,
  userInitials = 'JS',
  unreadCount = 0,
}: NavbarProps) {
  return (
    <header className="nh-navbar">
      <Link
        href={isAdmin ? '/admin' : '/dashboard'}
        className="nh-navbar__brand"
      >
        <i className="fas fa-bell" />
        NotifyHub
        {isAdmin && <span className="nh-navbar__admin-badge">Admin</span>}
      </Link>

      <div className="nh-navbar__right">
        {userName && (
          <span className="nh-navbar__user-label">{userName}</span>
        )}
        {!isAdmin && (
          <button className="nh-navbar__bell" aria-label="Notifications">
            <i className="fas fa-bell" />
            {unreadCount > 0 && (
              <span className="nh-navbar__notif-count">{unreadCount}</span>
            )}
          </button>
        )}
        <Avatar initials={userInitials} size="md" />
      </div>
    </header>
  );
}
