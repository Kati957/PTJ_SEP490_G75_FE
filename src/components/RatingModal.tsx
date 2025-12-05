import React, { useState } from "react";
import { Modal, Rate, Input, message } from "antd";
import ratingService from "../services/ratingService";

interface RatingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  rateeId: number;
  submissionId: number;
  rateeName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  rateeId,
  submissionId,
  rateeName,
}) => {
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (ratingValue === 0) {
      message.warning("Vui lòng chọn số sao đánh giá.");
      return;
    }

    setSubmitting(true);
    try {
      await ratingService.createRating({
        rateeId,
        submissionId,
        ratingValue,
        comment,
      });
      message.success("Đánh giá thành công!");
      onSuccess();
      setRatingValue(0);
      setComment("");
    } catch (error: unknown) {
      let errorMsg = "Có lỗi xảy ra khi đánh giá.";

      if (error && typeof error === "object" && "response" in error) {
        const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
        if (maybeResponse?.data?.message) {
          errorMsg = maybeResponse.data.message;
        }
      } else if (error instanceof Error && error.message) {
        errorMsg = error.message;
      }

      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Đánh giá ${rateeName}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Gửi đánh giá"
      cancelText="Hủy"
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <Rate
          value={ratingValue}
          onChange={setRatingValue}
          className="text-3xl"
        />
        <Input.TextArea
          rows={4}
          placeholder="Nhập nhận xét của bạn (tùy chọn)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          showCount
        />
      </div>
    </Modal>
  );
};

export default RatingModal;
