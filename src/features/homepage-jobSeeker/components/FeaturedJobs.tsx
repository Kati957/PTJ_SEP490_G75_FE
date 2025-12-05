import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel, Row, Col } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../app/store';
import type { Job } from '../../../types';
import JobCard from './JobCard';
import locationService, { type LocationOption } from '../../location/locationService';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const PrevArrow = ({ onClick, className, style }: ArrowProps) => (
  <div
    onClick={onClick}
    className={`${className ?? ""} custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white`}
    style={{ ...style, position: 'absolute', left: '0px', top: '50%', transform: 'translate(-50%, -50%)' }}
  >
    <LeftOutlined className="!text-xl !text-slate-700" />
  </div>
);

const NextArrow = ({ onClick, className, style }: ArrowProps) => (
  <div
    onClick={onClick}
    className={`${className ?? ""} custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white`}
    style={{ ...style, position: 'absolute', right: '0px', top: '50%', transform: 'translate(50%, -50%)' }}
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

const parseSalaryValue = (salaryText: string | undefined) => {
  if (!salaryText) return null;
  const match = salaryText.replace(/[.,]/g, '').match(/\d+/);
  if (!match) return null;
  return parseInt(match[0], 10);
};

const normalizeText = (text: string | undefined | null) =>
  (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const stripProvincePrefix = (text: string) =>
  text
    .replace(/^thanh pho\s*/g, '')
    .replace(/^tp\.?\s*/g, '')
    .replace(/^tinh\s*/g, '');

const normalizeProvinceTokens = (name: string) => {
  const normalized = normalizeText(name);
  const stripped = stripProvincePrefix(normalized);
  const baseTokens = [normalized, stripped].filter(Boolean);
  const compactTokens = baseTokens.map((t) => t.replace(/[^a-z0-9]/g, ''));
  const aliases: string[] = [];
  if (baseTokens.some((t) => t.includes('ho chi minh') || t.includes('hcm'))) {
    aliases.push('hcm', 'tphcm', 'hochiminh', 'saigon');
  }
  if (baseTokens.some((t) => t.includes('ha noi'))) {
    aliases.push('hanoi');
  }
  return Array.from(new Set([...baseTokens, ...compactTokens, ...aliases].filter(Boolean)));
};

const salaryFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'under1', label: 'Dưới 1 triệu' },
  { value: '1-3', label: '1 - 3 triệu' },
  { value: '3-5', label: '3 - 5 triệu' },
  { value: '5plus', label: 'Từ 5 triệu trở lên' },
  { value: 'negotiable', label: 'Thoả thuận' }
];

type ProvinceOption = LocationOption & { code: number };

