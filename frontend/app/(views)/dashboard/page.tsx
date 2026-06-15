'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import NotificationItem from '../../components/common/NotificationItem';
import Badge from '@/app/components/common/Badge';
import { useNotificationStore } from '@/app/store/notificationStore';
import { timeAgo } from '@/app/utils/helper';

const TYPES = ['info', 'success', 'warning', 'error'] as const;

export default function DashboardPage() {
  const { notifications, isUserLoading, fetchUserNotifications, markAllAsRead } = useNotificationStore();
  const [animatedWidths, setAnimatedWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchUserNotifications();
  }, []);

  const total  = notifications.length;
  const unread = notifications.filter((n) => n.status === 'unread').length;
  const read   = total - unread;

  // Type breakdown — count per type, percent of total
  const typeCounts = TYPES.map((type) => {
    const count = notifications.filter((n) => n.type === type).length;
    return { type, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  // Animate progress bars after data loads
  useEffect(() => {
    if (!notifications.length) return;
    setAnimatedWidths({});
    const frame = requestAnimationFrame(() => {
      const widths: Record<string, number> = {};
      typeCounts.forEach((t) => { widths[t.type] = t.pct; });
      setAnimatedWidths(widths);
    });
    return () => cancelAnimationFrame(frame);
  }, [notifications.length]);

  const unreadList = [...notifications]
    .filter((n) => n.status === 'unread')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);


  return (
    <DashboardLayout>
      <div className="main-content__header">
        <h1 className="main-content__title">My Dashboard</h1>
        <div className="live-status">
          <span className="live-status__dot" />
          Live updates active
        </div>
      </div>

      {/* Stats row — Bootstrap grid */}
      <div className="container-fluid px-0 mb-4">
        <div className="row g-3">
          <div className="col-12 col-sm-4">
            <StatCard label="Total" value={total} sub="All notifications" />
          </div>
          <div className="col-12 col-sm-4">
            <StatCard label="Unread" value={unread} sub="Need attention" valueVariant="primary" />
          </div>
          <div className="col-12 col-sm-4">
            <StatCard label="Read" value={read} sub="All caught up" valueVariant="success" />
          </div>
        </div>
      </div>

      {/* Type breakdown + Unread spotlight */}
      <div className="container-fluid px-0 mb-4">
        <div className="row g-3 align-items-stretch">

          {/* Type breakdown */}
          <div className="col-12 col-lg-6">
            <div className="nh-card h-100">
              <div className="nh-card__header">
                <span className="nh-card__title">Notifications by type</span>
              </div>
              <div className="nh-card__body">
                {isUserLoading ? (
                  <div className="d-flex justify-content-center py-3"><Spin /></div>
                ) : total === 0 ? (
                  <div className="text-center text-muted py-3">No data yet</div>
                ) : (
                  TYPES.map((type) => {
                    const t = typeCounts.find((x) => x.type === type)!;
                    return (
                      <div key={type} className="progress-stat progress-stat--inline">
                        <Badge variant={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
                        <div className="progress-stat__track">
                          <div
                            className={`progress-stat__fill progress-stat__fill--${type}`}
                            style={{ width: `${animatedWidths[type] ?? 0}%` }}
                          />
                        </div>
                        <span className="progress-stat__pct">{t.count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Unread spotlight / Recent fallback */}
          <div className="col-12 col-lg-6">
            <div className="nh-card h-100">
              <div className="nh-card__header">
                <span className="nh-card__title">
                  {unread > 0 ? 'Needs attention' : 'Recent notifications'}
                </span>
                {unread > 0 && (
                  <button className="nh-btn nh-btn--outline nh-btn--sm" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="nh-card__body p-0">
                {isUserLoading ? (
                  <div className="d-flex justify-content-center py-3"><Spin /></div>
                ) : unread > 0 ? (
                  unreadList.map((n) => (
                    <NotificationItem
                      key={n.userNotificationId}
                      showTime
                      type={n.type}
                      title={n.title}
                      subtitle={n.subtitle}
                      time={timeAgo(n.createdAt)}
                    />
                  ))
                ) : (
                  [...notifications]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4)
                    .map((n) => (
                      <NotificationItem
                        key={n.userNotificationId}
                        showTime
                        type={n.type}
                        title={n.title}
                        subtitle={n.subtitle}
                        time={timeAgo(n.createdAt)}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}
