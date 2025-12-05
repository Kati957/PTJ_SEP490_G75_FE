import React, { useState, useEffect } from "react";
import { Typography, Button, Input, Select, message, Space } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import locationService, {
  type LocationOption,
} from "../../location/locationService";

const { Text } = Typography;

interface LocationEditFieldProps {
  label: string;
  provinceId?: number | null;
  districtId?: number | null;
  wardId?: number | null;
  fullLocation?: string | null;
  onSave: (data: {
    provinceId: number;
    districtId: number;
    wardId: number;
    location: string;
  }) => Promise<void>;
}

const LocationEditField: React.FC<LocationEditFieldProps> = ({
  label,
  provinceId,
  districtId,
  wardId,
  fullLocation,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>(
    provinceId || undefined
  );
  const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>(
    districtId || undefined
  );
  const [selectedWard, setSelectedWard] = useState<number | undefined>(
    wardId || undefined
  );
  const [specificAddress, setSpecificAddress] = useState<string>("");

  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  useEffect(() => {
    if (fullLocation) {
      setSpecificAddress(fullLocation);
    }
  }, [fullLocation]);

  useEffect(() => {
    if (isEditing && provinces.length === 0) {
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
    }
  }, [isEditing, provinces.length]);

  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        setLocationLoading((prev) => ({ ...prev, districts: true }));
        try {
          const data = await locationService.getDistricts(selectedProvince);
          setDistricts(data);
        } catch {
          message.error("Không thể tải danh sách quận/huyện.");
        } finally {
          setLocationLoading((prev) => ({ ...prev, districts: false }));
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        setLocationLoading((prev) => ({ ...prev, wards: true }));
        try {
          const data = await locationService.getWards(selectedDistrict);
          setWards(data);
        } catch {
          message.error("Không thể tải danh sách phường/xã.");
        } finally {
          setLocationLoading((prev) => ({ ...prev, wards: false }));
        }
      };
      loadWards();
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const handleProvinceChange = (value: number) => {
    setSelectedProvince(value);
    setSelectedDistrict(undefined);
    setSelectedWard(undefined);
  };

  const handleDistrictChange = (value: number) => {
    setSelectedDistrict(value);
    setSelectedWard(undefined);
  };

  const handleWardChange = (value: number) => {
    setSelectedWard(value);
  };

  const handleSaveClick = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      message.error("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
        location: specificAddress,
      });
      setIsEditing(false);
    } catch (error) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Không thể lưu địa chỉ.";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedProvince(provinceId || undefined);
    setSelectedDistrict(districtId || undefined);
    setSelectedWard(wardId || undefined);
    setSpecificAddress(fullLocation || "");
  };

  if (isEditing) {
    return (
      <div className="py-4 border-b">
        <Text type="secondary" className="block mb-2">
          {label}
        </Text>
        <Space direction="vertical" className="w-full">
          <Select
            placeholder="Chọn Tỉnh/Thành phố"
            className="w-full"
            loading={locationLoading.provinces}
            options={provinces.map((p) => ({ label: p.name, value: p.code }))}
            value={selectedProvince}
            onChange={handleProvinceChange}
            showSearch
            optionFilterProp="label"
          />
          <Select
            placeholder="Chọn Quận/Huyện"
            className="w-full"
            loading={locationLoading.districts}
            options={districts.map((d) => ({ label: d.name, value: d.code }))}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            showSearch
            optionFilterProp="label"
          />
          <Select
            placeholder="Chọn Phường/Xã"
            className="w-full"
            loading={locationLoading.wards}
            options={wards.map((w) => ({ label: w.name, value: w.code }))}
            value={selectedWard}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            showSearch
            optionFilterProp="label"
          />
          <Input
            placeholder="Số nhà, tên đường, khu vực..."
            value={specificAddress}
            onChange={(e) => setSpecificAddress(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSaveClick}
              loading={loading}
              className="mr-2"
            >
              Lưu
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </Space>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-4 border-b">
      <div>
        <Text type="secondary" className="block">
          {label}
        </Text>
        <Text strong>{fullLocation || "Chưa cập nhật"}</Text>
      </div>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => setIsEditing(true)}
      >
        Chỉnh sửa
      </Button>
    </div>
  );
};

export default LocationEditField;
