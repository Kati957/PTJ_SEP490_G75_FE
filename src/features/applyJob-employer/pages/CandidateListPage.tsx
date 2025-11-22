import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  message,
  Typography,
  Tag,
  Button,
  Space,
  Tooltip,
  Modal,
  Input,
  Tabs,
} from "antd";
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { jobApplicationService } from "../jobApplicationService";
import { jobSeekerPostService } from "../../candidate/services";
import jobSeekerCvService from "../../jobSeekerCv/services";
import { useAuth } from "../../auth/hooks";
import type { JobApplicationResultDto } from "../../applyJob-jobSeeker/type";
import type { ShortlistedCandidateDto } from "../../candidate/type";
import type { JobSeekerCv } from "../../jobSeekerCv/types";

const { Title } = Typography;
const { TextArea } = Input;

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();

  const [applications, setApplications] = useState<JobApplicationResultDto[]>(
    []
  );
  const [savedList, setSavedList] = useState<ShortlistedCandidateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [statusModal, setStatusModal] = useState({
    visible: false,
    id: 0,
    currentNote: "",
    targetStatus: "" as "Accepted" | "Rejected",
    newNote: "",
  });

  // (Giả định trong file gốc bạn đã có state cvModal + setCvModal)
  const [cvModal, setCvModal] = useState<{
    visible: boolean;
    loading: boolean;
    cv: JobSeekerCv | null;
    error: string | null;
  }>({
    visible: false,
    loading: false,
    cv: null,
    error: null,
  });

  const savedIdSet = new Set(savedList.map((s) => s.jobSeekerId));

  const getCvIdFromRecord = (
    record: Partial<JobApplicationResultDto & ShortlistedCandidateDto>
  ): number | null => {
    return record.cvId ?? record.selectedCvId ?? (record as any)?.cvid ?? null;
  };

  const handleViewCv = useCallback(async (cvId?: number | null) => {
    if (!cvId) {
      message.info("Ứng viên này chưa đính kèm CV.");
      return;
    }
    setCvModal({ visible: true, loading: true, cv: null, error: null });
    try {
      const cv = await jobSeekerCvService.fetchCvForEmployer(cvId);
      setCvModal({ visible: true, loading: false, cv, error: null });
    } catch {
      setCvModal({
        visible: true,
        loading: false,
        cv: null,
        error: "Không thể tải CV. Vui lòng thử lại sau.",
      });
    }
  }, []);

  useEffect(() => {
    if (!employerPostId) {
      message.error("Không tìm thấy ID bài đăng.");
      setIsLoading(false);
      return;
    }
    const postId = parseInt(employerPostId, 10);
    fetchAll(postId);
  }, [employerPostId]);

  const fetchAll = async (postId: number) => {
    setIsLoading(true);
    try {
      const [applicationsRes, savedRes] = await Promise.all([
        jobApplicationService.getApplicationsByPost(postId),
        jobSeekerPostService.getShortlistedCandidates(postId),
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
        const titleFromApplicants = applicationsRes.data[0]?.postTitle || "";
        setPostTitle(titleFromApplicants);
      } else {
        message.error("Tải danh sách ứng viên thất bại.");
      }

      if (savedRes.success) {
        setSavedList(savedRes.data);
        if (!postTitle && savedRes.data[0]?.postTitle) {
          setPostTitle(savedRes.data[0].postTitle);
        }
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải dữ liệu.");
    }
    setIsLoading(false);
  };

  const handleToggleSave = async (record: JobApplicationResultDto) => {
    if (!user || !employerPostId) {
      message.warning("Vui lòng đăng nhập để thao tác.");
      return;
    }
    const postId = parseInt(employerPostId, 10);
    const dto = {
      employerId: user.id,
      jobSeekerId: record.jobSeekerId,
      employerPostId: postId,
    };
    const isSaved = savedIdSet.has(record.jobSeekerId);
    try {
      if (isSaved) {
        const res = await jobSeekerPostService.unsaveCandidate(dto);
        if (res?.success || res) {
          message.success("Đã bỏ lưu ứng viên.");
          setSavedList((prev) =>
            prev.filter((s) => s.jobSeekerId !== record.jobSeekerId)
          );
        }
      } else {
        const res = await jobSeekerPostService.saveCandidate(dto);
        if (res?.success || res) {
          message.success("Đã lưu hồ sơ ứng viên.");
          setSavedList((prev) => [
            ...prev,
            {
              jobSeekerId: record.jobSeekerId,
              jobSeekerName: record.username,
              addedAt: new Date().toISOString(),
              note: record.notes,
              postTitle: postTitle,
            } as ShortlistedCandidateDto,
          ]);
        }
      }
    } catch (err) {
      message.error("Thao tác thất bại.");
    }
  };

  const openStatusModal = (
    record: JobApplicationResultDto,
    status: "Accepted" | "Rejected"
  ) => {
    setStatusModal({
      visible: true,
      id: record.candidateListId,
      currentNote: record.notes || "",
      targetStatus: status,
      newNote: "",
    });
  };

  const handleSubmitStatus = async () => {
    const { id, targetStatus, newNote, currentNote } = statusModal;
    if (!id) return;
    const finalNote = newNote.trim() !== "" ? newNote : currentNote;
    try {
      const res = await jobApplicationService.updateStatus(
        id,
        targetStatus,
        finalNote
      );
      if (res.success) {
        message.success(
          targetStatus === "Accepted" ? "Đã duyệt hồ sơ." : "Đã từ chối hồ sơ."
        );
        setStatusModal({ ...statusModal, visible: false });
        if (employerPostId) fetchAll(parseInt(employerPostId, 10));
      } else {
        message.error(res.message || "Cập nhật trạng thái thất bại.");
      }
    } catch (err) {
      message.error("Lỗi hệ thống.");
    }
  };

  const renderStatusTag = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "accepted") return <Tag color="success">Đã duyệt</Tag>;
    if (s === "rejected") return <Tag color="error">Đã từ chối</Tag>;
    if (s === "pending") return <Tag color="processing">Chờ duyệt</Tag>;
    return <Tag>Chưa xem</Tag>;
  };

  const applicantColumns: TableColumnsType<JobApplicationResultDto> = [
    {
      title: "",
      key: "save",
      width: 50,
      align: "center",
      render: (_, record) => {
        const isSaved = savedIdSet.has(record.jobSeekerId);
        return (
          <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu hồ sơ"}>
            <Button
              type="text"
              shape="circle"
              icon={
                isSaved ? (
                  <HeartFilled style={{ color: "hotpink", fontSize: 18 }} />
                ) : (
                  <HeartOutlined style={{ color: "gray", fontSize: 18 }} />
                )
              }
              onClick={() => handleToggleSave(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Tên ứng viên",
      dataIndex: "username",
      key: "username",
      render: (text: string, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.username}</div>
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "applicationDate",
      key: "applicationDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatusTag,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (text) => (
        <span className="text-gray-500 italic text-xs">{text}</span>
      ),
    },
    {
      title: "Xét duyệt",
      key: "approval",
      render: (_, record) => {
        const currentStatus = record.status?.toLowerCase();
        return (
          <Space>
            {(currentStatus === "pending" ||
              currentStatus === "rejected") && (
              <Tooltip
                title={
                  currentStatus === "rejected" ? "Duyệt lại" : "Chấp nhận"
                }
              >
                <Button
                  type={currentStatus === "rejected" ? "dashed" : "text"}
                  className={
                    currentStatus === "rejected"
                      ? "text-green-600 border-green-600"
                      : "text-green-600"
                  }
                  icon={<CheckCircleOutlined style={{ fontSize: 18 }} />}
                  onClick={() => openStatusModal(record, "Accepted")}
                >
                  {currentStatus === "rejected" && "Duyệt lại"}
                </Button>
              </Tooltip>
            )}
            {(currentStatus === "pending" ||
              currentStatus === "accepted") && (
              <Tooltip
                title={currentStatus === "accepted" ? "Hủy duyệt" : "Từ chối"}
              >
                <Button
                  type={currentStatus === "accepted" ? "dashed" : "text"}
                  danger
                  icon={<CloseCircleOutlined style={{ fontSize: 18 }} />}
                  onClick={() => openStatusModal(record, "Rejected")}
                >
                  {currentStatus === "accepted" && "Hủy duyệt"}
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: "CV",
      key: "profile",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewCv(getCvIdFromRecord(record))}
        >
          Xem CV
        </Button>
      ),
    },
  ];

  const savedColumns: TableColumnsType<ShortlistedCandidateDto> = [
    {
      title: "",
      key: "delete",
      width: 50,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Bỏ lưu">
          <Button
            type="text"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={async () => {
              if (!user || !employerPostId) return;
              try {
                await jobSeekerPostService.unsaveCandidate({
                  employerId: user.id,
                  jobSeekerId: record.jobSeekerId,
                  employerPostId: parseInt(employerPostId, 10),
                });
                message.success("Đã bỏ lưu.");
                setSavedList((prev) =>
                  prev.filter((s) => s.jobSeekerId !== record.jobSeekerId)
                );
              } catch {
                message.error("Không thể bỏ lưu.");
              }
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Ứng viên",
      dataIndex: "jobSeekerName",
      key: "jobSeekerName",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (text) => (
        <span className="text-gray-500 italic text-xs">{text}</span>
      ),
    },
    {
      title: "Ngày lưu",
      dataIndex: "addedAt",
      key: "addedAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "CV",
      key: "profile",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewCv(getCvIdFromRecord(record))}
        >
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-0">
            Danh sách ứng viên
          </Title>
          {postTitle && (
            <div className="text-gray-500 mt-1">Tin tuyển dụng: {postTitle}</div>
          )}
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Tabs
          items={[
            {
              key: "applicants",
              label: `Ứng viên (${applications.length})`,
              children: (
                <Table
                  rowKey="candidateListId"
                  dataSource={applications}
                  columns={applicantColumns}
                  loading={isLoading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: "saved",
              label: `Đã lưu (${savedList.length})`,
              children: (
                <Table
                  rowKey={(record) => `${record.jobSeekerId}-${record.addedAt}`}
                  dataSource={savedList}
                  columns={savedColumns}
                  loading={isLoading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={
          statusModal.targetStatus === "Accepted"
            ? "Duyệt hồ sơ"
            : "Từ chối hồ sơ"
        }
        open={statusModal.visible}
        onOk={handleSubmitStatus}
        onCancel={() => setStatusModal({ ...statusModal, visible: false })}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: statusModal.targetStatus === "Rejected" }}
      >
        <div className="space-y-4">
          <p>
            Bạn xác nhận chuyển trạng thái sang
            <strong
              className={
                statusModal.targetStatus === "Accepted"
                  ? "text-green-600 ml-1"
                  : "text-red-600 ml-1"
              }
            >
              {statusModal.targetStatus === "Accepted"
                ? "Đã duyệt"
                : "Đã từ chối"}
            </strong>
            ?
          </p>

          {statusModal.currentNote && (
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 border">
              <strong>Ghi chú hiện tại:</strong> {statusModal.currentNote}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú mới (để trống sẽ giữ nguyên ghi chú cũ):
            </label>
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú..."
              value={statusModal.newNote}
              onChange={(e) =>
                setStatusModal({ ...statusModal, newNote: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>

      {/* Modal CV – nếu bạn đã có UI riêng thì giữ lại, đây chỉ là ví dụ */}
      <Modal
        title={cvModal.cv?.cvTitle || "CV ứng viên"}
        open={cvModal.visible}
        footer={null}
        onCancel={() =>
          setCvModal({ visible: false, loading: false, cv: null, error: null })
        }
        width={800}
      >
        {cvModal.loading ? (
          <p>Đang tải CV...</p>
        ) : cvModal.error ? (
          <p className="text-red-500">{cvModal.error}</p>
        ) : cvModal.cv ? (
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(cvModal.cv, null, 2)}
          </pre>
        ) : (
          <p>Không có dữ liệu CV.</p>
        )}
      </Modal>
    </div>
  );
};

export default CandidateListPage;
