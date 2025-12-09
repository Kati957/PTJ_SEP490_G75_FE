import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  message,
  Typography,
  Tag,
  Button,
  Tooltip,
  Modal,
  Input,
  Tabs,
  Dropdown,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  StarOutlined,
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

type StatusAction = "Accepted" | "Rejected" | "Interviewing";
type CvWithDetails = JobSeekerCv & { experience?: string | null; education?: string | null };

const STATUS_LABELS: Record<
  StatusAction,
  { label: string; className: string; successMessage: string; modalTitle: string }
> = {
  Accepted: {
    label: "Đồng ý tuyển dụng",
    className: "text-green-600 ml-1",
    successMessage: "Đã chuyển trạng thái sang Đồng ý tuyển dụng.",
    modalTitle: "Đồng ý tuyển dụng",
  },
  Rejected: {
    label: "Từ chối tuyển dụng",
    className: "text-red-600 ml-1",
    successMessage: "Đã chuyển trạng thái sang Từ chối tuyển dụng.",
    modalTitle: "Từ chối tuyển dụng",
  },
  Interviewing: {
    label: "Mời phỏng vấn",
    className: "text-blue-600 ml-1",
    successMessage: "Đã chuyển trạng thái sang Mời phỏng vấn.",
    modalTitle: "Mời phỏng vấn",
  },
};

