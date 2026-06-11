import axios from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";
import { UserProfileModel, UserListItem } from "@/app/model/UserModel";

type UpdateUserPayload = {
    name?: string;
    avatar?: string;
};

class UserService {
    static async getUser(): Promise<UserProfileModel> {
        const res = await axios.get(apiRoutes.user.detail, {
            headers: { Accept: "application/json" },
        });
        return new UserProfileModel(res.data.user ?? {});
    }

    static async updateUser(payload: UpdateUserPayload): Promise<void> {
        await axios.put(apiRoutes.user.update, payload, {
            headers: { Accept: "application/json" },
        });
    }

    static async getAllUsers(): Promise<UserListItem[]> {
        const res = await axios.get(apiRoutes.user.list, {
            headers: { Accept: "application/json" },
        });
        return UserListItem.fromApiList(res.data.users ?? []);
    }
    
    static async toggleBlock(userId: string): Promise<{ isBlocked: boolean; message: string }> {
        const res = await axios.patch(apiRoutes.user.block(userId), {}, {
            headers: { Accept: "application/json" },
        });
        return {
            isBlocked: res.data.isBlocked ?? false,
            message: res.data.message ?? '',
        };
    }
}

export default UserService;
