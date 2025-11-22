import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Empty,
  Form,
  Input,
  Typography,
  List,
  Space,
  Tag,
  message,
  Popconfirm,
  Select,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import jobSeekerCvService from "../services";
import type { JobSeekerCv, JobSeekerCvPayload } from "../types";
import locationService, {
  type LocationOption,
} from "../../location/locationService";

const { Title, Text, Paragraph } = Typography;

const JobSeekerCvPage: React.FC = () => {
  const [form] = Form.useForm();
  const [cvs, setCvs] = useState<JobSeekerCv[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCv, setEditingCv] = useState<JobSeekerCv | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const data = await jobSeekerCvService.fetchMyCvs();
      setCvs(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Không thể tải CV.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        message.error("Không thể tải danh sách tỉnh/thành.");
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  const handleProvinceChange = async (provinceId?: number) => {
    form.setFieldsValue({ districtId: undefined, wardId: undefined });
    setDistricts([]);
    setWards([]);
    if (!provinceId) return;
    setLocationLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await locationService.getDistricts(provinceId);
      setDistricts(data);
    } catch {
      message.error("Không thể tải danh sách quận/huyện.");
    } finally {
      setLocationLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleDistrictChange = async (districtId?: number) => {
    form.setFieldsValue({ wardId: undefined });
    setWards([]);
    if (!districtId) return;
    setLocationLoading((prev) => ({ ...prev, wards: true }));
    try {
      const data = await locationService.getWards(districtId);
      setWards(data);
    } catch {
      message.error("Không thể tải danh sách phường/xã.");
    } finally {
      setLocationLoading((prev) => ({ ...prev, wards: false }));
    }
  };

  const resetForm = () => {
    form.resetFields();
    setEditingCv(null);
    setDistricts([]);
    setWards([]);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    resetForm();
    setIsFormVisible(false);
  };

  const handleSubmit = async (values: any) => {
    const payload: JobSeekerCvPayload = {
      cvTitle: values.cvTitle,
      skillSummary: values.skillSummary || null,
      skills: values.skills || null,
      preferredJobType: values.preferredJobType || null,
      provinceId: values.provinceId,
      districtId: values.districtId,
      wardId: values.wardId,
      contactPhone: values.contactPhone || null,
    };

    try {
      setSubmitting(true);
      if (editingCv) {
        await jobSeekerCvService.updateCv(editingCv.cvid, payload);
        message.success("Cập nhật CV thành công.");
      } else {
        await jobSeekerCvService.createCv(payload);
        message.success("Tạo CV thành công.");
      }

      await fetchCvs();
      handleCancelForm();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Không thể lưu CV.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (cv: JobSeekerCv) => {
    setEditingCv(cv);
    setIsFormVisible(true);
    form.setFieldsValue({
      cvTitle: cv.cvTitle,
      skillSummary: cv.skillSummary,
      skills: cv.skills,
      preferredJobType: cv.preferredJobType,
      contactPhone: cv.contactPhone,
      provinceId: cv.provinceId ?? undefined,
      districtId: cv.districtId ?? undefined,
      wardId: cv.wardId ?? undefined,
    });
    if (cv.provinceId) {
      await handleProvinceChange(cv.provinceId);
    }
    if (cv.districtId) {
      await handleDistrictChange(cv.districtId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (cvId: number) => {
    try {
      await jobSeekerCvService.deleteCv(cvId);
      message.success("Đã xóa CV.");
      await fetchCvs();
      if (editingCv?.cvid === cvId) {
        handleCancelForm();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Không thể xóa CV.");
    }
  };

  const formTitle = editingCv ? "Chỉnh sửa CV" : "Tạo CV mới";

  const cvList = useMemo(() => {
    if (cvs.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa tạo CV nào"
        />
      );
    }

    return (
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={cvs}
        loading={loading}
        renderItem={(cv) => (
          <List.Item key={cv.cvid}>
            <Card className="rounded-xl shadow-sm h-full">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <Space size="small">
                    <FileTextOutlined className="text-blue-500" />
                    <Text strong>{cv.cvTitle}</Text>
                  </Space>
                  <Space size="small">
                    <Text type="secondary">
                      Cập nhật:{" "}
                      {new Date(cv.updatedAt).toLocaleDateString("vi-VN")}
                    </Text>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(cv)}
                      type="link"
                    >
                      Chỉnh sửa
                    </Button>
                    <Popconfirm
                      title="Xóa CV này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(cv.cvid)}
                    >
                      <Button icon={<DeleteOutlined />} danger type="link">
                        Xóa
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>

                <Paragraph ellipsis={{ rows: 2 }} className="mb-0 text-gray-600">
                  {cv.skillSummary || "Chưa có tóm tắt kỹ năng"}
                </Paragraph>

                <Space direction="vertical" size={2}>
                  <Space>
                    <PhoneOutlined className="text-gray-500" />
                    <Text>{cv.contactPhone || "Chưa cập nhật"}</Text>
                  </Space>
                  <Space>
                    <EnvironmentOutlined className="text-gray-500" />
                    <Text>{cv.preferredLocationName || "Chưa cập nhật"}</Text>
                  </Space>
                </Space>

                <div>
                  {cv.preferredJobType && (
                    <Tag color="blue">{cv.preferredJobType}</Tag>
                  )}
                  {cv.skills &&
                    cv.skills
                      .split(",")
                      .slice(0, 3)
                      .map((skill) => (
                        <Tag key={skill.trim()}>{skill.trim()}</Tag>
                      ))}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  }, [cvs, loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-6xl mx-auto px-6 h-48 flex flex-col justify-end pb-6 text-white text-center">
          <p className="uppercase text-base tracking-widest">CV của tôi</p>
          <h1 className="text-4xl font-semibold mt-2">
            Quản lý và tạo CV nổi bật
          </h1>
        </div>
      </div>

    <div className="max-w-6xl mx-auto px-6 pb-12">
      <div className="flex justify-start mt-8">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openCreateForm}
          className="ml-1"
        >
          Tạo CV
        </Button>
      </div>

        

        {isFormVisible && (
          <Card className="max-w-3xl mx-auto mt-6 shadow-lg" title={formTitle}>
            <Form
              layout="vertical"
              form={form}
              onFinish={handleSubmit}
              initialValues={{
                cvTitle: "",
                preferredJobType: "",
                skills: "",
                skillSummary: "",
                contactPhone: "",
              }}
            >
              <Form.Item
                name="contactPhone"
                label="Số điện thoại liên hệ"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^(0|\+84)([0-9]{9})$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="VD: 090xxxxxxx" />
              </Form.Item>

              <Form.Item
                name="cvTitle"
                label="Tiêu đề CV"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="VD: Lập trình viên .NET 3 năm kinh nghiệm" />
              </Form.Item>

              <Form.Item name="skillSummary" label="Tóm tắt kỹ năng nổi bật">
                <Input.TextArea rows={3} placeholder="Nội dung tóm tắt..." />
              </Form.Item>

              <Form.Item name="skills" label="Kỹ năng">
                <Input.TextArea placeholder="VD: .NET, SQL Server, REST API..." />
              </Form.Item>

              <Form.Item
                name="preferredJobType"
                label="Loại hình công việc mong muốn"
              >
                <Input placeholder="VD: Fulltime, Part-time, Remote..." />
              </Form.Item>

              <Divider />

              <Title level={5}>Địa điểm làm việc mong muốn</Title>

              <Form.Item
                name="provinceId"
                label="Tỉnh / Thành phố"
                rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành" }]}
              >
                <Select
                  placeholder="Chọn tỉnh / thành"
                  loading={locationLoading.provinces}
                  options={provinces.map((p) => ({
                    label: p.name,
                    value: p.code,
                  }))}
                  onChange={handleProvinceChange}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                name="districtId"
                label="Quận / Huyện"
                rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
              >
                <Select
                  placeholder="Chọn quận / huyện"
                  loading={locationLoading.districts}
                  options={districts.map((d) => ({
                    label: d.name,
                    value: d.code,
                  }))}
                  onChange={handleDistrictChange}
                  disabled={!form.getFieldValue("provinceId")}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                name="wardId"
                label="Phường / Xã"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  placeholder="Chọn phường / xã"
                  loading={locationLoading.wards}
                  options={wards.map((w) => ({
                    label: w.name,
                    value: w.code,
                  }))}
                  disabled={!form.getFieldValue("districtId")}
                  allowClear
                />
              </Form.Item>

              <Space className="w-full justify-end mt-4">
                <Button onClick={handleCancelForm}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingCv ? "Lưu thay đổi" : "Đăng"}
                </Button>
              </Space>
            </Form>
          </Card>
        )}

        <Card className="shadow-md mt-8">
          {cvList}
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerCvPage;
