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
  Pagination,
} from "antd";
import type { TableColumnsType } from "antd";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useCategories } from "../../category/hook";
import {
  fetchAdminEmployerPosts,
  selectAdminEmployerPosts,
  selectAdminEmployerStatus,
  selectAdminEmployerSelectedPost,
  toggleBlockAndRefresh,
  fetchAdminEmployerPostDetail,
  clearSelectedPost,
} from "../slice";

import type { AdminEmployerPostView } from "../type";
import { SearchOutlined } from "@ant-design/icons";
import JobEmployerDetailView from "../components/JobEmployerDetailView";

const { Option } = Select;

const AdminEmployerPostPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectAdminEmployerPosts);
  const status = useAppSelector(selectAdminEmployerStatus);
  const selectedPost = useAppSelector(selectAdminEmployerSelectedPost);

  const totalRecords = useAppSelector((state) => state.adminJobs.totalRecords);

  const { categories, isLoading: categoriesLoading } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchAdminEmployerPosts({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPost) {
      setIsModalOpen(true);
    }
  }, [selectedPost]);

  const handleFetchData = (page: number, size: number) => {
    dispatch(
      fetchAdminEmployerPosts({
        status: selectedStatus,
        categoryId: selectedCategory,
        keyword: keyword || undefined,
        page: page,
        pageSize: size,
      })
    );
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleFilter = () => {
    handleFetchData(1, pageSize);
  };

  const resetFilter = () => {
    setKeyword("");
    setSelectedStatus(undefined);
    setSelectedCategory(undefined);
    handleFetchData(1, 10);
  };

  const handleView = (id: number) => {
  dispatch(fetchAdminEmployerPostDetail(id));
};


  const handleToggleBlock = (id: number) => {
    dispatch(toggleBlockAndRefresh(id));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    dispatch(clearSelectedPost());
  };

  const columns: TableColumnsType<AdminEmployerPostView> = [
    {
      title: "ID",
      dataIndex: "employerPostId",
      key: "employerPostId",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Nhà tuyển dụng",
      dataIndex: "employerEmail",
      key: "employerEmail",
      render: (email, record) => (
        <div>
          <div>{record.employerName ?? "(Chưa có tên)"}</div>
          <small>{email}</small>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (name) => name ?? "N/A",
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
              onClick={() => handleView(record.employerPostId)}
            >
              Xem
            </Button>

            <Button
              type="link"
              size="small"
              danger={!isBlocked}
              onClick={() => handleToggleBlock(record.employerPostId)}
              loading={status === "loading"}
            >
              {isBlocked ? "Bỏ chặn" : "Chặn"}
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
        rowKey="id"
        columns={columns}
        dataSource={posts}
        loading={status === "loading"}
        pagination={{
          total: totalRecords,
          current: currentPage,
          pageSize: pageSize,
          onChange: handleFetchData,
        }}
      />

      <Modal
        title="Chi tiết bài đăng"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {status === "loading" && selectedPost === null ? (
          <div className="flex justify-center items-center h-48">
            <Spin />
          </div>
        ) : selectedPost ? (
          <JobEmployerDetailView post={selectedPost} />
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminEmployerPostPage;
