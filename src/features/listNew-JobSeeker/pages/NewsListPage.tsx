import React, { useMemo } from "react";
import {
  Input,
  Pagination,
  Row,
  Col,
  Spin,
  Typography,
  Empty,
  Tag,
  Button,
} from "antd";
import { FireOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNewsList } from "../hooks";
import NewsCard from "../components/NewsCardComponent";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const ButtonSearch = () => (
  <div className="flex items-center font-semibold">
    <SearchOutlined className="mr-2" />
    Tìm kiếm
  </div>
);

const NewsListPage: React.FC = () => {
  const { newsList, total, loading, params, updateParams } = useNewsList();

  const categories = useMemo(() => {
    const set = new Set<string>();
    newsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).slice(0, 6);
  }, [newsList]);

  const onSearch = (value: string) => {
    updateParams({ keyword: value, page: 1 });
  };

  const onPageChange = (page: number, pageSize: number) => {
    updateParams({ page, pageSize });
  };

  const handleCategory = (category?: string) => {
    updateParams({ category, page: 1 });
  };

  const goFirstPage = () => updateParams({ page: 1 });

  const heroBackground =
    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.09), transparent 26%), linear-gradient(120deg, #0f172a 0%, #1e293b 35%, #111827 100%)";

  return (
    <div className="min-h-screen bg-slate-50">
      <section
        className="relative overflow-hidden pb-20 pt-14 text-white"
        style={{ backgroundImage: heroBackground }}
      >
        <div className="absolute inset-0 opacity-70" />
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/25 via-cyan-400/15 to-transparent blur-3xl" />
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/10 to-transparent blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="md:w-2/3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100 ring-1 ring-white/15">
                <FireOutlined /> Tin nóng mỗi ngày
              </span>
              <Title className="!mt-5 !mb-3 !text-4xl !font-black leading-tight sm:!text-5xl lg:!text-6xl !text-white drop-shadow-sm">
                Cẩm nang nghề nghiệp & góc nhìn thị trường
              </Title>
              <Paragraph className="!mb-0 max-w-3xl text-lg text-slate-200">
                Cập nhật tin tức tuyển dụng, xu hướng ngành nghề và lời khuyên phát triển sự nghiệp
                được tuyển chọn bởi đội ngũ chuyên gia.
              </Paragraph>
              <div className="mt-6 flex flex-wrap gap-3">
                <Tag color="cyan" className="rounded-full px-4 py-2 text-sm">
                  {total} bài viết
                </Tag>
                <Tag color="geekblue" className="rounded-full px-4 py-2 text-sm">
                  Cập nhật mỗi ngày
                </Tag>
                <Tag color="gold" className="rounded-full px-4 py-2 text-sm">
                  Phân tích thị trường
                </Tag>
              </div>
            </div>

            <div className="w-full md:w-[360px]">
              <Search
                placeholder="Tìm kiếm bài viết, chủ đề..."
                allowClear
                enterButton={<ButtonSearch />}
                size="large"
                onSearch={onSearch}
                defaultValue={params.keyword}
                className="shadow-xl rounded-2xl search-hero-input"
              />
              <div className="mt-3 text-sm text-slate-200">
                Gợi ý: lộ trình nghề nghiệp, kỹ năng phỏng vấn, kinh nghiệm tìm việc
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
              Chủ đề nổi bật
            </span>
            <Button
              type={!params.category ? "primary" : "default"}
              size="small"
              className="!rounded-full !px-4"
              onClick={() => handleCategory(undefined)}
            >
              Tất cả
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                size="small"
                className="!rounded-full !px-4"
                type={params.category === category ? "primary" : "default"}
                onClick={() => handleCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <main className="relative pb-16 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow-xl ring-1 ring-slate-100">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tất cả bài viết</p>
                <Title level={3} className="!mb-1">
                  Thư viện tin tức tuyển dụng
                </Title>
                <p className="text-slate-500">Mọi bài viết được hiển thị chung trong một khung để dễ duyệt.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Tag color="purple" className="m-0 rounded-full px-3 py-2">
                  Trang {params.page || 1}
                </Tag>
                <Tag color="green" className="m-0 rounded-full px-3 py-2">
                  Tổng {total} bài viết
                </Tag>
                {(params.page || 1) > 1 && (
                  <Button icon={<ReloadOutlined />} onClick={goFirstPage}>
                    Về trang 1
                  </Button>
                )}
              </div>
            </div>

            {loading && newsList.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Spin size="large" tip="Đang tải bài viết..." />
              </div>
            ) : newsList.length > 0 ? (
              <>
                <Spin spinning={loading}>
                  <Row gutter={[24, 32]} className="mb-10">
                    {newsList.map((item) => (
                      <Col xs={24} sm={12} md={8} key={item.newsID}>
                        <NewsCard item={item} />
                      </Col>
                    ))}
                  </Row>
                </Spin>

                <div className="mt-4 flex justify-center">
                  <Pagination
                    current={params.page || 1}
                    pageSize={params.pageSize}
                    total={total}
                    onChange={onPageChange}
                    showSizeChanger={false}
                    showTotal={(value) => `Tổng ${value} bài viết`}
                    className="rounded-full bg-white px-5 py-3 shadow-md"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 py-16 text-center">
                <Empty
                  description={
                    <Text className="text-gray-600 text-lg">
                      Không tìm thấy bài viết nào phù hợp với từ khóa của bạn
                    </Text>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .search-hero-input .ant-input-group-addon .ant-btn {
          background: linear-gradient(120deg, #22c55e, #0ea5e9);
          border: none;
          color: white;
          font-weight: 700;
          height: 48px;
          padding-inline: 18px;
          box-shadow: 0 10px 30px rgba(14, 165, 233, 0.35);
        }
        .search-hero-input .ant-input-group-addon .ant-btn:hover {
          filter: brightness(1.05);
        }
        .search-hero-input .ant-input-affix-wrapper {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          height: 52px;
          font-size: 16px;
        }
        .search-hero-input .ant-input {
          background: transparent;
          color: white;
        }
        .search-hero-input .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        .search-hero-input .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.4);
        }
      `}</style>
    </div>
  );
};

export default NewsListPage;
