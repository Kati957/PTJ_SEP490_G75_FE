import React, { useEffect, useState } from "react";
import { Table, Space, Tag, Typography, Spin } from "antd";
import type { TableColumnsType } from "antd";
import type { SavedJobDtoOut } from "../type";
import { jobSeekerPostService } from "../services";
import { EnvironmentOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useAuth } from "../../auth/hooks";

const { Text } = Typography;

const SavedTalentPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SavedJobDtoOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchSaved = async () => {
      try {
        const res = await jobSeekerPostService.getSavedJobs(user.id);
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const columns: TableColumnsType<SavedJobDtoOut> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Nhà tuyển dụng",
      dataIndex: "employerName",
      key: "employerName",
      render: (name) => (
        <Space>
          <UserOutlined /> {name}
        </Space>
      ),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      render: (loc) => (
        <Space>
          <EnvironmentOutlined /> {loc || "Không rõ"}
        </Space>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || <Text type="secondary">Không có</Text>,
    },
    {
      title: "Ngày lưu",
      dataIndex: "addedAt",
      key: "addedAt",
      render: (addedAt) => (
        <Space>
          <CalendarOutlined /> {new Date(addedAt).toLocaleDateString("vi-VN")}
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" className="flex justify-center mt-10" />;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Tài năng đã lưu</h2>
      <Table
        rowKey="employerPostId"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: "Chưa có tài năng nào được lưu." }}
      />
    </div>
  );
};

export default SavedTalentPage;
