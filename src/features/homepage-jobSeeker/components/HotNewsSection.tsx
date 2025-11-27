import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Empty, Skeleton, Tag } from "antd";
import { ArrowRightOutlined, FireOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchHotNews } from "../hotNewsSlice";
import type { NewsItem } from "../../listNew-JobSeeker/types";

const fallbackImage = "https://placehold.co/600x360?text=Tin+tuc";

const HotNewsCard: React.FC<{ item: NewsItem; onClick: (id: number) => void }> = ({
  item,
  onClick,
}) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = fallbackImage;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.newsID)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(item.newsID);
        }
      }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={item.imageUrl || fallbackImage}
          alt={item.title}
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 shadow">
            <FireOutlined /> Hot
          </span>
          {item.category && (
            <Tag color="geekblue" className="m-0 rounded-full px-3 py-1 text-xs font-semibold">
              {item.category}
            </Tag>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 px-5 pb-5 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {dayjs(item.createdAt).format("DD/MM/YYYY")}
        </div>
        <h3
          className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2"
          title={item.title}
        >
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 flex-1">{item.content}</p>
        <div className="flex items-center justify-between pt-2 text-sm font-semibold text-sky-600">
          <span>Đọc ngay</span>
          <ArrowRightOutlined />
        </div>
      </div>
    </div>
  );
};

const HotNewsSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.hotNews);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchHotNews());
    }
  }, [dispatch, items.length]);

  const handleNavigate = (id: number) => {
    navigate(`/newsDetail/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderContent = () => {
    if (loading && !items.length) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow">
              <Skeleton.Image active className="!h-40 !w-full !rounded-2xl" />
              <Skeleton active title className="mt-4" paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      );
    }

    if (!loading && items.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16">
          <Empty
            description="Chưa có tin tức nổi bật"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="text-slate-500"
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <HotNewsCard key={item.newsID} item={item} onClick={handleNavigate} />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 px-4 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
              Tin tức nóng
            </p>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Tin tức tuyển dụng nổi bật trong tuần
            </h2>
            {error && (
              <p className="mt-1 text-sm text-rose-500">
                {error}. Vui lòng thử lại sau ít phút.
              </p>
            )}
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 font-semibold text-sky-600 transition hover:text-sky-700"
          >
            Xem tất cả tin tức <ArrowRightOutlined />
          </Link>
        </div>
        {renderContent()}
      </div>
    </section>
  );
};

export default HotNewsSection;
