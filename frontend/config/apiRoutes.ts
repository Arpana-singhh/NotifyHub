import config from "./config";

const apiRoutes = {
  auth: {
    register: `${config.baseUrl}/register`,
    verifyEmail: `${config.baseUrl}/verify-email`,
    login: `${config.baseUrl}/login`,
    forgotPassword: `${config.baseUrl}/forgot-password`,
    resetPassword: `${config.baseUrl}/reset-password`,
    changePassword: `${config.baseUrl}/change-password`,
  },
  user: {
    detail: `${config.baseUrl}/user`,
    update: `${config.baseUrl}/user`,
    list:   `${config.baseUrl}/admin/users`,
  },
  notification: {
    list:      `${config.baseUrl}/notifications`,
    adminList: `${config.baseUrl}/admin/notifications`,
    delete:       (id: string) => `${config.baseUrl}/notifications/${id}`,
    adminDelete:          `${config.baseUrl}/admin/notifications`,
    adminDeleteForUser:   `${config.baseUrl}/admin/notifications/user`,
  },
};

export default apiRoutes;
