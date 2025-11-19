import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Carousel, Row, Col, Card, Tag, Spin, Empty } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import { LeftOutlined, RightOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { JobSeekerPostDtoOut } from '../../candidate/type';
import { jobSeekerPostService } from '../../candidate/services';

const PrevArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white !shadow-md !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-gray-100"
    style={{
      position: 'absolute',
      left: '0px',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  >
    <LeftOutlined className="!text-xl !text-gray-600" />
  </div>
);

const NextArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white !shadow-md !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-gray-100"
    style={{
      position: 'absolute',
      right: '0px',
      top: '50%',
      transform: 'translate(50%, -50%)',
    }}
  >
    <RightOutlined className="!text-xl !text-gray-600" />
  </div>
);

const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const JobCategoriesSlider: React.FC = () => {
  const [posts, setPosts] = useState<JobSeekerPostDtoOut[]>([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef<CarouselRef>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await jobSeekerPostService.getAllJobSeekerPosts();
        if (mounted && response.success) {
          setPosts(response.data || []);
        }
      } catch (error) {
        if (mounted) {
          setPosts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const postPages = useMemo(() => {
    const limitedPosts = posts.slice(0, 24);
    return chunkArray(limitedPosts, 6);
  }, [posts]);

  const carouselSettings = {
    dots: true,
    infinite: postPages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <section className="bg-white py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Bài đăng tìm việc gần đây</h2>
        <Link to="/danh-sach-bai-dang-tim-viec" className="text-blue-600 hover:underline">
          Xem tất cả &gt;
        </Link>
      </div>

      <div className="relative px-10 md:px-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : postPages.length === 0 ? (
          <Empty description="Chưa có đơn tìm việc nào" />
        ) : (
          <>
            <Carousel ref={carouselRef} {...carouselSettings} dotPosition="bottom" style={{ paddingBottom: '40px' }} autoplay>
              {postPages.map((page, idx) => (
                <div key={idx}>
                  <Row gutter={[16, 16]}>
                    {page.map((post) => (
                      <Col span={8} key={post.jobSeekerPostId}>
                        <Link to={`/xem-bai-dang-tim-viec/${post.jobSeekerPostId}`}>
                          <Card hoverable className="h-full">
                            <div className="flex justify-between items-center mb-2">
                              <Tag color="purple">Ứng viên</Tag>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.description}</p>
                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                              {post.seekerName && (
                                <div className="flex items-center gap-2">
                                  <UserOutlined />
                                  <span>{post.seekerName}</span>
                                </div>
                              )}
                              {post.preferredLocation && (
                                <div className="flex items-center gap-2">
                                  <EnvironmentOutlined />
                                  <span>{post.preferredLocation}</span>
                                </div>
                              )}
                            </div>
                            {post.categoryName && (
                              <div className="mt-4">
                                <Tag color="blue">{post.categoryName}</Tag>
                              </div>
                            )}
                          </Card>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Carousel>
            <PrevArrow onClick={() => carouselRef.current?.prev()} />
            <NextArrow onClick={() => carouselRef.current?.next()} />
          </>
        )}
      </div>
    </section>
  );
};

export default JobCategoriesSlider;

