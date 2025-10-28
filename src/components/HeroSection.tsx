import React, { useState, useEffect } from 'react';
import { Carousel, Input, Button, Select } from 'antd'; // Import Select
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Tuyendung1 from '../assets/Tuyendung1.png';

const { Option } = Select; // Destructure Option from Select

const SlideZalo: React.FC = () => (
  <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-center p-6 pt-24 md:pt-6">
    <div className="text-center z-10">
      <h2 className="text-3xl md:text-4xl font-bold">Part-Time Job Finder</h2>
      <p className="mt-2 text-xl md:text-2xl">nay đã có mặt trên Zalo OA</p>
      <Button 
        type="primary" 
        size="large" 
        className="mt-6 bg-green-500 hover:bg-green-600 border-none"
      >
        Tìm Hiểu Thêm
      </Button>
    </div>
  </div>
);

const SlidePromotion: React.FC = () => (
  <div className="relative h-64 md:h-80 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-center p-6 pt-24 md:pt-6">
    <div className="text-center z-10">
      <h2 className="text-3xl md:text-4xl font-bold">Tìm việc siêu tốc</h2>
      <p className="mt-2 text-xl md:text-2xl">Hàng ngàn công việc mới được cập nhật mỗi ngày</p>
      <Button type="primary" size="large" className="mt-6">
        Xem Ngay
      </Button>
    </div>
  </div>
);

// Component chính HeroSection
const HeroSection: React.FC = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]); // Thay đổi thành mảng

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = (values: string[]) => { // Nhận một mảng các giá trị
    setSelectedProvinces(values);
    // Bạn có thể làm gì đó với giá trị tỉnh đã chọn ở đây
    console.log('Selected provinces:', values);
  };

  return (
    <>     
      <section className="relative bg-blue-50">
        
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            <Input
              size="large"
              placeholder="Nhập tên vị trí, công ty, từ khoá"
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full md:flex-1 rounded-lg shadow-md !h-14 placeholder-gray-600"
            />
            
            <Select
              mode="multiple"
              showSearch
              size="large"
              placeholder="Chọn tỉnh, thành phố"
              optionFilterProp="children"
              onChange={handleProvinceChange}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              className="w-full md:flex-1 rounded-lg shadow-md !h-14 placeholder-gray-600" // Thêm class cho Select
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
              className="w-full md:w-auto rounded-lg !h-14"
            >
              <SearchOutlined />
              <span className="ml-1">Tìm kiếm</span>
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <Carousel arrows className="hero-carousel" autoplay>
            {/* Slide 1 */}
            <div className="h-64 md:h-80"> 
              <img src={Tuyendung1} alt="Tuyển dụng" className="w-full h-full object-cover" />
            </div>
            
            {/* Slide 2 */}
            <div>
              <SlidePromotion />
            </div>
          
            
          </Carousel>
        </div>

      </section>
    </>
  );
};

export default HeroSection;
