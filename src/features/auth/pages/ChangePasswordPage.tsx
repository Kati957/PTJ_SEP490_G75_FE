import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { requestChangePassword } from '../services';
import type { RequestChangePasswordPayload } from '../types';

const { Title, Paragraph } = Typography;

const ChangePasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: RequestChangePasswordPayload) => {
    setLoading(true);
    setSuccess(false);
    try {
      await requestChangePassword(values);
      message.success('Đã gửi email xác nhận đổi mật khẩu.');
      setSuccess(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-xl shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <Title level={3} className="mb-2">
            Đổi mật khẩu
          </Title>
          <Paragraph type="secondary">
            Nhập mật khẩu hiện tại để yêu cầu liên kết xác nhận đổi mật khẩu gửi về email của bạn.
          </Paragraph>
        </div>

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off" requiredMark={false}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại.' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
              Gửi yêu cầu
            </Button>
          </Form.Item>

          {success && (
            <Alert
              type="info"
              showIcon
              message="Vui lòng kiểm tra email"
              description="Một liên kết xác nhận đổi mật khẩu đã được gửi đến email của bạn. Liên kết có hiệu lực trong 30 phút."
            />
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
