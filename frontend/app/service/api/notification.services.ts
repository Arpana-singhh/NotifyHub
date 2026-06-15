import axios from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";
import { UserNotificationItem } from "@/app/model/UserNotificationListModel";
import { AdminRecipient } from "@/app/model/AdminNotificationListModel";
import { DashboardStatsModel } from "@/app/model/DashboardStatsModel";

class NotificationService {
    static async getUserNotifications(): Promise<UserNotificationItem[]> {
        const response = await axios.get(apiRoutes.notification.list, {
            headers: { Accept: "application/json" },
        });
        return UserNotificationItem.fromApiList(response.data.notifications);
    }

    static async getAdminNotifications(): Promise<AdminRecipient[]> {
        const response = await axios.get(apiRoutes.notification.adminList, {
            headers: { Accept: "application/json" },
        });
        return AdminRecipient.fromApiList(response.data.recipients);
    }

    static async getChartData(): Promise<{ date: string; label: string; count: number }[]> {
        const response = await axios.get(apiRoutes.notification.chart, {
            headers: { Accept: "application/json" },
        });
        return response.data.data;
    }

    static async getDashboardStats(): Promise<DashboardStatsModel> {
        const response = await axios.get(apiRoutes.notification.stats, {
            headers: { Accept: "application/json" },
        });
        return new DashboardStatsModel(response.data);
    }

    static async markAsRead(userNotificationId: string): Promise<void> {
        await axios.patch(apiRoutes.notification.markRead(userNotificationId), {}, {
            headers: { Accept: "application/json" },
        });
    }

    static async markAllAsRead(): Promise<void> {
        await axios.patch(apiRoutes.notification.markAllRead, {}, {
            headers: { Accept: "application/json" },
        });
    }

    static async deleteNotification(userNotificationId: string): Promise<void> {
        await axios.delete(apiRoutes.notification.delete(userNotificationId), {
            headers: { Accept: "application/json" },
        });
    }

    static async deleteAdminNotification(notificationId: string): Promise<void> {
        await axios.delete(apiRoutes.notification.adminDelete, {
            headers: { Accept: "application/json" },
            data: { notificationIds: [notificationId] },
        });
    }

    static async createNotification(payload: {
        title: string;
        message: string;
        type: string;
        recipientType: 'all' | 'selected';
        userIds?: string[];
    }): Promise<{ message: string }> {
        const response = await axios.post(apiRoutes.notification.create, payload, {
            headers: { Accept: "application/json" },
        });
        return response.data;
    }

    static async deleteAdminUserNotification(userId: string, notificationId: string): Promise<void> {
        await axios.delete(apiRoutes.notification.adminDeleteForUser, {
            headers: { Accept: "application/json" },
            data: { userId, notificationId },
        });
    }
}

export default NotificationService;
