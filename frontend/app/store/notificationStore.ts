import { create } from 'zustand';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import NotificationService from '../service/api/notification.services';
import { TTLMap } from '../utils/TTLMap';
import type { AdminRecipient } from '../model/AdminNotificationListModel';
import type { UserNotification } from '../components/common/UserNotificationListing';
import type { DashboardStatsModel } from '../model/DashboardStatsModel';

export interface ChartDataPoint { date: string; label: string; count: number; }

/* ------------------------------------------------------------------ */
/* TTL CACHES (module-level, shared across store instances)             */
/* ------------------------------------------------------------------ */

const userNotifCache  = new TTLMap<string, UserNotification[]>(5 * 60 * 1000);
const adminNotifCache = new TTLMap<string, AdminRecipient[]>(5 * 60 * 1000);
const statsCache      = new TTLMap<string, DashboardStatsModel>(5 * 60 * 1000);
const chartCache      = new TTLMap<string, ChartDataPoint[]>(5 * 60 * 1000);

const USER_CACHE_KEY = 'user-notifications';
const ADMIN_CACHE_KEY = 'admin-notifications';
const STATS_CACHE_KEY = 'admin-dashboard-stats';
const CHART_CACHE_KEY = 'admin-chart-data';

/* ------------------------------------------------------------------ */
/* STORE TYPES                                                         */
/* ------------------------------------------------------------------ */

interface NotificationState {
    notifications: UserNotification[];
    recipients: AdminRecipient[];
    dashboardStats: DashboardStatsModel | null;
    chartData: ChartDataPoint[];

    isUserLoading: boolean;
    isAdminLoading: boolean;
    isStatsLoading: boolean;
    isChartLoading: boolean;

    fetchUserNotifications: (force?: boolean) => Promise<void>;
    fetchAdminNotifications: (force?: boolean) => Promise<void>;
    fetchDashboardStats: (force?: boolean) => Promise<void>;
    fetchChartData: (force?: boolean) => Promise<void>;
    markAsRead: (userNotificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (userNotificationId: string) => Promise<void>;
    createNotification: (payload: Parameters<typeof NotificationService.createNotification>[0]) => Promise<{ message: string }>;
    deleteAdminNotification: (notificationId: string) => Promise<void>;
    deleteAdminUserNotification: (userId: string, notificationId: string) => Promise<void>;

    // ── SSE real-time helpers ──────────────────────────────────────────────
    // Called by useSSE hook when the server pushes an event
    prependNotification: (item: UserNotification) => void;
    removeNotification: (userNotificationId: string) => void;
    invalidateAndRefetch: () => Promise<void>;

    reset: () => void;
}

/* ------------------------------------------------------------------ */
/* STORE IMPLEMENTATION                                                */
/* ------------------------------------------------------------------ */

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    recipients: [],
    dashboardStats: null,
    chartData: [],

