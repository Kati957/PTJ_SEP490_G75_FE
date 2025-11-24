import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Upload,
} from 'antd';
import { CameraOutlined, DeleteOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import type { JobSeekerProfileDto, JobSeekerProfileUpdateDto } from '../types';
import { deleteJobSeekerProfilePicture, updateJobSeekerProfile } from '../slice/profileSlice';
import locationService, { type LocationOption } from '../../location/locationService';

interface ProfileDetailsProps {
  profile: JobSeekerProfileDto | null;
  loading: boolean;
  error: string | null;
}

interface FormValues {
  fullName?: string;
  gender?: string;
  birthYear?: number;
  contactPhone?: string;
  fullLocation?: string;
  provinceId?: number;
  districtId?: number;
  wardId?: number;
}

const genderOptions = [
  { label: 'Nam', value: 'Male' },
  { label: 'Nữ', value: 'Female' },
  { label: 'Khác', value: 'Other' },
];

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile, loading, error }) => {
  const dispatch: AppDispatch = useDispatch();
  const [form] = Form.useForm<FormValues>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(profile?.profilePicture ?? undefined);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });
  const provinceValue = Form.useWatch('provinceId', form);
  const districtValue = Form.useWatch('districtId', form);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        message.error('Không thể tải danh sách tỉnh/thành.');
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };

    void loadProvinces();
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.setFieldsValue({
      fullName: profile.fullName ?? '',
      gender: profile.gender ?? undefined,
      birthYear: profile.birthYear ?? undefined,
      contactPhone: profile.contactPhone ?? '',
      fullLocation: profile.fullLocation ?? '',
      provinceId: profile.provinceId ?? undefined,
      districtId: profile.districtId ?? undefined,
      wardId: profile.wardId ?? undefined,
    });
    setPreviewUrl(profile.profilePicture ?? undefined);
    setAvatarFile(null);

    const primeLocations = async () => {
      if (!profile.provinceId) {
        setDistricts([]);
        setWards([]);
        return;
      }

      await handleLoadDistricts(profile.provinceId, profile.districtId ?? undefined);

      if (profile.districtId) {
        await handleLoadWards(profile.districtId);
      }
    };

    void primeLocations();
  }, [form, profile]);

  const handleLoadDistricts = async (provinceId: number, presetDistrictId?: number) => {
    setLocationLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await locationService.getDistricts(provinceId);
      setDistricts(data);
      if (!presetDistrictId) {
        setWards([]);
      }
    } catch {
      message.error('Không thể tải danh sách quận/huyện.');
    } finally {
      setLocationLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleLoadWards = async (districtId: number) => {
    setLocationLoading((prev) => ({ ...prev, wards: true }));
    try {
      const data = await locationService.getWards(districtId);
      setWards(data);
    } catch {
      message.error('Không thể tải danh sách phường/xã.');
    } finally {
      setLocationLoading((prev) => ({ ...prev, wards: false }));
    }
  };

  const handleAvatarChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
    const file = (fileList.at(-1)?.originFileObj as File | undefined) ?? null;
    setAvatarFile(file);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(profile?.profilePicture ?? undefined);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await dispatch(deleteJobSeekerProfilePicture()).unwrap();
      setAvatarFile(null);
      setPreviewUrl(undefined);
      message.success('Đã xóa ảnh đại diện.');
    } catch {
      message.error('Không thể xóa ảnh.');
    }
  };

  const handleProvinceSelect = async (value: number | null) => {
    const provinceId = value ?? undefined;
    form.setFieldsValue({ provinceId, districtId: undefined, wardId: undefined });
    if (provinceId) {
      await handleLoadDistricts(provinceId);
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictSelect = async (value: number | null) => {
    const districtId = value ?? undefined;
    form.setFieldsValue({ districtId, wardId: undefined });
    if (districtId) {
      await handleLoadWards(districtId);
    } else {
      setWards([]);
    }
  };

  const handleWardSelect = (value: number | null) => {
    form.setFieldsValue({ wardId: value ?? undefined });
  };

  const handleSubmit = async (values: FormValues) => {
    const payload: JobSeekerProfileUpdateDto = {
      ...values,
    };

    if (avatarFile) {
      payload.imageFile = avatarFile;
    }

    try {
      await dispatch(updateJobSeekerProfile(payload)).unwrap();
      message.success('Cập nhật hồ sơ thành công!');
      setAvatarFile(null);
    } catch {
      message.error('Cập nhật hồ sơ thất bại!');
    }
  };

  if (!profile) {
    return (
      <Card className="shadow-sm">
        <Alert message="Không tìm thấy hồ sơ để chỉnh sửa." type="warning" />
      </Card>
    );
  }

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit} className="space-y-4">
      {error && (
        <Alert message="Lỗi" description={error} type="error" showIcon className="mb-2" />
      )}

      <Card title="Chỉnh sửa hồ sơ" className="shadow-sm">
        <Row gutter={[24, 0]}>
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center gap-3">
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
                    src={previewUrl || undefined}
                    icon={<UserOutlined />}
                    className="border border-gray-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white text-xs rounded-full">
                    <span className="flex items-center gap-1">
                      <CameraOutlined />
                      Đổi ảnh
                    </span>
                  </div>
                </div>
              </Upload>
              <Button
                type="link"
                icon={loading ? <LoadingOutlined /> : <DeleteOutlined />}
                onClick={handleRemoveAvatar}
                disabled={loading}
              >
                Xóa ảnh
              </Button>
              <p className="text-xs text-gray-500 text-center">JPG/PNG tối đa 2MB.</p>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select options={genderOptions} allowClear placeholder="Chọn giới tính" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="birthYear" label="Năm sinh">
                  <InputNumber min={1950} max={new Date().getFullYear()} className="w-full" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="fullLocation" label="Địa chỉ chi tiết">
                  <Input placeholder="Số nhà, đường, khu vực" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="provinceId" label="Tỉnh / thành phố">
                  <Select
                    placeholder="Chọn tỉnh/thành"
                    allowClear
                    loading={locationLoading.provinces}
                    options={provinces.map((prov) => ({
                      label: prov.name,
                      value: prov.code,
                    }))}
                    onChange={(value) => {
                      void handleProvinceSelect((value as number | undefined) ?? null);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="districtId" label="Quận / huyện">
                  <Select
                    placeholder="Chọn quận/huyện"
                    allowClear
                    disabled={!provinceValue}
                    loading={locationLoading.districts}
                    options={districts.map((district) => ({
                      label: district.name,
                      value: district.code,
                    }))}
                    onChange={(value) => {
                      void handleDistrictSelect((value as number | undefined) ?? null);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="wardId" label="Phường / xã">
                  <Select
                    placeholder="Chọn phường/xã"
                    allowClear
                    disabled={!districtValue}
                    loading={locationLoading.wards}
                    options={wards.map((ward) => ({
                      label: ward.name,
                      value: ward.code,
                    }))}
                    onChange={(value) => handleWardSelect((value as number | undefined) ?? null)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card title="Thông tin liên hệ" className="shadow-sm">
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              name="contactPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="0987xxxxxx" />
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

export default ProfileDetails;
