import React, { useEffect, useState } from "react";
import { Table, Space, message, Button } from "antd";
import type { TableColumnsType } from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  HeartFilled,
  HeartOutlined,
} from "@ant-design/icons";
import { jobSeekerPostService } from "../services";
import type { JobSeekerPostDtoOut } from "../type";
import { useAuth } from "../../auth/hooks";

const JobSeekerPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<JobSeekerPostDtoOut[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const { user } = useAuth();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await jobSeekerPostService.getAllJobSeekerPosts();
      if (res.success) {
        setPosts(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      message.error("Không thể tải danh sách bài đăng tìm việc.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleSave = async (record: JobSeekerPostDtoOut) => {
    const jobId = record.jobSeekerPostId;
    const isSaved = savedJobs.includes(jobId);

    if (!user?.id) {
      message.warning("Bạn cần đăng nhập để lưu ứng viên.");
      return;
    }

    try {
      if (isSaved) {
        // Bỏ lưu
        await jobSeekerPostService.unsaveCandidate({
          employerId: user.id,
          jobSeekerId: record.jobSeekerId,
          employerPostId: record.jobSeekerPostId,
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        message.success("Đã bỏ lưu ứng viên.");
      } else {
        // Lưu
        await jobSeekerPostService.saveCandidate({
          employerId: user.id,
          jobSeekerId: record.jobSeekerId,
          employerPostId: record.jobSeekerPostId,
        });
        setSavedJobs([...savedJobs, jobId]);
        message.success("Đã lưu ứng viên.");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể thực hiện thao tác. Vui lòng thử lại.");
    }
  };

  const columns: TableColumnsType<JobSeekerPostDtoOut> = [
    {
      title: "Người dùng",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <span className="font-semibold text-blue-600">{text}</span>
          <div className="text-xs text-gray-500">
            {record.seekerName} • {record.gender ?? "Không rõ"} •{" "}
            {record.age ? `${record.age} tuổi` : "Tuổi N/A"}
          </div>
          <div className="text-xs text-gray-500">
            Ngày đăng: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (cat) => cat || "Chưa chọn",
    },
    {
      title: "Địa điểm",
      dataIndex: "preferredLocation",
      key: "preferredLocation",
      render: (loc) => (
        <Space>
          <EnvironmentOutlined /> {loc || "Không rõ"}
        </Space>
      ),
    },
    {
      title: "Giờ làm mong muốn",
      dataIndex: "preferredWorkHours",
      key: "preferredWorkHours",
      render: (hours) => (
        <Space>
          <ClockCircleOutlined /> {hours || "Không rõ"}
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "phoneContact",
      key: "phoneContact",
      render: (phone) => (
        <Space>
          <PhoneOutlined /> {phone || "N/A"}
        </Space>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => (
        <Space>
          <ClockCircleOutlined />{" "}
          {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "N/A"}
        </Space>
      ),
    },
    {
      title: "Yêu thích",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const isSaved = savedJobs.includes(record.jobSeekerPostId);
        return (
          <Button
            type="text"
            icon={
              isSaved ? (
                <HeartFilled style={{ color: "red", fontSize: 18 }} />
              ) : (
                <HeartOutlined style={{ color: "gray", fontSize: 18 }} />
              )
            }
            onClick={() => handleToggleSave(record)}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Danh sách bài đăng tìm việc
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Table
          rowKey="jobSeekerPostId"
          columns={columns}
          dataSource={posts}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default JobSeekerPostsPage;
