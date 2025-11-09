import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Select, Card, InputNumber, Radio, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../app/store';
import { useAuth } from '../../auth/hooks';
import { createPosting, resetPostStatus, fetchPostById, updatePosting } from '../slice/slice';
import { fetchProvinces } from '../services';
import { useCategories } from '../../category/hook';
import type { Province, CreateJobSeekerPostPayload, UpdateJobSeekerPostPayload } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const CreatePostingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL

  // Xác định chế độ (tạo mới, xem, sửa)
  const isCreateMode = location.pathname.includes('/tao-bai-dang-tim-viec');
  const isViewMode = location.pathname.includes('/xem-bai-dang-tim-viec');
  const isEditMode = location.pathname.includes('/sua-bai-dang-tim-viec');
  const [isReadOnly, setIsReadOnly] = useState(isViewMode);

  const { user } = useAuth();
  const { loading: isSubmitting, success, error } = useSelector((state: RootState) => state.jobSeekerPosting.create.create);
  const { post: postDetail, loading: isLoadingDetail, error: detailError } = useSelector((state: RootState) => state.jobSeekerPosting.create.detail);

  const { categories, isLoading: isLoadingCategories } = useCategories();
  const [provinces, setProvinces] = useState<Province[]>([]);

  const pageTitle = isCreateMode ? 'Tạo bài đăng tìm việc Part-time' : 'Chi tiết bài đăng tìm việc';
  const buttonText = isCreateMode ? 'Đăng bài' : 'Lưu thay đổi';

  useEffect(() => {
    setIsReadOnly(isViewMode);
  }, [isViewMode]);

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

  // Lấy chi tiết bài đăng nếu ở chế độ xem/sửa
  useEffect(() => {
    if ((isViewMode || isEditMode) && id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id, isViewMode, isEditMode]);

  // Điền dữ liệu vào form khi có chi tiết bài đăng
  useEffect(() => {
    if (postDetail && (isViewMode || isEditMode)) {
      form.setFieldsValue({
        ...postDetail,
      });
    }
    if (postDetail && categories.length > 0 && (isViewMode || isEditMode)) {
      const category = categories.find(c => c.name === postDetail.categoryName);
      if (category) {
        form.setFieldsValue({
          categoryID: category.categoryId,
        });
      }
    }
  }, [postDetail, categories, isViewMode, isEditMode, form]);

  // Xử lý khi tạo bài đăng thành công hoặc thất bại
  useEffect(() => {
    if (success) {
      message.success(isCreateMode ? 'Tạo bài đăng thành công!' : 'Cập nhật thành công!');
      dispatch(resetPostStatus());
      navigate('/quan-ly-bai-dang'); // Chuyển về trang quản lý
    }
    if (error) {
      message.error(`Thao tác thất bại: ${error}`);
      dispatch(resetPostStatus());
    }
  }, [success, error, dispatch, navigate, isCreateMode]);

  const onFinish = (values: any) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    if (isCreateMode) {
      const payload: CreateJobSeekerPostPayload = {
        ...values,
        userID: user.id,
        age: Number(values.age),
        categoryID: Number(values.categoryID),
      };
      dispatch(createPosting(payload));
    } else if (isEditMode && id) {
      const payload: UpdateJobSeekerPostPayload = {
        ...values,
        jobSeekerPostId: Number(id),
        userID: user.id,
        age: Number(values.age),
        categoryID: Number(values.categoryID),
      };
      dispatch(updatePosting(payload));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Title level={2} className="mb-6 text-center">{pageTitle}</Title>
        <Spin spinning={isSubmitting || isLoadingDetail}>
          <Card>
            <Form form={form} layout="vertical" name="create-posting-form" onFinish={onFinish}>
              <Form.Item name="title" label="Tiêu đề bài đăng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                <Input placeholder="Ví dụ: Sinh viên năm 2 tìm việc làm phục vụ" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item name="categoryID" label="Ngành nghề mong muốn" rules={[{ required: true, message: 'Vui lòng chọn ngành nghề!' }]}>
                <Select placeholder="Chọn ngành nghề" loading={isLoadingCategories} disabled={isReadOnly}>
                  {categories.map((category) => (
                    <Select.Option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="preferredLocation" label="Khu vực làm việc mong muốn" rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}>
                <Select showSearch placeholder="Chọn khu vực" optionFilterProp="children" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={provinces.map(p => ({ value: p.name, label: p.name }))} disabled={isReadOnly} />
              </Form.Item>

              <Form.Item name="preferredWorkHours" label="Thời gian làm việc mong muốn" rules={[{ required: true, message: 'Vui lòng nhập thời gian làm việc!' }]}>
                <Input placeholder="Ví dụ: Buổi tối các ngày trong tuần" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item name="phoneContact" label="Số điện thoại liên hệ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input type="number" placeholder="Nhà tuyển dụng sẽ liên hệ qua số này" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Vui lòng nhập tuổi của bạn!' }]}>
                <InputNumber min={16} max={60} style={{ width: '100%' }} readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                <Radio.Group disabled={isReadOnly}>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="description" label="Mô tả chi tiết về bản thân và kinh nghiệm" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                <TextArea rows={6} placeholder="Giới thiệu về kỹ năng, kinh nghiệm làm việc..." readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item>
                {isReadOnly ? (
                  <Button type="primary" block onClick={() => navigate(`/sua-bai-dang-tim-viec/${id}`)}>
                    Chỉnh sửa =={'>'} Sửa bài đăng
                  </Button>
                ) : (
                  <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                    {buttonText}
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default CreatePostingPage;
