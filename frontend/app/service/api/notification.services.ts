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
}

export default NotificationService;
