'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const USER_NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: 'fas fa-table-cells' },
  { label: 'Notifications', href: '/notifications',  icon: 'fas fa-bell' },
  { label: 'Profile',       href: '/profile',        icon: 'fas fa-user' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',         href: '/admin',       icon: 'fas fa-table-cells' },
  { label: 'Send Notification', href: '/admin/send',  icon: 'fas fa-paper-plane' },
  { label: 'Notifications',     href: '/notifications', icon: 'fas fa-bell' },
  { label: 'Users',             href: '/admin/users', icon: 'fas fa-users' },
  { label: 'Analytics',         href: '/admin/analytics', icon: 'fas fa-chart-bar' },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const items = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <aside className="nh-sidebar">
      <nav className="nh-sidebar__nav">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nh-sidebar__item${pathname === item.href ? ' nh-sidebar__item--active' : ''}`}
          >
            <i className={item.icon} />
            {item.label}
          </Link>
        ))}

        <div className="nh-sidebar__spacer" />

        {!isAdmin && (
          <Link href="/" className="nh-sidebar__item nh-sidebar__item--logout">
            <i className="fas fa-arrow-right-from-bracket" />
            Logout
          </Link>
        )}
      </nav>
    </aside>
  );
}
