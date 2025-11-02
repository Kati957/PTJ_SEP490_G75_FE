import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import { NavLink } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

interface Province {
  name: string;
  code: string;
}
interface District {
  name: string;
  code: string;
}

export const EmployerRegisterPage: React.FC = () => {
  const [form] = Form.useForm();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("Việt Nam");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setProvinces(data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tỉnh/thành:", error);
      }
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách quận/huyện:", error);
      }
      setLoadingDistricts(false);
    };

    fetchDistricts();
  }, [selectedProvinceCode]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setFieldsValue({
      city: null,
      district: null,
      otherCountry: null,
      otherCity: null,
      streetAddress: null,
    });
    setSelectedProvinceCode(null);
    setDistricts([]);
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvinceCode(provinceCode);
    form.setFieldsValue({ district: null });
  };

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg border border-gray-200">
        <Title level={3} className="text-center">
          Nhà tuyển dụng đăng ký
        </Title>
        <Text type="secondary" className="block text-center mb-8">
          Tạo tài khoản để tiếp cận kho ứng viên chất lượng và bắt đầu đăng việc
          ngay
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              size="large"
              placeholder="Sử dụng email công việc để xác thực nhanh hơn"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Nhập lại mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Divider />

          <Title level={4} className="text-center mb-6">
            Thông tin công ty
          </Title>

          <Form.Item
            name="companyName"
            label="Tên công ty"
            rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="companySize"
            label="Số nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn số nhân viên!" }]}
          >
            <Select size="large" placeholder="Chọn số nhân viên">
              <Option value="1-99">1 - 99</Option>
              <Option value="100-499">100 - 499</Option>
              <Option value="500-999">500 - 999</Option>
              <Option value="1000+">1000+</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPerson"
                label="Người liên hệ"
                rules={[
                  { required: true, message: "Vui lòng nhập người liên hệ!" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPhone"
                label="Điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={4} className="text-center mb-6">
            Địa chỉ
          </Title>

          <Form.Item label="Quốc gia" name="country">
            <Select
              size="large"
              defaultValue="Việt Nam"
              onSelect={handleCountryChange}
            >
              <Option value="Việt Nam">Việt Nam</Option>
              <Option value="Khác">Khác (Other)</Option>
            </Select>
          </Form.Item>

          {selectedCountry === "Việt Nam" && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="city"
                  label="Tỉnh/Thành phố"
                  rules={[
                    { required: true, message: "Vui lòng chọn tỉnh/thành!" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn tỉnh/thành"
                    loading={loadingProvinces}
                    onSelect={handleProvinceChange}
                    showSearch
                    filterOption={(input, option) =>
                      ((option?.label as string) ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {provinces.map((p) => (
                      <Option key={p.code} value={p.code} label={p.name}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="district"
                  label="Quận/Huyện"
                  rules={[
                    { required: true, message: "Vui lòng chọn quận/huyện!" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn quận/huyện"
                    loading={loadingDistricts}
                    disabled={!selectedProvinceCode}
                    showSearch
                    filterOption={(input, option) =>
                      ((option?.label as string) ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {districts.map((d) => (
                      <Option key={d.code} value={d.code} label={d.name}>
                        {d.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {selectedCountry === "Khác" && (
            <>
              <Form.Item
                name="otherCountry"
                label="Quốc gia"
                rules={[{ required: true, message: "Vui lòng nhập quốc gia!" }]}
              >
                <Input size="large" placeholder="Quốc gia" />
              </Form.Item>
              <Form.Item
                name="otherCity"
                label="Tỉnh/Thành phố (State/Province)"
                rules={[
                  { required: true, message: "Vui lòng nhập tỉnh/thành phố!" },
                ]}
              >
                <Input size="large" placeholder="Tỉnh/Thành phố" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="streetAddress"
            label="Số nhà, phường, xã"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input size="large" placeholder="Số nhà, phường, xã" />
          </Form.Item>

          <Divider />

          <Form.Item name="newsletter" valuePropName="checked">
            <Checkbox>Nhận bản tin việc làm</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Đăng ký ngay
            </Button>
          </Form.Item>

          <Text type="secondary" className="text-xs text-center block">
            Tôi đồng ý với{" "}
            <NavLink to="/terms" className="text-blue-600">
              Điều khoản dịch vụ
            </NavLink>{" "}
            và{" "}
            <NavLink to="/privacy" className="text-blue-600">
              Chính sách bảo mật
            </NavLink>{" "}
            của CareerLink.
          </Text>
        </Form>
      </div>
    </div>
  );
};

export default EmployerRegisterPage;
