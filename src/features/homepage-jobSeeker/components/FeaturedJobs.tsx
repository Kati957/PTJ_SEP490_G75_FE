import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel, Row, Col } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import JobCard from './JobCard';

const PrevArrow = ({ onClick }: { onClick: () => void }) => {
  return (
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
};

const NextArrow = ({ onClick }: { onClick: () => void }) => {
  return (
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
};

const chunkArray = (array: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const FeaturedJobs: React.FC = () => {
  const jobs = useSelector((state: RootState) => state.homepage.featuredJobs);
  const carouselRef = React.useRef<CarouselRef>(null);

  //Chia mảng jobs thành các trang, mỗi trang 12 jobs (3 cột * 4 hàng)
  const jobsPerPage = 12;
  const jobPages = chunkArray(jobs, jobsPerPage);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <section className="py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Việc làm gần đây</h2>
        <a href="#" className="text-blue-600 hover:underline">Xem tất cả &gt;</a>
      </div>

      <div className="relative px-10 md:px-16">
        <Carousel ref={carouselRef} {...settings} dotPosition='bottom' style={{ paddingBottom: '40px' }} autoplay>
          {jobPages.map((page, pageIndex) => (
            <div key={pageIndex}>
              <Row gutter={[16, 16]}>
                {page.map(job => (
                  <Col key={job.id} span={8}>
                    <JobCard job={job} />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
        
        <PrevArrow onClick={() => carouselRef.current?.prev()} />
        <NextArrow onClick={() => carouselRef.current?.next()} />
      </div>
    </section>
  );
};

export default FeaturedJobs;