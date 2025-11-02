import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Select, Card, InputNumber, Radio, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../app/store';
import { useAuth } from '../../auth/hooks';
import { createPosting, resetPostStatus } from '../slice/slice';
import { fetchProvinces } from '../services';
import type { Province, CreateJobSeekerPostPayload } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CreatePostingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, success, error } = useSelector((state: RootState) => state.jobSeekerPosting.create);

  const [provinces, setProvinces] = useState<Province[]>([]);

  // Lấy danh sách tỉnh/thành khi component được mount
  useEffect(() => {
    const getProvinces = async () => {
      try {
        const provinceData = await fetchProvinces();
        setProvinces(provinceData);
      } catch (err) {
        message.error('Không thể tải danh sách khu vực');
      }
    };
    getProvinces();
  }, []);

  // Xử lý khi tạo bài đăng thành công hoặc thất bại
  useEffect(() => {
    if (success) {
      message.success('Tạo bài đăng thành công!');
      dispatch(resetPostStatus());
      navigate('/quan-ly-bai-dang'); // Chuyển về trang quản lý
    }
    if (error) {
      message.error(error);
      dispatch(resetPostStatus());
    }
  }, [success, error, dispatch, navigate]);

  const onFinish = (values: any) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    const payload: CreateJobSeekerPostPayload = {
      ...values,
      userID: user.id,
      age: Number(values.age),
      categoryID: Number(values.categoryID),
    };

    dispatch(createPosting(payload));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Title level={2} className="mb-6 text-center">Tạo bài đăng tìm việc Part-time</Title>
        <Spin spinning={loading}>
          <Card>
            <Form layout="vertical" name="create-posting-form" onFinish={onFinish}>
              <Form.Item name="title" label="Tiêu đề bài đăng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                <Input placeholder="Ví dụ: Sinh viên năm 2 tìm việc làm phục vụ" />
              </Form.Item>

              <Form.Item name="categoryID" label="Ngành nghề mong muốn" rules={[{ required: true, message: 'Vui lòng chọn ngành nghề!' }]}>
                <Select placeholder="Chọn ngành nghề">
                  {/* Giả lập category ID, sẽ được thay thế bằng API sau */}
                  <Select.Option value={1}>Kế toán / Kiểm toán</Select.Option>
                  <Select.Option value={2}>Quảng cáo / Marketing</Select.Option>
                  <Select.Option value={3}>Nông nghiệp / Lâm nghiệp</Select.Option>
                  <Select.Option value={4}>Nghệ thuật / Thiết kế</Select.Option>
                  <Select.Option value={5}>Ngân hàng / Tài chính</Select.Option>
                  <Select.Option value={6}>Thư ký / Hành chính </Select.Option>
                  <Select.Option value={7}>Công nghệ thông tin </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="preferredLocation" label="Khu vực làm việc mong muốn" rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}>
                <Select showSearch placeholder="Chọn khu vực" optionFilterProp="children" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={provinces.map(p => ({ value: p.name, label: p.name }))} />
              </Form.Item>

              <Form.Item name="preferredWorkHours" label="Thời gian làm việc mong muốn" rules={[{ required: true, message: 'Vui lòng nhập thời gian làm việc!' }]}>
                <Input placeholder="Ví dụ: Buổi tối các ngày trong tuần" />
              </Form.Item>

              <Form.Item name="phoneContact" label="Số điện thoại liên hệ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input type="number" placeholder="Nhà tuyển dụng sẽ liên hệ qua số này" />
              </Form.Item>

              <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Vui lòng nhập tuổi của bạn!' }]}>
                <InputNumber min={16} max={60} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                <Radio.Group>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="description" label="Mô tả chi tiết về bản thân và kinh nghiệm" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                <TextArea rows={6} placeholder="Giới thiệu về kỹ năng, kinh nghiệm làm việc..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Đăng bài
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default CreatePostingPage;
