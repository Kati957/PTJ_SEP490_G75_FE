import React from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import type { Employer } from '../../../types'; // Import Employer interface

// Reusing the arrow components from FeaturedJobs.tsx
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

const TopEmployersSlider: React.FC = () => {
  const topEmployers = useSelector((state: RootState) => state.homepage.topEmployers);
  const sliderRef = React.useRef<Slider>(null); // Thêm ref cho Slider

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Display 4 employers at once
    slidesToScroll: 4,
    rows: 1,
    slidesPerRow: 1,
    prevArrow: <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />,
    nextArrow: <NextArrow onClick={() => sliderRef.current?.slickNext()} />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Nhà tuyển dụng hàng đầu
        </h2>
        <a href="#" className="text-blue-600 hover:underline">
          Xem tất cả &gt;
        </a>
      </div>
      <div className="relative px-10 md:px-16">
        <Slider ref={sliderRef} {...settings} autoplay>
          {topEmployers.map((employer: Employer) => (
            <div key={employer.id} className="p-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative h-[320px] pb-4 flex flex-col">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-orange-500 border-r-transparent z-10"></div>
                <div
                  className="w-full h-24 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${employer.backgroundImage})`,
                  }}
                ></div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center p-1">
                  <img
                    src={employer.logo}
                    alt={`${employer.name} Logo`}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div className="pt-16 text-center px-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-xl font-bold text-gray-800 mt-2 line-clamp-2 min-h-14">
                    {employer.name}
                  </h3>

                  {employer.jobDescription ? (
                    <p className="text-blue-600 text-sm mt-2 line-clamp-2 min-h-10">
                      {employer.jobDescription}
                    </p>
                  ) : (
                    <div className="min-h-10 mt-2" />
                  )}

                  <div className="mt-auto">
                    {" "}
                    <p className="text-gray-600 text-sm mt-2">
                      {employer.jobsCount} việc đang tuyển
                    </p>
                    <div className="flex items-center justify-center text-gray-500 text-xs mt-1">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      <span className="truncate">{employer.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TopEmployersSlider;