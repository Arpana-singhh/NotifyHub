import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Request interceptor — attaches Bearer token to every request
axios.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        const token = session?.user?.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handles 401 globally
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
    }
);
