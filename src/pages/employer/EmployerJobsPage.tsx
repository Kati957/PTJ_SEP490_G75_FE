import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Button,
  Select,
  Table,
  Tag,
  Space,
  Dropdown,
  message,
  Modal, // Modal đã được import, giờ ta sẽ dùng
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
  MoneyCollectOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../features/auth/hooks';
import jobPostService from '../../features/job/jobPostService';
import type { JobPostView } from '../../features/job/jobTypes';
// Import JobDetailView
import { JobDetailView } from '../../features/job/components/employer/JobDetailView';
import { useCategories } from '../../features/category/hook';

const { Option } = Select;

const formatCurrency = (value: number | null) => {
  if (!value) return 'Thỏa thuận';
  return `${value.toLocaleString('vi-VN')} triệu`;
};

const EmployerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useCategories();

  const [jobs, setJobs] = useState<JobPostView[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<JobPostView | null>(null);

  const fetchJobs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await jobPostService.getJobsByUser(user.id);
      if (res.success) {
        setJobs(res.data);
        setTotalJobs(res.total);
      } else {
        message.error('Không thể tải danh sách công việc.');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleRefresh = (id: number) => {
    message.info('Đang xử lý làm mới...');
  };

  const handleEdit = (id: number) => {
    navigate(`/nha-tuyen-dung/sua-tin/${id}`);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Bạn có chắc muốn xóa bài đăng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xác nhận Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
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
          message.error(err.response?.data?.message || 'Xóa thất bại.');
        }
      },
    });
  };

  const handleViewDetails = (id: number) => {
    const jobToView = jobs.find((job) => job.employerPostId === id);
    if (jobToView) {
      setSelectedJob(jobToView);
      setIsModalVisible(true);
    } else {
      message.error('Không tìm thấy chi tiết công việc.');
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedJob(null);
  };

  const columns: TableColumnsType<JobPostView> = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <>
          {status.toLowerCase() === 'draft' && <Tag color="grey">BẢN TẠM</Tag>}
          {status.toLowerCase() === 'active' && <Tag color="green">ĐANG ĐĂNG</Tag>}
          {status.toLowerCase() === 'expired' && <Tag color="red">HẾT HẠN</Tag>}
          {!['draft', 'active', 'expired'].includes(status.toLowerCase()) && <Tag>{status.toUpperCase()}</Tag>}
        </>
      ),
    },
    {
      title: 'Công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <a
            onClick={() => handleViewDetails(record.employerPostId)} // Chỗ này vẫn giữ nguyên
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {text}
          </a>
          <div className="text-xs text-gray-500">
            {record.location || '(Chưa có địa điểm)'}
          </div>
          <div className="text-xs text-gray-500">
            Cập nhật: {new Date(record.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (category) => (
        <Space>
          <AppstoreOutlined /> {category || 'N/A'}
        </Space>
      )
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => (
         <Space>
          <MoneyCollectOutlined /> {formatCurrency(salary)}
        </Space>
      )
    },
    {
      title: 'Làm mới',
      key: 'refresh',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<SyncOutlined />}
          onClick={() => handleRefresh(record.employerPostId)}
        >
          Làm mới
        </Button>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" className="!px-0" onClick={() => handleEdit(record.employerPostId)}>
            Sửa
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: '1', label: 'Xem ứng viên (Shortlist)', onClick: () => navigate(`/nha-tuyen-dung/ung-vien/${record.employerPostId}`) },
                { key: '2', label: 'Tạm dừng' },
                { key: '3', label: 'Xóa', danger: true, onClick: () => handleDelete(record.employerPostId) },
              ],
            }}
            trigger={['click']}
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
          Công việc của tôi ({totalJobs})
        </h1>
        <NavLink to="/nha-tuyen-dung/dang-tin">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Đăng công việc mới
          </Button>
        </NavLink>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
        
        {/* (Filter giữ nguyên) */}
        <div className="flex justify-between items-center">
          {/* ... (Code filter của bạn) ... */}
        </div>

        {/* (Pagination giữ nguyên, nhưng sẽ cần logic sau) */}
        {/* <TopPagination /> */}

        <Table
          rowKey="employerPostId"
          columns={columns}
          dataSource={jobs}
          loading={isLoading}
          pagination={{
            total: totalJobs,
            pageSize: 10,
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