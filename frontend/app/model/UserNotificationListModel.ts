type NotificationDetail = {
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

export class UserNotificationItem {
    userNotificationId: string;
    isRead: boolean;
    isDeletedByUser: boolean;
    createdAt: string;
    notification: NotificationDetail;

    constructor(raw: Record<string, any> = {}) {
        const n = raw.notification ?? {};

        this.userNotificationId = raw.userNotificationId ?? null;
        this.isRead = raw.isRead ?? false;
        this.isDeletedByUser = raw.isDeletedByUser ?? false;
        this.createdAt = raw.createdAt ?? null;

        this.notification = {
            notificationId: n.notificationId ?? null,
            title: n.title ?? '',
            message: n.message ?? '',
            type: n.type ?? 'info',
            createdBy: n.createdBy ?? null,
            createdAt: n.createdAt ?? null,
            updatedAt: n.updatedAt ?? null,
        };
    }

    toObjectUI() {
        return {
            userNotificationId: this.userNotificationId,
            type: this.notification.type,
            title: this.notification.title,
            subtitle: this.notification.message,
            status: (this.isRead ? 'read' : 'unread') as 'read' | 'unread',
            createdAt: this.createdAt,
        };
    }

    static fromApiList(list: Record<string, any>[] = []): UserNotificationItem[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new UserNotificationItem(item));
    }
}
