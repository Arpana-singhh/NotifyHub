'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Tooltip } from 'antd';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const USER_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',      icon: 'fas fa-table-cells' },
  { label: 'Notifications', href: '/notifications',  icon: 'fas fa-bell' },
  { label: 'Profile',       href: '/profile',        icon: 'fas fa-user' },
  { label: 'Help',          href: '/help',           icon: 'fas fa-circle-question' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',         href: '/admin',              icon: 'fas fa-table-cells' },
  { label: 'Send Notification', href: '/admin/send',         icon: 'fas fa-paper-plane' },
  { label: 'Notifications',     href: '/notifications',      icon: 'fas fa-bell' },
  { label: 'Users',             href: '/admin/users',        icon: 'fas fa-users' },
  { label: 'Support',           href: '/admin/support',      icon: 'fas fa-headset' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const items = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <aside className="nh-sidebar">
      <nav className="nh-sidebar__nav">
        {items.map((item) => (
          <Tooltip key={item.href} title={item.label} placement="right">
            <Link
              href={item.href}
              className={`nh-sidebar__item${pathname === item.href ? ' nh-sidebar__item--active' : ''}`}
            >
              <i className={item.icon} />
              <span className="label-text">{item.label}</span>
            </Link>
          </Tooltip>
        ))}

        <div className="nh-sidebar__spacer" />

        <Tooltip title="Logout" placement="right">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="nh-sidebar__item nh-sidebar__item--logout"
          >
            <i className="fas fa-arrow-right-from-bracket" />
            <span className="label-text"> Logout </span>
          </button>
        </Tooltip>

      </nav>
    </aside>
  );
}
