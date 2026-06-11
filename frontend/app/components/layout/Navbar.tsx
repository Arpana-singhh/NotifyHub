'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Avatar from '../common/Avatar';
import { useUserStore } from '@/app/store/userStore';
import { useNotificationStore } from '@/app/store/notificationStore';

interface NavbarProps {
  isAdmin?: boolean;
  userName?: string;
  userInitials?: string;
}

export default function Navbar({
  isAdmin = false,
  userName,
  userInitials = 'JS',
}: NavbarProps) {
  const { user, fetchUser } = useUserStore();
  const { notifications, fetchUserNotifications } = useNotificationStore();

  useEffect(() => {
    fetchUser();
    if (!isAdmin) fetchUserNotifications();
  }, [isAdmin]);

  const displayName = user?.name || userName;
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : userInitials;
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

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
