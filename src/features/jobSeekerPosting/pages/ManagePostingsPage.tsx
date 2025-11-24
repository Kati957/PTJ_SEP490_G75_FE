import React, { useEffect, useMemo } from "react";
import {
  Button,
  Spin,
  Alert,
  Popconfirm,
  message,
  Empty,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchPostsByUserId } from "../slice/managePostSlice";
import { deletePosting, resetPostStatus } from "../slice/slice";
import { format } from "date-fns";

const ManagePostingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.jobSeekerPosting.manage
  );
  const {
    loading: isDeleting,
    success: deleteSuccess,
    error: deleteError,
  } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.delete
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchPostsByUserId(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (deleteSuccess) {
      message.success("Xóa bài đăng thành công");
      dispatch(resetPostStatus());
      if (user) {
        dispatch(fetchPostsByUserId(user.id));
      }
    }
    if (deleteError) {
      message.error(`Xóa thất bại: ${deleteError}`);
      dispatch(resetPostStatus());
    }
  }, [deleteSuccess, deleteError, dispatch, user]);

  const stats = useMemo(() => {
    const total = posts.length;
    const active = posts.filter((p) => p.status === "Active").length;
    const expired = posts.filter((p) => p.status !== "Active").length;
    return { total, active, expired };
  }, [posts]);

  const statusTag = (status: string) => {
    const isActive = status === "Active";
    return (
      <Tag color={isActive ? "green" : "red"} className="px-3 py-1 text-xs">
        {isActive ? "Đang hoạt động" : "Hết hạn"}
      </Tag>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-emerald-600 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-100">
              Quản lý bài đăng
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Hồ sơ tìm việc của bạn
            </h1>
            <p className="text-emerald-50 mt-2 max-w-2xl">
              Cập nhật, sửa và quản lý các bài đăng tìm việc của bạn trong một
              giao diện gọn gàng.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                Tổng bài đăng: <strong>{stats.total}</strong>
              </span>
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                Đang hoạt động: <strong>{stats.active}</strong>
              </span>
              <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                Hết hạn: <strong>{stats.expired}</strong>
              </span>
            </div>
          </div>
          <Link to="/tao-bai-dang-tim-viec">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-white text-emerald-600 hover:bg-emerald-50 border-none shadow-lg"
            >
              Tạo bài đăng mới
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          {loading || isDeleting ? (
            <div className="py-12 flex justify-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert message="Lỗi" description={error} type="error" showIcon />
          ) : posts.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Empty description="Chưa có bài đăng nào" />
              <Link to="/tao-bai-dang-tim-viec">
                <Button type="primary" icon={<PlusOutlined />}>
                  Tạo bài đăng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((item) => (
                <div
                  key={item.jobSeekerPostId}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition"
                >
                  <div className="flex-1 space-y-2">
                    <Link
                      to={`/xem-bai-dang-tim-viec/${item.jobSeekerPostId}`}
                      className="text-lg font-semibold text-slate-900 hover:text-emerald-600"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-slate-500">
                      Ngày tạo:{" "}
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <div className="flex items-center gap-2">
                      {statusTag(item.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/sua-bai-dang-tim-viec/${item.jobSeekerPostId}`}>
                      <Button icon={<EditOutlined />} type="default">
                        Sửa
                      </Button>
                    </Link>
                    <Popconfirm
                      title="Xóa bài đăng?"
                      description="Bạn chắc chắn muốn xóa bài đăng này?"
                      onConfirm={() =>
                        dispatch(deletePosting(item.jobSeekerPostId))
                      }
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button icon={<DeleteOutlined />} danger>
                        Xóa
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePostingsPage;
