import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, message, Typography, Space, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { jobSeekerPostService } from '../services';
import type { ShortlistedCandidateDto } from '../type';
import { useAuth } from '../../auth/hooks';

const { Title, Text } = Typography;

const ShortlistedCandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();

  const [candidates, setCandidates] = useState<ShortlistedCandidateDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employerPostId) {
      fetchShortlisted(parseInt(employerPostId));
    }
  }, [employerPostId]);

  const fetchShortlisted = async (postId: number) => {
    setLoading(true);
    try {
      const res = await jobSeekerPostService.getShortlistedCandidates(postId);
      if (res.success) {
        setCandidates(res.data);
      }
    } catch {
      message.error("Lỗi khi tải danh sách đã lưu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobSeekerId: number) => {
    if (!user || !employerPostId) return;
    
    try {
      await jobSeekerPostService.unsaveCandidate({
        employerId: user.id,
        employerPostId: parseInt(employerPostId),
        jobSeekerId: jobSeekerId
      });
      message.success("Đã xóa khỏi danh sách lưu.");
      // Load lại danh sách sau khi xóa
      fetchShortlisted(parseInt(employerPostId));
    } catch {
      message.error("Không thể xóa.");
    }
  };

  const columns: TableColumnsType<ShortlistedCandidateDto> = [
    {
      title: 'Tên ứng viên',
      dataIndex: 'jobSeekerName',
      key: 'jobSeekerName',
      render: (text) => (
        <Space>
          <UserOutlined /> <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || <Text type="secondary" italic>Không có ghi chú</Text>
    },
    {
      title: 'Ngày lưu',
      dataIndex: 'addedAt',
      key: 'addedAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
             type="link" 
             onClick={() => navigate(`/ho-so/${record.jobSeekerId}`)}
          >
            Xem chi tiết
          </Button>
          
          <Popconfirm
            title="Bỏ lưu ứng viên này?"
            onConfirm={() => handleUnsave(record.jobSeekerId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Ứng viên đã lưu (Shortlist)</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow border border-gray-200">
        <Table
          rowKey="jobSeekerId"
          dataSource={candidates}
          columns={columns}
          loading={loading}
          locale={{ emptyText: "Chưa có ứng viên nào được lưu cho bài này." }}
        />
      </div>
    </div>
  );
};

export default ShortlistedCandidatesPage;