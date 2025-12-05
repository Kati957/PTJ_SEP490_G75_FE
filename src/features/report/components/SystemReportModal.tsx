import React, { useState } from "react";
import { Form, Input, Modal, message } from "antd";
import reportService from "../reportService";

interface SystemReportModalProps {
  open: boolean;
  onClose: () => void;
}

const SystemReportModal: React.FC<SystemReportModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: { title: string; description: string }) => {
    setSubmitting(true);
    try {
      await reportService.createSystemReport({
        title: values.title.trim(),
        description: values.description.trim(),
      });
      message.success("Gửi báo cáo thành công. Cảm ơn bạn đã phản hồi!");
      form.resetFields();
      onClose();
    } catch (error) {
      const apiMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error(apiMessage || "Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        if (!submitting) {
          onClose();
        }
      }}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Gửi báo cáo"
      cancelText="Hủy"
      destroyOnHidden
      title="Dịch vụ hỗ trợ hệ thống"
      maskClosable={!submitting}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề" },
            { min: 5, message: "Tiêu đề cần ít nhất 5 ký tự" },
          ]}
        >
          <Input maxLength={120} showCount placeholder="Ví dụ: Lỗi giao diện, lỗi đăng nhập..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả cần ít nhất 10 ký tự" },
          ]}
        >
          <Input.TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder="Mô tả lỗi bạn gặp phải, bước tái hiện, đính kèm minh chứng (nếu có)..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SystemReportModal;
