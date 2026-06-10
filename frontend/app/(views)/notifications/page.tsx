'use client';

import { useEffect, useState } from 'react';
import { Input, Select, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import NotificationItem from '../../components/common/NotificationItem';
import Pagination from '../../components/common/Pagination';
import NotificationService from '../../service/api/notification.services';

const TYPE_CHIPS = ['All', 'Unread', 'Read', 'Info', 'Success', 'Warning', 'Error'];
const PAGE_SIZE = 10;

type NotifType = 'info' | 'success' | 'warning' | 'error';

type FlatNotification = {
  type: NotifType;
  title: string;
  subtitle: string;
  status: 'read' | 'unread';
  createdAt: string;
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [notifications, setNotifications] = useState<FlatNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const recipients = await NotificationService.getAdminNotifications();
          const flat: FlatNotification[] = recipients.flatMap((r) =>
            r.notifications.map((n) => n.toUI())
          );
          setNotifications(flat);
        } else {
          const items = await NotificationService.getUserNotifications();
          const flat: FlatNotification[] = items.map((n) => n.toUI());
          setNotifications(flat);
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [status, isAdmin]);

  const paginated = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardLayout userInitials="JS" unreadCount={5}>
      <div className="main-content__header">
        <h1 className="main-content__title">
          {isAdmin ? 'All Notifications' : 'My Notifications'}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar mb-3">
        <Input.Search
          placeholder="Search notifications..."
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Select
          defaultValue="all"
          style={{ width: 130 }}
          options={[
            { value: 'all',     label: 'All Types' },
            { value: 'info',    label: 'Info' },
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'error',   label: 'Error' },
          ]}
        />
        <Select
          defaultValue="all"
          style={{ width: 130 }}
          options={[
            { value: 'all',    label: 'All Status' },
            { value: 'read',   label: 'Read' },
            { value: 'unread', label: 'Unread' },
          ]}
        />
      </div>

      {/* Filter chips */}
      <div className="filter-chips mb-4">
        {TYPE_CHIPS.map((chip, i) => (
          <button
            key={chip}
            className={`filter-chips__chip${i === 0 ? ' filter-chips__chip--active' : ''}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="nh-card">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spin size="large" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="d-flex justify-content-center py-5 text-muted">
            No notifications found.
          </div>
        ) : (
          paginated.map((n, i) => (
            <NotificationItem
              key={i}
              showStatus
              showDelete={!isAdmin}
              {...n}
            />
          ))
        )}
        {!loading && notifications.length > PAGE_SIZE && (
          <Pagination
            current={currentPage}
            total={notifications.length}
            pageSize={PAGE_SIZE}
            onChange={setCurrentPage}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
