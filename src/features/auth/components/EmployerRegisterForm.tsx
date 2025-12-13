import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, LinkOutlined, HomeOutlined } from '@ant-design/icons';
import { registerEmployer } from '../services';
import type { RegisterEmployerPayload } from '../types';
import { useNavigate } from 'react-router-dom';

const phoneRegex = /^0\d{9}$/;

type EmployerRegisterFormValues = {
  companyName: string;
  companyDescription?: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  website?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const EmployerRegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: EmployerRegisterFormValues) => {
    setLoading(true);
    try {
      const payload: RegisterEmployerPayload = {
        companyName: values.companyName,
        companyDescription: values.companyDescription,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        address: values.address,
        website: values.website,
        email: values.email,
        password: values.password,
      };
      await registerEmployer(payload);
      setSuccess(true);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      message.error(
        apiMessage || 'Không thể đăng ký nhà tuyển dụng, vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white/90 p-8 text-center shadow-xl">
        <Alert
          type="success"
          message="Gửi yêu cầu đăng ký thành công."
          description="Vui lòng chờ quản trị viên phê duyệt. Sau khi được duyệt, email xác thực sẽ được gửi tới bạn."
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
      <h3 className="text-center text-2xl font-semibold text-slate-900 mb-6">
        Đăng ký nhà tuyển dụng
      </h3>

      <Form
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
        name="employer_register_form"
      >
        <Form.Item
          label="Tên nhà tuyển dụng"
          name="companyName"
rules={[{ required: true, message: 'Vui lòng nhập tên nhà tuyển dụng.' }]}
        >
          <Input
            size="large"
            placeholder="VD: Nhà tuyển dụng Nguyen van A"
            prefix={<UserOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label="Mô tả nhà tuyển dụng." name="companyDescription">
          <Input.TextArea
            rows={3}
            maxLength={2000}
            placeholder="Giới thiệu ngắn gọn về nhà tuyển dụng"
          />
        </Form.Item>

        <Form.Item
          label="Email đăng ký"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email.' },
            { type: 'email', message: 'Email không hợp lệ.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Email sử dụng đăng nhập"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu.' },
            { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự.' },
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

        <Form.Item label="Người liên hệ" name="contactPerson">
          <Input
            size="large"
            placeholder="VD: Nguyễn Văn A"
            prefix={<UserOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại liên hệ"
          name="contactPhone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại liên hệ.' },
            {
              pattern: phoneRegex,
              message: 'Nhập số điện thoại Việt Nam hợp lệ (10 số bắt đầu bằng 0).',
            },
          ]}
        >
          <Input
size="large"
            placeholder="VD: 0912345678"
            prefix={<PhoneOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Email liên hệ"
          name="contactEmail"
          rules={[{ type: 'email', message: 'Vui lòng nhập email liên hệ hợp lệ.' }]}
        >
          <Input
            size="large"
            placeholder="contact@company.com"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input
            size="large"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            prefix={<HomeOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Website (không bắt buộc)"
          name="website"
          rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ.' }]}
        >
          <Input
            size="large"
            placeholder="https://company.vn"
            prefix={<LinkOutlined className="text-slate-400" />}
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

export default EmployerRegisterForm;