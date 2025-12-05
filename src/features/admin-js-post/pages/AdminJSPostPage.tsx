import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Card,
  message,
  Spin,
  Modal,
} from "antd";
import type { TableColumnsType } from "antd";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useCategories } from "../../category/hook";
import {
  fetchAdminEmployerPosts,
  selectAdminJobPosts,
  selectAdminJobStatus,
  toggleEmployerPostBlock,
} from "../slice";
import type { AdminJobSeekerPostView } from "../type";
import { SearchOutlined } from "@ant-design/icons";
import { adminService } from "../service";
import JobJSDetailView from "../components/JobJSDetailView";

const { Option } = Select;

const AdminJSPostPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectAdminJobPosts);
  const status = useAppSelector(selectAdminJobStatus);
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] =
    useState<AdminJobSeekerPostView | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    dispatch(fetchAdminEmployerPosts({}));
  }, [dispatch]);

  const handleView = async (id: number) => {
  setIsModalOpen(true);
  setIsModalLoading(true);
  try {
    const postDetail = await adminService.getJobSeekerPostDetail(id);
    setSelectedPost(postDetail);
  } catch {
    message.error("Không thể tải chi tiết.");
    setIsModalOpen(false);
  } finally {
    setIsModalLoading(false);
  }
};


  const handleToggleBlock = (id: number) => {
    dispatch(toggleEmployerPostBlock(id));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleFilter = () => {
    dispatch(
      fetchAdminEmployerPosts({
        status: selectedStatus,
        categoryId: selectedCategory,
        keyword: keyword || undefined,
      })
    );
  };

  const resetFilter = () => {
    setKeyword("");
    setSelectedStatus(undefined);
    setSelectedCategory(undefined);
    dispatch(fetchAdminEmployerPosts({}));
  };

  const columns: TableColumnsType<AdminJobSeekerPostView> = [
    {
      title: "ID",
      dataIndex: "jobSeekerPostId",
      key: "jobSeekerPostId",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Người tìm việc",
      dataIndex: "jobSeekerEmail",
      key: "jobSeekerEmail",
      render: (email) => (
        <div>
          <small>{email}</small>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (name) => name || "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "Active") color = "green";
        if (status === "Archived") color = "blue";
        if (status === "Blocked" || status === "Deleted") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const isBlocked = record.status.toLowerCase() === "archived";
        return (
          <Space size="middle">
            <Button
              type="link"
              size="small"
              onClick={() => handleView(record.jobSeekerPostId)}
            >
              Xem
            </Button>

            <Button
              type="link"
              size="small"
              danger={!isBlocked}
              onClick={() => handleToggleBlock(record.jobSeekerPostId)}
              loading={status === "loading"}
            >
              {isBlocked ? "Bỏ lưu trữ" : "Lưu trữ"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Quản lý bài đăng của Nhà tuyển dụng
      </h1>

      <Card>
        <Space wrap size="middle">
          <Input
            placeholder="Tìm tiêu đề, email, mô tả..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleFilter}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
          >
            <Option value="Active">Active</Option>
            <Option value="Archived">Archived</Option>
            <Option value="Deleted">Deleted</Option>
            <Option value="Blocked">Blocked</Option>
          </Select>
          <Select
            placeholder="Lọc theo ngành nghề"
            style={{ width: 200 }}
            allowClear
            loading={categoriesLoading}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={categories.map((cat) => ({
              value: cat.categoryId,
              label: cat.name,
            }))}
          />
          <Button
            type="primary"
            onClick={handleFilter}
            icon={<SearchOutlined />}
          >
            Lọc
          </Button>
          <Button onClick={resetFilter}>Reset</Button>
        </Space>
      </Card>

      <Table
        rowKey="jobSeekerPostId"
        columns={columns}
        dataSource={Array.isArray(posts) ? posts : []}
        loading={status === "loading"}
        pagination={{
          total: posts?.length ?? 0,
          pageSize: 10,
        }}
      />

      <Modal
        title={null}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        className="custom-modal"
      >
        {isModalLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spin />
          </div>
        ) : selectedPost ? (
          <div>
            <div className="bg-blue-900 text-white px-5 py-3 rounded-t-lg -m-6 mb-4">
              <h2 className="text-lg font-semibold">Chi tiết bài đăng</h2>
              <p className="text-blue-100 text-sm">
                Mã: {selectedPost.jobSeekerPostId}
              </p>
            </div>

            <JobJSDetailView post={selectedPost} />
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminJSPostPage;