    isUserLoading: false,
    isAdminLoading: false,
    isStatsLoading: false,
    isChartLoading: false,

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
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
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
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
            set({ recipients: [] });
        } finally {
            set({ isAdminLoading: false });
        }
    },

    /* ---------------- FETCH DASHBOARD STATS (ADMIN) ---------------- */

    fetchDashboardStats: async (force = false) => {
        if (!force) {
            const cached = statsCache.get(STATS_CACHE_KEY);
            if (cached) { set({ dashboardStats: cached }); return; }
        }
        if (get().isStatsLoading) return;
        set({ isStatsLoading: true });
        try {
            const stats = await NotificationService.getDashboardStats();
            statsCache.set(STATS_CACHE_KEY, stats);
            set({ dashboardStats: stats });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
            set({ dashboardStats: null });
        } finally {
            set({ isStatsLoading: false });
        }
    },

    /* ---------------- FETCH CHART DATA (ADMIN) ---------------- */

    fetchChartData: async (force = false) => {
        if (!force) {
            const cached = chartCache.get(CHART_CACHE_KEY);
            if (cached) { set({ chartData: cached }); return; }
        }
        if (get().isChartLoading) return;
        set({ isChartLoading: true });
        try {
            const data = await NotificationService.getChartData();
            chartCache.set(CHART_CACHE_KEY, data);
            set({ chartData: data });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
            set({ chartData: [] });
        } finally {
            set({ isChartLoading: false });
        }
    },

    /* ---------------- MARK AS READ ---------------- */

    markAsRead: async (userNotificationId: string) => {
        try {
            await NotificationService.markAsRead(userNotificationId);
            const updated = get().notifications.map((n) =>
                n.userNotificationId === userNotificationId ? { ...n, status: 'read' as const } : n
            );
            userNotifCache.set(USER_CACHE_KEY, updated);
            set({ notifications: updated });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
        }
    },

    markAllAsRead: async () => {
        try {
            await NotificationService.markAllAsRead();
            const updated = get().notifications.map((n) => ({ ...n, status: 'read' as const }));
            userNotifCache.set(USER_CACHE_KEY, updated);
            set({ notifications: updated });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
        }
    },

    /* ---------------- DELETE NOTIFICATION (user only) ---------------- */

    deleteNotification: async (userNotificationId: string) => {
        try {
            await NotificationService.deleteNotification(userNotificationId);
            const updated = get().notifications.filter(
                (n) => n.userNotificationId !== userNotificationId
            );
            userNotifCache.set(USER_CACHE_KEY, updated);
            set({ notifications: updated });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
        }
    },

    /* ---------------- DELETE NOTIFICATION (admin) ---------------- */

    deleteAdminNotification: async (notificationId: string) => {
        try {
            await NotificationService.deleteAdminNotification(notificationId);
            const updated = get().recipients.map((r) => ({
                ...r,
                notifications: r.notifications.filter((n) => n.notificationId !== notificationId),
            }));
            adminNotifCache.set(ADMIN_CACHE_KEY, updated);
            set({ recipients: updated });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
        }
    },

    /* ---------------- CREATE NOTIFICATION (admin) ---------------- */

    createNotification: async (payload) => {
        try {
            const result = await NotificationService.createNotification(payload);
            adminNotifCache.delete(ADMIN_CACHE_KEY);
            statsCache.delete(STATS_CACHE_KEY);
            chartCache.delete(CHART_CACHE_KEY);
            return result;
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
            throw error;
        }
    },

    /* ---------------- DELETE NOTIFICATION (admin — single user) ---------------- */

    deleteAdminUserNotification: async (userId: string, notificationId: string) => {
        try {
            await NotificationService.deleteAdminUserNotification(userId, notificationId);
            const updated = get().recipients.map((r) => ({
                ...r,
                notifications: r.userId === userId
                    ? r.notifications.filter((n) => n.notificationId !== notificationId)
                    : r.notifications,
            }));
            adminNotifCache.set(ADMIN_CACHE_KEY, updated);
            set({ recipients: updated });
        } catch (error) {
            const message = (error as AxiosError<{ message?: string }>).response?.data?.message;
            if (message) toast.error(message);
        }
    },

    /* ---------------- SSE REAL-TIME HELPERS ---------------- */

    // Add a new notification to the TOP of the list (called on 'notification:new' SSE event).
    // Also updates the TTL cache so a cache-hit within 5 min still includes this item.
    prependNotification: (item: UserNotification) => {
        const updated = [item, ...get().notifications];
        userNotifCache.set(USER_CACHE_KEY, updated);
        set({ notifications: updated });
    },

    // Remove a notification from the list by its recipient record ID
    // (called on 'notification:deleted' SSE event — works for both user and admin deletes).
    removeNotification: (userNotificationId: string) => {
        const updated = get().notifications.filter(
            (n) => n.userNotificationId !== userNotificationId
        );
        userNotifCache.set(USER_CACHE_KEY, updated);
        set({ notifications: updated });
    },

    // Bust the cache and force a fresh fetch from the server.
    // Used as a fallback when an SSE payload can't be parsed.
    invalidateAndRefetch: async () => {
        userNotifCache.delete(USER_CACHE_KEY);
        await get().fetchUserNotifications(true);
    },

    /* ---------------- RESET ---------------- */

    reset: () => {
        userNotifCache.clear();
        adminNotifCache.clear();
        statsCache.clear();
        chartCache.clear();
        set({ notifications: [], recipients: [], dashboardStats: null, chartData: [], isUserLoading: false, isAdminLoading: false, isStatsLoading: false, isChartLoading: false });
    },
}));
