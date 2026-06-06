import axios, { type AxiosResponse } from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";

type ApiResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: unknown;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type VerifyEmailPayload = {
  email: string;
  otp: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

class AuthService {
  static async register(name: string, email: string, password: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: RegisterPayload = { name, email, password };

    return axios.post(apiRoutes.auth.register, payload, {
      headers: { Accept: "application/json" },
    });
  }

  static async verifyEmail(email: string, otp: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: VerifyEmailPayload = { email, otp };

    return axios.post(apiRoutes.auth.verifyEmail, payload, {
      headers: { Accept: "application/json" },
    });
  }

  static async login(email: string, password: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: LoginPayload = { email, password };

    return axios.post(apiRoutes.auth.login, payload, {
      headers: { Accept: "application/json" },
    });
  }

  static async forgotPassword(email: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: ForgotPasswordPayload = { email };

    return axios.post(apiRoutes.auth.forgotPassword, payload, {
      headers: { Accept: "application/json" },
    });
  }

  static async resetPassword(email: string, otp: string, newPassword: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: ResetPasswordPayload = { email, otp, newPassword };

    return axios.post(apiRoutes.auth.resetPassword, payload, {
      headers: { Accept: "application/json" },
    });
  }

  static async changePassword(currentPassword: string, newPassword: string, token?: string): Promise<AxiosResponse<ApiResponse>> {
    const payload: ChangePasswordPayload = { currentPassword, newPassword };

    return axios.post(apiRoutes.auth.changePassword, payload, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }
}

export default AuthService;
