import React, { useEffect, useState } from 'react';

const recentLightningJobs = [
  {
    title: 'Kế toán trưởng - Thu nhập 25-35 triệu/tháng - Tại Hồ Chí Minh',
    company: 'CTY TNHH TM THE C.I.U',
    location: 'Hồ Chí Minh, Phường Tân Sơn Hòa',
    tag: 'Huy hiệu Tia Sét'
  },
  {
    title: 'Sales Executive/Nhân viên kinh doanh - Làm việc tại Đà Lạt',
    company: 'CÔNG TY TNHH TRÀ NGỌC DUY',
    location: 'Lâm Đồng, Phường Lang Biang - Đà Lạt',
    tag: 'Huy hiệu Tia Sét'
  },
  {
    title: 'Cộng tác viên tư vấn tài chính - Không áp doanh số/linh hoạt giờ',
    company: 'FE CREDIT',
    location: 'Hà Nội & 35 nơi khác',
    tag: 'Huy hiệu Tia Sét'
  },
  {
    title: 'Nhân viên tư vấn tại văn phòng - Lương cứng 7tr, không áp KPI',
    company: 'CÔNG TY CỔ PHẦN BPO MẮT BÃO',
    location: 'Hồ Chí Minh & 19 nơi khác',
    tag: 'Huy hiệu Tia Sét'
  }
];

const UPDATE_CYCLE_SECONDS = 4 * 60 * 60; // 4 giờ/lần để minh họa vòng cập nhật

const stats = [
  { value: '1.240', label: 'Bài viết đã đăng' },
  { value: '86', label: 'Ứng viên mới hôm nay' },
  { value: '1.540', label: 'Ứng viên mới trong tháng' }
];

const LightningBadgeBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(UPDATE_CYCLE_SECONDS);

  useEffect(() => {
    const update = () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remaining = UPDATE_CYCLE_SECONDS - (nowSeconds % UPDATE_CYCLE_SECONDS);
      setTimeLeft(remaining);
    };

    update(); // tính ngay lần đầu
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const countdown = [
    { value: hours, label: 'Giờ' },
    { value: minutes, label: 'Phút' },
    { value: seconds, label: 'Giây' }
  ];

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto rounded-3xl overflow-hidden relative text-white shadow-[0_20px_60px_rgba(5,12,30,0.35)] border border-sky-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-900 to-sky-700" />
        <div
          className="absolute -left-10 -top-16 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.75) 0%, rgba(30,64,175,0) 60%)' }}
        />
        <div
          className="absolute -right-16 -bottom-10 h-80 w-80 rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(30,64,175,0) 60%)' }}
        />

        <div className="relative z-0 grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 lg:p-14">
          <div className="lg:col-span-6 xl:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              <span className="text-xs font-semibold tracking-[0.15em] uppercase">Cập nhật liên tục</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Huy Hiệu Tia Sét</h2>
              <p className="text-lg text-sky-50/90">
                Ghi nhận sự tương tác thường xuyên của Nhà tuyển dụng với CV ứng viên
              </p>
            </div>

            <div className="bg-white/12 border border-white/20 rounded-2xl px-6 py-4 w-fit shadow-lg backdrop-blur">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black">2.981</span>
                <span className="text-sm text-sky-50/80">
                  tin đăng được NTD tương tác thường xuyên trong 24 giờ qua
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-white/12 border border-white/20 rounded-2xl px-4 py-4 shadow-lg backdrop-blur"
                >
                  <div className="text-3xl font-black leading-none">{item.value}</div>
                  <div className="mt-2 text-sm text-sky-50/85">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.35em] uppercase text-sky-50/90">
                Tự động cập nhật sau
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                {countdown.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/15 border border-white/25 rounded-2xl px-6 py-4 text-center shadow-lg backdrop-blur"
                  >
                    <div className="text-4xl font-black leading-none">{item.value}</div>
                    <div className="mt-2 text-sm text-sky-50/80">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sky-50/80">Danh sách tin đăng đạt</p>
                <p className="text-lg font-semibold">Huy hiệu Tia Sét</p>
              </div>
              <button className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition">
                Xem ngay <span aria-hidden>→</span>
              </button>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-4 space-y-3 backdrop-blur">
              {recentLightningJobs.map((job) => (
                <div
                  key={job.title}
                  className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/15 transition"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-slate-900 shadow-inner">
                    ⚡
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-tight">{job.title}</p>
                    <p className="text-xs text-emerald-50/80 leading-snug">
                      {job.company} • {job.location}
                    </p>
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100 bg-white/10 px-2 py-1 rounded-lg border border-white/15">
                      {job.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightningBadgeBanner;
