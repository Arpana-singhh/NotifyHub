import { create } from 'zustand';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import UserService from '../service/api/user.services';
import { TTLMap } from '../utils/TTLMap';
import type { UserProfileModel, UserListItem } from '../model/UserModel';

/* ------------------------------------------------------------------ */
/* TTL CACHE                                                           */
/* ------------------------------------------------------------------ */

const userCache = new TTLMap<string, UserProfileModel>(5 * 60 * 1000); // 5 min
const usersListCache = new TTLMap<string, UserListItem[]>(5 * 60 * 1000); // 5 min

const USER_CACHE_KEY = 'user-profile';
const USERS_LIST_CACHE_KEY = 'admin-users-list';

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

interface UserState {
    user: UserProfileModel | null;
    users: UserListItem[];
    isLoading: boolean;
    isSaving: boolean;
    isLoadingUsers: boolean;

    fetchUser: (force?: boolean) => Promise<void>;
    updateUser: (name: string, avatar?: string) => Promise<void>;
    fetchAllUserByAdmin: (force?: boolean) => Promise<void>;
    toggleBlock: (userId: string) => Promise<void>;
    reset: () => void;
}

/* ------------------------------------------------------------------ */
/* STORE                                                               */
/* ------------------------------------------------------------------ */

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    users: [],
    isLoading: false,
    isSaving: false,
    isLoadingUsers: false,

    /* ---------------- FETCH USER ---------------- */

    fetchUser: async (force = false) => {
        if (!force) {
            const cached = userCache.get(USER_CACHE_KEY);
            if (cached) {
                set({ user: cached });
                return;
            }
        }

        if (get().isLoading) return; // a fetch is already in flight

        set({ isLoading: true });
        try {
            const profile = await UserService.getUser();
            userCache.set(USER_CACHE_KEY, profile);
            console.log("profile", profile)
            set({ user: profile });
        } catch {
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    /* ---------------- UPDATE USER ---------------- */

    updateUser: async (name: string, avatar?: string) => {
        set({ isSaving: true });
        try {
            await UserService.updateUser({ name, avatar });
            const current = get().user;
            if (current) {
                current.name = name;
                if (avatar) current.avatar = avatar;
                userCache.set(USER_CACHE_KEY, current);
                set({ user: current });
            }
            toast.success('Profile updated successfully');
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError.response?.data?.message || 'Failed to update profile');
        } finally {
            set({ isSaving: false });
        }
    },

    /* ---------------- FETCH ALL USERS (ADMIN) ---------------- */

    fetchAllUserByAdmin: async (force = false) => {
        if (!force) {
            const cached = usersListCache.get(USERS_LIST_CACHE_KEY);
            if (cached) {
                set({ users: cached });
                return;
            }
        }

        if (get().isLoadingUsers) return; // a fetch is already in flight

        set({ isLoadingUsers: true });
        try {
            const users = await UserService.getAllUsers();
            console.log("users", users)
            usersListCache.set(USERS_LIST_CACHE_KEY, users);
            set({ users });
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError.response?.data?.message || 'Failed to load users');
            set({ users: [] });
        } finally {
            set({ isLoadingUsers: false });
        }
    },

    /* ---------------- TOGGLE BLOCK (ADMIN) ---------------- */

    toggleBlock: async (userId: string) => {
        try {
            const { isBlocked, message } = await UserService.toggleBlock(userId);

            const users = get().users.map((u) => {
                if (u.userId !== userId) return u;
                u.isBlocked = isBlocked;
                u.status = isBlocked ? 'Blocked' : 'Active';
                return u;
            });

            usersListCache.set(USERS_LIST_CACHE_KEY, users);
            set({ users });
            toast.success(message || 'User updated successfully');
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            toast.error(axiosError.response?.data?.message || 'Failed to update user');
        }
    },

    /* ---------------- RESET ---------------- */

    reset: () => {
        userCache.clear();
        usersListCache.clear();
        set({ user: null, users: [], isLoading: false, isSaving: false, isLoadingUsers: false });
    },
}));
