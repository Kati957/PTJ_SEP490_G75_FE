export interface Notification {
  notificationId: number;
  notificationType: string;
  relatedItemId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}
