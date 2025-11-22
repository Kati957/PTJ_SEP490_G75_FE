import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmChangePassword } from '../services';

const { Title, Paragraph } = Typography;

const ConfirmChangePasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      message.error('Thiếu token xác nhận.');
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      await confirmChangePassword({
        token,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      message.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error: any) {
      const messageText = error?.response?.data?.message || 'Không thể đổi mật khẩu.';
      setServerError(messageText);
      message.error(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-xl shadow-2xl rounded-3xl">
        <div className="text-center mb-8 space-y-2">
          <Title level={3}>Xác nhận đổi mật khẩu</Title>
          <Paragraph type="secondary">
            Nhập mật khẩu mới để hoàn tất yêu cầu đổi mật khẩu của bạn.
          </Paragraph>
        </div>

        {!token ? (
          <Alert
            type="error"
            showIcon
            message="Liên kết không hợp lệ hoặc đã hết hạn"
            description="Vui lòng yêu cầu đổi mật khẩu lại từ trang tài khoản."
          />
        ) : (
          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới.' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.' },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp.'));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            {serverError && (
              <Alert type="error" showIcon className="mb-4" message={serverError} />
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full" size="large" loading={submitting}>
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ConfirmChangePasswordPage;
