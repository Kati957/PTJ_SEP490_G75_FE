import React, { useState, useMemo } from 'react';
import { Input, Button, Dropdown, Checkbox, Slider, InputNumber } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { jobExperiences, jobLevels, jobEducations } from '../mockData';

const MAX_SALARY = 100; // Example: 100 triệu

export const SearchBar = () => {
  const { majors } = useSelector((state: RootState) => state.findJob);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  // const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  // const [selectedEducations, setSelectedEducations] = useState<string[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // Salary filter states
  // const [salaryRange, setSalaryRange] = useState<[number, number]>([0, MAX_SALARY]);
  // const [appliedSalary, setAppliedSalary] = useState<[number, number] | null>(null);

  const [isCategoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  // const [isLevelDropdownVisible, setLevelDropdownVisible] = useState(false);
  // const [isExperienceDropdownVisible, setExperienceDropdownVisible] = useState(false);
  // const [isSalaryDropdownVisible, setSalaryDropdownVisible] = useState(false);
  // const [isEducationDropdownVisible, setEducationDropdownVisible] = useState(false);

  const allCategories = useMemo(() => majors.flatMap((major) => major.categories), [majors]);

  const filteredCategories = useMemo(() => 
    allCategories.filter((category) =>
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    )
  , [allCategories, categorySearchTerm]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string, checked: boolean) => {
    setter((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  // const totalFilters = selectedCategories.length + selectedLevels.length + selectedExperiences.length + selectedEducations.length + (appliedSalary ? 1 : 0);

  // const handleClearAllFilters = () => {
  //   setSelectedCategories([]);
  //   setSelectedLevels([]);
  //   setSelectedExperiences([]);
  //   setSelectedEducations([]);
  //   setAppliedSalary(null);
  //   setSalaryRange([0, MAX_SALARY]);
  // };

  // const handleApplySalary = () => {
  //   setAppliedSalary(salaryRange);
  //   setSalaryDropdownVisible(false);
  // };

  // const handleClearSalary = () => {
  //   setAppliedSalary(null);
  //   setSalaryRange([0, MAX_SALARY]);
  // };

  // const educationDropdownContent = (
  //   <div className="bg-white shadow-lg rounded-lg p-4" style={{ width: 250 }}>
  //     <div style={{ maxHeight: 200, overflowY: 'auto' }}>
  //       {jobEducations.map((edu) => (
  //         <div key={edu.id} className="block mb-2">
  //           <Checkbox
  //             checked={selectedEducations.includes(edu.id)}
  //             onChange={(e) => handleFilterChange(setSelectedEducations, edu.id, e.target.checked)}
  //           >
  //             {edu.name}
  //           </Checkbox>
  //         </div>
  //       ))}
  //     </div>
  //     {selectedEducations.length > 0 && (
  //       <Button type="link" icon={<DeleteOutlined />} onClick={() => setSelectedEducations([])} className="mt-4">
  //         Xóa lọc
  //       </Button>
  //     )}
  //   </div>
  // );

  const categoryDropdownContent = (
    <div className="bg-white shadow-lg rounded-lg p-4" style={{ width: 300 }}>
      <Input
        placeholder="Tìm kiếm ngành nghề"
        value={categorySearchTerm}
        onChange={(e) => setCategorySearchTerm(e.target.value)}
        className="mb-4"
      />
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {filteredCategories.map((category) => (
          <div key={category.id} className="block mb-2">
            <Checkbox
              checked={selectedCategories.includes(category.id)}
              onChange={(e) => handleFilterChange(setSelectedCategories, category.id, e.target.checked)}
            >
              {category.name}
            </Checkbox>
          </div>
        ))}
      </div>
      {selectedCategories.length > 0 && (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => setSelectedCategories([])} className="mt-4">
          Xóa lọc
        </Button>
      )}
    </div>
  );

  // const levelDropdownContent = (
  //   <div className="bg-white shadow-lg rounded-lg p-4" style={{ width: 250 }}>
  //     <div style={{ maxHeight: 200, overflowY: 'auto' }}>
  //       {jobLevels.map((level) => (
  //         <div key={level.id} className="block mb-2">
  //           <Checkbox
  //             checked={selectedLevels.includes(level.id)}
  //             onChange={(e) => handleFilterChange(setSelectedLevels, level.id, e.target.checked)}
  //           >
  //             {level.name}
  //           </Checkbox>
  //         </div>
  //       ))}
  //     </div>
  //     {selectedLevels.length > 0 && (
  //       <Button type="link" icon={<DeleteOutlined />} onClick={() => setSelectedLevels([])} className="mt-4">
  //         Xóa lọc
  //       </Button>
  //     )}
  //   </div>
  // );

  // const experienceDropdownContent = (
  //   <div className="bg-white shadow-lg rounded-lg p-4" style={{ width: 250 }}>
  //     <div style={{ maxHeight: 200, overflowY: 'auto' }}>
  //       {jobExperiences.map((exp) => (
  //         <div key={exp.id} className="block mb-2">
  //           <Checkbox
  //             checked={selectedExperiences.includes(exp.id)}
  //             onChange={(e) => handleFilterChange(setSelectedExperiences, exp.id, e.target.checked)}
  //           >
  //             {exp.name}
  //           </Checkbox>
  //         </div>
  //       ))}
  //     </div>
  //     {selectedExperiences.length > 0 && (
  //       <Button type="link" icon={<DeleteOutlined />} onClick={() => setSelectedExperiences([])} className="mt-4">
  //         Xóa lọc
  //       </Button>
  //     )}
  //   </div>
  // );

  // const salaryDropdownContent = (
  //   <div className="bg-white shadow-lg rounded-lg p-4" style={{ width: 300 }}>
  //       <p className="font-semibold">Mức lương (tháng)</p>
  //       <Slider
  //           range
  //           min={0}
  //           max={MAX_SALARY}
  //           value={salaryRange}
  //           onChange={setSalaryRange}
  //           className="my-4"
  //           tipFormatter={(value) => `${value} triệu`}
  //       />
  //       <div className="flex justify-between items-center">
  //           <InputNumber
  //               min={0}
  //               max={MAX_SALARY}
  //               value={salaryRange[0]}
  //               onChange={(val) => setSalaryRange([val ?? 0, salaryRange[1]])}
  //               formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
  //               addonAfter="triệu"
  //           />
  //           <span className="mx-2">-</span>
  //           <InputNumber
  //               min={0}
  //               max={MAX_SALARY}
  //               value={salaryRange[1]}
  //               onChange={(val) => setSalaryRange([salaryRange[0], val ?? MAX_SALARY])}
  //               formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
  //               addonAfter="triệu"
  //           />
  //       </div>
  //       <div className="flex justify-end items-center mt-6">
  //           <Button type="link" danger onClick={handleClearSalary} icon={<DeleteOutlined />}>
  //               Xóa lọc
  //           </Button>
  //           <Button type="primary" onClick={handleApplySalary}>
  //               Áp dụng
  //           </Button>
  //       </div>
  //   </div>
  // );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          size="large"
          placeholder="Nhập tên vị trí, công ty, từ khoá"
          prefix={<SearchOutlined />}
        />
        <Input
          size="large"
          placeholder="Nhập tỉnh, thành phố"
          prefix={<EnvironmentOutlined />}
        />
        <Dropdown overlay={categoryDropdownContent} trigger={['click']} visible={isCategoryDropdownVisible} onVisibleChange={setCategoryDropdownVisible}>
          <Button size="large" type={selectedCategories.length > 0 ? 'primary' : 'default'}>
            Ngành nghề {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Button type="primary" size="large" icon={<SearchOutlined />}>
          Tìm kiếm
        </Button>
      </div>
      {/* <div className="flex items-center flex-wrap gap-4 mt-4"> */}
        

        {/* <Dropdown overlay={levelDropdownContent} trigger={['click']} visible={isLevelDropdownVisible} onVisibleChange={setLevelDropdownVisible}>
          <Button size="large" type={selectedLevels.length > 0 ? 'primary' : 'default'}>
            Cấp bậc {selectedLevels.length > 0 && `(${selectedLevels.length})`}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown overlay={experienceDropdownContent} trigger={['click']} visible={isExperienceDropdownVisible} onVisibleChange={setExperienceDropdownVisible}>
          <Button size="large" type={selectedExperiences.length > 0 ? 'primary' : 'default'}>
            Kinh nghiệm {selectedExperiences.length > 0 && `(${selectedExperiences.length})`}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown overlay={salaryDropdownContent} trigger={['click']} visible={isSalaryDropdownVisible} onVisibleChange={setSalaryDropdownVisible}>
          <Button size="large" type={appliedSalary ? 'primary' : 'default'}>
            Mức lương
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown overlay={educationDropdownContent} trigger={['click']} visible={isEducationDropdownVisible} onVisibleChange={setEducationDropdownVisible}>
          <Button size="large" type={selectedEducations.length > 0 ? 'primary' : 'default'}>
            Học vấn {selectedEducations.length > 0 && `(${selectedEducations.length})`}
            <DownOutlined />
          </Button>
        </Dropdown> */}

        {/* {totalFilters > 0 && (
            <Button type="link" danger onClick={handleClearAllFilters} icon={<DeleteOutlined />}>
                Xóa lọc ({totalFilters})
            </Button>
        )} */}
      {/* </div> */}
    </div>
  );
};