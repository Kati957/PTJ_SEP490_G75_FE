import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Row, 
  Col, 
  Spin, 
  Card, 
  Tag, 
  Divider,
  Empty
} from 'antd';
import { 
  ClockCircleOutlined, 
  ReadOutlined, 
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useNewsDetail } from '../hooks';
// Import Hooks từ feature ListView để lấy danh sách tin Hot
import { useNewsList } from '../../listNew-JobSeeker/hooks';
import type { NewsItem } from '../../listNew-JobSeeker/types';

const { Title, Paragraph } = Typography;

// Component hiển thị thẻ tin gợi ý
const HotNewsItem: React.FC<{ item: NewsItem; onClick: (id: number) => void }> = ({ item, onClick }) => (
  <div 
    className="group cursor-pointer mb-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100"
    onClick={() => onClick(item.newsID)}
  >
    <div className="flex gap-3">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
        <img 
          src={item.imageUrl || 'https://placehold.co/100x100?text=News'} 
          alt={item.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {item.title}
        </h4>
        <div className="text-xs text-gray-400 flex items-center mt-1">
          <ClockCircleOutlined className="mr-1 text-[10px]" />
          {dayjs(item.createdAt).format('DD/MM/YYYY')}
        </div>
      </div>
    </div>
  </div>
);

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsId = Number(id);

  const { newsDetail, loading: loadingDetail } = useNewsDetail(newsId);
  // Sử dụng hook từ listView để lấy danh sách tin tức làm tin gợi ý
  const { newsList, loading: loadingList } = useNewsList(); 

  const otherNews = newsList
    .filter(item => item.newsID !== newsId)
    .slice(0, 5); 

  const handleHotNewsClick = (clickedId: number) => {
    navigate(`/newsDetail/${clickedId}`);
    window.scrollTo(0, 0);
  };

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ");

  const renderContent = (content: string) => {
    return stripHtml(content)
      .split(/\r\n|\n/)
      .map((paragraph, index) => {
        if (!paragraph.trim()) return null;
        return (
          <Paragraph key={index} className="text-gray-700 text-base leading-relaxed mb-4 text-justify">
            {paragraph}
          </Paragraph>
        );
      });
  };

  if (loadingDetail) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Spin size="large" tip="Đang tải nội dung..." />
      </div>
    );
  }

  if (!newsDetail) {
    return <div className="text-center mt-20">Không tìm thấy bài viết.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Row gutter={[32, 32]}>
          
          {/* --- LEFT SIDEBAR (Tin khác) --- */}
          <Col xs={24} lg={7} className="order-2 lg:order-1">
            <div className="bg-white p-5 rounded-xl shadow-sm sticky top-6 border border-gray-100">
                <div className="flex items-center mb-6 border-b-2 border-blue-100 pb-2">
                    <ReadOutlined className="text-blue-600 text-xl mr-2" />
                    <Title level={4} className="!mb-0 text-gray-800">Tin khác</Title>
                </div>
                
                <Spin spinning={loadingList}>
                    {otherNews.length > 0 ? (
                        otherNews.map(news => (
                            <HotNewsItem 
                                key={news.newsID} 
                                item={news} 
                                onClick={handleHotNewsClick} 
                            />
                        ))
                    ) : (
                        <Empty description="Không có tin khác" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <a onClick={() => navigate('/news')} className="text-indigo-600 font-medium hover:underline cursor-pointer">
                        Xem tất cả tin tức →
                    </a>
                </div>
            </div>
          </Col>

          {/* --- RIGHT CONTENT --- */}
          <Col xs={24} lg={17} className="order-1 lg:order-2">
             <Card className="shadow-sm rounded-xl overflow-hidden border-none">
                {/* Detail Header */}
                <div className="mb-6">
                     {newsDetail.category && (
                        <Tag color="geekblue" className="mb-3 text-sm py-1 px-3 rounded-full font-semibold">
                            {newsDetail.category.toUpperCase()}
                        </Tag>
                    )}
                    <Title level={1} className="!text-3xl md:!text-4xl !font-bold text-gray-900 leading-tight mb-4">
                        {newsDetail.title}
                    </Title>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-6">
                        <div className="flex items-center">
                             <UserOutlined className="mr-2" />
                             <span>Admin</span>
                        </div>
                        <div className="flex items-center">
                             <ClockCircleOutlined className="mr-2" />
                             <span>{dayjs(newsDetail.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="mb-8 rounded-lg overflow-hidden shadow-md">
                    <img 
                        src={newsDetail.imageUrl} 
                        alt={newsDetail.title} 
                        className="w-full h-auto object-cover max-h-[500px]"
                        onError={(e) => e.currentTarget.src = 'https://placehold.co/800x400?text=No+Image'}
                    />
                    <div className="bg-gray-50 p-2 text-center text-gray-400 text-xs italic">
                        {newsDetail.title}
                    </div>
                </div>

                {/* Main Content */}
                <div className="news-content text-gray-800 leading-relaxed">
                    {renderContent(newsDetail.content)}
                </div>

                <Divider />
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Title level={4} className="!mb-0">Bình luận</Title>
                    <Tag color="blue">Đang cập nhật</Tag>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    Tính năng bình luận sẽ sớm được bổ sung.
                  </div>
                </div>
             </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default NewsDetailPage;
