import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../../services/baseService";
import type { Notification } from "./types";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: ((notification: Notification) => void)[] = [];
  private startPromise: Promise<void> | null = null;
  private shouldStop = false;

  public async startConnection(userId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      this.shouldStop = false;
      return;
    }

    if (this.connection?.state === signalR.HubConnectionState.Connecting && this.startPromise) {
      this.shouldStop = false;
      return this.startPromise;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/notification?userId=${userId}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on("ReceiveNotification", (notification: Notification) => {
      console.log("Received notification:", notification);
      for (const callback of this.callbacks) {
        callback(notification);
      }
    });

    this.shouldStop = false;
    try {
      this.startPromise = this.connection.start();
      await this.startPromise;
      if (this.shouldStop) {
        await this.stopConnection();
        return;
      }
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      this.startPromise = null;
      setTimeout(() => this.startConnection(userId), 5000);
    }
  }

  public async stopConnection() {
    this.shouldStop = true;
    if (this.startPromise) {
      try {
        await this.startPromise;
      } catch {
        // ignore start errors during stop
      }
    }
    if (this.connection) {
      try {
        await this.connection.stop();
      } finally {
        this.connection = null;
        this.startPromise = null;
      }
    } else {
      this.startPromise = null;
    }
  }

  public onReceiveNotification(callback: (notification: Notification) => void) {
    this.callbacks.push(callback);
  }

  public offReceiveNotification(callback: (notification: Notification) => void) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }
}

export const signalRService = new SignalRService();
