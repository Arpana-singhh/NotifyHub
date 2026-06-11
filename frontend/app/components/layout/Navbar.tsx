'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Avatar from '../common/Avatar';
import { useUserStore } from '@/app/store/userStore';

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
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  const displayName = user?.name || userName;
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : userInitials;

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
        {displayName && (
          <span className="nh-navbar__user-label">{displayName}</span>
        )}
        {!isAdmin && (
          <button className="nh-navbar__bell" aria-label="Notifications">
            <i className="fas fa-bell" />
            {unreadCount > 0 && (
              <span className="nh-navbar__notif-count">{unreadCount}</span>
            )}
          </button>
        )}
        <Avatar initials={initials} src={user?.avatar || undefined} size="md" />
      </div>
    </header>
  );
}
