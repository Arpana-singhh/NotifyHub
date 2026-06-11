import axios from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";
import { UserNotificationItem } from "@/app/model/UserNotificationListModel";
import { AdminRecipient } from "@/app/model/AdminNotificationListModel";

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

    static async deleteAdminUserNotification(userId: string, notificationId: string): Promise<void> {
        await axios.delete(apiRoutes.notification.adminDeleteForUser, {
            headers: { Accept: "application/json" },
            data: { userId, notificationId },
        });
    }
}

export default NotificationService;
