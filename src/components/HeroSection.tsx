import React, { useEffect, useState } from "react";
import { Carousel, Input, Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Tuyendung1 from "../assets/anhlidehomepage.png";
import HomeBackground from "../assets/anhhome.png";
import {
  fetchCategories,
  selectCategoryList,
} from "../features/category/slice";
import type { AppDispatch } from "../app/store";
import locationService, {
  type LocationOption,
} from "../features/location/locationService";
import type { JobSearchFilters } from "../features/findJob-jobSeeker/types";

const { Option } = Select;

const slideHeightClasses = "h-64 md:h-72 lg:h-[300px]";

type SlidePrimaryProps = {
  onViewMore: () => void;
};

const SlidePrimary: React.FC<SlidePrimaryProps> = ({ onViewMore }) => (
  <div
    className={`relative ${slideHeightClasses} flex items-center justify-center overflow-hidden bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white`}
  >
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent)]" />
    <div className="text-center z-10 px-6">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">
        Part-Time Job Finder
      </h2>
      <p className="mt-2 text-lg md:text-xl text-blue-100">
        Kết nối việc làm nhanh chóng, dễ dàng
      </p>
      <Button
        type="primary"
        size="large"
        className="mt-6 bg-white text-sky-700 border-none hover:bg-blue-100"
        onClick={onViewMore}
      >
        Xem thêm
      </Button>
    </div>
  </div>
);

const HeroSection: React.FC = () => {
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const categories = useSelector(selectCategoryList);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvince(true);
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setProvinces([]);
      } finally {
        setLoadingProvince(false);
      }
    };

    fetchProvinces();
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearchNavigate = () => {
    const nextFilters: Partial<JobSearchFilters> = {};
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      nextFilters.keyword = trimmedKeyword;
    }
    if (selectedProvince) {
      nextFilters.provinceId = selectedProvince;
    }

    navigate("/viec-lam", { state: nextFilters });
  };

  const handleViewMoreJobs = () => {
    navigate("/viec-lam");
  };

  return (
    <section
      className="relative py-14 md:py-16 overflow-hidden"
      style={{
        backgroundImage: `url(${HomeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <Input
            size="large"
            placeholder="Nhập tên việc làm"
            prefix={<SearchOutlined className="text-blue-400" />}
            className="w-full md:flex-1 rounded-xl shadow-sm !h-14 placeholder-gray-600 border-gray-200 focus:border-blue-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearchNavigate}
            allowClear
          />

          <Select
            showSearch
            size="large"
            placeholder="Chọn tỉnh/thành phố"
            optionFilterProp="children"
            value={selectedProvince ?? undefined}
            onChange={(value) => setSelectedProvince(value ?? null)}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            loading={loadingProvince}
            allowClear
            className="w-full md:w-64 rounded-xl shadow-sm !h-14 border-gray-200 focus:border-blue-500"
          >
            {provinces.map((province) => (
              <Option key={province.code} value={province.code}>
                {province.name}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            size="large"
            className="w-full md:w-auto rounded-xl !h-14 bg-gradient-to-r from-sky-500 to-blue-600 border-none shadow-lg"
            onClick={handleSearchNavigate}
          >
            <SearchOutlined />
            <span className="ml-1">Tìm kiếm</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-stretch">
          <div
            className="hidden lg:block rounded-[32px] border border-white/20 overflow-hidden shadow-lg h-[300px]"
            style={{
              background: "linear-gradient(135deg, #5B247A 0%, #1B1464 100%)",
            }}
          >
            <div className="p-4 h-full flex flex-col">
              <h3 className="text-white font-bold text-lg mb-3 px-2">
                Danh mục nghề nghiệp
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <style>
                  {`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(255, 255, 255, 0.3);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(255, 255, 255, 0.5);
                    }
                  `}
                </style>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.categoryId}>
                      <div
                        onClick={() => {
                          navigate("/viec-lam", {
                            state: {
                              categoryId: category.categoryId,
                              categoryName: category.name,
                            },
                          });
                        }}
                        className="block px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm truncate cursor-pointer"
                        title={category.name}
                      >
                        {category.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] overflow-hidden border border-gray-200 shadow-[0_25px_80px_rgba(15,23,42,0.35)] bg-white">
            <Carousel arrows autoplay dots className="hero-carousel">
              <div className={slideHeightClasses}>
                <img
                  src={Tuyendung1}
                  alt="Tuyen dung"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <SlidePrimary onViewMore={handleViewMoreJobs} />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
