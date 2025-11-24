import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { NewsItem } from '../types';

const { Title, Paragraph } = Typography;

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const navigate = useNavigate();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
  };

  const handleClick = () => {
    navigate(`/newsDetail/${item.newsID}`);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      className="h-full flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg group"
      bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
      cover={
        <div className="h-48 overflow-hidden relative">
          <img
            alt={item.title}
            src={item.imageUrl || 'https://placehold.co/600x400?text=News'}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {item.category && (
            <Tag color="blue" className="absolute top-3 left-3 m-0 font-semibold shadow-sm z-10">
              {item.category}
            </Tag>
          )}
        </div>
      }
    >
      <div className="flex-1">
        <Title 
          level={4} 
          className="!mb-2 !text-base sm:!text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors"
          title={item.title}
        >
          {item.title}
        </Title>
        
        <div className="mb-3 text-xs text-gray-400 flex items-center">
           <ClockCircleOutlined className="mr-1" />
           {dayjs(item.createdAt).format('DD/MM/YYYY')}
        </div>

        <Paragraph 
          className="text-gray-600 !mb-0 text-sm text-justify"
          ellipsis={{ rows: 3, expandable: false, symbol: '...' }}
        >
          {item.content}
        </Paragraph>
      </div>
      
    </Card>
  );
};

export default NewsCard;