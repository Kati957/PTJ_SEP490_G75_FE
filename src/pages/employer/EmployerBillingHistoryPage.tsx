import React, { useEffect, useMemo, useState } from "react";
import { Card, Tabs, Table, Tag, Typography, message, Statistic, Space, Divider } from "antd";
import baseService from "../../services/baseService";

type TransactionItem = {
  transactionId: number;
  planId?: number | null;
  amount?: number | null;
  status?: string | null;
  payOsorderCode?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
};

type SubscriptionItem = {
  subscriptionId: number;
  planName?: string | null;
  price?: number | null;
  remainingPosts?: number | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const numberText = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") : "-";

const EmployerBillingHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  const fetchTransactions = async () => {
    setLoadingTxn(true);
    try {
      const res = await baseService.get("/payment/transaction-history");
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : (res as unknown);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("load transaction history error", error);
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoadingTxn(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoadingSub(true);
    try {
      const res = await baseService.get("/payment/subscription-history");
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : (res as unknown);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("load subscription history error", error);
      message.error("Không thể tải lịch sử gói");
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
    void fetchSubscriptions();
  }, []);

  const totalPaid = useMemo(
    () => transactions.reduce((sum, t) => sum + (t.status === "Paid" && t.amount ? t.amount : 0), 0),
    [transactions],
  );
  const paidCount = useMemo(() => transactions.filter((t) => t.status === "Paid").length, [transactions]);
  const pendingCount = useMemo(() => transactions.filter((t) => t.status === "Pending").length, [transactions]);

  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status === "Active").length, [subscriptions]);
  const expiredSubs = useMemo(() => subscriptions.filter((s) => s.status === "Expired").length, [subscriptions]);

  const txnColumns = [
    { title: "Mã GD", dataIndex: "transactionId", key: "transactionId", width: 100 },
    { title: "Gói", dataIndex: "planId", key: "planId", width: 80 },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: numberText,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "Paid" ? "green" : v === "Pending" ? "orange" : "default"}>
          {v === "Paid" ? "Đã thanh toán" : v === "Pending" ? "Đang chờ" : v || "-"}
        </Tag>
      ),
    },
    { title: "Mã order", dataIndex: "payOsorderCode", key: "payOsorderCode" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: formatDateTime },
    { title: "Thanh toán", dataIndex: "paidAt", key: "paidAt", render: formatDateTime },
  ];

  const subColumns = [
    { title: "Gói", dataIndex: "planName", key: "planName" },
    { title: "Giá", dataIndex: "price", key: "price", render: numberText },
    { title: "Bài còn lại", dataIndex: "remainingPosts", key: "remainingPosts", render: numberText },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "Active" ? "green" : v === "Expired" ? "red" : "default"}>
          {v === "Active" ? "Đang hiệu lực" : v === "Expired" ? "Hết hạn" : v || "-"}
        </Tag>
      ),
    },
    { title: "Bắt đầu", dataIndex: "startDate", key: "startDate", render: formatDateTime },
    { title: "Kết thúc", dataIndex: "endDate", key: "endDate", render: formatDateTime },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <Card
        className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg border-none"
        styles={{ body: { padding: 20 } }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <Typography.Title level={3} className="!text-white !mb-1">
              Lịch sử gói & giao dịch
            </Typography.Title>
            <Typography.Paragraph className="!text-white/80 !mb-0">
              Theo dõi gói đã mua, giao dịch thanh toán và số bài còn lại.
            </Typography.Paragraph>
          </div>
          <Space size="large" className="text-white">
            <Statistic
              title={<span className="text-white/80">Tổng đã thanh toán</span>}
              value={totalPaid}
              valueStyle={{ color: "#fff", fontSize: 20 }}
              formatter={(v) => `${Number(v).toLocaleString("vi-VN")} đ`}
            />
            <Divider type="vertical" className="!border-white/40" />
            <div className="text-right">
              <div className="text-sm text-white/80">Giao dịch</div>
              <div className="text-lg font-semibold">{paidCount} đã thanh toán</div>
              <div className="text-xs text-white/70">{pendingCount} đang chờ</div>
            </div>
            <Divider type="vertical" className="!border-white/40" />
            <div className="text-right">
              <div className="text-sm text-white/80">Gói</div>
              <div className="text-lg font-semibold">{activeSubs} đang hiệu lực</div>
              <div className="text-xs text-white/70">{expiredSubs} đã hết hạn</div>
            </div>
          </Space>
        </div>
      </Card>

      <Card className="shadow-md">
        <Tabs
          items={[
            {
              key: "txn",
              label: "Giao dịch",
              children: (
                <Table
                  rowKey={(record: TransactionItem) => record.transactionId}
                  dataSource={transactions}
                  columns={txnColumns}
                  loading={loadingTxn}
                  pagination={false}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "Chưa có giao dịch" }}
                />
              ),
            },
            {
              key: "sub",
              label: "Lịch sử gói",
              children: (
                <Table
                  rowKey={(record: SubscriptionItem) => record.subscriptionId}
                  dataSource={subscriptions}
                  columns={subColumns}
                  loading={loadingSub}
                  pagination={false}
                  scroll={{ x: 900 }}
                  locale={{ emptyText: "Chưa có gói đã mua" }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EmployerBillingHistoryPage;
