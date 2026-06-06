'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SCREENS = [
  { label: 'Home',                href: '/' },
  { label: 'Login',               href: '/login' },
  { label: 'Register',            href: '/register' },
  { label: 'User Dashboard',      href: '/dashboard' },
  { label: 'Notifications',       href: '/notifications' },
  { label: 'Admin Dashboard',     href: '/admin' },
  { label: 'Create Notification', href: '/admin/send' },
  { label: 'User Management',     href: '/admin/users' },
  { label: 'Profile',             href: '/profile' },
];

export default function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="demo-nav">
      <span className="demo-nav__label">Screens:</span>
      {SCREENS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={`demo-nav__btn${pathname === s.href ? ' demo-nav__btn--active' : ''}`}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
