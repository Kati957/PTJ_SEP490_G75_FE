import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Upload, Avatar, Space } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Profile, ProfileUpdateRequest } from '../../../../types/profile';
import defaultCompanyLogo from '../../../../assets/no-logo.png';

interface ProfileFormProps {
  profile: Profile | null;
  loading: boolean;
  onSubmit: (data: ProfileUpdateRequest) => Promise<void>;
  onDeleteAvatar: () => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  loading,
  onSubmit,
  onDeleteAvatar
}) => {
  const [form] = Form.useForm<ProfileUpdateRequest>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(profile?.avatarUrl ?? undefined);

  useEffect(() => {
    form.setFieldsValue({
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      website: profile?.website ?? '',
      location: profile?.location ?? '',
      contactName: profile?.contactName ?? '',
      contactEmail: profile?.contactEmail ?? '',
      contactPhone: profile?.contactPhone ?? ''
    });
    setPreviewUrl(profile?.avatarUrl ?? undefined);
    setAvatarFile(null);
  }, [form, profile]);

  const canDeleteAvatar = useMemo(() => Boolean(profile?.avatarUrl), [profile?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAvatarChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
    const file = (fileList.at(-1)?.originFileObj as File | undefined) ?? null;
    setAvatarFile(file);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(profile?.avatarUrl ?? undefined);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await onDeleteAvatar();
      setAvatarFile(null);
      setPreviewUrl(undefined);
      message.success('Đã xóa ảnh đại diện');
    } catch (error) {
      message.error('Không thể xóa ảnh');
    }
  };

  const handleFinish = async (values: ProfileUpdateRequest) => {
    try {
      await onSubmit({ ...values, imageFile: avatarFile });
      message.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      message.error('Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={profile ?? {}}
      onFinish={handleFinish}
      className="space-y-4"
    >
      <Card title="Thông tin nhà tuyển dụng" bordered={false} className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Upload
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <div className="relative cursor-pointer group">
                <Avatar
                  size={110}
                  src={previewUrl || defaultCompanyLogo}
                  className="border-4 border-white shadow-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-white text-xs rounded-full">
                  <Space direction="vertical" size={0} className="items-center">
                    <CameraOutlined />
                    <span>Chọn ảnh</span>
                  </Space>
                </div>
              </div>
            </Upload>
            {canDeleteAvatar && (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveAvatar}
                disabled={loading}
              >
                Xóa ảnh
              </Button>
            )}
          </div>

          <div className="flex-1 w-full">
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="displayName"
                  label="Tên nhà tuyển dụng"
                  rules={[{ required: true, message: 'Vui lòng nhập tên nhà tuyển dụng!' }]}
                >
                  <Input placeholder="VD: Nhà tuyển dụng ABC" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Mô tả nhà tuyển dụng"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả nhà tuyển dụng!' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Giới thiệu ngắn gọn về nhà tuyển dụng của bạn"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[{ type: 'url', message: 'Đường dẫn website không hợp lệ!' }]}
                >
                  <Input placeholder="https://nha-tuyen-dung.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label="Địa điểm chính"
                  rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
                >
                  <Input placeholder="VD: Hà Nội, Việt Nam" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Card title="Thông tin liên hệ" bordered={false} className="shadow-sm">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactName"
              label="Người liên hệ"
              rules={[{ required: true, message: 'Vui lòng nhập người liên hệ!' }]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactEmail"
              label="Email liên hệ"
              rules={[
                { required: true, message: 'Vui lòng nhập email liên hệ!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="contact@company.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactPhone"
              label="Số điện thoại liên hệ"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input placeholder="+84 912 345 678" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu thay đổi
        </Button>
      </div>
    </Form>
  );
};

export default ProfileForm;
