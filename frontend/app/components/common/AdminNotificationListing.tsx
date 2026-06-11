'use client';

import { useState } from 'react';
import { Collapse, Badge as AntBadge, Table, Button } from 'antd';
import Badge from './Badge';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import type { AdminRecipient, AdminNotificationEntry } from '@/app/model/AdminNotificationListModel';

interface AdminNotificationListingProps {
    recipients: AdminRecipient[];
    onDelete?: (notificationId: string) => void;
    onDeleteForUser?: (userId: string, notificationId: string) => void;
    searchQuery?: string;
    typeFilter?: string;
    statusFilter?: string;
    userFilter?: string;
}

type ViewMode = 'by-recipient' | 'delivery-log' | 'notifications';

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

/* ------------------------------------------------------------------ */
/* BY RECIPIENT VIEW                                                    */
/* ------------------------------------------------------------------ */

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

const BY_RECIPIENT_PAGE_SIZE = 10;

function ByRecipientView({ recipients, searchQuery = '', typeFilter = 'all', statusFilter = 'all', userFilter = 'all' }: { recipients: AdminRecipient[]; searchQuery?: string; typeFilter?: string; statusFilter?: string; userFilter?: string }) {
    const [currentPage, setCurrentPage] = useState(1);

    const q = searchQuery.toLowerCase();

    const filtered = recipients
        .filter((r) => userFilter === 'all' || r.userId === userFilter)
        .map((r) => ({
            ...r,
            notifications: r.notifications.filter((n) => {
                if (typeFilter !== 'all' && n.type !== typeFilter) return false;
                if (statusFilter === 'read' && !n.isRead) return false;
                if (statusFilter === 'unread' && n.isRead) return false;
                if (q) return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
                return true;
            }),
        }))
        .filter((r) => !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.notifications.length > 0);

    const paginated = filtered.slice(
        (currentPage - 1) * BY_RECIPIENT_PAGE_SIZE,
        currentPage * BY_RECIPIENT_PAGE_SIZE
    );

    const items = paginated.map((recipient) => ({
        key: recipient.userId,
        label: <RecipientHeader recipient={recipient} />,
        extra: (
            <AntBadge
                count={recipient.notifications.length}
                style={{ backgroundColor: '#100f0e' }}
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
        <>
            <Collapse
                accordion={false}
                items={items}
                className="admin-notif-collapse"
            />
            {filtered.length > BY_RECIPIENT_PAGE_SIZE && (
                <Pagination
                    current={currentPage}
                    total={filtered.length}
                    pageSize={BY_RECIPIENT_PAGE_SIZE}
                    onChange={setCurrentPage}
                />
            )}
        </>
    );
}

/* ------------------------------------------------------------------ */
/* DELIVERY LOG VIEW (all user × notification pairs)                   */
/* ------------------------------------------------------------------ */

type DeliveryRow = {
    rowKey: string;
    userId: string;
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    isDeletedByUser: boolean;
    createdAt: string;
    userName: string;
    userEmail: string;
};

type PendingDelete = { userId: string; notificationId: string; userName: string; title: string } | null;

function DeliveryLogView({
    recipients,
    onDeleteForUser,
    searchQuery = '',
    typeFilter = 'all',
    statusFilter = 'all',
    userFilter = 'all',
}: {
    recipients: AdminRecipient[];
    onDeleteForUser?: (userId: string, notificationId: string) => void;
    searchQuery?: string;
    typeFilter?: string;
    statusFilter?: string;
    userFilter?: string;
}) {
    const [pending, setPending] = useState<PendingDelete>(null);

    const handleConfirm = () => {
        if (pending) onDeleteForUser?.(pending.userId, pending.notificationId);
        setPending(null);
    };

    const q = searchQuery.toLowerCase();

    const allRows: DeliveryRow[] = recipients.flatMap((r) =>
        r.notifications.map((n) => ({
            rowKey: `${n.notificationId}-${r.userId}`,
            userId: r.userId,
            notificationId: n.notificationId,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            isDeletedByUser: n.isDeletedByUser,
            createdAt: n.createdAt,
            userName: r.name,
            userEmail: r.email,
        }))
    );

    const rows = allRows.filter((row) => {
        if (userFilter !== 'all' && row.userId !== userFilter) return false;
        if (typeFilter !== 'all' && row.type !== typeFilter) return false;
        if (statusFilter === 'read' && !row.isRead) return false;
        if (statusFilter === 'unread' && row.isRead) return false;
        if (q) return (
            row.title.toLowerCase().includes(q) ||
            row.message.toLowerCase().includes(q) ||
            row.userName.toLowerCase().includes(q) ||
            row.userEmail.toLowerCase().includes(q)
        );
        return true;
    });

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title', width: 160 },
        { title: 'Message', dataIndex: 'message', key: 'message', width: '30%' },
        {
            title: 'Type', dataIndex: 'type', key: 'type', width: 100,
            render: (type: string) => (
                <Badge variant={type as any}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
            ),
        },
        {
            title: 'Read', dataIndex: 'isRead', key: 'isRead', width: 90,
            render: (isRead: boolean) => (
                <Badge variant={isRead ? 'neutral' : 'primary'}>
                    {isRead ? 'Read' : 'Unread'}
                </Badge>
            ),
        },
        {
            title: 'Deleted', dataIndex: 'isDeletedByUser', key: 'isDeletedByUser', width: 90,
            render: (deleted: boolean) => (
                <Badge variant={deleted ? 'error' : 'neutral'}>
                    {deleted ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            title: 'User', key: 'user', width: 180,
            render: (_: any, row: DeliveryRow) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #6b7280)' }}>
                        {row.userEmail}
                    </div>
                </div>
            ),
        },
        {
            title: 'Action', key: 'action', width: 72,
            render: (_: any, row: DeliveryRow) => (
                <Button
                    type="text"
                    danger
                    icon={<i className="fas fa-trash-can" />}
                    aria-label="Delete"
                    onClick={() => setPending({ userId: row.userId, notificationId: row.notificationId, userName: row.userName, title: row.title })}
                />
            ),
        },
    ];

    return (
        <>
            <div className="ant-notif-table">
                <Table
                    dataSource={rows}
                    columns={columns}
                    rowKey="rowKey"
                    pagination={{ pageSize: 10, placement: ['bottomCenter'] }}
                    size="middle"
                   
                />
            </div>
            <ConfirmModal
                open={!!pending}
                title="Delete User Notification"
                message={pending ? `Remove "${pending.title}" for ${pending.userName}? This will only delete it for this user.` : ''}
                okText="Yes, Delete"
                onConfirm={handleConfirm}
                onCancel={() => setPending(null)}
            />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* NOTIFICATIONS VIEW (distinct by notificationId)                     */
/* ------------------------------------------------------------------ */

type NotifRow = {
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
};

function NotificationsView({
    recipients,
    onDelete,
    searchQuery = '',
    typeFilter = 'all',
    statusFilter = 'all',
}: {
    recipients: AdminRecipient[];
    onDelete?: (notificationId: string) => void;
    searchQuery?: string;
    typeFilter?: string;
    statusFilter?: string;
}) {
    const [pendingId, setPendingId] = useState<string | null>(null);

    const handleConfirm = () => {
        if (pendingId) onDelete?.(pendingId);
        setPendingId(null);
    };

    // Deduplicate by notificationId — keep first occurrence
    // For status filter we check if ANY recipient has that read state for this notification
    const seen = new Set<string>();
    const seenReadState = new Map<string, boolean>();
    for (const r of recipients) {
        for (const n of r.notifications) {
            if (!seen.has(n.notificationId)) {
                seen.add(n.notificationId);
                seenReadState.set(n.notificationId, n.isRead);
            } else if (n.isRead) {
                seenReadState.set(n.notificationId, true);
            }
        }
    }

    const dedupedRows: NotifRow[] = [];
    const added = new Set<string>();
    for (const r of recipients) {
        for (const n of r.notifications) {
            if (!added.has(n.notificationId)) {
                added.add(n.notificationId);
                dedupedRows.push({
                    notificationId: n.notificationId,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                });
            }
        }
    }

    const q = searchQuery.toLowerCase();
    const rows = dedupedRows.filter((row) => {
        if (typeFilter !== 'all' && row.type !== typeFilter) return false;
        if (statusFilter === 'read' && !seenReadState.get(row.notificationId)) return false;
        if (statusFilter === 'unread' && seenReadState.get(row.notificationId)) return false;
        if (q) return (
            row.title.toLowerCase().includes(q) ||
            row.message.toLowerCase().includes(q)
        );
        return true;
    });

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title', width: 200 },
        { title: 'Message', dataIndex: 'message', key: 'message' },
        {
            title: 'Type', dataIndex: 'type', key: 'type', width: 110,
            render: (type: string) => (
                <Badge variant={type as any}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
            ),
        },
        {
            title: 'Action', key: 'action', width: 72,
            render: (_: any, row: NotifRow) => (
                <Button
                    type="text"
                    danger
                    icon={<i className="fas fa-trash-can" />}
                    aria-label="Delete"
                    onClick={() => setPendingId(row.notificationId)}
                />
            ),
        },
    ];

    return (
        <>
            <div className="ant-notif-table">
                <Table
                    dataSource={rows}
                    columns={columns}
                    rowKey="notificationId"
                    pagination={{ pageSize: 10, placement: ['bottomCenter'] }}
                    size="middle"
                    
                />
            </div>
            <ConfirmModal
                open={!!pendingId}
                title="Delete Notification"
                message="Are you sure you want to permanently delete this notification for all recipients? This action cannot be undone."
                okText="Yes, Delete"
                onConfirm={handleConfirm}
                onCancel={() => setPendingId(null)}
            />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export default function AdminNotificationListing({ recipients, onDelete, onDeleteForUser, searchQuery = '', typeFilter = 'all', statusFilter = 'all', userFilter = 'all' }: AdminNotificationListingProps) {
    const [view, setView] = useState<ViewMode>('notifications');

    if (!recipients || recipients.length === 0) {
        return (
            <div className="d-flex justify-content-center py-5 text-muted">
                No notifications found.
            </div>
        );
    }

    return (
        <>
            <div className="admin-view-tabs">
                <Button
                    type={view === 'notifications' ? 'primary' : 'default'}
                    icon={<i className="fas fa-bell" />}
                    onClick={() => setView('notifications')}
                >
                    Notifications
                </Button>
                <Button
                    type={view === 'delivery-log' ? 'primary' : 'default'}
                    icon={<i className="fas fa-list-check" />}
                    onClick={() => setView('delivery-log')}
                >
                    Delivery Log
                </Button>
                <Button
                    type={view === 'by-recipient' ? 'primary' : 'default'}
                    icon={<i className="fas fa-users" />}
                    onClick={() => setView('by-recipient')}
                >
                   Notifications Per User
                </Button>
            </div>

            {view === 'by-recipient' && <ByRecipientView recipients={recipients} searchQuery={searchQuery} typeFilter={typeFilter} statusFilter={statusFilter} userFilter={userFilter} />}
            {view === 'delivery-log' && <DeliveryLogView recipients={recipients} onDeleteForUser={onDeleteForUser} searchQuery={searchQuery} typeFilter={typeFilter} statusFilter={statusFilter} userFilter={userFilter} />}
            {view === 'notifications' && <NotificationsView recipients={recipients} onDelete={onDelete} searchQuery={searchQuery} typeFilter={typeFilter} statusFilter={statusFilter} />}
        </>
    );
}
