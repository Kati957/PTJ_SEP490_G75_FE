import React from "react";
import { Button, Card, Tag } from "antd";
import { CloseCircleTwoTone, ArrowLeftOutlined, RedoOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-rose-50 px-4 py-10">
      <Card className="w-full max-w-3xl shadow-lg border border-rose-100/70">
        <div className="flex items-center gap-3 mb-2">
          <CloseCircleTwoTone twoToneColor="#ff4d4f" className="text-2xl" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-0">Giao dịch không thành công</h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Thanh toán đã bị hủy hoặc hết hạn. Vui lòng thử lại nếu bạn vẫn muốn nâng cấp gói.
        </p>

        <div className="rounded-xl border border-rose-100 bg-white px-4 py-5 mb-5 shadow-sm">
          <div className="flex items-start gap-3">
            <StopOutlined className="text-rose-500 text-xl" />
            <div>
              <h2 className="text-lg font-semibold text-rose-700 mb-1">Thanh toán bị hủy</h2>
              <p className="text-sm text-gray-700">
                Chúng tôi chưa ghi nhận thanh toán. Bạn có thể thực hiện lại để kích hoạt gói VIP cho tài khoản.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Tag color="red" className="m-0">CANCELLED</Tag>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/nha-tuyen-dung/nang-cap")}
            icon={<RedoOutlined />}
            shape="round"
            className="px-5 shadow-sm"
          >
            Thử lại thanh toán
          </Button>
          <Button
            size="large"
            onClick={() => navigate("/nha-tuyen-dung/dashboard")}
            icon={<ArrowLeftOutlined />}
            shape="round"
            className="px-5"
          >
            Về trang quản lý NTD
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancelledPage;
