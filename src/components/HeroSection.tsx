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

const { Option } = Select;

const slideHeightClasses = "h-64 md:h-72 lg:h-[300px]";

const SlidePrimary: React.FC = () => (
  <div
    className={`relative ${slideHeightClasses} flex items-center justify-center overflow-hidden bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white`}
  >
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent)]" />
    <div className="text-center z-10 px-6">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">Tìm việc nhanh chóng</h2>
      <p className="mt-2 text-lg md:text-xl text-blue-100">Kết nối việc làm nhanh trên mọi nền tảng</p>
      <Button
        type="primary"
        size="large"
        className="mt-6 bg-white text-sky-700 border-none hover:bg-blue-100"
      >
        Tìm hiểu thêm
      </Button>
    </div>
  </div>
);

const SlideSecondary: React.FC = () => (
  <div
    className={`relative ${slideHeightClasses} flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-sky-900 text-white`}
  >
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.4),_transparent)]" />
    <div className="text-center z-10 px-6">
      <h2 className="text-3xl md:text-4xl font-bold">Tìm việc siêu tốc</h2>
      <p className="mt-2 text-lg md:text-xl text-blue-100">Hàng ngàn cơ hội mới được cập nhật mỗi ngày</p>
      <Button type="primary" size="large" className="mt-6 bg-sky-500 border-none hover:bg-sky-400">
        Xem ngay
      </Button>
    </div>
  </div>
);

const HeroSection: React.FC = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const categories = useSelector(selectCategoryList);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleProvinceChange = (values: string[]) => {
    setSelectedProvinces(values);
    console.log("Selected provinces:", values);
  };

  return (
    <section
      className="relative pt-28 pb-16 overflow-hidden"
      style={{
        backgroundImage: `url(${HomeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <Input
            size="large"
            placeholder="Nhập tên việc làm, công ty, từ khóa"
            prefix={<SearchOutlined className="text-blue-400" />}
            className="w-full md:flex-1 rounded-xl shadow-sm !h-14 placeholder-gray-600 border-gray-200 focus:border-blue-500"
          />

          <Select
            mode="multiple"
            showSearch
            size="large"
            placeholder="Chọn tỉnh, thành phố"
            optionFilterProp="children"
            onChange={handleProvinceChange}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="w-full md:w-64 rounded-xl shadow-sm !h-14 border-gray-200 focus:border-blue-500"
          >
            {provinces.map((province: any) => (
              <Option key={province.code} value={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            size="large"
            className="w-full md:w-auto rounded-xl !h-14 bg-gradient-to-r from-sky-500 to-blue-600 border-none shadow-lg"
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
                <SlidePrimary />
              </div>
              <div>
                <SlideSecondary />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
