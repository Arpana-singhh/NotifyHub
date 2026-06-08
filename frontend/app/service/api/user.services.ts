import axios, { type AxiosResponse } from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";

type ApiResponse = {
    success: boolean;
    message: string;
    user?: {
        _id: string;
        name: string;
        email: string;
        role: string;
        avatar: string;
        isAccountVerified: boolean;
    };
};

type UpdateUserPayload = {
    name?: string;
    avatar?: string;
};

class UserService {
    static async getUser(): Promise<AxiosResponse<ApiResponse>> {
        return axios.get(apiRoutes.user.detail, {
            headers: { Accept: "application/json" },
        });
    }

    static async updateUser(payload: UpdateUserPayload): Promise<AxiosResponse<ApiResponse>> {
        return axios.put(apiRoutes.user.update, payload, {
            headers: { Accept: "application/json" },
        });
    }
}

export default UserService;
