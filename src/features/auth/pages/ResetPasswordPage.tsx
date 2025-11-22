import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { resetPassword } from '../services';

const { Title, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (values: { newPassword: string }) => {
    if (!token) {
      message.error('Thiếu token xác thực. Vui lòng kiểm tra lại liên kết.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: values.newPassword });
      setDone(true);
      message.success('Đặt lại mật khẩu thành công.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <Title level={3} className="mb-2">
            Đặt lại mật khẩu
          </Title>
          <Paragraph type="secondary">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </Paragraph>
        </div>

        {!token && (
          <Alert
            type="error"
            showIcon
            message="Thiếu token xác thực"
            description="Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu lại."
            className="mb-6"
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!token || done}
          requiredMark={false}
          name="reset_password_form"
        >
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
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu.' },
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
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
              Cập nhật mật khẩu
            </Button>
          </Form.Item>

          {done && (
            <Alert
              type="success"
              showIcon
              message="Đặt lại mật khẩu thành công"
              description="Bạn sẽ được chuyển về trang đăng nhập trong giây lát."
              className="mb-4"
            />
          )}

          <div className="text-center text-sm text-slate-500">
            <Link to="/login" className="text-blue-600 font-semibold">
              Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
