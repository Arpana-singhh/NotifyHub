import { create } from 'zustand';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import UserService from '../service/api/user.services';
import { TTLMap } from '../utils/TTLMap';
import type { UserProfileModel } from '../model/UserModel';

/* ------------------------------------------------------------------ */
/* TTL CACHE                                                           */
/* ------------------------------------------------------------------ */

const userCache = new TTLMap<string, UserProfileModel>(5 * 60 * 1000); // 5 min

const USER_CACHE_KEY = 'user-profile';

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */

interface UserState {
    user: UserProfileModel | null;
    isLoading: boolean;
    isSaving: boolean;

    fetchUser: (force?: boolean) => Promise<void>;
    updateUser: (name: string, avatar?: string) => Promise<void>;
    reset: () => void;
}

/* ------------------------------------------------------------------ */
/* STORE                                                               */
/* ------------------------------------------------------------------ */

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isLoading: false,
    isSaving: false,

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

    /* ---------------- RESET ---------------- */

    reset: () => {
        userCache.clear();
        set({ user: null, isLoading: false, isSaving: false });
    },
}));
