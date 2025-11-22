import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { registerJobSeeker } from '../services';
import type { RegisterJobSeekerPayload } from '../types';
import { useNavigate } from 'react-router-dom';

const JobSeekerRegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: RegisterJobSeekerPayload = {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      };
      await registerJobSeeker(payload);
      setSuccess(true);
    } catch (error: any) {
      message.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center shadow-xl">
        <Alert
          type="success"
          message="Đăng ký thành công!"
          description="Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập."
          showIcon
          className="mb-6 text-left"
        />
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          Trở về đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-white/40 bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 p-6 shadow-xl sm:p-8">
      <h3 className="text-center text-2xl font-semibold text-slate-900 mb-6">Đăng ký ứng viên</h3>
      <Form
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        initialValues={{}}
        name="jobseeker_register_form"
      >
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên.' }]}
        >
          <Input
            size="large"
            placeholder="Họ và tên"
            prefix={<UserOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email.' },
            { type: 'email', message: 'Email không hợp lệ.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Email"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu.' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp.'));
              },
            }),
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập lại mật khẩu"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <div className="mb-4">
          <Checkbox
            checked={passwordVisible}
            onChange={(e) => setPasswordVisible(e.target.checked)}
          >
            Hiển thị mật khẩu
          </Checkbox>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full"
            loading={loading}
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default JobSeekerRegisterForm;
