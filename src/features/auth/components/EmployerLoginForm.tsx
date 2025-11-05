import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../../constants/roles';
import { loginJobSeeker } from '../services';
import { setAccessToken } from '../../../services/baseService';
import { loginSuccess } from '../slice';

export const EmployerLoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await loginJobSeeker(values);
      const { accessToken, user } = response;

      //.roles = [ROLES.EMPLOYER];

      setAccessToken(accessToken);
      dispatch(loginSuccess({ user, token: accessToken }));

      message.success('Đăng nhập thành công!');
      navigate('/nha-tuyen-dung/dashboard');

    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      const errorMessage =
        error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    message.error('Vui lòng kiểm tra lại thông tin!');
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-center mb-4">
        Nhà tuyển dụng đăng nhập
      </h3>

      <Form
        name="employer_login"
        layout="vertical"
        onFinish={onLoginFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
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

          <a href="#" className="text-blue-600 hover:underline">
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

      <div className="flex justify-between text-sm">
        <span></span>
        <a href="/nha-tuyen-dung/register" className="text-blue-600 hover:underline">
          Đăng ký
        </a>
      </div>
    </div>
  );
};
