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
    title: '\u1ee8ng vi\xean t\xecm vi\u1ec7c',
    description:
      'T\u1ea1o CV, l\u01b0u tin v\xe0 \u1ee9ng tuy\u1ec3n nhanh ch\xf3ng \u0111\u1ec3 kh\xf4ng b\u1ecf l\u1ee1 c\u01a1 h\u1ed9i t\u1ed1t nh\u1ea5t d\xe0nh cho b\u1ea1n.',
    highlight:
      'Ph\xf9 h\u1ee3p khi b\u1ea1n mu\u1ed1n t\xecm ki\u1ebfm c\xf4ng vi\u1ec7c ch\u1ea5t l\u01b0\u1ee3ng v\u1edbi tr\u1ea3i nghi\u1ec7m \u1ee9ng tuy\u1ec3n m\u01b0\u1ee3t m\xe0.',
    redirect: '/',
    buttonLabel: 'T\xf4i l\xe0 \u1ee9ng vi\xean t\xecm vi\u1ec7c',
    image: jobSeekerBanner,
    accent: 'bg-emerald-200 text-emerald-800',
  },
  Employer: {
    title: 'Nh\xe0 tuy\u1ec3n d\u1ee5ng',
    description:
      '\u0110\u0103ng tin, qu\u1ea3n l\xfd \u1ee9ng vi\xean v\xe0 x\xe2y d\u1ef1ng th\u01b0\u01a1ng hi\u1ec7u tuy\u1ec3n d\u1ee5ng chuy\xean nghi\u1ec7p ch\u1ec9 trong m\u1ed9t n\u01a1i.',
    highlight: 'T\u1ed1i \u01b0u quy tr\xecnh tuy\u1ec3n d\u1ee5ng c\u1ee7a doanh nghi\u1ec7p v\u1edbi n\u1ec1n t\u1ea3ng hi\u1ec7n \u0111\u1ea1i.',
    redirect: '/nha-tuyen-dung/dashboard',
    buttonLabel: 'T\xf4i l\xe0 nh\xe0 tuy\u1ec3n d\u1ee5ng',
    image: employerBanner,
    accent: 'bg-cyan-200 text-cyan-800',
  },
};

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
      message.error('Phi\xean \u0111\u0103ng nh\u1eadp Google \u0111\xe3 h\u1ebft h\u1ea1n, vui l\xf2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.');
      navigate('/login', { replace: true });
    }
  }, [onboardingData, navigate]);

  const handleRoleSelection = async (role: string) => {
    if (!onboardingData) return;
    setProcessingRole(role);
    try {
      const response = await googleComplete({ idToken: onboardingData.idToken, role });
      const { accessToken, user } = response;

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
      message.success('\u0110\u0103ng k\xfd Google th\xe0nh c\xf4ng!');

      const destination =
        ROLE_DETAILS[role]?.redirect || (role === 'Employer' ? '/nha-tuyen-dung/dashboard' : '/');
      navigate(destination, { replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Kh\xf4ng th\u1ec3 ho\xe0n t\u1ea5t \u0111\u0103ng k\xfd Google. Vui l\xf2ng th\u1eed l\u1ea1i.';
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
          <Paragraph className="text-emerald-600 font-semibold uppercase tracking-[0.3em] mb-2">Ch&#224;o b&#7841;n &#128075;</Paragraph>
          <Title level={2} className="!mb-3 text-slate-900">D&#224;nh v&#224;i gi&#226;y x&#225;c nh&#7853;n th&#244;ng tin nh&#233;!</Title>
          <Paragraph className="text-base text-gray-600 max-w-2xl mx-auto">&#272;&#7875; t&#7889;i &#432;u tr&#7843;i nghi&#7879;m v&#224; cung c&#7845;p n&#7897;i dung ph&#249; h&#7907;p nh&#7845;t, vui l&#242;ng ch&#7885;n nh&#243;m vai tr&#242; g&#7847;n nh&#7845;t v&#7899;i nhu c&#7847;u c&#7911;a b&#7841;n tr&#234;n n&#7873;n t&#7843;ng.</Paragraph>
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
                bordered={false}
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
