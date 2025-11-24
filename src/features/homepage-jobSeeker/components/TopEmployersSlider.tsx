import React from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import type { Employer } from '../../../types';

const PrevArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white"
    style={{
      position: 'absolute',
      left: '0px',
      top: '50%',
      transform: 'translate(-50%, -50%)',
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
      transform: 'translate(50%, -50%)',
    }}
  >
    <RightOutlined className="!text-xl !text-slate-700" />
  </div>
);

const TopEmployersSlider: React.FC = () => {
  const topEmployers = useSelector((state: RootState) => state.homepage.topEmployers);
  const sliderRef = React.useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    rows: 1,
    slidesPerRow: 1,
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
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-gray-200 rounded-3xl p-12 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-slate-900">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Doi tac</p>
            <h2 className="text-3xl font-bold">Nha tuyen dung hang dau</h2>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm">
            Xem tat ca &gt;
          </a>
        </div>

        <div className="relative px-4 md:px-10">
          <Slider ref={sliderRef} {...settings} autoplay>
            {topEmployers.map((employer: Employer) => (
              <div key={employer.id} className="p-2">
                <div className="bg-white text-slate-800 rounded-2xl shadow-lg overflow-hidden relative h-[320px] pb-4 flex flex-col border border-blue-50">
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-sky-400 border-r-transparent z-10"></div>
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
                    <h3 className="text-xl font-bold mt-2 line-clamp-2 min-h-14">{employer.name}</h3>

                    {employer.jobDescription ? (
                      <p className="text-sky-600 text-sm mt-2 line-clamp-2 min-h-10">{employer.jobDescription}</p>
                    ) : (
                      <div className="min-h-10 mt-2" />
                    )}

                    <div className="mt-auto">
                      <p className="text-slate-600 text-sm mt-2">{employer.jobsCount} viec dang tuyen</p>
                      <div className="flex items-center justify-center text-slate-500 text-xs mt-1">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        <span className="truncate">{employer.location}</span>
                      </div>
                    </div>
                  </div>
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

export default TopEmployersSlider;
