import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  Card,
  InputNumber,
  Radio,
  message,
  Spin,
  TimePicker,
  Space,
  Empty,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { useAuth } from "../../auth/hooks";
import {
  createPosting,
  resetPostStatus,
  fetchPostById,
  updatePosting,
  fetchPostSuggestions,
} from "../slice/slice";
import { useCategories } from "../../category/hook";
import { useSubCategories } from "../../subcategory/hook";
import type {
  CreateJobSeekerPostPayload,
  UpdateJobSeekerPostPayload,
} from "../types";
import locationService, {
  type LocationOption,
} from "../../location/locationService";
import { fetchMyCvs } from "../../jobSeekerCv/services";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import JobCard from "../../homepage-jobSeeker/components/JobCard";

const { Title } = Typography;
const { TextArea } = Input;
const timeFormat = "HH:mm";

const parseTimeValue = (value?: string | null): Dayjs | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed
    .replace(/[hH]/, ":")
    .replace(/\s/g, "")
    .replace(/(\d)(?=[ap]m$)/i, "$1"); // best effort cleanup
  const [hourPart, minutePart = "00"] = normalized.split(":");
  if (!hourPart) return null;
  const hours = hourPart.padStart(2, "0").slice(-2);
  const minutes = minutePart.padEnd(2, "0").slice(0, 2);
  const formatted = `${hours}:${minutes}`;
  const parsed = dayjs(formatted, timeFormat, true);
  return parsed.isValid() ? parsed : null;
};

const CreatePostingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isCreateMode = location.pathname.includes("/tao-bai-dang-tim-viec");
  const isViewMode = location.pathname.includes("/xem-bai-dang-tim-viec");
  const isEditMode = location.pathname.includes("/sua-bai-dang-tim-viec");
  const [isReadOnly, setIsReadOnly] = useState(isViewMode);

  const { user } = useAuth();
  const { loading: isSubmitting, success, error } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.create
  );
  const { post: postDetail, loading: isLoadingDetail } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.detail
  );
  const { jobs: suggestedJobs, loading: isLoadingSuggestions } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.suggestions
  );

  const { categories, isLoading: isLoadingCategories } = useCategories();
  const selectedCategoryId = Form.useWatch("categoryID", form);
  const lastCategoryRef = useRef<number | null>(null);
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories(
    selectedCategoryId ?? null
  );
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);

  const pageTitle = isCreateMode
    ? "Tạo bài đăng tìm việc Part-time"
    : isEditMode
    ? "Chỉnh sửa bài đăng tìm việc"
    : "Chi tiết bài đăng tìm việc";
  const buttonText = isCreateMode ? "Đăng bài" : "Lưu thay đổi";

  useEffect(() => {
    setIsReadOnly(isViewMode);
  }, [isViewMode]);

  useEffect(() => {
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        message.error("Không thể tải danh sách khu vực");
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  const handleProvinceChange = useCallback(
    async (value?: number, preserveSelection = false) => {
      if (!preserveSelection) {
        form.setFieldsValue({ districtId: undefined, wardId: undefined });
      }
      setDistricts([]);
      setWards([]);
      if (!value) return;
      setLocationLoading((prev) => ({ ...prev, districts: true }));
      try {
        const data = await locationService.getDistricts(value);
        setDistricts(data);
      } catch {
        message.error("Không thể tải danh sách quận/huyện");
      } finally {
        setLocationLoading((prev) => ({ ...prev, districts: false }));
      }
    },
    [form]
  );

  const handleDistrictChange = useCallback(
    async (value?: number, preserveSelection = false) => {
      if (!preserveSelection) {
        form.setFieldsValue({ wardId: undefined });
      }
      setWards([]);
      if (!value) return;
      setLocationLoading((prev) => ({ ...prev, wards: true }));
      try {
        const data = await locationService.getWards(value);
        setWards(data);
      } catch {
        message.error("Không thể tải danh sách phường/xã");
      } finally {
        setLocationLoading((prev) => ({ ...prev, wards: false }));
      }
    },
    [form]
  );

  useEffect(() => {
    if ((isViewMode || isEditMode) && id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id, isViewMode, isEditMode]);

  useEffect(() => {
    if (isViewMode && id) {
      dispatch(fetchPostSuggestions(Number(id)));
    }
  }, [dispatch, isViewMode, id]);

  useEffect(() => {
    const normalized =
      typeof selectedCategoryId === "number"
        ? selectedCategoryId
        : selectedCategoryId
        ? Number(selectedCategoryId)
        : null;
    if (lastCategoryRef.current !== normalized) {
      lastCategoryRef.current = normalized;
      form.setFieldsValue({ subCategoryId: undefined });
    }
  }, [selectedCategoryId, form]);

  useEffect(() => {
    if (postDetail && (isViewMode || isEditMode)) {
      const fallbackParts =
        postDetail.preferredWorkHours
          ?.split("-")
          .map((part) => part.trim()) ?? [];
      const [fallbackStart, fallbackEnd] = fallbackParts;
      const startTime = parseTimeValue(
        postDetail.preferredWorkHourStart ?? fallbackStart
      );
      const endTime = parseTimeValue(
        postDetail.preferredWorkHourEnd ?? fallbackEnd
      );

      form.setFieldsValue({
        ...postDetail,
        preferredWorkHourStart: startTime || undefined,
        preferredWorkHourEnd: endTime || undefined,
        locationDetail: postDetail.preferredLocation,
        selectedCvId: postDetail.selectedCvId ?? postDetail.cvId ?? undefined,
        subCategoryId: postDetail.subCategoryId ?? undefined,
      });

      lastCategoryRef.current =
        postDetail.categoryID ?? postDetail.categoryID ?? null;

      (async () => {
        if (postDetail.provinceId) {
          await handleProvinceChange(postDetail.provinceId, true);
          if (postDetail.districtId) {
            await handleDistrictChange(postDetail.districtId, true);
          }
        }
      })();
    }
  }, [
    postDetail,
    isViewMode,
    isEditMode,
    form,
    handleProvinceChange,
    handleDistrictChange,
  ]);

  useEffect(() => {
    if (!user || isViewMode) return;
    const loadCvs = async () => {
      setIsLoadingCvs(true);
      try {
        const data = await fetchMyCvs();
        setCvOptions(data);
      } catch {
        message.error("Không thể tải danh sách CV");
      } finally {
        setIsLoadingCvs(false);
      }
    };
    loadCvs();
  }, [user, isViewMode]);

  useEffect(() => {
    if (success) {
      message.success(
        isCreateMode ? "Tạo bài đăng thành công!" : "Cập nhật thành công!"
      );
      dispatch(resetPostStatus());
      navigate("/quan-ly-bai-dang");
    }
    if (error) {
      message.error(`Thao tác thất bại: ${error}`);
      dispatch(resetPostStatus());
    }
  }, [success, error, dispatch, navigate, isCreateMode]);

  const {
    provinces: provincesLoading,
    districts: districtsLoading,
    wards: wardsLoading,
  } = locationLoading;

  const buildPreferredLocation = (values: any) => {
    const provinceName = provinces.find(
      (p) => p.code === values.provinceId
    )?.name;
    const districtName = districts.find(
      (d) => d.code === values.districtId
    )?.name;
    const wardName = wards.find((w) => w.code === values.wardId)?.name;
    return [
      values.locationDetail?.trim(),
      wardName,
      districtName,
      provinceName,
    ]
      .filter((part) => part && part.length > 0)
      .join(", ");
  };

  const onFinish = (values: any) => {
    if (!user) {
      message.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }

    const {
      locationDetail,
      provinceId,
      districtId,
      wardId,
      preferredWorkHourStart,
      preferredWorkHourEnd,
      selectedCvId,
      subCategoryId,
      ...rest
    } = values;

    const preferredLocation =
      buildPreferredLocation({ ...values, locationDetail }) || "";

    const startTime = (preferredWorkHourStart as Dayjs).format(timeFormat);
    const endTime = (preferredWorkHourEnd as Dayjs).format(timeFormat);

    const payload: CreateJobSeekerPostPayload = {
      ...rest,
      preferredLocation,
      userID: user.id,
      age: Number(rest.age),
      categoryID: Number(rest.categoryID),
      subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
      provinceId: Number(provinceId),
      districtId: Number(districtId),
      wardId: Number(wardId),
      preferredWorkHourStart: startTime,
      preferredWorkHourEnd: endTime,
      selectedCvId: selectedCvId ? Number(selectedCvId) : undefined,
    };

    if (isCreateMode) {
      dispatch(createPosting(payload));
    } else if (isEditMode && id) {
      const updatePayload: UpdateJobSeekerPostPayload = {
        ...payload,
        jobSeekerPostId: Number(id),
      };
      dispatch(updatePosting(updatePayload));
    }
  };

  const disabledTimePicker = isReadOnly;
  const MainContent = (
    <Spin spinning={isSubmitting || isLoadingDetail}>
      <Card>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Tiêu đề bài đăng"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề!" },
              { max: 120, message: "Tiêu đề không vượt quá 120 ký tự!" },
              {
                validator: (_, value) => {
                  const text = (value || "").trim();
                  if (!text) {
                    return Promise.resolve();
                  }
                  if (text.length < 5) {
                    return Promise.reject(
                      new Error("Tiêu đề phải có ít nhất 5 ký tự!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Sinh viên nam năm 2 tìm việc làm phục vụ"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="categoryID"
            label="Ngành nghề mong muốn"
            rules={[
              { required: true, message: "Vui lòng chọn ngành nghề!" },
            ]}
          >
            <Select
              placeholder="Chọn ngành nghề"
              loading={isLoadingCategories}
              disabled={isReadOnly}
              showSearch
              optionFilterProp="children"
            >
              {categories.map((category) => (
                <Select.Option
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subCategoryId"
            label="Nhóm nghề cụ thể"
            rules={[{ required: true, message: "Vui lòng chọn nhóm nghề!" }]}
          >
            <Select
              placeholder={
                selectedCategoryId ? "Chọn nhóm nghề" : "Chọn ngành trước"
              }
              disabled={isReadOnly || !selectedCategoryId}
              loading={isLoadingSubCategories}
              showSearch
              optionFilterProp="children"
            >
              {subCategories.map((sub) => (
                <Select.Option key={sub.subCategoryId} value={sub.subCategoryId}>
                  {sub.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="provinceId"
            label="Tỉnh / Thành phố"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn tỉnh/thành!",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Chọn tỉnh / thành phố"
              optionFilterProp="children"
              disabled={isReadOnly}
              loading={provincesLoading}
              onChange={(value) =>
                handleProvinceChange(value as number | undefined, false)
              }
              allowClear
            >
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.code}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="districtId"
            label="Quận / Huyện"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn quận/huyện!",
              },
            ]}
          >
            <Select
              placeholder="Chọn quận / huyện"
              disabled={isReadOnly || !form.getFieldValue("provinceId")}
              loading={districtsLoading}
              onChange={(value) =>
                handleDistrictChange(value as number | undefined, false)
              }
              allowClear
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.code}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="wardId"
            label="Phường / Xã"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn phường/xã!",
              },
            ]}
          >
            <Select
              placeholder="Chọn phường / xã"
              disabled={isReadOnly || !form.getFieldValue("districtId")}
              loading={wardsLoading}
              allowClear
            >
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.code}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="locationDetail"
            label="Địa chỉ chi tiết"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ chi tiết!",
              },
            ]}
          >
            <Input
              placeholder="Ví dụ: Số 12, đường Láng"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian làm việc mong muốn"
            required
            className="time-picker-item"
          >
            <Space.Compact className="w-full">
              <Form.Item
                name="preferredWorkHourStart"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn giờ bắt đầu!",
                  },
                ]}
              >
                <TimePicker
                  format={timeFormat}
                  placeholder="Từ"
                  style={{ width: "50%" }}
                  disabled={disabledTimePicker}
                />
              </Form.Item>
              <Form.Item
                name="preferredWorkHourEnd"
                noStyle
                dependencies={["preferredWorkHourStart"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn giờ kết thúc!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start: Dayjs | undefined = getFieldValue(
                        "preferredWorkHourStart"
                      );
                      if (!value || !start || value.isAfter(start)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Giờ kết thúc phải sau giờ bắt đầu"
                        )
                      );
                    },
                  }),
                ]}
              >
                <TimePicker
                  format={timeFormat}
                  placeholder="Đến"
                  style={{ width: "50%" }}
                  disabled={disabledTimePicker}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="phoneContact"
            label="Số điện thoại liên hệ"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^\d{10}$/,
                message: "Số điện thoại phải có 10 chữ số!",
              },
            ]}
          >
            <Input
              type="tel"
              placeholder="Nhà tuyển dụng sẽ liên hệ qua số này"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="age"
            label="Tuổi"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tuổi của bạn!",
              },
            ]}
          >
            <InputNumber
              min={16}
              max={60}
              style={{ width: "100%" }}
              disabled={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn giới tính!",
              },
            ]}
          >
            <Radio.Group disabled={isReadOnly}>
              <Radio value="Nam">Nam</Radio>
              <Radio value="Nữ">Nữ</Radio>
              <Radio value="Khác">Khác</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết về bản thân và kinh nghiệm"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả!" },
              {
                validator: (_, value) => {
                  const length = (value ?? "").trim().length;
                  return length >= 20
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "Mô tả phải có ít nhất 20 ký tự để nhà tuyển dụng hiểu rõ về bạn"
                        )
                      );
                },
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Giới thiệu về kỹ năng, kinh nghiệm làm việc..."
              readOnly={isReadOnly}
            />
          </Form.Item>

          {!isViewMode && (
            <Form.Item name="selectedCvId" label="Chọn CV đính kèm">
              <Select
                placeholder="Chọn một CV để AI ưu tiên gợi ý cho việc làm"
                loading={isLoadingCvs}
                allowClear
                showSearch
                optionFilterProp="children"
                disabled={isReadOnly}
                notFoundContent={
                  !isLoadingCvs ? "Bạn chưa có CV nào." : undefined
                }
              >
                {cvOptions.map((cv) => (
                  <Select.Option key={cv.cvid} value={cv.cvid}>
                    {cv.cvTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            {isViewMode ? (
              user &&
              postDetail &&
              user.id === postDetail.userID && (
                <Button
                  type="primary"
                  block
                  onClick={() => navigate(`/sua-bai-dang-tim-viec/${id}`)}
                >
                  Chỉnh sửa bài đăng
                </Button>
              )
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
              >
                {buttonText}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className={`${isViewMode ? "max-w-7xl" : "max-w-2xl"} mx-auto`}>
        <Title level={2} className="mb-6 text-center">
          {pageTitle}
        </Title>

        {isViewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">{MainContent}</div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Title level={4} className="mb-4 text-indigo-700">
                  <i className="fas fa-bolt mr-2"></i>
                  Công việc phù hợp
                </Title>
                <Spin spinning={isLoadingSuggestions}>
                  <div className="flex flex-col gap-4">
                    {suggestedJobs && suggestedJobs.length > 0 ? (
                      suggestedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="transform hover:scale-102 transition-transform duration-200"
                        >
                          <JobCard job={job} />
                        </div>
                      ))
                    ) : (
                      <Empty
                        description="Chưa tìm thấy công việc phù hợp"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Spin>
              </div>
            </div>
          </div>
        ) : (
          MainContent
        )}
      </div>
    </div>
  );
};

export default CreatePostingPage;
