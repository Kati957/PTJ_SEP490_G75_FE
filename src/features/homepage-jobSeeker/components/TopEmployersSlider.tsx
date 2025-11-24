import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Empty, Spin } from 'antd';
import { Link } from 'react-router-dom';
import type { Employer as ListingEmployer } from '../../listEmployer-jobSeeker/types';
import type { Employer as HomepageEmployer } from '../../../types';
import { getEmployers } from '../../listEmployer-jobSeeker/services/service';
import EmployerCard from '../../listEmployer-jobSeeker/components/EmployerCard';
import { useSelector } from 'react-redux';
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

const chunkArray = <T,>(data: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};

const normalizeFallback = (items: HomepageEmployer[]): ListingEmployer[] => {
  return items.map((item, index) => ({
    id: Number(item.id) || index,
    name: item.name,
    logo: item.logo,
    jobCount: item.jobsCount ?? 0,
    locations: item.location ? [item.location] : [],
  }));
};

const TopEmployersSlider: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const fallbackEmployers = useSelector(
    (state: RootState) => state.homepage.topEmployers
  );
  const normalizedFallback = useMemo(
    () => normalizeFallback(fallbackEmployers ?? []),
    [fallbackEmployers]
  );
  const [employers, setEmployers] = useState<ListingEmployer[]>(normalizedFallback);

  useEffect(() => {
    if (employers.length === 0 && normalizedFallback.length > 0) {
      setEmployers(normalizedFallback);
    }
  }, [normalizedFallback, employers.length]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchEmployers = async () => {
      setLoading(true);
      try {
        const response = await getEmployers({ page: 1, pageSize: 12 });
        if (mounted) {
          setEmployers(response.employers);
        }
      } catch {
        if (mounted) {
          setEmployers((prev) => (prev.length ? prev : normalizedFallback));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchEmployers();
    return () => {
      mounted = false;
    };
  }, [normalizedFallback]);

  const slides = useMemo(() => chunkArray(employers, 4), [employers]);

  const settings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    adaptiveHeight: true
  };

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-gray-200 rounded-3xl p-12 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-slate-900">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Đối tác</p>
            <h2 className="text-3xl font-bold">Nhà tuyển dụng hàng đầu</h2>
          </div>
          <Link
            to="/employer"
            className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div className="relative px-4 md:px-10">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : slides.length === 0 ? (
            <Empty description="Chưa có nhà tuyển dụng nào" />
          ) : (
            <>
              <Slider ref={sliderRef} {...settings}>
                {slides.map((group, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {group.map((employer) => (
                        <Link
                          key={employer.id}
                          to={`/nha-tuyen-dung/chi-tiet/${employer.id}`}
                          className="block h-full"
                        >
                          <EmployerCard employer={employer} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </Slider>
              <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
              <NextArrow onClick={() => sliderRef.current?.slickNext()} />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopEmployersSlider;
