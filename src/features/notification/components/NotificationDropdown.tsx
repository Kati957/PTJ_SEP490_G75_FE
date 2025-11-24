import React, { useEffect } from "react";
import { Badge, Dropdown, List, Avatar, Button, Empty } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  addNotification,
  setConnectionStatus,
} from "../slice";
import { signalRService } from "../signalRService";
import { useNavigate } from "react-router-dom";
import type { Notification } from "../types";

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(undefined));
      signalRService.startConnection(String(userId));
      dispatch(setConnectionStatus("connected"));

      const handleNotification = (notification: Notification) => {
        dispatch(addNotification(notification));
      };

      signalRService.onReceiveNotification(handleNotification);

      return () => {
        signalRService.offReceiveNotification(handleNotification);
        signalRService.stopConnection();
        dispatch(setConnectionStatus("disconnected"));
      };
    }
  }, [dispatch, userId]);

  const handleItemClick = (item: Notification) => {
    if (!item.isRead) {
      dispatch(markNotificationAsRead(item.notificationId));
    }
    // Navigate based on notification type if needed
    // if (item.relatedItemId) {
    //   navigate(`/some-path/${item.relatedItemId}`);
    // }
  };

  const menu = (
    <div className="w-80 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto">
      <div className="p-3 border-b flex justify-between items-center bg-gray-50">
        <span className="font-semibold text-gray-700">Thông báo</span>
        <Button
          type="link"
          size="small"
          onClick={() => dispatch(fetchNotifications(undefined))}
        >
          Làm mới
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 transition-colors p-3 border-b last:border-b-0 ${
              !item.isRead ? "bg-blue-50" : ""
            }`}
            onClick={() => handleItemClick(item)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<BellOutlined />}
                  className={!item.isRead ? "bg-blue-500" : "bg-gray-300"}
                />
              }
              title={
                <span
                  className={`text-sm ${
                    !item.isRead ? "font-bold text-gray-800" : "text-gray-600"
                  }`}
                >
                  {item.title}
                </span>
              }
              description={
                <div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {item.message}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: "20px" }} />}
          className="flex items-center justify-center"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
