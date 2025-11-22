import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import loginImageOne from '../../../assets/ImageFormLoginJobSeeker.jpg';
import backgroundTexture from '../../../assets/Nen-anh-sang-xanh-dep-mat.jpg';
import partTimeBanner from '../../../assets/gpo-part-time-la-gi-2.jpg';
import flexibleWorkBanner from '../../../assets/03c7c9370cb14c92893e7719db10bad6.jpg';
import LoginForm from '../components/LoginForm';

const BANNER_SLIDES = [
  {
    id: 1,
    image: loginImageOne,
    label: 'Job Finder',
    tagline: 'Tạo dựng tương lai',
    title: 'Chắp cánh sự nghiệp của bạn cùng Job Finder',
    description:
      'Khám phá cơ hội phù hợp, kết nối với nhà tuyển dụng và bắt đầu hành trình mới đầy cảm hứng.',
    overlay: 'from-sky-900/20 via-sky-950/60 to-sky-950/90',
  },
  {
    id: 2,
    image: partTimeBanner,
    label: 'Job Finder',
    tagline: 'Cơ hội part-time',
    title: 'Lịch làm việc linh hoạt',
    description: 'Tìm công việc part-time phù hợp, chủ động sắp xếp thời gian và thu nhập.',
    overlay: 'from-amber-900/20 via-orange-800/60 to-rose-900/90',
  },
  {
    id: 3,
    image: flexibleWorkBanner,
    label: 'Job Finder',
    tagline: 'Nâng cấp kỹ năng',
    title: 'Học hỏi từ mọi trải nghiệm',
    description: 'Thử thách bản thân qua nhiều lĩnh vực, mở rộng mạng lưới và cách làm việc.',
    overlay: 'from-emerald-900/20 via-teal-800/60 to-slate-950/90',
  },
];


const JobSeekerAuthPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-2 py-20 font-sans sm:px-6"
      style={{
        backgroundImage: `linear-gradient(rgba(4,25,38,0.85), rgba(8,47,73,0.9)), url(${backgroundTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex w-full max-w-[1700px] flex-col overflow-hidden rounded-[36px] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_40px_140px_rgba(15,23,42,0.55)] lg:flex-row">
        <div className="relative flex-1 px-8 py-14 text-white sm:px-14 lg:flex-[5]">
          <div className="absolute inset-6 overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
            <div className="h-full w-full overflow-hidden">
              <div
                className="flex h-full transition-transform duration-[1500ms] ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {BANNER_SLIDES.map((slide) => (
                  <div key={slide.id} className="relative h-full min-w-full flex-shrink-0">
                    <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-b ${slide.overlay}`} />
                    <div className="absolute inset-0 z-10 flex flex-col px-10 py-10">
                      <div className="flex items-center justify-between text-sm uppercase tracking-[0.4em] text-white/80">
                        <p>{slide.label}</p>
                        <Link
                          to="/"
                          className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/30"
                        >
                          Trở về trang chủ
                        </Link>
                      </div>

                      <div className="mt-auto space-y-4">
                        <p className="text-xs uppercase tracking-[0.4em] text-white/70">{slide.tagline}</p>
                        <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
                          {slide.title}
                        </h1>
                        <p className="max-w-md text-base text-white/80">{slide.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 ml-1 flex items-center gap-2">
            {BANNER_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentSlide === index ? 'w-10 bg-white' : 'w-6 bg-white/40'
                }`}
                aria-label={`Chọn banner ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-white/95 px-8 py-12 sm:px-12 lg:flex-[2]">
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
              Truy cập hệ thống Job Finder
            </p>
            <h2 className="text-4xl font-bold text-slate-900">Đăng nhập hệ thống</h2>
          </div>

          <div className="mt-8 sm:mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerAuthPage;
