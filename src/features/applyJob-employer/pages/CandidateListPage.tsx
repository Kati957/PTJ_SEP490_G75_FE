import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, message, Typography, Tag, Button, Space, Tooltip } from 'antd';
import { ArrowLeftOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';

// Import Services & Hooks
import { jobApplicationService } from '../jobApplicationService'; 
import { jobSeekerPostService } from '../../candidate/services';
import { useAuth } from '../../auth/hooks';

import type { JobApplicationResultDto } from '../../applyJob-jobSeeker/type';

const { Title } = Typography;

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<JobApplicationResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [savedSeekerIds, setSavedSeekerIds] = useState<Set<number>>(new Set());

  const postTitle = applications.length > 0 ? applications[0].postTitle : "";

  useEffect(() => {
    if (employerPostId) {
      fetchAllData(parseInt(employerPostId, 10)); 
    } else {
      message.error("Không tìm thấy ID bài đăng.");
      setIsLoading(false);
    }
  }, [employerPostId]);

  const fetchAllData = async (postId: number) => {
    setIsLoading(true);
    try {
      const [applicationsRes, shortlistedRes] = await Promise.all([
        jobApplicationService.getApplicationsByPost(postId),
        jobSeekerPostService.getShortlistedCandidates(postId)
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
        setTotal(applicationsRes.total);
      } else {
        message.error("Tải danh sách ứng viên thất bại.");
      }

      if (shortlistedRes.success) {
        const savedIds = shortlistedRes.data.map(candidate => candidate.jobSeekerId);
        setSavedSeekerIds(new Set(savedIds));
      }

    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi tải dữ liệu.");
    }
    setIsLoading(false);
  };

  const handleToggleSave = async (record: JobApplicationResultDto) => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để thực hiện chức năng này.");
      return;
    }

    const pId = employerPostId ? parseInt(employerPostId, 10) : record.employerPostId;

    const dto = {
      employerId: user.id,
      jobSeekerId: record.jobSeekerId,
      employerPostId: pId
    };

    const isSaved = savedSeekerIds.has(record.jobSeekerId);

    try {
      let res;
      if (isSaved) {
        res = await jobSeekerPostService.unsaveCandidate(dto);
        if (res.success || res) {
           message.success("Đã bỏ lưu ứng viên");
           setSavedSeekerIds(prev => {
             const newSet = new Set(prev);
             newSet.delete(record.jobSeekerId);
             return newSet;
           });
        }
      } else {
        res = await jobSeekerPostService.saveCandidate(dto);
        if (res.success || res) {
           message.success("Đã lưu hồ sơ ứng viên");
           setSavedSeekerIds(prev => new Set(prev).add(record.jobSeekerId));
        }
      }
    } catch (err: any) {
      message.error("Thao tác thất bại.");
    }
  };

  const columns: TableColumnsType<JobApplicationResultDto> = [
    {
      title: '',
      key: 'save',
      width: 50,
      render: (_, record) => {
        const isSaved = savedSeekerIds.has(record.jobSeekerId);
        return (
          <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu hồ sơ"}>
            <Button
              type="text"
              shape="circle"
              icon={
                isSaved ? (
                  <HeartFilled style={{ color: 'hotpink', fontSize: '18px' }} />
                ) : (
                  <HeartOutlined style={{ color: 'gray', fontSize: '18px' }} />
                )
              }
              onClick={() => handleToggleSave(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Tên ứng viên',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="blue">{status?.toUpperCase()}</Tag>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/ho-so/${record.jobSeekerId}`)}>
            Xem hồ sơ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2}>Danh sách ứng viên</Title>
          {postTitle && <Title level={4} style={{ marginTop: 0, color: '#555' }}>Cho tin: {postTitle}</Title>}
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Table
          rowKey="candidateListId"  
          dataSource={applications}
          columns={columns}
          loading={isLoading}
          pagination={{ total: total, pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default CandidateListPage;