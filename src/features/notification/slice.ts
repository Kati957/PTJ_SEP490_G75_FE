import { createSlice, createAsyncThunk,type PayloadAction } from "@reduxjs/toolkit";
import type { Notification, NotificationState } from "./types";
import { notificationService } from "./service";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  connectionStatus: "disconnected",
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (isRead: boolean | undefined, { rejectWithValue }) => {
    try {
      const data = await notificationService.getUserNotifications(isRead);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
    setConnectionStatus: (
      state,
      action: PayloadAction<"connected" | "disconnected" | "connecting">
    ) => {
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
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.notificationId === action.payload
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification, setConnectionStatus } = notificationSlice.actions;
export default notificationSlice.reducer;
