'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import BarChart from '@/app/components/common/BarChart';
import { useNotificationStore } from '@/app/store/notificationStore';
import Badge from '@/app/components/common/Badge';
import { useSession } from 'next-auth/react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const { dashboardStats, isStatsLoading, fetchDashboardStats, fetchAdminNotifications, chartData, fetchChartData } = useNotificationStore();
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (isAdmin) {
      fetchAdminNotifications();
      fetchDashboardStats();
      fetchChartData();
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
                sub="Active Users"
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
        <div className="row g-3 align-items-stretch">
          {/* Bar chart */}
          <div className="col-12 col-lg-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Notifications sent — last 7 days</span>
              </div>
              <div className="nh-card__body">
                <BarChart data={chartData} />
              </div>
            </div>
          </div>

          {/* Read rate by type */}
          <div className="col-12 col-lg-6">
            <div className="nh-card progress-card">
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
