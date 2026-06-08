import axios from "axios";
import { signOut } from "next-auth/react";

// Response interceptor — handles 401 globally by signing out
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
    }
);
