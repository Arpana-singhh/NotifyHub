import axios from "axios";

axios.interceptors.request.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);