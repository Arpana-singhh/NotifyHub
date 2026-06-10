export type UserNotificationItemType = ReturnType<UserNotificationItem['toUI']>;

export class UserNotificationItem {
    userNotificationId: string;
    isRead: boolean;
    isDeletedByUser: boolean;
    createdAt: string;
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    createdBy: string;
    notificationCreatedAt: string;
    notificationUpdatedAt: string;

    constructor(raw: Record<string, any> = {}) {
        this.userNotificationId = raw.userNotificationId ?? null;
        this.isRead = raw.isRead ?? false;
        this.isDeletedByUser = raw.isDeletedByUser ?? false;
        this.createdAt = raw.createdAt ?? null;

        const n = raw.notification ?? {};
        this.notificationId = n.notificationId ?? null;
        this.title = n.title ?? '';
        this.message = n.message ?? '';
        this.type = n.type ?? 'info';
        this.createdBy = n.createdBy ?? null;
        this.notificationCreatedAt = n.createdAt ?? null;
        this.notificationUpdatedAt = n.updatedAt ?? null;
    }

    toUI() {
        return {
            userNotificationId: this.userNotificationId,
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

    static fromApiList(list: Record<string, any>[] = []): UserNotificationItem[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new UserNotificationItem(item));
    }
}
