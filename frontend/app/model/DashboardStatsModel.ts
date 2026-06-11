export interface NotificationTypeStats {
    type: 'info' | 'success' | 'warning' | 'error';
    count: number;
    readCount: number;
    readPercent: number;
}

export class DashboardStatsModel {
    totalUsers: number;
    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    byType: NotificationTypeStats[];

    constructor(raw: Record<string, any> = {}) {
        const stats = raw.stats ?? raw;
        this.totalUsers = stats.totalUsers ?? 0;
        this.totalNotifications = stats.notifications?.total ?? 0;
        this.readNotifications = stats.notifications?.read ?? 0;
        this.unreadNotifications = stats.notifications?.unread ?? 0;
        this.byType = (stats.notifications?.byType ?? []) as NotificationTypeStats[];
    }

    get readRate(): number {
        if (this.totalNotifications === 0) return 0;
        return Math.round((this.readNotifications / this.totalNotifications) * 100);
    }
}
