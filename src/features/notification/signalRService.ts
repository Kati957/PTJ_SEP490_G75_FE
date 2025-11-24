import * as signalR from "@microsoft/signalr";
import type { Notification } from "./types";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: ((notification: Notification) => void)[] = [];

  public async startConnection(userId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:7100/hubs/notification?userId=${userId}`, {
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

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      setTimeout(() => this.startConnection(userId), 5000);
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
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
