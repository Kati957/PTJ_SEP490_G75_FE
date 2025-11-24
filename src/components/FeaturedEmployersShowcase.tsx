import React from 'react';
import { Link } from 'react-router-dom';

type EmployerShowcase = {
  id: string;
  name: string;
  category: string;
  jobsCount: number;
  logo: string;
  location: string;
  badge?: 'Pro Company' | 'Hot';
};

const employers: EmployerShowcase[] = [
  {
    id: 'fwd',
    name: 'Công ty TNHH Bảo hiểm Nhân thọ FWD Việt Nam',
    category: 'Tài chính',
    jobsCount: 2,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/FWD_Group_logo.svg',
    location: 'Hồ Chí Minh',
    badge: 'Pro Company'
  },
  {
    id: 'acb',
    name: 'Ngân hàng Á Châu - ACB',
    category: 'Ngân hàng',
    jobsCount: 5,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/ACB_bank_logo.png',
    location: 'Hà Nội'
  },
  {
    id: 'baoviet',
    name: 'Ngân hàng Bảo Việt',
    category: 'Ngân hàng',
    jobsCount: 1,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Baoviet_logo.png',
    location: 'Hà Nội'
  },
  {
    id: 'scg',
    name: 'Công ty Cổ phần Tập đoàn Xây dựng SCG',
    category: 'Xây dựng',
    jobsCount: 13,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/SCG_logo.svg',
    location: 'Hồ Chí Minh'
  },
  {
    id: 'mpe',
    name: 'Công ty TNHH Thương mại - Dịch vụ Điện lạnh MPE',
    category: 'IT',
    jobsCount: 4,
    logo: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=200&q=60',
    location: 'Đà Nẵng',
    badge: 'Hot'
  },
  {
    id: 'inox',
    name: 'Công ty TNHH Sản xuất và Thương mại INOX Việt',
    category: 'Sản xuất',
    jobsCount: 3,
    logo: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=200&q=60',
    location: 'Bình Dương'
  },
  {
    id: 'annam',
    name: 'Annam Gourmet',
    category: 'FMCG',
    jobsCount: 15,
    logo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=200&q=60',
    location: 'Hồ Chí Minh'
  },
  {
    id: 'yakult',
    name: 'Công ty TNHH Yakult Việt Nam',
    category: 'FMCG',
    jobsCount: 14,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Yakult_logo.svg',
    location: 'Toàn quốc'
  }
];

const FeaturedEmployersShowcase: React.FC = () => {
  const hero = employers[0];
  const gridItems = employers.slice(1);

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-amber-100 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700 text-white px-8 py-10">
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-200">Thương hiệu lớn tiêu biểu</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Nhà tuyển dụng nổi bật</h2>
              <p className="text-amber-100 mt-2">Hàng trăm thương hiệu đang tuyển dụng mỗi tuần</p>
            </div>
            <div>
              <button className="bg-white text-amber-800 font-semibold px-6 py-3 rounded-full shadow hover:bg-amber-50 transition">
                Pro Company
              </button>
            </div>
          </div>
        </div>

        <div className="px-10 pt-10 pb-8 flex flex-col gap-2 text-slate-900 border-b border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-amber-600 uppercase tracking-[0.2em]">
                Nhà tuyển dụng nổi bật
              </span>
              <span className="h-1 w-12 bg-amber-500" />
            </div>
            <Link
              to="/employer"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold"
            >
              Xem tất cả <span aria-hidden>→</span>
            </Link>
          </div>
          <h2 className="text-3xl font-bold">Thương hiệu lớn tiêu biểu</h2>
        </div>

        {hero && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-none bg-gradient-to-b from-amber-900 via-amber-800 to-amber-700 text-white p-8 flex flex-col justify-between shadow-xl border border-amber-900">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-none bg-white flex items-center justify-center">
                    <img src={hero.logo} alt={hero.name} className="h-12 w-12 object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-amber-100">{hero.category}</p>
                    <h3 className="text-xl font-semibold leading-snug">{hero.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-amber-100/80">Khu vực: {hero.location}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-none bg-amber-600 text-white font-semibold">
                    <span aria-hidden>💼</span> {hero.jobsCount} việc làm
                  </span>
                  {hero.badge && (
                    <span className="inline-flex items-center px-3 py-2 rounded-none bg-white/15 border border-white/20 text-white font-semibold">
                      {hero.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button className="flex-1 bg-white text-amber-900 font-semibold py-3 rounded-none shadow-md hover:bg-amber-50 transition">
                  Xem tin tuyển dụng
                </button>
                <button className="px-4 py-3 rounded-none border border-white/40 text-white hover:bg-white/10 transition">
                  + Theo dõi
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {gridItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-400 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl border border-amber-100 bg-white flex items-center justify-center">
                      <img src={item.logo} alt={item.name} className="h-10 w-10 object-contain" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-slate-500">{item.category}</p>
                      <h4 className="text-base font-semibold leading-snug">{item.name}</h4>
                      <p className="text-sm text-slate-600">Khu vực: {item.location}</p>
                    </div>
                    {item.badge && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                    <div className="inline-flex items-center gap-2 text-amber-700">
                      <span aria-hidden>💼</span> {item.jobsCount} việc làm
                    </div>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition text-xs">
                      <span aria-hidden>＋</span> Theo dõi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEmployersShowcase;
