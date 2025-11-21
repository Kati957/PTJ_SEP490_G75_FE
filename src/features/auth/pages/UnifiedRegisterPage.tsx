import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import backgroundTexture from '../../../assets/Nen-anh-sang-xanh-dep-mat.jpg';
import JobSeekerRegisterForm from '../components/JobSeekerRegisterForm';
import EmployerRegisterForm from '../components/EmployerRegisterForm';

type RegisterRole = 'jobseeker' | 'employer';

interface UnifiedRegisterPageProps {
  defaultRole?: RegisterRole;
}

const ROLE_CARDS: Array<{
  id: RegisterRole;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    id: 'jobseeker',
    title: 'Người tìm việc',
    description: 'Tạo hồ sơ, lưu việc làm yêu thích và ứng tuyển nhanh chóng.',
    badge: 'Ứng viên',
  },
  {
    id: 'employer',
    title: 'Nhà tuyển dụng',
    description: 'Đăng tin tuyển dụng, quản lý ứng viên và kết nối nhân tài phù hợp.',
    badge: 'Doanh nghiệp',
  },
];

const isRole = (value: string | null): value is RegisterRole =>
  value === 'jobseeker' || value === 'employer';

const UnifiedRegisterPage: React.FC<UnifiedRegisterPageProps> = ({ defaultRole }) => {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');
  const normalizedQueryRole = isRole(queryRole) ? queryRole : undefined;

  const initialRole = normalizedQueryRole ?? defaultRole ?? 'jobseeker';
  const [selectedRole, setSelectedRole] = useState<RegisterRole | null>(initialRole);

  useEffect(() => {
    if (normalizedQueryRole && normalizedQueryRole !== selectedRole) {
      setSelectedRole(normalizedQueryRole);
    }
  }, [normalizedQueryRole, selectedRole]);

const SelectedForm = useMemo(() => {
    if (selectedRole === 'jobseeker') {
      return <JobSeekerRegisterForm />;
    }
    if (selectedRole === 'employer') {
      return <EmployerRegisterForm />;
    }
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-3xl border border-white/30 bg-white/70 p-8 text-center shadow-xl">
        <p className="text-lg text-slate-600">
          Vui lòng chọn loại tài khoản để hiển thị biểu mẫu đăng ký tương ứng.
        </p>
      </div>
    );
  }, [selectedRole]);

  return (
    <div
      className="min-h-screen px-4 py-12 sm:px-6 lg:px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(6,17,38,0.92), rgba(13,44,71,0.94)), url(${backgroundTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 lg:flex-row">
        <section className="flex-1 rounded-[32px] border border-white/15 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl min-h-[700px] max-h-[700px] flex flex-col overflow-hidden">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.35em] text-blue-100 uppercase">
              Tạo tài khoản PTJ
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Chọn vai trò phù hợp để bắt đầu hành trình của bạn
            </h1>
            <p className="text-white/80">
              PTJ hỗ trợ cả nhà tuyển dụng lẫn ứng viên. Một tài khoản, nhiều lợi ích và được bảo
              vệ bằng bước xác minh email an toàn.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {ROLE_CARDS.map((card) => {
              const isActive = selectedRole === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedRole(card.id)}
                  className={`rounded-3xl border p-5 text-left transition-all ${
                    isActive
                      ? 'border-white/60 bg-white/15 shadow-2xl'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/40 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
                      {card.badge}
                    </span>
                    {isActive && (
                      <span className="text-xs font-semibold text-emerald-200">Đang chọn</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{card.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-sm text-white/80">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-white">
              Đăng nhập
            </Link>
          </div>
        </section>

        <section className="flex-1 rounded-[32px] border border-white/40 bg-white/95 p-6 shadow-2xl">
          {SelectedForm}
        </section>
      </div>
    </div>
  );
};

export default UnifiedRegisterPage;
