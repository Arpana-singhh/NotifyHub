import { create } from 'zustand';
import NotificationService from '../service/api/notification.services';
import { TTLMap } from '../utils/TTLMap';
import type { AdminRecipient } from '../model/AdminNotificationListModel';
import type { UserNotification } from '../components/common/UserNotificationListing';

/* ------------------------------------------------------------------ */
/* TTL CACHES (module-level, shared across store instances)             */
/* ------------------------------------------------------------------ */

const userNotifCache = new TTLMap<string, UserNotification[]>(5 * 60 * 1000);  // 5 min
const adminNotifCache = new TTLMap<string, AdminRecipient[]>(5 * 60 * 1000);

const USER_CACHE_KEY = 'user-notifications';
const ADMIN_CACHE_KEY = 'admin-notifications';

/* ------------------------------------------------------------------ */
/* STORE TYPES                                                         */
/* ------------------------------------------------------------------ */

interface NotificationState {
    notifications: UserNotification[];
    recipients: AdminRecipient[];

    isUserLoading: boolean;
    isAdminLoading: boolean;

    fetchUserNotifications: (force?: boolean) => Promise<void>;
    fetchAdminNotifications: (force?: boolean) => Promise<void>;
    deleteNotification: (userNotificationId: string) => Promise<void>;
    deleteAdminNotification: (notificationId: string) => Promise<void>;
    deleteAdminUserNotification: (userId: string, notificationId: string) => Promise<void>;

    reset: () => void;
}

/* ------------------------------------------------------------------ */
/* STORE IMPLEMENTATION                                                */
/* ------------------------------------------------------------------ */

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    recipients: [],

    isUserLoading: false,
    isAdminLoading: false,

    /* ---------------- FETCH USER NOTIFICATIONS ---------------- */

    fetchUserNotifications: async (force = false) => {
        if (!force) {
            const cached = userNotifCache.get(USER_CACHE_KEY);
            if (cached) {
                set({ notifications: cached });
                return;
            }
        }

        set({ isUserLoading: true });
        try {
            const items = await NotificationService.getUserNotifications();
            const mapped = items.map((n) => n.toObjectUI());
            userNotifCache.set(USER_CACHE_KEY, mapped);
            set({ notifications: mapped });
        } catch {
            set({ notifications: [] });
        } finally {
            set({ isUserLoading: false });
        }
    },

    /* ---------------- FETCH ADMIN NOTIFICATIONS ---------------- */

    fetchAdminNotifications: async (force = false) => {
        if (!force) {
            const cached = adminNotifCache.get(ADMIN_CACHE_KEY);
            if (cached) {
                set({ recipients: cached });
                return;
            }
        }

        set({ isAdminLoading: true });
        try {
            const data = await NotificationService.getAdminNotifications();
            adminNotifCache.set(ADMIN_CACHE_KEY, data);
            set({ recipients: data });
        } catch {
            set({ recipients: [] });
        } finally {
            set({ isAdminLoading: false });
        }
    },

    /* ---------------- DELETE NOTIFICATION (user only) ---------------- */

    deleteNotification: async (userNotificationId: string) => {
        await NotificationService.deleteNotification(userNotificationId);
        // Update store and bust cache so next fetch reflects the deletion
        const updated = get().notifications.filter(
            (n) => n.userNotificationId !== userNotificationId
        );
        userNotifCache.set(USER_CACHE_KEY, updated);
        set({ notifications: updated });
    },

    /* ---------------- DELETE NOTIFICATION (admin) ---------------- */

    deleteAdminNotification: async (notificationId: string) => {
        await NotificationService.deleteAdminNotification(notificationId);
        const updated = get().recipients.map((r) => ({
            ...r,
            notifications: r.notifications.filter((n) => n.notificationId !== notificationId),
        }));
        adminNotifCache.set(ADMIN_CACHE_KEY, updated);
        set({ recipients: updated });
    },

    /* ---------------- DELETE NOTIFICATION (admin — single user) ---------------- */

    deleteAdminUserNotification: async (userId: string, notificationId: string) => {
        await NotificationService.deleteAdminUserNotification(userId, notificationId);
        const updated = get().recipients.map((r) => ({
            ...r,
            notifications: r.userId === userId
                ? r.notifications.filter((n) => n.notificationId !== notificationId)
                : r.notifications,
        }));
        adminNotifCache.set(ADMIN_CACHE_KEY, updated);
        set({ recipients: updated });
    },

    /* ---------------- RESET ---------------- */

    reset: () => {
        userNotifCache.clear();
        adminNotifCache.clear();
        set({ notifications: [], recipients: [], isUserLoading: false, isAdminLoading: false });
    },
}));
