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
  DatePicker,
  Space,
  message,
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
import { DeleteOutlined } from "@ant-design/icons";
import {
  isNegotiableSalary,
  salaryTypeOptions,
  type SalaryTypeCode,
} from "../../../../utils/salary";
import type { Category } from "../../../category/type";

type OnDataChange = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => void;

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
const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const JobInfoFormSection: React.FC<{
  data: JobPostData;
  onDataChange: OnDataChange;
}> = ({ data, onDataChange }) => {
  const editor = useRef(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { categories, isLoading } = useCategories();

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const [validation, setValidation] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Dayjs | null>(null);

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

  const disablePastDates = (current: Dayjs) => {
    if (!current) return false;
    return current.startOf("day").isBefore(dayjs().startOf("day"));
  };

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
    setIsNegotiable(
      isNegotiableSalary(data.salaryMin, data.salaryMax, data.salaryType)
    );
  }, [data.salaryMin, data.salaryMax, data.salaryType]);

  const validateSalaryFields = useCallback(() => {
    if (isNegotiable) {
      setValidation((prev) => ({
        ...prev,
        salaryRange: false,
        salaryType: false,
      }));
      return;
    }

    const hasMin =
      typeof data.salaryMin === "number" && data.salaryMin > 0;
    const hasMax =
      typeof data.salaryMax === "number" && data.salaryMax > 0;

    const rangeInvalid =
      (!hasMin && !hasMax) ||
      (hasMin &&
        hasMax &&
        (data.salaryMax ?? 0) < (data.salaryMin ?? 0));

    setValidation((prev) => ({
      ...prev,
      salaryRange: rangeInvalid,
      salaryType: data.salaryType == null,
    }));
  }, [data.salaryMin, data.salaryMax, data.salaryType, isNegotiable]);

  useEffect(() => {
    validateSalaryFields();
  }, [validateSalaryFields]);

  useEffect(() => {
    if (data.expiredAt) {
      const parsed = dayjs(data.expiredAt, "DD/MM/YYYY", true);
      setExpiryDate(parsed.isValid() ? parsed : null);
    } else {
      setExpiryDate(null);
    }
  }, [data.expiredAt]);

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
  }, [data]);

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

  const handleEditorChange = useMemo(
    () =>
      debounce((content: string) => {
        onDataChange("jobDescription", content);
      }, 400),
    [onDataChange]
  );

  useEffect(
    () => () => {
      if (typeof handleEditorChange.cancel === "function") {
        handleEditorChange.cancel();
      }
    },
    [handleEditorChange]
  );

  const handleBlur = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => {
    if (field === "expiredAt") {
      return;
    }
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

    if (field === "expiredAt") {
      isInvalid = !value;
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

  const handleChange = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => {
    onDataChange(field, value);
    if (validation[field]) {
      setValidation((prev) => ({ ...prev, [field]: false }));
    }
  };

  const clearSalaryDisplayIfNeeded = () => {
    if (data.salaryDisplay) {
      handleChange("salaryDisplay", null);
    }
  };

  const handleSalaryNegotiableChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setIsNegotiable(checked);

    if (checked) {
      handleChange("salaryMin", null);
      handleChange("salaryMax", null);
      handleChange("salaryType", null);
    } else if (!data.salaryType) {
      handleChange("salaryType", 4 as SalaryTypeCode);
    }

    clearSalaryDisplayIfNeeded();

    setValidation((prev) => ({
      ...prev,
      salaryRange: false,
      salaryType: false,
    }));
  };

  const handleSalaryNumberChange = (
    field: "salaryMin" | "salaryMax",
    value: number | null
  ) => {
    clearSalaryDisplayIfNeeded();
    if (typeof value === "number" && value < 0) {
      handleChange(field, null);
      return;
    }
    handleChange(field, value ?? null);
  };


  const handleExpiredDateChange = (value: Dayjs | null) => {
    setExpiryDate(value);
    setTouched((prev) => ({ ...prev, expiredAt: true }));
    if (value) {
      handleChange("expiredAt", value.format("DD/MM/YYYY"));
      setValidation((prev) => ({ ...prev, expiredAt: false }));
    } else {
      handleChange("expiredAt", null);
      setValidation((prev) => ({ ...prev, expiredAt: true }));
    }
  };

  const handleTimeRangeChange = (values: [Dayjs | null, Dayjs | null]) => {
    setTimeRange(values);
    setTouched((prev) => ({ ...prev, workHours: true }));

    const [start, end] = values;
    if (start && end) {
      if (!end.isAfter(start)) {
        setValidation((prev) => ({ ...prev, workHours: true }));
        return;
      }
      const formatted = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
      handleChange("workHourStart", start.format("HH:mm"));
      handleChange("workHourEnd", end.format("HH:mm"));
      handleChange("workHours", formatted);
      setValidation((prev) => ({ ...prev, workHours: false }));
      return;
    }

    // Chưa đủ 2 mốc giờ: cho phép người dùng chọn tiếp, không xóa giá trị cũ.
    setValidation((prev) => ({ ...prev, workHours: true }));
  };

  const updateLocationValidation = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => {
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

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const totalSelected = data.images.length + data.existingImages.length;
    const remainingSlots = MAX_IMAGE_COUNT - totalSelected;
    if (remainingSlots <= 0) {
      message.warning(`Chỉ được tải tối đa ${MAX_IMAGE_COUNT} ảnh.`);
      event.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const validFiles: File[] = [];

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        message.warning(`${file.name} không phải là hình ảnh hợp lệ.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        message.warning(
          `${file.name} vượt quá ${MAX_IMAGE_SIZE_MB}MB.`
        );
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    try {
      const previews = await Promise.all(validFiles.map(fileToBase64));
      handleChange("images", [...data.images, ...validFiles]);
      handleChange("imagePreviews", [...data.imagePreviews, ...previews]);
    } catch (error) {
      console.error("Failed to read images", error);
      message.error("Không thể đọc một số ảnh. Vui lòng thử lại.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, idx) => idx !== index);
    const newPreviews = data.imagePreviews.filter((_, idx) => idx !== index);
    handleChange("images", newImages);
    handleChange("imagePreviews", newPreviews);
  };

  const handleRemoveExistingImage = (imageId: number) => {
    if (data.deleteImageIds.includes(imageId)) {
      return;
    }
    if (imageId > 0) {
      handleChange("deleteImageIds", [...data.deleteImageIds, imageId]);
    }
    handleChange(
      "existingImages",
      data.existingImages.filter((img) => img.imageId !== imageId)
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">
       Vui lòng điền thông tin cho bài đăng tuyển dụng
      </h3>

      <FormField label="Tiêu đề bài tuyển dụng" required>
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

      <FormField label="Địa điểm nơi làm việc" required>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InputNumber
            size="large"
            min={0}
            className={`w-full ${validation.salaryRange ? "border-red-500" : ""}`}
            placeholder="Tối thiểu (VD: 15000000)"
            value={data.salaryMin ?? undefined}
            disabled={isNegotiable}
            onChange={(value) =>
              handleSalaryNumberChange("salaryMin", value ?? null)
            }
          />
          <InputNumber
            size="large"
            min={0}
            className={`w-full ${validation.salaryRange ? "border-red-500" : ""}`}
            placeholder="Tối đa"
            value={data.salaryMax ?? undefined}
            disabled={isNegotiable}
            onChange={(value) =>
              handleSalaryNumberChange("salaryMax", value ?? null)
            }
          />
          <Select
            size="large"
            placeholder="Loại lương"
            value={data.salaryType ?? undefined}
            disabled={isNegotiable}
            onChange={(value) => {
              clearSalaryDisplayIfNeeded();
              handleChange("salaryType", value);
            }}
            options={salaryTypeOptions.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            className={validation.salaryType ? "select-invalid" : ""}
          />
        </div>
        <Checkbox
          checked={isNegotiable}
          onChange={handleSalaryNegotiableChange}
          className="mt-2"
        >
          Thỏa thuận (Không hiển thị mức lương)
        </Checkbox>
        {validation.salaryRange && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập mức lương hợp lệ.
          </p>
        )}
        {validation.salaryType && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng chọn loại lương.
          </p>
        )}
      </FormField>

      <FormField label="Ngày hết hạn" required>
        <DatePicker
          format="DD/MM/YYYY"
          value={expiryDate}
          onChange={handleExpiredDateChange}
          onBlur={() => handleBlur("expiredAt", data.expiredAt)}
          disabledDate={disablePastDates}
          size="large"
          placeholder="Chọn ngày hết hạn"
          style={{ width: "100%" }}
          className={validation.expiredAt ? "border-red-500" : ""}
        />
        {validation.expiredAt && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng chọn ngày hết hạn hợp lệ
          </p>
        )}
      </FormField>

      <FormField label="Mô tả công việc cần tuyển dụng" required>
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

      <FormField label="Hình ảnh bài đăng">
        <div className="space-y-3">
          {data.existingImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Hình ảnh hiện có ({data.existingImages.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.existingImages.map((img) => (
                  <div
                    key={img.imageId}
                    className="relative rounded-lg overflow-hidden border border-gray-200 group"
                  >
                    <img
                      src={img.url}
                      alt={`existing-${img.imageId}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.imageId)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <DeleteOutlined className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageInputChange}
              className="block w-full text-sm text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ tải tối đa {MAX_IMAGE_COUNT} ảnh, mỗi ảnh không quá {MAX_IMAGE_SIZE_MB}MB.
            </p>
          </div>

          {data.imagePreviews.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Hình ảnh mới ({data.imagePreviews.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.imagePreviews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <DeleteOutlined className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormField>

      <FormField label="Yêu cầu công việc cho ứng viên" required>
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
          options={categories.map((cat: Category) => ({
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
}
