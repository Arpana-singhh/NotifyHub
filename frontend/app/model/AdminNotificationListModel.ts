export type AdminNotificationEntryType = ReturnType<AdminNotificationEntry['toUI']>;
export type AdminRecipientType = ReturnType<AdminRecipient['toUI']>;

export class AdminNotificationEntry {
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    isDeletedByUser: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;

    constructor(raw: Record<string, any> = {}) {
        this.notificationId = raw.notificationId ?? null;
        this.title = raw.title ?? '';
        this.message = raw.message ?? '';
        this.type = raw.type ?? 'info';
        this.isRead = raw.isRead ?? false;
        this.isDeletedByUser = raw.isDeletedByUser ?? false;
        this.createdBy = raw.createdBy ?? null;
        this.createdAt = raw.createdAt ?? null;
        this.updatedAt = raw.updatedAt ?? null;
    }

    toUI() {
        return {
            notificationId: this.notificationId,
            type: this.type,
            title: this.title,
            subtitle: this.message,
            status: (this.isRead ? 'read' : 'unread') as 'read' | 'unread',
            isRead: this.isRead,
            isDeletedByUser: this.isDeletedByUser,
            createdAt: this.createdAt,
        };
    }

    static fromApiList(list: Record<string, any>[] = []): AdminNotificationEntry[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new AdminNotificationEntry(item));
    }
}

export class AdminRecipient {
    userId: string;
    name: string;
    email: string;
    role: string;
    notifications: AdminNotificationEntry[];

    constructor(raw: Record<string, any> = {}) {
        this.userId = raw.userId ?? null;
        this.name = raw.name ?? '';
        this.email = raw.email ?? '';
        this.role = raw.role ?? 'user';
        this.notifications = AdminNotificationEntry.fromApiList(raw.notifications ?? []);
    }

    toUI() {
        return {
            userId: this.userId,
            name: this.name,
            email: this.email,
            role: this.role,
            notifications: this.notifications.map((n) => n.toUI()),
        };
    }

    static fromApiList(list: Record<string, any>[] = []): AdminRecipient[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new AdminRecipient(item));
    }
}
