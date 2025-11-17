import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Select,
  Table,
  Tag,
  Space,
  Dropdown,
  message,
  Modal,
  Input,
  Row,
  Col,
} from "antd";
import type { TableProps, TableColumnsType } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks";
import jobPostService from "../../features/job/jobPostService";
import type { JobPostView } from "../../features/job/jobTypes";
import { JobDetailView } from "../../features/job/components/employer/JobDetailView";
import { useCategories } from "../../features/category/hook";

import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

const { Option } = Select;
const { Search } = Input;

const formatCurrency = (value: number | null | undefined) => {
  if (value == null || value <= 0) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")} vnđ`;
};

const EmployerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useCategories();

  const { categories, status: categoryStatus } = useSelector(
    (state: RootState) => state.category
  );

  const [allJobs, setAllJobs] = useState<JobPostView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sortInfo, setSortInfo] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({
    field: "createdAt",
    order: "desc",
  });

  const fetchJobs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await jobPostService.getJobsByUser(user.id);
      if (res.success) {
        setAllJobs(res.data);
      } else {
        message.error("Không thể tải danh sách công việc.");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi tải dữ liệu.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const processedJobs = useMemo(() => {
    let filteredData = [...allJobs];

    if (searchTerm) {
      filteredData = filteredData.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const category = categories.find(
        (c: any) => c.categoryId === selectedCategory
      );
      if (category) {
        filteredData = filteredData.filter(
          (job) => job.categoryName === category.name
        );
      }
    }

    const { field, order } = sortInfo;
    if (field && order) {
      filteredData.sort((a, b) => {
        const valA = a[field as keyof JobPostView] ?? "";
        const valB = b[field as keyof JobPostView] ?? "";

        let compare = 0;
        if (valA > valB) compare = 1;
        if (valA < valB) compare = -1;

        return order === "asc" ? compare : -compare;
      });
    }

    return filteredData;
  }, [allJobs, searchTerm, selectedCategory, sortInfo, categories]);

  const paginatedJobs = useMemo(() => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return processedJobs.slice(startIndex, startIndex + pageSize);
  }, [processedJobs, pagination]);

  const handleRefresh = () => {
    fetchJobs();
  };

  const handleEdit = (id: number) => {
    navigate(`/nha-tuyen-dung/sua-tin/${id}`);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa bài đăng này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xác nhận Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await jobPostService.deleteJobPost(id);
          if (res.success) {
            message.success(res.message);
            fetchJobs();
          } else {
            message.error(res.message);
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || "Xóa thất bại.");
        }
      },
    });
  };

  const handleViewDetails = (id: number) => {
    const jobToView = allJobs.find((job) => job.employerPostId === id);
    if (jobToView) {
      setSelectedJob(jobToView);
      setIsModalVisible(true);
    } else {
      message.error("Không tìm thấy chi tiết công việc.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedJob(null);
  };

  const handleTableChange: TableProps<JobPostView>["onChange"] = (
    newPagination,
    filters,
    sorter: any
  ) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });

    setSortInfo({
      field: sorter.field || "createdAt",
      order: sorter.order
        ? sorter.order === "ascend"
          ? "asc"
          : "desc"
        : "desc",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns: TableColumnsType<JobPostView> = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status: string) => (
        <>
          {status.toLowerCase() === "draft" && <Tag color="grey">BẢN TẠM</Tag>}
          {status.toLowerCase() === "active" && (
            <Tag color="green">ĐANG ĐĂNG</Tag>
          )}
          {status.toLowerCase() === "expired" && <Tag color="red">HẾT HẠN</Tag>}
          {!["draft", "active", "expired"].includes(status.toLowerCase()) && (
            <Tag>{status.toUpperCase()}</Tag>
          )}
        </>
      ),
    },
    {
      title: "Công việc",
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (text, record) => (
        <div>
          <a
            onClick={() => handleViewDetails(record.employerPostId)}
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {text}
          </a>
          <div className="text-xs text-gray-500">
            {record.location || "(Chưa có địa điểm)"}
          </div>
          <div className="text-xs text-gray-500">
            Cập nhật: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngành nghề",
      dataIndex: "categoryName",
      key: "categoryName",
      sorter: true,
      render: (category) => (
        <Space>
          <AppstoreOutlined /> {category || "N/A"}
        </Space>
      ),
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      sorter: true,
      render: (salary) => (
        <Space>
          <MoneyCollectOutlined /> {formatCurrency(salary)}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            className="!px-0"
            onClick={() => handleEdit(record.employerPostId)}
          >
            Sửa
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "Xem ứng viên (Shortlist)",
                  onClick: () =>
                    navigate(
                      `/nha-tuyen-dung/ung-vien/${record.employerPostId}`
                    ),
                },
                {
                  key: "saved",
                  label: "Đã lưu (Saved)",
                  onClick: () =>
                    navigate(`/nha-tuyen-dung/da-luu/${record.employerPostId}`),
                },
                {
                  key: "3",
                  label: "Xóa",
                  danger: true,
                  onClick: () => handleDelete(record.employerPostId),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Công việc của tôi ({allJobs.length})
        </h1>
        <div className="flex gap-2">
          <Button
            type="default"
            icon={<SyncOutlined />}
            size="large"
            onClick={handleRefresh}
            loading={isLoading}
          >
            Làm mới
          </Button>
          <NavLink to="/nha-tuyen-dung/dang-tin">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Đăng công việc mới
            </Button>
          </NavLink>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="Tìm kiếm theo tiêu đề công việc..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              enterButton
              allowClear
              loading={isLoading}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              placeholder="Lọc theo ngành nghề"
              onChange={handleCategoryChange}
              allowClear
              style={{ width: "100%" }}
              loading={categoryStatus === "loading"}
            >
              {categories.map((cat: any) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          rowKey="employerPostId"
          columns={columns}
          dataSource={paginatedJobs}
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: processedJobs.length,
            showSizeChanger: true,
          }}
        />

        <Modal
          title="Chi tiết công việc"
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedJob && <JobDetailView job={selectedJob} />}
        </Modal>
      </div>
    </div>
  );
};

export default EmployerJobsPage;
