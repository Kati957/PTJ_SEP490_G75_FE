import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Empty, Spin } from 'antd';
import { Link } from 'react-router-dom';
import type { Employer } from '../../listEmployer-jobSeeker/types';
import { getEmployers } from '../../listEmployer-jobSeeker/services/service';
import EmployerCard from '../../listEmployer-jobSeeker/components/EmployerCard';

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

const chunkArray = <T,>(data: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};

const TopEmployersSlider: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [employers, setEmployers] = useState<Employer[]>([]);
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
      } catch (error) {
        if (mounted) {
          setEmployers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployers();
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(() => chunkArray(employers, 4), [employers]);

  const settings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    adaptiveHeight: true,
  };

  return (
    <section className="py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Tên nhà tuyển dụng</h2>
        <Link to="/employer" className="text-blue-600 hover:underline">
          Xem tất cả &gt;
        </Link>
      </div>

      <div className="relative px-10 md:px-16">
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
    </section>
  );
};

export default TopEmployersSlider;
