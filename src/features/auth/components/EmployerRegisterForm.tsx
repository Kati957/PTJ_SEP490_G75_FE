import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, message } from 'antd';
import {
  BankOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { registerEmployer } from '../services';
import type { RegisterEmployerPayload } from '../types';

const phoneRegex = /^0\d{9}$/;

const EmployerRegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: RegisterEmployerPayload = {
        companyName: values.companyName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail || undefined,
        address: values.address,
        companyDescription: '',
        contactPerson: '',
        email: values.email,
        password: values.password,
      };

      const res = await registerEmployer(payload);
      setSuccessMessage(
        res?.message ?? 'Gui yeu cau dang ky thanh cong. Vui long cho quan tri vien phe duyet.'
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Khong the dang ky nha tuyen dung, vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white/90 p-8 text-center shadow-xl">
        <Alert
          type="success"
          message="Gui yeu cau thanh cong!"
          description={successMessage}
          showIcon
          className="mb-6 text-left"
        />
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          Tro ve dang nhap
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-white/40 bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 p-6 shadow-xl sm:p-8">
      <h3 className="text-center text-2xl font-semibold text-slate-900 mb-6">Dang ky nha tuyen dung</h3>
      <Form layout="vertical" autoComplete="off" onFinish={handleSubmit} name="employer_register_form">
        <Form.Item
          label="Ten cong ty"
          name="companyName"
          rules={[{ required: true, message: 'Vui long nhap ten cong ty.' }]}
        >
          <Input
            size="large"
            placeholder="VD: Cong ty ABC"
            prefix={<BankOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="So dien thoai lien he"
          name="contactPhone"
          rules={[
            { required: true, message: 'Vui long nhap so dien thoai.' },
            {
              pattern: phoneRegex,
              message: 'Vui long nhap so dien thoai Viet Nam hop le (10 so bat dau bang 0).',
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
          label="Email lien he (khong bat buoc)"
          name="contactEmail"
          rules={[{ type: 'email', message: 'Email lien he khong hop le.' }]}
        >
          <Input size="large" placeholder="Email lien he" prefix={<MailOutlined className="text-slate-400" />} />
        </Form.Item>

        <Form.Item
          label="Dia chi (khong bat buoc)"
          name="address"
          rules={[{ max: 500, message: 'Dia chi toi da 500 ky tu.' }]}
        >
          <Input
            size="large"
            placeholder="So nha, duong, quan/huyen, tinh/thanh pho"
            prefix={<HomeOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Email tai khoan"
          name="email"
          rules={[
            { required: true, message: 'Vui long nhap email tai khoan.' },
            { type: 'email', message: 'Email khong hop le.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Email dang nhap"
            prefix={<MailOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Mat khau"
          name="password"
          rules={[
            { required: true, message: 'Vui long nhap mat khau.' },
            { min: 6, message: 'Mat khau phai co it nhat 6 ky tu.' },
          ]}
        >
          <Input
            size="large"
            placeholder="Mat khau"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Xac nhan mat khau"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui long xac nhan mat khau.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mat khau khong khop.'));
              },
            }),
          ]}
        >
          <Input
            size="large"
            placeholder="Nhap lai mat khau"
            type={passwordVisible ? 'text' : 'password'}
            prefix={<LockOutlined className="text-slate-400" />}
          />
        </Form.Item>

        <div className="mb-4">
          <Checkbox checked={passwordVisible} onChange={(e) => setPasswordVisible(e.target.checked)}>
            Hien thi mat khau
          </Checkbox>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" className="w-full" loading={loading}>
            Dang ky
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EmployerRegisterForm;