const FeaturedJobs: React.FC = () => {
  const jobs = useSelector((state: RootState) => state.homepage.featuredJobs);
  const carouselRef = useRef<CarouselRef>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<ProvinceOption[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>('all');
  const [filterType, setFilterType] = useState<'location' | 'salary'>('location');

  const jobsPerPage = 6;

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        const allOption: ProvinceOption = { code: 0, name: 'Tất cả' };
        setProvinceOptions([allOption, ...data]);
      } catch {
        const allOption: ProvinceOption = { code: 0, name: 'Tất cả' };
        setProvinceOptions([allOption]);
      }
    };
    fetchProvinces();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: Job) => {
      const normalizedLocRaw = normalizeText(job.location ?? undefined);
      const normalizedLoc = stripProvincePrefix(normalizedLocRaw);
      const normalizedLocCompact = normalizedLoc.replace(/[^a-z0-9]/g, '');
      const selectedProvinceName = provinceOptions.find((p) => p.code === selectedProvinceId)?.name || '';
      const provinceTokens = normalizeProvinceTokens(selectedProvinceName);

      const jobProvinceId = (job as Job & { provinceId?: number | null }).provinceId;
      const matchProvinceId =
        selectedProvinceId !== null &&
        jobProvinceId !== undefined &&
        jobProvinceId !== null &&
        String(jobProvinceId) === String(selectedProvinceId);

      const matchLocation =
        selectedProvinceId === null ||
        matchProvinceId ||
        provinceTokens.some((token) => token && (normalizedLoc.includes(token) || normalizedLocCompact.includes(token)));

      if (!matchLocation) return false;

      if (selectedSalary === 'all') return true;

      const salaryValue = parseSalaryValue(job.salary ?? undefined);
      if (selectedSalary === 'negotiable') return salaryValue === null;
      if (salaryValue === null) return false;

      const salaryMillions = salaryValue / 1_000_000;

      switch (selectedSalary) {
        case 'under1':
          return salaryMillions > 0 && salaryMillions < 1;
        case '1-3':
          return salaryMillions >= 1 && salaryMillions <= 3;
        case '3-5':
          return salaryMillions > 3 && salaryMillions <= 5;
        case '5plus':
          return salaryMillions > 5;
        default:
          return true;
      }
    });
  }, [jobs, selectedProvinceId, selectedSalary, provinceOptions]);

  const limitedJobs = filteredJobs.slice(0, 24);
  const jobPages = chunkArray(limitedJobs, jobsPerPage);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const renderFilterChips = () => {
    const active = 'bg-blue-600 text-white border-blue-600 shadow-sm';
    const inactive =
      'bg-white text-slate-700 border-gray-200 hover:border-blue-500 hover:text-blue-700 shadow-sm';

    if (filterType === 'salary') {
      return salaryFilters.map((item) => (
        <button
          key={item.value}
          onClick={() => setSelectedSalary(item.value)}
          className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition cursor-pointer ${
            selectedSalary === item.value ? active : inactive
          }`}
        >
          {item.label}
        </button>
      ));
    }

    return provinceOptions.map((loc) => (
      <button
        key={loc.code ?? 'all'}
        onClick={() => setSelectedProvinceId(loc.code === null ? null : loc.code)}
        className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition cursor-pointer ${
          selectedProvinceId === loc.code ? active : inactive
        }`}
      >
        {loc.name}
      </button>
    ));
  };

  return (
    <section className="px-0 -mt-2 md:-mt-8 flex justify-center">
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-5 bg-gray-50 rounded-[2.5rem] border border-gray-200 shadow-lg"
        style={{ width: 'min(1400px, calc(100vw - 64px))' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 text-slate-900">
          <div className="space-y-1">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-blue-500">
              Việc làm
            </span>
            <h2 className="text-3xl font-bold">Việc làm gần đây</h2>
          </div>
          <Link
            to="/viec-lam"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-3 px-2 md:px-0 overflow-x-auto">
          <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-2 py-1 shadow-sm whitespace-nowrap">
            {[
              { value: 'location', label: 'Địa điểm' },
              { value: 'salary', label: 'Mức lương' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value as 'location' | 'salary')}
                className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                  filterType === option.value
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">{renderFilterChips()}</div>
        </div>

        <div className="relative px-0 md:px-2 pt-4">
          <Carousel
            ref={carouselRef}
            {...settings}
            dotPosition="bottom"
            className="pt-2"
            style={{ paddingTop: 8, paddingBottom: '30px' }}
            autoplay
          >
            {jobPages.map((page, pageIndex) => (
              <div
                key={pageIndex}
                className={pageIndex % 2 === 0 ? 'bg-gray-100 rounded-2xl p-2' : 'bg-white rounded-2xl p-2 border border-gray-100'}
              >
                <Row gutter={[20, 16]} className="pt-1">
                  {page.map((job, jobIndex) => (
                    <Col key={job.id} xs={24} sm={12} md={8} lg={8} xl={8}>
                      <JobCard job={job} tone={(jobIndex + pageIndex * jobsPerPage) % 2 === 0 ? 'white' : 'gray'} />
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
