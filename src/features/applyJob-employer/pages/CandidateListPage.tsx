import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, message, Typography, Tag, Button, Space, Tooltip, Modal, Input } from 'antd';
import { 
  ArrowLeftOutlined, HeartOutlined, HeartFilled, 
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { jobApplicationService } from '../jobApplicationService'; 
import { jobSeekerPostService } from '../../candidate/services';
import { useAuth } from '../../auth/hooks';
import type { JobApplicationResultDto } from '../../applyJob-jobSeeker/type';

const { Title } = Typography;
const { TextArea } = Input;

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<JobApplicationResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [savedSeekerIds, setSavedSeekerIds] = useState<Set<number>>(new Set());

  const [statusModal, setStatusModal] = useState({
    visible: false,
    id: 0,
    currentNote: '', 
    targetStatus: '' as 'Accepted' | 'Rejected',
    newNote: '' 
  });

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
        setTotal(applicationsRes.total || applicationsRes.data.length);
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

  const openStatusModal = (record: JobApplicationResultDto, status: 'Accepted' | 'Rejected') => {
    setStatusModal({
      visible: true,
      id: record.candidateListId, 
      currentNote: record.notes || '', 
      targetStatus: status,
      newNote: '' 
    });
  };

  const handleSubmitStatus = async () => {
    const { id, targetStatus, newNote, currentNote } = statusModal;
    if (!id) return;

    const finalNote = newNote.trim() !== "" ? newNote : currentNote;

    try {
      const res = await jobApplicationService.updateStatus(id, targetStatus, finalNote);
      
      if (res.success) {
        message.success(`Đã cập nhật: ${targetStatus === 'Accepted' ? 'Duyệt' : 'Từ chối'}`);
        setStatusModal({ ...statusModal, visible: false });
        if (employerPostId) fetchAllData(parseInt(employerPostId, 10));
      } else {
        message.error(res.message || "Thất bại.");
      }
    } catch (err) {
      message.error("Lỗi hệ thống.");
    }
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
      align: 'center',
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
      render: (text: string, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.username}</div>
        </div>
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : "-",
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = 'Chờ duyệt';
        const s = status?.toLowerCase();
        if (s === 'accepted') { color = 'success'; label = 'Đã duyệt'; }
        else if (s === 'rejected') { color = 'error'; label = 'Đã từ chối'; }
        else if (s === 'pending') { color = 'processing'; label = 'Chờ duyệt'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => <span className="text-gray-500 italic text-xs">{text}</span>
    },
    {
      title: 'Xét duyệt',
      key: 'approval',
      render: (_, record) => {
        const currentStatus = record.status?.toLowerCase();

        return (
          <Space>
            {(currentStatus === 'pending' || currentStatus === 'rejected') && (
              <Tooltip title={currentStatus === 'rejected' ? "Đổi ý: Duyệt lại" : "Chấp nhận"}>
                <Button 
                  type={currentStatus === 'rejected' ? 'dashed' : 'text'}
                  className={currentStatus === 'rejected' ? "text-green-600 border-green-600" : "text-green-600"}
                  icon={<CheckCircleOutlined style={{ fontSize: '18px' }} />} 
                  onClick={() => openStatusModal(record, 'Accepted')}
                >
                  {currentStatus === 'rejected' && "Duyệt lại"}
                </Button>
              </Tooltip>
            )}

            {(currentStatus === 'pending' || currentStatus === 'accepted') && (
              <Tooltip title={currentStatus === 'accepted' ? "Đổi ý: Từ chối" : "Từ chối"}>
                <Button 
                  type={currentStatus === 'accepted' ? 'dashed' : 'text'}
                  danger
                  icon={<CloseCircleOutlined style={{ fontSize: '18px' }} />} 
                  onClick={() => openStatusModal(record, 'Rejected')}
                >
                  {currentStatus === 'accepted' && "Hủy duyệt"}
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/ho-so/${record.jobSeekerId}`)}>
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-0">Danh sách ứng viên</Title>
          {postTitle && <div className="text-gray-500 mt-1">Tin: {postTitle}</div>}
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Table
          rowKey="candidateListId"
          dataSource={applications}
          columns={columns}
          loading={isLoading}
          pagination={{ total: total, pageSize: 10 }}
        />
      </div>

      <Modal
        title={statusModal.targetStatus === 'Accepted' ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}
        open={statusModal.visible}
        onOk={handleSubmitStatus}
        onCancel={() => setStatusModal({ ...statusModal, visible: false })}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: statusModal.targetStatus === 'Rejected' }}
      >
        <div className="space-y-4">
          <p>
            Bạn xác nhận muốn chuyển trạng thái sang: 
            <strong className={statusModal.targetStatus === 'Accepted' ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
              {statusModal.targetStatus === 'Accepted' ? 'Đã duyệt' : 'Từ chối'}
            </strong>?
          </p>

          {statusModal.currentNote && (
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 border">
              <strong>Ghi chú hiện tại:</strong> {statusModal.currentNote}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú mới (Để trống sẽ giữ nguyên note cũ):
            </label>
            <TextArea 
              rows={3} 
              placeholder="Nhập ghi chú mới..."
              value={statusModal.newNote}
              onChange={(e) => setStatusModal({ ...statusModal, newNote: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateListPage;