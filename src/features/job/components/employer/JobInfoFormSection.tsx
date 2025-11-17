import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  Input,
  InputNumber,
  Select,
  Checkbox,
  TimePicker,
  Space,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { JobPostData } from "../../jobTypes";
import JoditEditor from "jodit-react";
import debounce from "lodash.debounce";
import "jodit/es2021/jodit.min.css";
import { useCategories } from "../../../category/hook";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import locationService, {
  type LocationOption,
} from "../../../location/locationService";

const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">{children}</div>
  </div>
);

const timeRangeRegex = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;

export const JobInfoFormSection: React.FC<{
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}> = ({ data, onDataChange }) => {
  const editor = useRef(null);
  const { categories, isLoading } = useCategories();

  const [validation, setValidation] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [isNegotiable, setIsNegotiable] = useState(false);

  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([]);
  const [wardOptions, setWardOptions] = useState<LocationOption[]>([]);

  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  useEffect(() => {
    let mounted = true;
    const fetchProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const provinces = await locationService.getProvinces();
        if (mounted) {
          setProvinceOptions(provinces);
        }
      } catch (error) {
        console.error("Failed to load provinces", error);
      } finally {
        if (mounted) {
          setLocationLoading((prev) => ({ ...prev, provinces: false }));
        }
      }
    };
    fetchProvinces();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!data.provinceId) {
      setDistrictOptions([]);
      setWardOptions([]);
      setDistrictName("");
      setWardName("");
      return;
    }

    let mounted = true;
    const fetchDistricts = async () => {
      setLocationLoading((prev) => ({ ...prev, districts: true }));
      try {
        const districts = await locationService.getDistricts(
          data.provinceId as number
        );
        if (mounted) {
          setDistrictOptions(districts);
        }
      } catch (error) {
        console.error("Failed to load districts", error);
      } finally {
        if (mounted) {
          setLocationLoading((prev) => ({ ...prev, districts: false }));
        }
      }
    };
    fetchDistricts();
    return () => {
      mounted = false;
    };
  }, [data.provinceId]);

  useEffect(() => {
    if (!data.districtId) {
      setWardOptions([]);
      setWardName("");
      return;
    }

    let mounted = true;
    const fetchWards = async () => {
      setLocationLoading((prev) => ({ ...prev, wards: true }));
      try {
        const wards = await locationService.getWards(
          data.districtId as number
        );
        if (mounted) {
          setWardOptions(wards);
        }
      } catch (error) {
        console.error("Failed to load wards", error);
      } finally {
        if (mounted) {
          setLocationLoading((prev) => ({ ...prev, wards: false }));
        }
      }
    };
    fetchWards();
    return () => {
      mounted = false;
    };
  }, [data.districtId]);

  useEffect(() => {
    if (!data.provinceId) {
      setProvinceName("");
      return;
    }
    const province = provinceOptions.find(
      (item) => item.code === data.provinceId
    );
    if (province) {
      setProvinceName(province.name);
    }
  }, [provinceOptions, data.provinceId]);

  useEffect(() => {
    if (!data.districtId) {
      setDistrictName("");
      return;
    }
    const district = districtOptions.find(
      (item) => item.code === data.districtId
    );
    if (district) {
      setDistrictName(district.name);
    }
  }, [districtOptions, data.districtId]);

  useEffect(() => {
    if (!data.wardId) {
      setWardName("");
      return;
    }
    const ward = wardOptions.find((item) => item.code === data.wardId);
    if (ward) {
      setWardName(ward.name);
    }
  }, [wardOptions, data.wardId]);

  const locationDisplay = useMemo(() => {
    const parts = [
      data.detailAddress?.trim(),
      wardName,
      districtName,
      provinceName,
    ].filter((part) => part && part.length > 0);
    return parts.join(", ");
  }, [data.detailAddress, wardName, districtName, provinceName]);

  useEffect(() => {
    if (locationDisplay !== data.location) {
      onDataChange("location", locationDisplay);
    }
  }, [locationDisplay, data.location, onDataChange]);

  useEffect(() => {
    setIsNegotiable(Boolean(data.salaryText));
  }, [data.salaryText]);

  useEffect(() => {
    if (!touched.workHours) return;
    const invalid =
      !timeRange[0] || !timeRange[1] || !timeRange[1]?.isAfter(timeRange[0]!);
    setValidation((prev) => ({ ...prev, workHours: invalid }));
  }, [timeRange, touched.workHours]);

  useEffect(() => {
    const { workHourStart, workHourEnd, workHours } = data;
    if (workHourStart && workHourEnd) {
      setTimeRange([
        dayjs(workHourStart, "HH:mm"),
        dayjs(workHourEnd, "HH:mm"),
      ]);
      return;
    }
    const match = workHours ? workHours.match(timeRangeRegex) : null;
    if (match) {
      setTimeRange([dayjs(match[1], "HH:mm"), dayjs(match[2], "HH:mm")]);
    } else {
      setTimeRange([null, null]);
    }
  }, [data.workHourStart, data.workHourEnd, data.workHours]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Mô tả công việc...",
      height: 200,
      showPoweredBy: false,
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "alignleft",
        "aligncenter",
        "alignright",
        "|",
        "undo",
        "redo",
        "|",
        "find",
      ],
    }),
    []
  );

  const normalizeEditorText = (value: string) =>
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const handleEditorChange = useCallback(
    debounce((content: string) => {
      onDataChange("jobDescription", content);
    }, 400),
    [onDataChange]
  );

  const handleBlur = (field: keyof JobPostData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let isInvalid = false;

    const phoneRegex =
      /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;

    if (
      ["jobTitle", "detailAddress", "requirements", "contactPhone"].includes(
        field as string
      )
    ) {
      isInvalid = !value || (value as string).trim() === "";

      if (field === "contactPhone" && !isInvalid) {
        if (!phoneRegex.test((value as string).trim())) {
          isInvalid = true;
        }
      }
    }

    if (field === "jobDescription") {
      const normalized =
        typeof value === "string" ? normalizeEditorText(value) : "";
      isInvalid = !normalized || normalized.length < 20;
    }

    if (field === "categoryID") {
      isInvalid = value === null || value === undefined;
    }

    if (field === "salaryValue") {
      isInvalid = !isNegotiable && (!value || value <= 0);
    }

    if (["provinceId", "districtId", "wardId"].includes(field as string)) {
      isInvalid = !value;
    }

    if (field === "workHours") {
      const [start, end] = timeRange;
      isInvalid = !start || !end || !end.isAfter(start);
    }

    setValidation((prev) => ({ ...prev, [field]: isInvalid }));
  };

  const handleChange = (field: keyof JobPostData, value: any) => {
    onDataChange(field, value);
    if (validation[field]) {
      setValidation((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSalaryNegotiableChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setIsNegotiable(checked);

    if (checked) {
      handleChange("salaryValue", null);
      handleChange("salaryText", "Thỏa thuận");
      setValidation((prev) => ({ ...prev, salaryValue: false }));
    } else {
      handleChange("salaryText", null);
    }
  };

  const handleTimeRangeChange = (values: [Dayjs | null, Dayjs | null]) => {
    setTimeRange(values);
    setTouched((prev) => ({ ...prev, workHours: true }));

    const [start, end] = values;
    if (start && end) {
      if (!end.isAfter(start)) {
        setValidation((prev) => ({ ...prev, workHours: true }));
        handleChange("workHourStart", null);
        handleChange("workHourEnd", null);
        handleChange("workHours", "");
        return;
      }
      const formatted = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
      handleChange("workHourStart", start.format("HH:mm"));
      handleChange("workHourEnd", end.format("HH:mm"));
      handleChange("workHours", formatted);
      setValidation((prev) => ({ ...prev, workHours: false }));
      return;
    }

    handleChange("workHourStart", null);
    handleChange("workHourEnd", null);
    handleChange("workHours", "");
    setValidation((prev) => ({ ...prev, workHours: true }));
  };

  const updateLocationValidation = (field: keyof JobPostData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setValidation((prev) => ({ ...prev, [field]: !value }));
  };

  const handleProvinceChange = (value: number | null) => {
    handleChange("provinceId", value ?? null);
    handleChange("districtId", null);
    handleChange("wardId", null);
    updateLocationValidation("provinceId", value);
    setTouched((prev) => ({ ...prev, districtId: false, wardId: false }));
    setValidation((prev) => ({ ...prev, districtId: false, wardId: false }));
  };

  const handleDistrictChange = (value: number | null) => {
    handleChange("districtId", value ?? null);
    handleChange("wardId", null);
    updateLocationValidation("districtId", value);
    setTouched((prev) => ({ ...prev, wardId: false }));
    setValidation((prev) => ({ ...prev, wardId: false }));
  };

  const handleWardChange = (value: number | null) => {
    handleChange("wardId", value ?? null);
    updateLocationValidation("wardId", value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">
        Thông tin công việc
      </h3>

      <FormField label="Tên công việc" required>
        <Input
          size="large"
          placeholder="Nhập tiêu đề công việc"
          value={data.jobTitle}
          onChange={(e) => handleChange("jobTitle", e.target.value)}
          onBlur={() => handleBlur("jobTitle", data.jobTitle)}
          className={validation.jobTitle ? "border-red-500" : ""}
        />
        {validation.jobTitle && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập tiêu đề công việc
          </p>
        )}
      </FormField>

      <FormField label="Địa điểm" required>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Select
                size="large"
                placeholder="Chọn tỉnh/thành"
                loading={locationLoading.provinces}
                value={data.provinceId ?? undefined}
                options={provinceOptions.map((option) => ({
                  value: option.code,
                  label: option.name,
                }))}
                onChange={(value) => handleProvinceChange(value as number)}
                allowClear
              />
              {validation.provinceId && touched.provinceId && (
                <p className="text-red-500 text-sm mt-1">
                  Vui lòng chọn tỉnh/thành
                </p>
              )}
            </div>
            <div>
              <Select
                size="large"
                placeholder="Chọn quận/huyện"
                loading={locationLoading.districts}
                value={data.districtId ?? undefined}
                disabled={!data.provinceId}
                options={districtOptions.map((option) => ({
                  value: option.code,
                  label: option.name,
                }))}
                onChange={(value) => handleDistrictChange(value as number)}
                allowClear
              />
              {validation.districtId && touched.districtId && (
                <p className="text-red-500 text-sm mt-1">
                  Vui lòng chọn quận/huyện
                </p>
              )}
            </div>
            <div>
              <Select
                size="large"
                placeholder="Chọn phường/xã"
                loading={locationLoading.wards}
                value={data.wardId ?? undefined}
                disabled={!data.districtId}
                options={wardOptions.map((option) => ({
                  value: option.code,
                  label: option.name,
                }))}
                onChange={(value) => handleWardChange(value as number)}
                allowClear
              />
              {validation.wardId && touched.wardId && (
                <p className="text-red-500 text-sm mt-1">
                  Vui lòng chọn phường/xã
                </p>
              )}
            </div>
          </div>
          <Input
            size="large"
            placeholder="Số nhà, tên đường..."
            value={data.detailAddress}
            onChange={(e) => handleChange("detailAddress", e.target.value)}
            onBlur={() => handleBlur("detailAddress", data.detailAddress)}
            className={validation.detailAddress ? "border-red-500" : ""}
          />
          {validation.detailAddress && (
            <p className="text-red-500 text-sm mt-1">
              Vui lòng nhập địa chỉ chi tiết
            </p>
          )}
        </div>
      </FormField>

      <FormField label="Mức lương (VND)">
        <InputNumber
          size="large"
          min={0}
          className={`w-full ${validation.salaryValue ? "border-red-500" : ""}`}
          placeholder="Nhập mức lương (ví dụ: 15000000)"
          value={data.salaryValue ?? undefined}
          onChange={(value) => handleChange("salaryValue", value ?? null)}
          onBlur={() => handleBlur("salaryValue", data.salaryValue)}
          disabled={isNegotiable}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
        />
        <Checkbox
          checked={isNegotiable}
          onChange={handleSalaryNegotiableChange}
          className="mt-2"
        >
          Thỏa thuận (Không hiển thị lương)
        </Checkbox>
        {validation.salaryValue && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập mức lương hợp lệ (lớn hơn 0)
          </p>
        )}
      </FormField>

      <FormField label="Mô tả công việc" required>
        <div className={validation.jobDescription ? "jodit-invalid" : ""}>
          <JoditEditor
            ref={editor}
            value={data.jobDescription}
            config={config}
            onBlur={(newContent) => {
              handleEditorChange(newContent);
              handleBlur("jobDescription", newContent);
            }}
            onChange={() => {
              if (validation.jobDescription) {
                setValidation((prev) => ({ ...prev, jobDescription: false }));
              }
            }}
          />
        </div>
        {validation.jobDescription && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập mô tả công việc (ít nhất 20 ký tự)
          </p>
        )}
        <style>{`.jodit-invalid .jodit-container { border: 1px solid #ef4444; }`}</style>
      </FormField>

      <FormField label="Yêu cầu công việc" required>
        <Input.TextArea
          rows={3}
          placeholder="Nhập yêu cầu về kỹ năng, kinh nghiệm..."
          value={data.requirements}
          onChange={(e) => handleChange("requirements", e.target.value)}
          onBlur={() => handleBlur("requirements", data.requirements)}
          className={validation.requirements ? "border-red-500" : ""}
        />
        {validation.requirements && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập yêu cầu công việc
          </p>
        )}
      </FormField>

      <FormField label="Giờ làm việc" required>
        <Space.Compact className="w-full">
          <TimePicker
            value={timeRange[0]}
            onChange={(time) => handleTimeRangeChange([time, timeRange[1]])}
            format="HH:mm"
            placeholder="Từ"
            className={validation.workHours ? "border-red-500" : ""}
            style={{ width: "50%" }}
          />
          <TimePicker
            value={timeRange[1]}
            onChange={(time) => handleTimeRangeChange([timeRange[0], time])}
            format="HH:mm"
            placeholder="Đến"
            className={validation.workHours ? "border-red-500" : ""}
            style={{ width: "50%" }}
          />
        </Space.Compact>
        {validation.workHours && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập giờ làm hợp lệ (giờ kết thúc phải sau giờ bắt đầu)
          </p>
        )}
      </FormField>

      <FormField label="Ngành nghề" required>
        <Select
          size="large"
          placeholder={isLoading ? "Đang tải danh mục..." : "Chọn ngành nghề"}
          loading={isLoading}
          value={data.categoryID ?? undefined}
          onChange={(value) => handleChange("categoryID", value)}
          onBlur={() => handleBlur("categoryID", data.categoryID)}
          className={validation.categoryID ? "select-invalid" : ""}
          options={categories.map((cat: any) => ({
            value: cat.categoryId,
            label: cat.name,
          }))}
        />
        {validation.categoryID && (
          <p className="text-red-500 text-sm mt-1">Vui lòng chọn ngành nghề</p>
        )}
        <style>{`.select-invalid .ant-select-selector { border-color: #ef4444 !important; }`}</style>
      </FormField>

      <FormField label="Số điện thoại liên hệ" required>
        <Input
          size="large"
          placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
          value={data.contactPhone}
          onBlur={() => handleBlur("contactPhone", data.contactPhone)}
          onChange={(e) => handleChange("contactPhone", e.target.value)}
          className={validation.contactPhone ? "border-red-500" : ""}
        />
        {validation.contactPhone && (
          <p className="text-red-500 text-sm mt-1">
            {!data.contactPhone
              ? "Vui lòng nhập số điện thoại"
              : "Số điện thoại không đúng định dạng Việt Nam"}
          </p>
        )}
      </FormField>
    </div>
  );
};
