import React from "react";
import { Button, Card, Tag } from "antd";
import { CheckCircleTwoTone, ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const orderCode = params.get("orderCode");
  const status = params.get("status") || "PAID";
  const code = params.get("code");

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-3xl shadow-lg border border-green-100/60">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircleTwoTone twoToneColor="#52c41a" className="text-2xl" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-0">Đặt hàng thành công</h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Mã đơn hàng: <span className="font-semibold text-gray-800">{orderCode || "Không có"}</span>
        </p>

        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-5 mb-5">
          <div className="flex items-start gap-3">
            <CheckCircleOutlined className="text-green-500 text-xl" />
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-1">Thanh toán thành công</h2>
              <p className="text-sm text-green-800">
                Chúng tôi đã nhận được thanh toán. Gói VIP sẽ được kích hoạt và đồng bộ tài khoản của bạn trong thời gian sớm nhất.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Tag color="green" className="m-0">{status.toUpperCase()}</Tag>
                {code && <span className="text-xs text-gray-600">Code: {code}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/nha-tuyen-dung/dashboard")}
            icon={<ArrowLeftOutlined />}
            shape="round"
            className="px-5 shadow-sm"
          >
            Về trang quản lý
          </Button>
          <Button
            size="large"
            onClick={() => navigate("/nha-tuyen-dung/dang-tin")}
            shape="round"
            className="px-5"
          >
            Đăng tin tuyển dụng
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
