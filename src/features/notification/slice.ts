import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { notificationService } from "./service";
import type { Notification, NotificationState } from "./types";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  connectionStatus: "disconnected",
};

export const fetchNotifications = createAsyncThunk<
  Notification[],
  boolean | undefined,
  { rejectValue: string }
>("notification/fetchNotifications", async (isRead, { rejectWithValue }) => {
  try {
    const data = await notificationService.getUserNotifications(isRead);
    return data;
  } catch (error) {
    const message =
      (error as { message?: string }).message || "Không thể tải thông báo";
    return rejectWithValue(message);
  }
});

export const markNotificationAsRead = createAsyncThunk<number, number, { rejectValue: string }>(
  "notification/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error) {
      const message =
        (error as { message?: string }).message || "Không thể cập nhật thông báo";
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setConnectionStatus: (state, action: PayloadAction<"connected" | "disconnected" | "connecting">) => {
      state.connectionStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Không thể tải thông báo";
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.notificationId === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification, setConnectionStatus } = notificationSlice.actions;
export default notificationSlice.reducer;
