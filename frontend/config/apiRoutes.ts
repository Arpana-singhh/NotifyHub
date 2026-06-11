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
    block:   (id: string) => `${config.baseUrl}/admin/users/${id}/block`,
  },
  notification: {
    list:      `${config.baseUrl}/notifications`,
    adminList: `${config.baseUrl}/admin/notifications`,
    delete:       (id: string) => `${config.baseUrl}/notifications/${id}`,
    markRead:     (id: string) => `${config.baseUrl}/notifications/${id}/read`,
    markAllRead:  `${config.baseUrl}/notifications/read-all`,
    adminDelete:          `${config.baseUrl}/admin/notifications`,
    adminDeleteForUser:   `${config.baseUrl}/admin/notifications/user`,
    stats:  `${config.baseUrl}/admin/dashboard/stats`,
  },
};

export default apiRoutes;
