import React, { useState } from 'react';
import { Button, Input, Checkbox, Form, message } from 'antd';
import { GoogleOutlined, LinkedinOutlined } from '@ant-design/icons';
import loginImage from '../../../assets/ImageFormLoginJobSeeker.jpg';

const JobSeekerAuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // false = login, true = register

  // Hàm xử lý khi submit form đăng nhập
  const onLoginFinish = (values: any) => {
    setLoading(true);
    console.log('Đăng nhập với thông tin:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng nhập thành công!');
    }, 1500);
  };

  // Hàm xử lý khi submit form đăng ký
  const onRegisterFinish = (values: any) => {
    setLoading(true);
    console.log('Đăng ký với thông tin:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('Đăng ký thành công!');
    }, 1500);
  };

  // Hàm xử lý khi submit form thất bại
  const onFinishFailed = (errorInfo: any) => {
    console.log('Lỗi:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin!');
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Phần bên trái */}
      <div className="w-1/2 bg-white hidden lg:flex flex-col justify-center items-center p-20 relative">
        <img src={loginImage} alt="Decorative" className="w-full object-cover mb-8 rounded-lg" />
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Xây dựng <span className="text-blue-600">Sự nghiệp</span>
          </h1>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <span className="text-blue-600">thành công</span> cùng
          </h1>
          <h1 className="text-4xl font-bold text-gray-800">
            Job Finder
          </h1>
        </div>
      </div>

      {/* Phần bên phải (Form với flip animation) */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md" style={{ perspective: '1000px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Form Đăng nhập */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: isFlipped ? 'absolute' : 'relative',
                width: '100%',
                top: 0,
                left: 0,
              }}
            >
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
                  <Button icon={<GoogleOutlined className="text-red-500" />} size="large" className="w-full">
                    Đăng nhập với Google
                  </Button>
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
                      setIsFlipped(true);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Đăng ký
                  </a>
                </p>
              </div>
            </div>

            {/* Form Đăng ký */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: isFlipped ? 'relative' : 'absolute',
                width: '100%',
                top: 0,
                left: 0,
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-full bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Đăng ký tài khoản
                </h2>
                <Form
                  name="jobseeker_register"
                  onFinish={onRegisterFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  layout="vertical"
                >
                  <Form.Item
                    name="fullname"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input size="large" placeholder="Họ và tên" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                  >
                    <Input size="large" placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu!' },
                      { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Mật khẩu"
                      type={passwordVisible ? 'text' : 'password'}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Xác nhận mật khẩu"
                      type={passwordVisible ? 'text' : 'password'}
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

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400">Hoặc</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="space-y-3">
                  <Button icon={<GoogleOutlined className="text-red-500" />} size="large" className="w-full">
                    Đăng ký với Google
                  </Button>
                  <Button icon={<LinkedinOutlined className="text-teal-500" />} size="large" className="w-full">
                    Đăng ký với LinkedIn
                  </Button>
                </div>

                <p className="text-center mt-6 text-sm">
                  Đã có tài khoản?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFlipped(false);
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Đăng nhập
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-white text-sm">
          Bạn là nhà tuyển dụng?{' '}
          <a href="#" className="font-semibold hover:underline text-white">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default JobSeekerAuthPage;