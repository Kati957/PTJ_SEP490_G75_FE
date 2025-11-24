import {
  DollarCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Input, Modal, Row, Tag, Avatar } from "antd";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

import type { JobApplicationResultDto } from "../type";
import { APPLICATION_STATUS_VN, STATUS_COLORS } from "../constants";
import noLogo from "../../../assets/no-logo.png";

const { TextArea } = Input;

interface AppliedJobCardProps {
  appliedJob: JobApplicationResultDto;
  onWithdraw: (jobSeekerId: number, employerPostId: number) => void;
}

const AppliedJobCard = ({ appliedJob, onWithdraw }: AppliedJobCardProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleWithdraw = () => {
    onWithdraw(appliedJob.jobSeekerId, appliedJob.employerPostId);
  };

  const formattedDate = useMemo(() => {
    return appliedJob.applicationDate
      ? format(parseISO(appliedJob.applicationDate), "dd/MM/yyyy")
      : "N/A";
  }, [appliedJob.applicationDate]);

  const logoSrc =
    (appliedJob as any).employerAvatar ||
    (appliedJob as any).employerLogo ||
    (appliedJob as any).logo ||
    (appliedJob as any).logoUrl ||
    noLogo;

  const salaryText =
    appliedJob.salary && appliedJob.salary > 0
      ? appliedJob.salary
      : "Thỏa thuận";

  const statusColor =
    STATUS_COLORS[appliedJob.status] || STATUS_COLORS.Pending || "default";

  const statusLabel =
    APPLICATION_STATUS_VN[
      appliedJob.status as keyof typeof APPLICATION_STATUS_VN
    ] || "Đang xử lý";

  return (
    <Card
      className="overflow-hidden shadow-sm hover:shadow-md transition"
      hoverable
      style={{ borderRadius: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={4} className="flex items-center justify-center">
          <Avatar
            src={logoSrc}
            size={72}
            shape="square"
            style={{ borderRadius: 16 }}
          />
        </Col>

        <Col xs={24} sm={14}>
          <Link to={`/viec-lam/chi-tiet/${appliedJob.employerPostId}`}>
            <h3 className="mb-2 text-lg font-bold text-blue-600 hover:text-blue-500">
              {appliedJob.postTitle}
            </h3>
          </Link>
          <p className="mb-2 text-base font-semibold text-gray-700">
            {appliedJob.employerName}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            <span className="flex items-center">
              <DollarCircleOutlined className="mr-2" /> {salaryText}
            </span>
            <span className="flex items-center">
              <EnvironmentOutlined className="mr-2" />{" "}
              {appliedJob.location || "Đang cập nhật"}
            </span>
            <span className="flex items-center">
              <FieldTimeOutlined className="mr-2" /> Ngày ứng tuyển:{" "}
              {formattedDate}
            </span>
          </div>
        </Col>

        <Col xs={24} sm={6} className="flex flex-col items-end gap-2">
          <Tag
            color={statusColor}
            className="mb-2 inline-flex items-center justify-center self-start rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide shadow-sm sm:self-end"
          >
            {statusLabel}
          </Tag>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Button icon={<EyeOutlined />} onClick={showModal} block>
              Xem ghi chú
            </Button>
            {appliedJob.status === "Pending" && (
              <Button danger onClick={handleWithdraw} block>
                Rút đơn
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Modal
        title="Ghi chú ứng tuyển"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <TextArea
          readOnly
          value={appliedJob.notes || "Không có ghi chú."}
          autoSize={{ minRows: 4, maxRows: 10 }}
          style={{
            cursor: "default",
            backgroundColor: "#fff",
            color: "rgba(0, 0, 0, 0.88)",
          }}
        />
      </Modal>
    </Card>
  );
};

export default AppliedJobCard;
