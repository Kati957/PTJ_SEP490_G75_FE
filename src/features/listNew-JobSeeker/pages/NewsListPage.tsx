import React from 'react';
import { Input, Pagination, Row, Col, Spin, Typography, Empty, Breadcrumb } from 'antd';
import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import { useNewsList } from '../hooks';
import NewsCard from '../components/NewsCardComponent';

const { Title, Text } = Typography;
const { Search } = Input;

const ButtonSearch = () => (
    <div className="flex items-center font-medium">
        <SearchOutlined className="mr-1" />
        Tìm kiếm
    </div>
);

const NewsListPage: React.FC = () => {
  const { newsList, total, loading, params, updateParams } = useNewsList();

  const onSearch = (value: string) => {
    updateParams({ keyword: value });
  };

  const onPageChange = (page: number, pageSize: number) => {
    updateParams({ page, pageSize });
  };

  const handleCardClick = (id: number) => {
    console.log('Navigate to news detail:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Hero Section / Header */}
        <div 
            className="relative bg-cover bg-center bg-no-repeat pb-16 pt-12 px-4 sm:px-6 lg:px-8"
            style={{
                backgroundImage: `url('https://placehold.co/1920x600/0a0a0a/FFFFFF?text=Career+Guide+Banner')`, // Thay bằng URL ảnh thật của bạn
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 sm:bg-transparent sm:bg-gradient-to-r sm:from-black/80 sm:to-black/20"></div>

            <div className="relative max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div className="md:w-3/4 lg:w-2/3">
                        <Title level={1} className="!mb-6 !text-white !font-bold !text-4xl md:!text-5xl lg:!text-6xl tracking-tight drop-shadow-md">
                            Tin tức liên quan
                        </Title>
                        
                        {/* CẬP NHẬT: Sử dụng thẻ h3 thay vì Paragraph */}
                        <h3 className="text-white/90 text-xl md:text-2xl lg:text-3xl font-normal max-w-4xl leading-relaxed drop-shadow-sm mt-4">
                            Khám phá kho tàng <span className="text-yellow-400 font-bold">kiến thức</span>, trang bị những <span className="text-yellow-400 font-bold">kỹ năng</span> thiết yếu và nắm bắt các <span className="text-yellow-400 font-bold">xu hướng nghề nghiệp</span> mới nhất để tự tin <span className="text-yellow-400 font-bold">phát triển sự nghiệp</span> của bạn.
                        </h3>
                    </div>
                    
                    <div className="w-full md:w-1/3 lg:w-1/4 pb-2">
                        <Search
                            placeholder="Tìm kiếm bài viết..."
                            allowClear
                            enterButton={<ButtonSearch />}
                            size="large"
                            onSearch={onSearch}
                            className="shadow-xl rounded-lg search-hero-input w-full"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {loading && newsList.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Đang tải bài viết..." />
                </div>
            ) : (
                <>
                    {newsList.length > 0 ? (
                        <Spin spinning={loading}>
                             <Row gutter={[24, 32]} className="mb-10">
                                {newsList.map((item) => (
                                    <Col xs={24} sm={12} md={8} key={item.newsID}>
                                        <NewsCard item={item} onClick={handleCardClick} />
                                    </Col>
                                ))}
                            </Row>
                            
                            <div className="flex justify-center mt-12">
                                <Pagination
                                    current={params.page}
                                    pageSize={params.pageSize}
                                    total={total}
                                    onChange={onPageChange}
                                    showSizeChanger={false}
                                    showTotal={(total) => `Tổng ${total} bài viết`}
                                    className="bg-white p-3 rounded-full shadow-md"
                                />
                            </div>
                        </Spin>
                    ) : (
                         <div className="bg-white p-16 rounded-lg shadow-sm text-center">
                            <Empty 
                                description={<Text className="text-gray-500 text-lg">Không tìm thấy bài viết nào phù hợp với từ khóa của bạn</Text>}
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        </div>
                    )}
                </>
            )}
        </div>
        
        {/* CSS cho ô tìm kiếm trong Hero section */}
        <style jsx>{`
            .search-hero-input .ant-input-group-addon .ant-btn {
                background-color: #faad14 !important;
                border-color: #faad14 !important;
                color: white !important;
                font-weight: 600;
                height: 48px;
            }
            .search-hero-input .ant-input-group-addon .ant-btn:hover {
                background-color: #d48806 !important;
                border-color: #d48806 !important;
            }
            .search-hero-input .ant-input-affix-wrapper {
                border-color: #faad14 !important;
                height: 48px;
                font-size: 16px;
            }
            .search-hero-input .ant-input-affix-wrapper:hover,
            .search-hero-input .ant-input-affix-wrapper:focus,
            .search-hero-input .ant-input-affix-wrapper-focused {
                 border-color: #faad14 !important;
                 box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2) !important;
            }
        `}</style>
    </div>
  );
};

export default NewsListPage;