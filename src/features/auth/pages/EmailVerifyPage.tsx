import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services';

const EmailVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/verify-failed?error=Thiếu%20token%20xác%20thực', { replace: true });
      return;
    }

    const handleVerify = async () => {
      try {
        await verifyEmail(token);
        navigate('/verify-success', { replace: true });
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Không thể xác thực email. Vui lòng thử lại.';
        navigate(`/verify-failed?error=${encodeURIComponent(message)}`, { replace: true });
      }
    };

    void handleVerify();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-md">
        <Spin size="large" />
        <p className="text-slate-600">Đang xác thực email của bạn...</p>
      </div>
    </div>
  );
};

export default EmailVerifyPage;
