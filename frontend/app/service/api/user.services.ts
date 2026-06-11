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

    static async getUsers(): Promise<UserListItem[]> {
        const res = await axios.get(apiRoutes.user.list, {
            headers: { Accept: "application/json" },
        });
        return UserListItem.fromApiList(res.data.users ?? []);
    }
}

export default UserService;
