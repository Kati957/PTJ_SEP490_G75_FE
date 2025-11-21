import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services';

const { Title, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await requestPasswordReset({ email: values.email });
      setSuccess(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <Title level={3} className="mb-2">
            Quên mật khẩu
          </Title>
          <Paragraph type="secondary">
            Nhập email tài khoản của bạn. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu vào hòm thư.
          </Paragraph>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <Paragraph>
              Đã gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra email và làm theo hướng dẫn.
            </Paragraph>
            <Link to="/login">
              <Button type="primary">Quay lại đăng nhập</Button>
            </Link>
          </div>
        ) : (
          <Form layout="vertical" onFinish={handleSubmit}>
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
                placeholder="you@example.com"
                prefix={<MailOutlined className="text-slate-400" />}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
                Gửi yêu cầu
              </Button>
            </Form.Item>

            <div className="text-center text-sm text-slate-500">
              <span>Bạn nhớ mật khẩu? </span>
              <Link to="/login" className="text-blue-600 font-semibold">
                Đăng nhập
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
