import React from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../app/store';

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

const JobCategoriesSlider: React.FC = () => {
  const jobCategories = useSelector((state: RootState) => state.homepage.jobCategories);
  const sliderRef = React.useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    rows: 1,
    slidesPerRow: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4, slidesToScroll: 1 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-gray-200 rounded-3xl p-12 shadow-[0_30px_90px_rgba(15,23,42,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-slate-900">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Danh mục</p>
            <h2 className="text-3xl font-bold">Việc làm theo ngành nghề</h2>
          </div>
          <Link
            to="/viec-lam"
            className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div className="relative px-4 md:px-10">
          <Slider ref={sliderRef} {...settings} autoplay>
            {jobCategories.map((category) => (
              <div key={category.id} className="p-2">
                <div className="p-5 rounded-2xl shadow-lg bg-white text-slate-800 flex flex-col items-center justify-center h-full border border-blue-50">
                  <img
                    src={category.icon}
                    alt={`${category.name} icon`}
                    className="mx-auto mb-3 w-16 h-16 object-contain"
                  />
                  <h3 className="text-md font-semibold text-center">{category.name}</h3>
                  <p className="text-slate-500 text-sm">{category.count} việc làm</p>
                </div>
              </div>
            ))}
          </Slider>

          <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
          <NextArrow onClick={() => sliderRef.current?.slickNext()} />
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSlider;
