import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel, Row, Col } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../app/store';
import JobCard from './JobCard';

const PrevArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white"
    style={{
      position: 'absolute',
      left: '0px',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}
  >
    <LeftOutlined className="!text-xl !text-slate-700" />
  </div>
);

const NextArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white"
    style={{
      position: 'absolute',
      right: '0px',
      top: '50%',
      transform: 'translate(50%, -50%)'
    }}
  >
    <RightOutlined className="!text-xl !text-slate-700" />
  </div>
);

const chunkArray = <T,>(array: T[], chunkSize: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const FeaturedJobs: React.FC = () => {
  const jobs = useSelector((state: RootState) => state.homepage.featuredJobs);
  const carouselRef = React.useRef<CarouselRef>(null);

  const jobsPerPage = 6; // show 6 cards (2 rows x 3 columns) per slide
  const limitedJobs = jobs.slice(0, 24);
  const jobPages = chunkArray(limitedJobs, jobsPerPage);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-gray-200 rounded-3xl p-12 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-slate-900">
          <div>
            <h2 className="text-3xl font-bold">Việc làm gần đây</h2>
          </div>
          <Link
            to="/viec-lam"
            className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div className="relative px-4 md:px-10">
          <Carousel
            ref={carouselRef}
            {...settings}
            dotPosition="bottom"
            style={{ paddingBottom: '40px' }}
            autoplay
          >
            {jobPages.map((page, pageIndex) => (
              <div key={pageIndex}>
                <Row gutter={[16, 16]}>
                  {page.map((job) => (
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
      </div>
    </section>
  );
};

export default FeaturedJobs;
