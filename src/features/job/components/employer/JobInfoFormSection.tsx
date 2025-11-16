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
  Radio,
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

const { RangePicker } = TimePicker;

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

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

export const JobInfoFormSection: React.FC<Props> = ({ data, onDataChange }) => {
  const editor = useRef(null);
  const [validation, setValidation] = useState<Record<string, boolean>>({});
  const { categories, isLoading } = useCategories();

  type WorkHoursType = "range" | "text";
  const [workHoursType, setWorkHoursType] = useState<WorkHoursType>("text");
  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [workHoursText, setWorkHoursText] = useState("");

  const [isNegotiable, setIsNegotiable] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    if (touched.workHours) {
      if (workHoursType === "range") {
        const isInvalid = !timeRange[0] || !timeRange[1];
        setValidation((prev) => ({ ...prev, workHours: isInvalid }));
      } else {
        const isInvalid = !workHoursText || workHoursText.trim() === "";
        setValidation((prev) => ({ ...prev, workHours: isInvalid }));
      }
    }
  }, [timeRange, workHoursText, workHoursType, touched.workHours]);

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

  useEffect(() => {
    setIsNegotiable(data.salaryValue === 0);

    const wh = data.workHours;
    const match = wh ? wh.match(timeRangeRegex) : null;

    if (match) {
      setWorkHoursType("range");
      setTimeRange([dayjs(match[1], "HH:mm"), dayjs(match[2], "HH:mm")]);
      setWorkHoursText("");
    } else {
      setWorkHoursType("text");
      setWorkHoursText(wh || "");
      setTimeRange([null, null]);
    }
  }, [data.salaryValue, data.workHours]);

  const handleEditorChange = useCallback(
    debounce((content: string) => {
      onDataChange("jobDescription", content);
    }, 400),
    []
  );
  const handleBlur = (field: keyof JobPostData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let isInvalid = false;

    const vnPhoneRegex =
      /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;

    if (
      ["jobTitle", "location", "requirements", "contactPhone"].includes(field)
    ) {
      isInvalid = !value || (value as string).trim() === "";

      if (field === "contactPhone" && !isInvalid) {
        const phone = (value as string).trim();
        if (!vnPhoneRegex.test(phone)) {
          isInvalid = true;
        }
      }
    }

    if (field === "jobDescription") {
      isInvalid =
        !value || (value as string).trim() === "" || value === "<p><br></p>";
    }

    if (field === "categoryID") {
      isInvalid = value === null || value === undefined;
    }

    if (field === "salaryValue") {
      isInvalid = !isNegotiable && (value === null || value <= 0);
    }

    // if (field === "workHours") {
    //   if (workHoursType === "range") {
    //     isInvalid = !timeRange[0] || !timeRange[1];
    //   } else {
    //     isInvalid = !value || (value as string).trim() === "";
    //   }
    // }

    setValidation((prev) => ({ ...prev, [field]: isInvalid }));
  };

  const handleChange = (field: keyof JobPostData, value: any) => {
    onDataChange(field, value);
    if (validation[field]) {
      setValidation((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSalaryNegotiableChange = (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked;
    setIsNegotiable(isChecked);

    if (isChecked) {
      handleChange("salaryValue", 0);
      setValidation((prev) => ({ ...prev, salaryValue: false }));
    } else {
      handleChange("salaryValue", null);
    }
  };

  const handleWorkHoursTypeChange = (e: any) => {
    const newType = e.target.value as WorkHoursType;
    setWorkHoursType(newType);

    if (newType === "range") {
      setWorkHoursText("");
      handleBlur("workHours", null);
    } else {
      setTimeRange([null, null]);
      handleBlur("workHours", null);
    }
    onDataChange("workHours", "");
  };

  const handleTimeRangeChange = (values: [Dayjs | null, Dayjs | null]) => {
    setTimeRange(values);
    setTouched((prev) => ({ ...prev, workHours: true }));

    if (values[0] && values[1]) {
      const formattedString = `${values[0].format(
        "HH:mm"
      )} - ${values[1].format("HH:mm")}`;
      handleChange("workHours", formattedString);
    } else {
      handleChange("workHours", "");
    }
  };

  const handleWorkHoursTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newText = e.target.value;
    setWorkHoursText(newText);
    setTouched((prev) => ({ ...prev, workHours: true }));
    handleChange("workHours", newText);
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
        <Input
          size="large"
          placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
          value={data.location}
          onChange={(e) => handleChange("location", e.target.value)}
          onBlur={() => handleBlur("location", data.location)}
          className={validation.location ? "border-red-500" : ""}
        />
        {validation.location && (
          <p className="text-red-500 text-sm mt-1">Vui lòng nhập địa điểm</p>
        )}
      </FormField>

      <FormField label="Mức lương (VNĐ)">
        <InputNumber
          size="large"
          min={0}
          className={`w-full ${validation.salaryValue ? "border-red-500" : ""}`}
          placeholder="Nhập mức lương (ví dụ: 15000000)"
          value={
            data.salaryValue === 0 ? undefined : data.salaryValue ?? undefined
          }
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
          Thoả thuận (Không hiển thị lương)
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
            onChange={(newContent) => {
              if (validation.jobDescription) {
                setValidation((prev) => ({ ...prev, jobDescription: false }));
              }
            }}
          />
        </div>
        {validation.jobDescription && (
          <p className="text-red-500 text-sm mt-1">
            Vui lòng nhập mô tả công việc
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
            VSui lòng nhập yêu cầu công việc
          </p>
        )}
      </FormField>

      <FormField label="Giờ làm việc" required>
        <Radio.Group
          value={workHoursType}
          onChange={handleWorkHoursTypeChange}
          className="mb-2"
        >
          <Radio value="range">Theo khoảng giờ</Radio>
          <Radio value="text">Mô tả tự do</Radio>
        </Radio.Group>

        {workHoursType === "range" && (
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
        )}

        {workHoursType === "text" && (
          <Input
            size="large"
            placeholder="Ví dụ: Toàn thời gian, 8h-17h, Sau 18h..."
            value={workHoursText}
            onChange={handleWorkHoursTextChange}
            onBlur={() => handleBlur("workHours", workHoursText)}
            className={validation.workHours ? "border-red-500" : ""}
          />
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

      {/* --- Số điện thoại liên hệ (giữ nguyên) --- */}
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
              : "Số điện thoại không hợp lệ (phải là số Việt Nam)"}
          </p>
        )}
      </FormField>
    </div>
  );
};
