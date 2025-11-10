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
      message.success('Da xoa anh dai dien');
    } catch (error) {
      message.error('Khong the xoa anh');
    }
  };

  const handleFinish = async (values: ProfileUpdateRequest) => {
    try {
      await onSubmit({ ...values, imageFile: avatarFile });
      message.success('Cap nhat ho so thanh cong');
    } catch (error) {
      message.error('Cap nhat ho so that bai');
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
      <Card title="Thong tin nha tuyen dung" bordered={false} className="shadow-sm">
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
                    <span>Chon anh</span>
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
                Xoa anh
              </Button>
            )}
          </div>

          <div className="flex-1 w-full">
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="displayName"
                  label="Ten nha tuyen dung"
                  rules={[{ required: true, message: 'Vui long nhap ten nha tuyen dung!' }]}
                >
                  <Input placeholder="VD: Nha tuyen dung ABC" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label="Mo ta nha tuyen dung"
                  rules={[{ required: true, message: 'Vui long nhap mo ta nha tuyen dung!' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Gioi thieu ngan gon ve nha tuyen dung cua ban"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[{ type: 'url', message: 'Duong dan website khong hop le!' }]}
                >
                  <Input placeholder="https://nha-tuyen-dung.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label="Dia diem chinh"
                  rules={[{ required: true, message: 'Vui long nhap dia diem!' }]}
                >
                  <Input placeholder="Thanh pho, quoc gia" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Card title="Thong tin lien he" bordered={false} className="shadow-sm">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactName"
              label="Nguoi lien he"
              rules={[{ required: true, message: 'Vui long nhap nguoi lien he!' }]}
            >
              <Input placeholder="Ho va ten" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactEmail"
              label="Email lien he"
              rules={[
                { required: true, message: 'Vui long nhap email lien he!' },
                { type: 'email', message: 'Email khong hop le!' }
              ]}
            >
              <Input placeholder="contact@company.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="contactPhone"
              label="So dien thoai lien he"
              rules={[{ required: true, message: 'Vui long nhap so dien thoai!' }]}
            >
              <Input placeholder="+84 912 345 678" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          Luu thay doi
        </Button>
      </div>
    </Form>
  );
};

export default ProfileForm;
