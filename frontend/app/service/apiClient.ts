import axios from "axios";
import AxiosService from "./axios.services";

axios.interceptors.request.use(
    (config) => {
        const token = AxiosService.getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        if (error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
