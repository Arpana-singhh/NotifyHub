'use client';

import { Collapse, Badge as AntBadge } from 'antd';
import Badge from './Badge';
import type { AdminRecipient, AdminNotificationEntry } from '@/app/model/AdminNotificationListModel';

interface AdminNotificationListingProps {
    recipients: AdminRecipient[];
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function NotificationRow({ notif }: { notif: AdminNotificationEntry }) {
    return (
        <div className="admin-notif-row">
            <div className="admin-notif-row__title">{notif.title}</div>
            <div className="admin-notif-row__message">{notif.message}</div>
            <div className="admin-notif-row__meta">
                <div className="admin-notif-row__header">
                    <Badge variant={notif.type}>
                        {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                    </Badge>
                    <Badge variant={notif.isRead ? 'neutral' : 'primary'}>
                        {notif.isRead ? 'Read' : 'Unread'}
                    </Badge>
                </div>
                <span className="admin-notif-row__meta-item">
                    <i className="fas fa-clock" /> {formatDate(notif.createdAt)}
                </span>
            </div>
        </div>
    );
}

function RecipientHeader({ recipient }: { recipient: AdminRecipient }) {
    return (
        <div className="admin-notif-header">
            <div className="admin-notif-header__user">
                <span className="admin-notif-header__name">{recipient.name}</span>
                <Badge variant={recipient.role === 'admin' ? 'role-admin' : 'role-user'}>
                    {recipient.role.charAt(0).toUpperCase() + recipient.role.slice(1)}
                </Badge>
            </div>
            <div className="admin-notif-header__email">{recipient.email}</div>
        </div>
    );
}

export default function AdminNotificationListing({ recipients }: AdminNotificationListingProps) {
    if (!recipients || recipients.length === 0) {
        return (
            <div className="d-flex justify-content-center py-5 text-muted">
                No notifications found.
            </div>
        );
    }

    const items = recipients.map((recipient) => ({
        key: recipient.userId,
        label: <RecipientHeader recipient={recipient} />,
        extra: (
            <AntBadge
                count={recipient.notifications.length}
                style={{ backgroundColor: '#6366f1' }}
            />
        ),
        children: recipient.notifications.length === 0 ? (
            <div className="text-muted py-2">No notifications for this user.</div>
        ) : (
            recipient.notifications.map((notif) => (
                <NotificationRow key={notif.notificationId} notif={notif} />
            ))
        ),
    }));

    return (
        <Collapse
            accordion={false}
            items={items}
            className="admin-notif-collapse"
        />
    );
}
