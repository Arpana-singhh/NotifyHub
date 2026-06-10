'use client';

import { useEffect, useState } from 'react';
import { Input, Select, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminNotificationListing from '../../components/common/AdminNotificationListing';
import UserNotificationListing from '../../components/common/UserNotificationListing';
import NotificationService from '../../service/api/notification.services';
import type { AdminRecipient } from '../../model/AdminNotificationListModel';
import type { UserNotification } from '../../components/common/UserNotificationListing';

const PAGE_SIZE = 10;


export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (status !== 'authenticated') return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    const data = await NotificationService.getAdminNotifications();
                    setRecipients(data);
                } else {
                    const items = await NotificationService.getUserNotifications();
                    setNotifications(items.map((n) => n.toObjectUI()));
                }
            } catch {
                setRecipients([]);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [status, isAdmin]);

    const handleDelete = async (userNotificationId: string) => {
        await NotificationService.deleteNotification(userNotificationId);
        setNotifications((prev) => prev.filter((n) => n.userNotificationId !== userNotificationId));
    };

    const userFilterOptions = [
        { value: 'all', label: 'All Users' },
        ...recipients.map((r) => ({ value: r.userId, label: r.name })),
    ];

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
                {isAdmin && (
                    <Select
                        defaultValue="all"
                        style={{ width: 160 }}
                        options={userFilterOptions}
                    />
                )}
            </div>

            {/* Notifications list */}
            <div className="nh-card">
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <Spin size="large" />
                    </div>
                ) : isAdmin ? (
                    <AdminNotificationListing recipients={recipients} />
                ) : (
                    <UserNotificationListing
                        notifications={notifications}
                        currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
