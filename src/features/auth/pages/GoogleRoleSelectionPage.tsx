import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Avatar, Typography, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { googleComplete } from '../services';
import {
  clearGoogleOnboardingData,
  getGoogleOnboardingData,
  type GoogleOnboardingData,
} from '../utils/googleOnboardingStorage';
import { setAccessToken } from '../../../services/baseService';
import { loginSuccess } from '../slice';
import { ROLES } from '../../../constants/roles';
import employerBanner from '../../../assets/Tuyendung1.png';
import jobSeekerBanner from '../../../assets/ImageFormLoginJobSeeker.jpg';
import backgroundRoleSelection from '../../../assets/background-banner-luon-song.jpg';

const { Title, Paragraph, Text } = Typography;

type RoleDetail = {
  title: string;
  description: string;
  highlight: string;
  redirect: string;
  buttonLabel: string;
  image: string;
  accent?: string;
};

const ROLE_DETAILS: Record<string, RoleDetail> = {
  JobSeeker: {
    title: 'Ứng viên tìm việc',
    description:
      'Tạo CV, lưu tin và ứng tuyển nhanh chóng để không bỏ lỡ cơ hội tốt nhất dành cho bạn.',
    highlight:
      'Phù hợp khi bạn muốn tìm kiếm công việc chất lượng với trải nghiệm ứng tuyển mượt mà.',
    redirect: '/',
    buttonLabel: 'Tôi là ứng viên tìm việc',
    image: jobSeekerBanner,
    accent: 'bg-emerald-200 text-emerald-800',
  },
  Employer: {
    title: 'Nhà tuyển dụng',
    description:
      'Đăng tin, quản lý ứng viên và xây dựng thương hiệu tuyển dụng chuyên nghiệp chỉ trong một nơi.',
    highlight: 'Tối ưu quy trình tuyển dụng của doanh nghiệp với nền tảng hiện đại.',
    redirect: '/nha-tuyen-dung/dashboard',
    buttonLabel: 'Tôi là nhà tuyển dụng',
    image: employerBanner,
    accent: 'bg-cyan-200 text-cyan-800',
  },
};

type ApiError = { response?: { data?: { message?: string } }; message?: string };

const GoogleRoleSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processingRole, setProcessingRole] = useState<string | null>(null);

  const onboardingData = useMemo<GoogleOnboardingData | null>(() => {
    if (location.state && typeof location.state === 'object') {
      return location.state as GoogleOnboardingData;
    }
    return getGoogleOnboardingData();
  }, [location.state]);

  useEffect(() => {
    if (!onboardingData) {
      message.error('Phiên đăng nhập Google đã hết hạn, vui lòng đăng nhập lại.');
      navigate('/login', { replace: true });
    }
  }, [onboardingData, navigate]);

  const handleRoleSelection = async (role: string) => {
    if (!onboardingData) return;
    setProcessingRole(role);
    try {
      const response = await googleComplete({ idToken: onboardingData.idToken, role });

      if (response.requiresApproval) {
        clearGoogleOnboardingData();
        message.success(
          response.message ||
            'Đã gửi yêu cầu tạo tài khoản nhà tuyển dụng. Vui lòng chờ admin phê duyệt.'
        );
        navigate('/login', { replace: true });
        return;
      }

      const { accessToken, user } = response;

      if (!accessToken || !user) {
        throw new Error('Không nhận được token sau khi đăng nhập Google.');
      }

      const normalizedRoles =
        Array.isArray(user.roles) && user.roles.length > 0
          ? user.roles
          : [role === 'Employer' ? ROLES.EMPLOYER : ROLES.JOB_SEEKER];
      const normalizedUser = {
        ...user,
        roles: normalizedRoles,
      };

      setAccessToken(accessToken);
      dispatch(loginSuccess({ user: normalizedUser, token: accessToken }));
      clearGoogleOnboardingData();
      message.success('Đăng ký Google thành công!');

      const destination =
        ROLE_DETAILS[role]?.redirect || (role === 'Employer' ? '/nha-tuyen-dung/dashboard' : '/');
      navigate(destination, { replace: true });
    } catch (error: unknown) {
      const errObj = error as ApiError;
      const errorMessage =
        errObj?.response?.data?.message ||
        errObj?.message ||
        'Không thể hoàn tất đăng ký Google. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setProcessingRole(null);
    }
  };

  if (!onboardingData) {
    return null;
  }

  const roles = onboardingData.availableRoles?.length
    ? onboardingData.availableRoles
    : ['JobSeeker', 'Employer'];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(3, 73, 82, 0.72), rgba(3, 73, 82, 0.72)), url(${backgroundRoleSelection})`,
      }}
    >
      <div className="w-full max-w-5xl bg-white/90 border border-white/40 rounded-3xl shadow-[0_25px_70px_rgba(15,23,42,0.25)] backdrop-blur-xl p-6 md:p-10">
        <div className="text-center mb-10 text-emerald-900">
          <Paragraph className="text-emerald-600 font-semibold uppercase tracking-[0.3em] mb-2">Chào bạn 👋</Paragraph>
          <Title level={2} className="!mb-3 text-slate-900">Dành vài giây xác nhận thông tin nhé!</Title>
          <Paragraph className="text-base text-gray-600 max-w-2xl mx-auto">Để tối ưu trải nghiệm và cung cấp nội dung phù hợp nhất, vui lòng chọn nhóm vai trò gần nhất với nhu cầu của bạn trên nền tảng.</Paragraph>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 shadow mt-5">
            <Avatar size={40} src={onboardingData.picture}>
              {onboardingData.name?.[0] ?? onboardingData.email[0]}
            </Avatar>
            <div className="text-left">
              <Text strong>{onboardingData.name || onboardingData.email}</Text>
              <div className="text-xs text-gray-500">{onboardingData.email}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {roles.map((role) => {
            const info = ROLE_DETAILS[role] ?? ROLE_DETAILS.JobSeeker;
            const accentBadge = info.accent ?? 'bg-gray-100 text-gray-600';
            return (
              <Card
                key={role}
                variant="outlined"
                className="h-full rounded-3xl shadow-2xl border border-white/60 bg-white/90 backdrop-blur hover:-translate-y-1 transition"
                cover={
                  <div className="px-6 pt-6">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${accentBadge}`}
                    >
                      {info.title}
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col h-full text-center items-center px-4 pb-4">
                  <img
                    src={info.image}
                    alt={info.title}
                    className="w-40 h-40 object-cover rounded-full border-4 border-white shadow mb-4"
                  />
                  <Title level={4} className="!mb-2 text-slate-900">
                    {info.title}
                  </Title>
                  <Paragraph className="text-gray-600">{info.description}</Paragraph>
                  <Text className="text-sm text-slate-500">{info.highlight}</Text>
                  <Button
                    type="default"
                    size="large"
                    className="w-full mt-6 h-11 font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none shadow-lg hover:from-emerald-600 hover:to-teal-600"
                    loading={processingRole === role}
                    onClick={() => handleRoleSelection(role)}
                  >
                    {info.buttonLabel}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoogleRoleSelectionPage;
