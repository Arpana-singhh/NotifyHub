'use client';

import { useEffect } from 'react';
import { Spin } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import NotificationItem from '../../components/common/NotificationItem';
import { useNotificationStore } from '@/app/store/notificationStore';
import { timeAgo } from '@/app/utils/helper';

export default function DashboardPage() {
  const { notifications, isUserLoading, fetchUserNotifications } = useNotificationStore();

  useEffect(() => {
    fetchUserNotifications();
  }, []);

  const total = notifications.length;
  const unread = notifications.filter((n) => n.status === 'unread').length;
  const read = total - unread;

  const recent = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <DashboardLayout unreadCount={unread}>
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

      {/* Recent notifications */}
      <div className="nh-card">
        <div className="nh-card__header">
          <span className="nh-card__title">Recent notifications</span>
        </div>

        {isUserLoading && (
          <div className="d-flex justify-content-center py-5">
            <Spin size="large" />
          </div>
        )}

        {!isUserLoading && recent.length === 0 && (
          <div className="text-center text-muted py-5">No notifications yet</div>
        )}

        {!isUserLoading && recent.map((n) => (
          <NotificationItem
            key={n.userNotificationId}
            showTime
            type={n.type}
            title={n.title}
            subtitle={n.subtitle}
            time={timeAgo(n.createdAt)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
