import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Upload, Avatar, Space, Select } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Profile, ProfileUpdateRequest } from '../../../../types/profile';
import defaultCompanyLogo from '../../../../assets/no-logo.png';
import locationService, { type LocationOption } from '../../../location/locationService';

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
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false
  });
  const autoLocationRef = useRef<string>('');
  const provinceValue = Form.useWatch('provinceId', form);
  const districtValue = Form.useWatch('districtId', form);

  const normalizeLocationId = (value?: number | null) =>
    value !== null && value !== undefined && value > 0 ? value : undefined;

  useEffect(() => {
    form.setFieldsValue({
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      website: profile?.website ?? '',
      location: profile?.location ?? '',
      fullLocation: profile?.fullLocation ?? '',
      provinceId: normalizeLocationId(profile?.provinceId ?? undefined),
      districtId: normalizeLocationId(profile?.districtId ?? undefined),
      wardId: normalizeLocationId(profile?.wardId ?? undefined),
      contactName: profile?.contactName ?? '',
      contactEmail: profile?.contactEmail ?? '',
      contactPhone: profile?.contactPhone ?? ''
    });
    autoLocationRef.current = profile?.location ?? '';
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

  useEffect(() => {
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        message.error('Khong the tai danh sach tinh/thanh.');
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };

    void loadProvinces();
  }, []);

  const loadDistricts = useCallback(async (provinceCode: number) => {
    setLocationLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch {
      message.error('Khong the tai danh sach quan/huyen.');
    } finally {
      setLocationLoading((prev) => ({ ...prev, districts: false }));
    }
  }, []);

  const loadWards = useCallback(async (districtCode: number) => {
    setLocationLoading((prev) => ({ ...prev, wards: true }));
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch {
      message.error('Khong the tai danh sach phuong/xa.');
    } finally {
      setLocationLoading((prev) => ({ ...prev, wards: false }));
    }
  }, []);

  const findOptionName = (options: LocationOption[], code?: number | null) => {
    if (code === null || code === undefined) {
      return undefined;
    }
    return options.find((option) => option.code === code)?.name;
  };

  const updateLocationFromSelections = useCallback(
    (provinceCode?: number | null, districtCode?: number | null, wardCode?: number | null) => {
      const provinceName = findOptionName(provinces, provinceCode);
      const districtName = findOptionName(districts, districtCode);
      const wardName = findOptionName(wards, wardCode);
      const autoValue = [wardName, districtName, provinceName].filter(Boolean).join(', ');
      const currentValue = form.getFieldValue('location') ?? '';

      if (!autoValue) {
        if (autoLocationRef.current && currentValue === autoLocationRef.current) {
          form.setFieldsValue({ location: '' });
        }
        autoLocationRef.current = '';
        return;
      }

      if (!currentValue || currentValue === autoLocationRef.current) {
        form.setFieldsValue({ location: autoValue });
      }
      autoLocationRef.current = autoValue;
    },
    [districts, form, provinces, wards]
  );

  useEffect(() => {
    const provinceId = normalizeLocationId(profile?.provinceId ?? undefined);
    if (provinceId) {
      void loadDistricts(provinceId);
    } else {
      setDistricts([]);
      form.setFieldsValue({ districtId: undefined, wardId: undefined });
    }
  }, [form, loadDistricts, profile?.provinceId]);

  useEffect(() => {
    const districtId = normalizeLocationId(profile?.districtId ?? undefined);
    if (districtId) {
      void loadWards(districtId);
    } else {
      setWards([]);
      form.setFieldsValue({ wardId: undefined });
    }
  }, [form, loadWards, profile?.districtId]);

  useEffect(() => {
    const provinceId = form.getFieldValue('provinceId');
    const districtId = form.getFieldValue('districtId');
    const wardId = form.getFieldValue('wardId');
    if (provinceId || districtId || wardId) {
      updateLocationFromSelections(provinceId, districtId, wardId);
    }
  }, [districts, form, provinces, updateLocationFromSelections, wards]);

  const handleProvinceSelect = async (value: number | null) => {
    const selectedProvince = value ?? null;
    form.setFieldsValue({
      provinceId: selectedProvince ?? undefined,
      districtId: undefined,
      wardId: undefined
    });
    if (selectedProvince) {
      await loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setWards([]);
    }
    updateLocationFromSelections(selectedProvince, null, null);
  };

  const handleDistrictSelect = async (value: number | null) => {
    const selectedProvince = form.getFieldValue('provinceId') ?? null;
    const selectedDistrict = value ?? null;
    form.setFieldsValue({
      districtId: selectedDistrict ?? undefined,
      wardId: undefined
    });
    if (selectedDistrict) {
      await loadWards(selectedDistrict);
    } else {
      setWards([]);
    }
    updateLocationFromSelections(selectedProvince, selectedDistrict, null);
  };

  const handleWardSelect = (value: number | null) => {
    const selectedProvince = form.getFieldValue('provinceId') ?? null;
    const selectedDistrict = form.getFieldValue('districtId') ?? null;
    const selectedWard = value ?? null;
    form.setFieldsValue({ wardId: selectedWard ?? undefined });
    updateLocationFromSelections(selectedProvince, selectedDistrict, selectedWard);
  };

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
    } catch {
      message.error('Không thể xóa ảnh');
    }
  };

  const handleFinish = async (values: ProfileUpdateRequest) => {
    try {
      await onSubmit({ ...values, imageFile: avatarFile });
      message.success('Cập nhật hồ sơ thành công');
    } catch {
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
                <Form.Item name="fullLocation" label="Địa chỉ chi tiết">
                  <Input placeholder="Số nhà, đường, khu vực" />
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
              <Col xs={24} md={12}>
                <Form.Item
                  name="provinceId"
                  label="Tinh / thanh pho"
                  rules={[{ required: true, message: 'Vui long chon tinh/thanh!' }]}
                >
                  <Select
                    placeholder="Chon tinh/thanh"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    loading={locationLoading.provinces}
                    options={provinces.map((prov) => ({
                      label: prov.name,
                      value: prov.code
                    }))}
                    onChange={(value) =>
                      handleProvinceSelect((value as number | undefined) ?? null)
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="districtId" label="Quan / huyen">
                  <Select
                    placeholder="Chon quan/huyen"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={!provinceValue}
                    loading={locationLoading.districts}
                    options={districts.map((district) => ({
                      label: district.name,
                      value: district.code
                    }))}
                    onChange={(value) =>
                      handleDistrictSelect((value as number | undefined) ?? null)
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="wardId" label="Phuong / xa">
                  <Select
                    placeholder="Chon phuong/xa"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    disabled={!districtValue}
                    loading={locationLoading.wards}
                    options={wards.map((ward) => ({
                      label: ward.name,
                      value: ward.code
                    }))}
                    onChange={(value) => handleWardSelect((value as number | undefined) ?? null)}
                  />
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
