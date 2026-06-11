'use client';

import { Button } from 'antd';
import { useState } from 'react';
import Badge from './Badge';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';

type NotifType = 'info' | 'success' | 'warning' | 'error';

export type UserNotification = {
    userNotificationId: string;
    type: NotifType;
    title: string;
    subtitle: string;
    status: 'read' | 'unread';
    createdAt: string;
};

interface NotificationRowProps extends UserNotification {
    onDelete: (id: string) => void;
}

interface UserNotificationListingProps {
    notifications: UserNotification[];
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onDelete: (userNotificationId: string) => void;
    searchQuery?: string;
    typeFilter?: string;
    statusFilter?: string;
}

function NotificationRow({ userNotificationId, type, title, subtitle, status, onDelete }: NotificationRowProps) {
    const [open, setOpen] = useState(false);
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

    const handleConfirm = () => {
        setOpen(false);
        onDelete(userNotificationId);
    };

    return (
        <div className="notif-item">
            <span className={`notif-item__dot notif-item__dot--${type}`} />
            <div className="notif-item__body">
                <div className="notif-item__title">{title}</div>
                <div className="notif-item__sub">{subtitle}</div>
            </div>
            <div className="notif-item__meta">
                <Badge variant={type}>{typeLabel}</Badge>
                <Badge variant={status === 'unread' ? 'primary' : 'neutral'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <Button
                    type="text"
                    danger
                    icon={<i className="fas fa-trash-can" />}
                    aria-label="Delete"
                    onClick={() => setOpen(true)}
                />
                <ConfirmModal
                    open={open}
                    title="Delete Notification"
                    message="Are you sure you want to delete this notification? This action cannot be undone."
                    okText="Yes, Delete"
                    onConfirm={handleConfirm}
                    onCancel={() => setOpen(false)}
                />
            </div>
        </div>
    );
}

export default function UserNotificationListing({
    notifications,
    currentPage,
    pageSize,
    onPageChange,
    onDelete,
    searchQuery = '',
    typeFilter = 'all',
    statusFilter = 'all',
}: UserNotificationListingProps) {
    const q = searchQuery.toLowerCase();
    const filtered = notifications.filter((n) => {
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        if (statusFilter !== 'all' && n.status !== statusFilter) return false;
        if (q) return n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q);
        return true;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (filtered.length === 0) {
        return (
            <div className="d-flex justify-content-center py-5 text-muted">
                No notifications found.
            </div>
        );
    }

    return (
        <>
            {paginated.map((n) => (
                <NotificationRow key={n.userNotificationId} {...n} onDelete={onDelete} />
            ))}
            {filtered.length > pageSize && (
                <Pagination
                    current={currentPage}
                    total={filtered.length}
                    pageSize={pageSize}
                    onChange={onPageChange}
                />
            )}
        </>
    );
}
