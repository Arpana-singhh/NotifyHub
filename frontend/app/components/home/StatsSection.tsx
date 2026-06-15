'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Reveal from './Reveal';
import CountUp from './CountUp';
import { useNotificationStore } from '@/app/store/notificationStore';

const STATIC_STATS: { end: number; decimals?: number; prefix?: string; suffix: string; label: string; sub: string }[] = [
  { end: 0, suffix: '+', label: 'Notifications sent', sub: 'And counting' },
  { end: 0, suffix: '+', label: 'Active users', sub: 'Across all teams' },
  { end: 0, suffix: '%', label: 'Read rate', sub: 'Messages opened' },
  { end: 0, suffix: '', label: 'Pending', sub: 'In inbox' },
];

export default function StatsSection() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const { dashboardStats, fetchDashboardStats } = useNotificationStore();

  useEffect(() => {
    if (isAdmin) fetchDashboardStats();
  }, [isAdmin]);

  const stats = STATIC_STATS.map((s) => {
    if (!dashboardStats) return s;
    if (s.label === 'Notifications sent') return { ...s, end: dashboardStats.totalNotifications };
    if (s.label === 'Active users')       return { ...s, end: dashboardStats.totalUsers };
    if (s.label === 'Read rate')          return { ...s, end: dashboardStats.readRate };
    if (s.label === 'Pending')            return { ...s, end: dashboardStats.unreadNotifications };
    return s;
  });

  return (
    <section id="stats" className="home-stats" data-section="dark">
      <div className="container">
        <div className="home-stats__grid">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 150}>
              <div className="home-stats__item">
                <div className="home-stats__value">
                  <CountUp
                    end={stat.end}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="home-stats__label">{stat.label}</div>
                <div className="home-stats__sub">{stat.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
