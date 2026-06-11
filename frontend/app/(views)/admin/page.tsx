'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { useNotificationStore } from '@/app/store/notificationStore';
import Badge from '@/app/components/common/Badge';
import { useSession } from 'next-auth/react';

const BAR_DAYS = [
  { label: 'Mon', height: 35, active: false },
  { label: 'Tue', height: 28, active: false },
  { label: 'Wed', height: 45, active: false },
  { label: 'Thu', height: 38, active: false },
  { label: 'Fri', height: 52, active: false },
  { label: 'Sat', height: 65, active: false },
  { label: 'Sun', height: 100, active: true },
];

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const { dashboardStats, isStatsLoading, fetchDashboardStats ,fetchAdminNotifications} = useNotificationStore();
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (isAdmin) {
      fetchAdminNotifications();
      fetchDashboardStats();
    }
}, [status, isAdmin]);

  // Trigger animation: start at 0, then set real values on next frame
  useEffect(() => {
    if (!dashboardStats?.byType?.length) return;
    setAnimatedWidths({});
    const frame = requestAnimationFrame(() => {
      const widths: Record<string, number> = {};
      dashboardStats.byType.forEach((r) => { widths[r.type] = r.readPercent; });
      setAnimatedWidths(widths);
    });
    return () => cancelAnimationFrame(frame);
  }, [dashboardStats]);

  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">Admin Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="container-fluid px-0 mb-4">
        {isStatsLoading ? (
          <div className="d-flex justify-content-center py-4">
            <Spin size="large" />
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <StatCard
                label="Total Users"
                value={dashboardStats?.totalUsers ?? '—'}
                sub="Active, non-admin"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                label="Notifications"
                value={dashboardStats?.totalNotifications.toLocaleString() ?? '—'}
                sub="Sent all time"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                label="Read"
                value={dashboardStats?.readNotifications.toLocaleString() ?? '—'}
                sub={`${dashboardStats?.readRate ?? 0}% read rate`}
                valueVariant="success"
              />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard
                label="Unread"
                value={dashboardStats?.unreadNotifications.toLocaleString() ?? '—'}
                sub="Pending"
                valueVariant="primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="container-fluid px-0">
        <div className="row g-3">
          {/* Bar chart */}
          <div className="col-12 col-lg-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Notifications sent — last 7 days</span>
              </div>
              <div className="nh-card__body">
                <div className="bar-chart">
                  {BAR_DAYS.map((d) => (
                    <div key={d.label} className="bar-chart__col">
                      <div
                        className={`bar-chart__bar${d.active ? ' bar-chart__bar--active' : ''}`}
                        style={{ height: `${d.height}%` }}
                      />
                      <span className="bar-chart__label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Read rate by type */}
          <div className="col-12 col-lg-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Read rate by type</span>
              </div>
              <div className="nh-card__body">
                {(dashboardStats?.byType ?? []).map((r) => (
                  <div key={r.type} className="progress-stat progress-stat--inline">
                    <Badge variant={r.type}>{r.type.charAt(0).toUpperCase() + r.type.slice(1)}</Badge>
                    <div className="progress-stat__track">
                      <div
                        className={`progress-stat__fill progress-stat__fill--${r.type}`}
                        style={{ width: `${animatedWidths[r.type] ?? 0}%` }}
                      />
                    </div>
                    <span className="progress-stat__pct">{r.readPercent}%</span>
                  </div>
                ))}
                {!isStatsLoading && !dashboardStats?.byType?.length && (
                  <div className="text-center text-muted py-3">No data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
