'use client';

import { useEffect, useState } from 'react';
import { Input, Select, Spin, Button } from 'antd';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminNotificationListing from '../../components/common/AdminNotificationListing';
import UserNotificationListing from '../../components/common/UserNotificationListing';
import { useNotificationStore } from '../../store/notificationStore';

const PAGE_SIZE = 10;

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    const { notifications, recipients, isUserLoading, isAdminLoading, fetchUserNotifications, fetchAdminNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAdminNotification, deleteAdminUserNotification } = useNotificationStore();

    useEffect(() => {
        if (status !== 'authenticated') return;
        if (isAdmin) fetchAdminNotifications();
        else fetchUserNotifications();
    }, [status, isAdmin]);

    const loading = isAdmin ? isAdminLoading : isUserLoading;

    const userFilterOptions = [
        { value: 'all', label: 'All Users' },
        ...recipients.map((r) => ({ value: r.userId, label: r.name })),
    ];

    return (
        <DashboardLayout>
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
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    onSearch={(val) => setSearchQuery(val)}
                />
                <Select
                    value={typeFilter}
                    style={{ width: 130 }}
                    onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                    options={[
                        { value: 'all',     label: 'All Types' },
                        { value: 'info',    label: 'Info' },
                        { value: 'success', label: 'Success' },
                        { value: 'warning', label: 'Warning' },
                        { value: 'error',   label: 'Error' },
                    ]}
                />
                <Select
                    value={statusFilter}
                    style={{ width: 130 }}
                    onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                    options={[
                        { value: 'all',    label: 'All Status' },
                        { value: 'read',   label: 'Read' },
                        { value: 'unread', label: 'Unread' },
                    ]}
                />
                {isAdmin && (
                    <Select
                        value={userFilter}
                        style={{ width: 160 }}
                        onChange={(val) => setUserFilter(val)}
                        options={userFilterOptions}
                    />
                )}
                {!isAdmin && notifications.some((n) => n.status === 'unread') && (
                    <Button onClick={markAllAsRead}>
                        <i className="fas fa-check-double" /> Mark all read
                    </Button>
                )}
            </div>

            {/* Notifications list */}
            <div className="nh-card">
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <Spin size="large" />
                    </div>
                ) : isAdmin ? (
                    <AdminNotificationListing
                        recipients={recipients}
                        onDelete={deleteAdminNotification}
                        onDeleteForUser={deleteAdminUserNotification}
                        searchQuery={searchQuery}
                        typeFilter={typeFilter}
                        statusFilter={statusFilter}
                        userFilter={userFilter}
                    />
                ) : (
                    <UserNotificationListing
                        notifications={notifications}
                        currentPage={currentPage}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                        onDelete={deleteNotification}
                        onMarkRead={markAsRead}
                        searchQuery={searchQuery}
                        typeFilter={typeFilter}
                        statusFilter={statusFilter}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
