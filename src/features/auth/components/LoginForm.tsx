import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { LinkedinOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { loginJobSeeker, googlePrepare } from '../services';
import { setAccessToken } from '../../../services/baseService';
import { loginSuccess } from '../slice';
import { ROLES } from '../../../constants/roles';
import { saveGoogleOnboardingData } from '../utils/googleOnboardingStorage';
import type { User } from '../types';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSuccess = (user: User, accessToken: string, successMessage = 'Đăng nhập thành công!') => {
    const normalizedRoles =
      Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [ROLES.JOB_SEEKER];
    const normalizedUser = {
      ...user,
      roles: normalizedRoles
    };

    setAccessToken(accessToken);
    dispatch(loginSuccess({ user: normalizedUser, token: accessToken }));

    message.success(successMessage);

    if (normalizedRoles.includes(ROLES.ADMIN)) {
      navigate('/admin/dashboard');
      return;
    }

    if (normalizedRoles.includes(ROLES.EMPLOYER)) {
      navigate('/nha-tuyen-dung/dashboard');
      return;
    }

    navigate('/');
  };

  // Hàm xử lý khi submit form đăng nhập
  const onLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await loginJobSeeker(values);
      const { accessToken, user } = response;
      handleLoginSuccess(user, accessToken);
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi submit form thất bại
  const onFinishFailed = (errorInfo: any) => {
    console.log('Lỗi:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin!');
  };

  const handleGoogleResult = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      const response = await googlePrepare(idToken);

      if ('accessToken' in response) {
        const { accessToken, user } = response;
        handleLoginSuccess(user, accessToken, 'Đăng nhập Google thành công!');
        return;
      }

      if (response.needRoleSelection) {
        saveGoogleOnboardingData({
          idToken,
          email: response.email,
          name: response.name,
          picture: response.picture,
          availableRoles: response.availableRoles,
        });
        message.info('Vui lòng chọn vai trò để hoàn tất đăng ký.');
        navigate('/google/select-role');
        return;
      }

      message.error('Phản hồi không hợp lệ từ server.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Không thể kết nối Google.';
      message.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCredential = (credentialResponse: CredentialResponse): void => {
    const rawIdToken = credentialResponse.credential;
    if (!rawIdToken) {
      message.error('Google không trả về ID token. Vui lòng thử lại.');
      return;
    }
    void handleGoogleResult(rawIdToken);
  };

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Người tìm việc đăng nhập
      </h2>
      <Form
        name="jobseeker_login"
        initialValues={{ remember: true }}
        onFinish={onLoginFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
        >
          <Input size="large" placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input
            size="large"
            placeholder="Mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
          />
        </Form.Item>

        <div className="flex justify-between items-center mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hiển thị mật khẩu
          </Checkbox>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full"
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400">Hoặc</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="space-y-3">
        <div className={`flex justify-center ${googleLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="w-full max-w-xs">
            <GoogleLogin
              onSuccess={handleGoogleCredential}
              onError={() => message.error('Có lỗi xảy ra khi xử lý Google.')}
              useOneTap={false}
              theme="outline"
              shape="rectangular"
              text="continue_with"
              size="large"
            />
          </div>
        </div>
        <Button icon={<LinkedinOutlined className="text-teal-500" />} size="large" className="w-full">
          Đăng nhập với LinkedIn
        </Button>
      </div>

      <p className="text-center mt-6 text-sm">
        Chưa có tài khoản?{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Giả sử route cho trang đăng ký là '/register'
            navigate('/register');
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng ký
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
