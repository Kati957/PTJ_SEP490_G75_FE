import baseService from "../../services/baseService";
import type { Notification } from "./types";

export const notificationService = {
  getUserNotifications: async (isRead?: boolean): Promise<Notification[]> => {
    const params = isRead !== undefined ? { isRead } : {};
    const response = await baseService.get<Notification[]>("/Notification", { params });
    return response;
  },

  markAsRead: async (id: number): Promise<boolean> => {
    const response = await baseService.post<{ success: boolean }>(`/Notification/${id}/read`);
    return response.success;
  },
};
