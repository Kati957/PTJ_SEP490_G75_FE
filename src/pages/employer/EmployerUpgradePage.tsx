import React, { useMemo, useState } from "react";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  CrownOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Modal, Tag, message } from "antd";
import { useAuth } from "../../features/auth/hooks";
import employerPaymentService from "../../features/payment/employerPaymentService";
import { useAppSelector } from "../../app/hooks";
import type { User } from "../../features/auth/types";

type PlanOption = {
  planId: number;
  name: string;
  price: number;
  description: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
};

const EmployerUpgradePage: React.FC = () => {
  const { user } = useAuth();
  const employerProfile = useAppSelector((state) => state.profile.profile);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  type UserWithOptionalFields = User & { avatarUrl?: string | null; fullName?: string | null };
  const typedUser: UserWithOptionalFields | undefined = user
    ? {
        ...user,
        avatarUrl: user.avatarUrl ?? null,
        fullName: user.fullName ?? user.username ?? null,
      }
    : undefined;

  const avatarSrc = employerProfile?.avatarUrl ?? typedUser?.avatar ?? typedUser?.avatarUrl ?? undefined;
  const displayName =
    employerProfile?.displayName ||
    employerProfile?.contactName ||
    employerProfile?.username ||
    typedUser?.fullName ||
    typedUser?.username ||
    "Nhà tuyển dụng";

  const plans = useMemo<PlanOption[]>(
    () => [
      {
        planId: 2,
        name: "Medium",
        price: 30000,
        description: "Đủ tính năng cần thiết, đăng 6 bài trong kỳ và nhận CV đều đặn.",
        features: [
          "Đăng tối đa 6 bài / kỳ",
          "Tự động nổi bật bài đăng trong 3 ngày đầu",
        ],
      },
      {
        planId: 3,
        name: "Premium",
        price: 90000,
        badge: "Đề xuất",
        highlight: true,
        description: "Tăng tốc tuyển dụng: 15 bài/kỳ, ưu tiên hiển thị và hỗ trợ chuyên sâu.",
        features: [
          "Đăng tối đa 15 bài / kỳ",
          "Đề xuất bài viết ưu tiên lên đầu danh sách",
          "Đẩy top trang chủ 7 ngày",
        ],
      },
    ],
    []
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

  const handleChoosePlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setLoadingPlanId(selectedPlan.planId);

    try {
      const res = await employerPaymentService.createPaymentLink(selectedPlan.planId);
      const checkoutUrl = res.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(res.message || "Không nhận được đường dẫn thanh toán.");
      }

      message.success("Đang chuyển tới trang thanh toán PayOS...");
      window.location.href = checkoutUrl;
    } catch (error) {
      let errorMsg = "Không thể tạo liên kết thanh toán. Vui lòng thử lại.";

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
      setLoadingPlanId(null);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-indigo-50" />
      <div className="absolute -z-10 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl top-10 -left-24" />
      <div className="absolute -z-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl bottom-0 right-0" />

      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl p-6 md:p-8 border border-blue-400/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Tag color="gold" className="bg-white/20 border-0 text-xs font-semibold px-3 py-1 rounded-full w-fit shadow">
              Thanh toán an toàn qua PayOS
            </Tag>
            <h1 className="text-3xl font-bold leading-tight">
              Nâng cấp tài khoản nhà tuyển dụng
            </h1>
            <p className="text-sm text-white/80">
              Chọn gói phù hợp, xác nhận thanh toán, chúng tôi sẽ đưa bạn tới trang PayOS để hoàn tất giao dịch.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <SafetyCertificateOutlined /> Bảo mật dữ liệu thanh toán
              </span>
              <span className="flex items-center gap-1">
                <ThunderboltOutlined /> Kích hoạt gói nhanh sau khi thanh toán
              </span>
            </div>
          </div>
          <div className="relative bg-white/20 rounded-xl p-4 min-w-[260px] space-y-2 backdrop-blur border border-amber-200/70 shadow-inner">
            <Tag color="gold" className="absolute top-2 right-2 font-semibold">
              PRE
            </Tag>
            <p className="text-xs uppercase tracking-wide text-white/80">Tài khoản</p>
            <div className="flex items-center gap-3">
              <Avatar
                size={46}
                src={avatarSrc}
                className="ring-2 ring-amber-200 bg-amber-100 text-amber-700"
              >
                {!avatarSrc && displayName ? displayName.charAt(0).toUpperCase() : null}
              </Avatar>
              <div>
                <p className="text-lg font-extrabold bg-gradient-to-r from-amber-200 via-white to-pink-200 bg-clip-text text-transparent drop-shadow-sm">
                  {displayName}
                </p>
                <p className="text-xs text-white/70">Dùng tài khoản này để kích hoạt gói.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.planId}
            className={`relative overflow-hidden ${
              plan.highlight
                ? "border-transparent bg-gradient-to-br from-amber-50 via-white to-indigo-50 shadow-[0_12px_45px_rgba(59,130,246,0.28)] ring-2 ring-offset-2 ring-amber-300"
                : "bg-white border border-gray-100 shadow-sm hover:shadow-lg transition"
            }`}
            bodyStyle={{ padding: "22px" }}
          >
            {plan.badge && (
              <Tag color="gold" className="absolute top-4 right-4 text-xs font-semibold z-10">
                {plan.badge}
              </Tag>
            )}

            {plan.highlight ? (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500" />
            ) : (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400/40 to-indigo-400/30" />
            )}
            {plan.highlight && (
              <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-500 opacity-30 blur-2xl animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-2 mb-2">
              {plan.highlight ? (
                <CrownOutlined className="text-amber-500 text-lg drop-shadow-sm" />
              ) : (
                <ThunderboltOutlined className="text-blue-500 text-lg" />
              )}
              <h2
                className={`text-xl font-extrabold ${
                  plan.highlight
                    ? "bg-gradient-to-r from-amber-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,193,7,0.45)]"
                    : "text-gray-900"
                }`}
              >
                {plan.name}
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(plan.price)}
              </span>
              <span className="text-sm text-gray-500">/ gói</span>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className={`flex items-center gap-2 text-sm ${
                    plan.highlight ? "text-gray-800 bg-white/60" : "text-gray-700 bg-gray-50"
                  } rounded-lg px-2 py-1`}
                >
                  <CheckCircleFilled className="text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              type={plan.highlight ? "primary" : "default"}
              size="large"
              className={`w-full ${
                plan.highlight
                  ? "bg-gradient-to-r from-amber-500 to-indigo-500 border-none shadow-lg hover:opacity-90"
                  : ""
              } rounded-full`}
              icon={<ArrowRightOutlined />}
              onClick={() => handleChoosePlan(plan)}
              loading={loadingPlanId === plan.planId}
            >
              Thanh toán gói {plan.name}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="border-gray-100">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">B1: Chọn gói</p>
            <p className="text-sm text-gray-600">
              Chọn Medium hoặc Premium tùy nhu cầu đăng tin và nhận CV.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">B2: Xác nhận</p>
            <p className="text-sm text-gray-600">
              Hệ thống hỏi lại một lần trước khi tạo liên kết PayOS.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">B3: Thanh toán</p>
            <p className="text-sm text-gray-600">
              Chuyển sang PayOS để thanh toán, gói sẽ kích hoạt ngay khi thanh toán thành công.
            </p>
          </div>
        </div>
      </Card>

      <Modal
        title="Xác nhận thanh toán"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        okText="Thanh toán PayOS"
        cancelText="Hủy"
        confirmLoading={loadingPlanId === selectedPlan?.planId}
        onOk={handleConfirmPayment}
      >
        {selectedPlan ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Bạn sắp mua gói <span className="font-semibold">{selectedPlan.name}</span> với giá{" "}
              <span className="font-semibold">{formatCurrency(selectedPlan.price)}</span>.
            </p>
            <p className="text-sm text-gray-600">
              Tiếp tục sẽ mở trang thanh toán PayOS. Vui lòng hoàn tất giao dịch để kích hoạt gói.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Chưa có gói nào được chọn.</p>
        )}
      </Modal>
    </div>
  );
};

export default EmployerUpgradePage;