const APPROVAL_OPTIONS: { key: StatusAction; label: string; icon: React.ReactNode }[] =
  [
    {
      key: "Accepted",
      label: "Đồng ý tuyển dụng",
      icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
    {
      key: "Rejected",
      label: "Từ chối tuyển dụng",
      icon: <CloseCircleOutlined style={{ color: "#dc2626" }} />,
    },
    {
      key: "Interviewing",
      label: "Mời phỏng vấn",
      icon: <StarOutlined style={{ color: "#2563eb" }} />,
    },
  ];

const CandidateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerPostId } = useParams<{ employerPostId: string }>();
  const { user } = useAuth();

  const [applications, setApplications] = useState<JobApplicationResultDto[]>([]);
  const [savedList, setSavedList] = useState<ShortlistedCandidateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postTitle, setPostTitle] = useState("");

  const [statusModal, setStatusModal] = useState({
    visible: false,
    id: 0,
    currentNote: "",
    targetStatus: "Accepted" as StatusAction,
    newNote: "",
  });

  const [cvModal, setCvModal] = useState<{
    visible: boolean;
    loading: boolean;
    cv: CvWithDetails | null;
    error: string | null;
  }>({
    visible: false,
    loading: false,
    cv: null,
    error: null,
  });

  // ⭐ NEW: modal hiển thị đầy đủ mô tả / ghi chú
  const [descriptionModal, setDescriptionModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({
    visible: false,
    title: "",
    content: "",
  });

  const savedIdSet = new Set(savedList.map((s) => s.jobSeekerId));
  const fetchAll = useCallback(async (postId: number) => {
    setIsLoading(true);
    try {
      const [applicationsRes, savedRes] = await Promise.all([
        jobApplicationService.getApplicationsByPost(postId),
        jobSeekerPostService.getShortlistedCandidates(postId),
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
        const titleFromApplicants = applicationsRes.data?.[0]?.postTitle ?? '';
        setPostTitle((prev) => prev || titleFromApplicants);
      } else {
        message.error('T?i danh s?ch ?ng vi?n th?t b?i.');
      }

      if (savedRes.success) {
        setSavedList(savedRes.data);
        const fallbackTitle = savedRes.data?.[0]?.postTitle ?? '';
        setPostTitle((prev) => prev || fallbackTitle);
      }
    } catch (err) {
      const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const fallback = err instanceof Error ? err.message : 'L?i khi t?i d? li?u.';
      message.error(responseMessage || fallback);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!employerPostId) {
      message.error('Kh?ng t?m th?y ID b?i ??ng.');
      setIsLoading(false);
      return;
    }
    const postId = parseInt(employerPostId, 10);
    fetchAll(postId);
  }, [employerPostId, fetchAll]);

  const getCvIdFromRecord = (
    record: Partial<JobApplicationResultDto & ShortlistedCandidateDto>
  ): number | null => {
    return record.cvId ?? record.selectedCvId ?? record.cvid ?? null;
  };

  const formatDateOnly = (value?: string | null) => {
    if (!value) return 'Ch?a c?p nh?t';
    try {
      return new Date(value).toLocaleDateString('vi-VN');
    } catch {
      return value;
    }
  };

  const handleViewCv = useCallback(async (cvId?: number | null) => {
    if (!cvId) {
      message.info('?ng vi?n n?y ch?a ??nh k?m CV.');
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
        error: 'Kh?ng th? t?i CV. Vui l?ng th? l?i sau.',
      });
    }
  }, []);

  const handleToggleSave = async (record: JobApplicationResultDto) => {
    if (!user || !employerPostId) {
      message.warning('Vui l?ng ??ng nh?p ?? thao t?c.');
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
          message.success('Đã bỏ lưu hồ sơ ứng viên.');
          setSavedList((prev) => prev.filter((s) => s.jobSeekerId !== record.jobSeekerId));
        }
      } else {
        const res = await jobSeekerPostService.saveCandidate(dto);
        if (res?.success || res) {
          message.success('Đã lưu hồ sơ ứng viên.');
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
    } catch {
      message.error('Thao tác thất bại.');
    }
  };
  const openStatusModal = (
    record: JobApplicationResultDto,
    status: StatusAction
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
        message.success(STATUS_LABELS[targetStatus].successMessage);
        setStatusModal({ ...statusModal, visible: false });
        if (employerPostId) fetchAll(parseInt(employerPostId, 10));
      } else {
        message.error(res.message || "Cập nhật trạng thái thất bại.");
      }
    } catch {
      message.error("Lỗi hệ thống.");
    }
  };

  const renderStatusTag = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "accepted") return <Tag color="success">Đồng ý tuyển dụng</Tag>;
    if (s === "rejected") return <Tag color="error">Từ chối tuyển dụng</Tag>;
    if (s === "interviewing") return <Tag color="blue">Mời phỏng vấn</Tag>;
    if (s === "pending") return <Tag color="processing">Chờ duyệt</Tag>;
    return <Tag>Chưa xem</Tag>;
  };

  // ⭐ Helper cắt bớt mô tả/ghi chú + nút Xem thêm
  const renderClampedText = (
    text: string | undefined | null,
    titleForModal: string
  ) => {
    const content = (text || "").trim();
    if (!content) {
      return <span className="text-gray-400 italic text-xs">Không có</span>;
    }

    const MAX_LEN = 60;
    const isLong = content.length > MAX_LEN;
    const display = isLong ? `${content.slice(0, MAX_LEN)}...` : content;

    return (
      <div
        className="flex items-center gap-1 max-w-xs"
        style={{ wordBreak: "break-word" }}
      >
        <span className="text-gray-500 italic text-xs">{display}</span>
        {isLong && (
          <Button
            type="link"
            size="small"
            onClick={() =>
              setDescriptionModal({
                visible: true,
                title: titleForModal,
                content: content,
              })
            }
          >
            Xem thêm
          </Button>
        )}
      </div>
    );
  };

  const applicantColumns: TableColumnsType<JobApplicationResultDto> = [
    {
      title: "",
      key: "save",
      width: 50,
      fixed: "left",
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
      width: 220,
      fixed: "left",
      render: (text: string, record) => (
        <div className="min-w-0">
          <div className="font-medium truncate max-w-[180px]">{text}</div>
          <div className="text-xs text-gray-500 truncate max-w-[180px]">
            {record.username}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "applicationDate",
      key: "applicationDate",
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: renderStatusTag,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 260,
      // ⭐ dùng renderer cắt bớt + Xem thêm
      render: (text, record) =>
        renderClampedText(text, `Ghi chú - ${record.username || "Ứng viên"}`),
    },
    {
      title: "Xét duyệt",
      key: "approval",
      width: 150,
      render: (_, record) => {
        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: APPROVAL_OPTIONS.map((option) => ({
                key: option.key,
                label: (
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                ),
                disabled:
                  record.status?.toLowerCase() === option.key.toLowerCase(),
              })),
              onClick: ({ key }) =>
                openStatusModal(record, key as StatusAction),
            }}
          >
            <Button
              size="small"
              type="default"
              className="flex items-center gap-1"
            >
              <span>Chọn trạng thái</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: "CV",
      key: "profile",
      width: 80,
      fixed: "right",
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
      fixed: "left",
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
      width: 220,
      render: (text, record) => (
        <div className="min-w-0">
          <div className="font-medium truncate max-w-[180px]">{text}</div>
          <div className="text-xs text-gray-500 truncate max-w-[180px]">
            {record.jobSeekerName}
          </div>
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 260,
      render: (text, record) =>
        renderClampedText(text, `Ghi chú đã lưu - ${record.jobSeekerName}`),
    },
    {
      title: "Ngày lưu",
      dataIndex: "addedAt",
      key: "addedAt",
      width: 110,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
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
            <div className="text-gray-500 mt-1">
              Tin tuyển dụng: {postTitle}
            </div>
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
                <div className="overflow-x-auto">
                  <Table
                    rowKey="candidateListId"
                    dataSource={applications}
                    columns={applicantColumns}
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    tableLayout="fixed"
                    scroll={{ x: 1100 }} // ⭐ đủ để không tràn viền, có thanh scroll ngang nếu thiếu
                  />
                </div>
              ),
            },
            {
              key: "saved",
              label: `Đã lưu (${savedList.length})`,
              children: (
                <div className="overflow-x-auto">
                  <Table
                    rowKey={(record) =>
                      `${record.jobSeekerId}-${record.addedAt}`
                    }
                    dataSource={savedList}
                    columns={savedColumns}
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    tableLayout="fixed"
                    scroll={{ x: 900 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal đổi trạng thái */}
      <Modal
        title={STATUS_LABELS[statusModal.targetStatus].modalTitle}
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
            <strong className={STATUS_LABELS[statusModal.targetStatus].className}>
              {STATUS_LABELS[statusModal.targetStatus].label}
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

      {/* Modal CV */}
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
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-lg border bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-1">Thông tin chung</h3>
              <p>
                <span className="font-semibold">Tiêu đề:</span>{" "}
                {cvModal.cv.cvTitle}
              </p>
              {cvModal.cv.preferredJobType && (
                <p>
                  <span className="font-semibold">Công việc mong muốn:</span>{" "}
                  {cvModal.cv.preferredJobType}
                </p>
              )}
              {cvModal.cv.preferredLocationName && (
                <p>
                  <span className="font-semibold">Khu vực mong muốn:</span>{" "}
                  {cvModal.cv.preferredLocationName}
                </p>
              )}
              {cvModal.cv.contactPhone && (
                <p>
                  <span className="font-semibold">Liên hệ:</span>{" "}
                  {cvModal.cv.contactPhone}
                </p>
              )}
            </div>

            {(cvModal.cv.skillSummary || cvModal.cv.skills) && (
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">Kỹ năng</h3>
                {cvModal.cv.skillSummary && (
                  <p className="text-gray-700">{cvModal.cv.skillSummary}</p>
                )}
                {cvModal.cv.skills && (
                  <div className="mt-2">
                    {cvModal.cv.skills.split(",").map((skill, idx) => (
                      <Tag key={idx} color="blue" className="mb-1">
                        {skill.trim()}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cvModal.cv.experience && (
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">Kinh nghiệm</h3>
                <p className="whitespace-pre-wrap text-gray-700">
                  {cvModal.cv.experience}
                </p>
              </div>
            )}

            {cvModal.cv.education && (
              <div className="p-3 rounded-lg border bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-1">Học vấn</h3>
                <p className="whitespace-pre-wrap text-gray-700">
                  {cvModal.cv.education}
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500 text-right">
              Cập nhật: {formatDateOnly(cvModal.cv.updatedAt)}
            </div>
          </div>
        ) : (
          <Empty description="Không có dữ liệu CV." />
        )}
      </Modal>
      {/* Modal xem đầy đủ mô tả / ghi chú */}
      <Modal
        title={descriptionModal.title || "Chi tiết"}
        open={descriptionModal.visible}
        footer={null}
        onCancel={() =>
          setDescriptionModal({ visible: false, title: "", content: "" })
        }
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{descriptionModal.content}</p>
      </Modal>

  </div>
);
};

export default CandidateListPage;
