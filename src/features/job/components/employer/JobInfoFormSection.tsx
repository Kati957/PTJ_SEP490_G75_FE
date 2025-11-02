// import React, { useRef, useMemo, useCallback } from 'react';
// import { Input, Radio, Space } from 'antd';
// import type { JobPostData } from '../../../../pages/employer/PostJobPage';
// import JoditEditor from 'jodit-react';
// import 'jodit/es2021/jodit.min.css';
// import debounce from 'lodash.debounce';

// interface Props {
//   data: JobPostData;
//   onDataChange: (field: keyof JobPostData, value: any) => void;
// }

// const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
//     <div className="grid grid-cols-3 gap-4 mb-4 items-start">
//         <label className="text-sm font-medium text-gray-700 text-left pt-2">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="col-span-2">
//             {children}
//         </div>
//     </div>
// );

// export const JobInfoFormSection: React.FC<Props> = ({ data, onDataChange }) => {

//   const editor = useRef(null);

//   const config = useMemo(
//     () => ({
//       readonly: false,
//       placeholder: 'Mô tả công việc...',
//       height: 200,
      
//       showPoweredBy: false, 
//       toolbarAdaptive: false,
//       buttons: [
//         'bold', 
//         'italic', 
//         'underline', 
//         '|', 
//         'ul',
//         'ol',
//         '|',
//         'alignleft',
//         'aligncenter',
//         'alignright',
//         '|', 
//         'undo', 
//         'redo',
//         '|',
//         'find'
//       ],
//     }),
//     [],
//   );

//   const handleEditorChange = useCallback(
//     debounce((content: string) => {
//       onDataChange('jobDescription', content);
//     }, 500),
//     []
//   );

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//       <h3 className="text-xl font-bold text-blue-700 mb-6">Thông tin công việc</h3>

//       <FormField label="Tên công việc" required>
//         <Input 
//           size="large" 
//           placeholder="Tên công việc" 
//           value={data.jobTitle}
//           onChange={(e) => onDataChange('jobTitle', e.target.value)}
//         />
//       </FormField>

//       <FormField label="Địa điểm" required>
//         <Space direction="vertical" className="w-full">
//           <Input size="large" placeholder="Địa điểm làm việc (từ các tùy chọn)" />
//           <Input size="large" placeholder="Địa điểm làm việc (từ danh sách văn phòng)" />
//         </Space>
//       </FormField>

//       <FormField label="Lương" required>
//         <Radio.Group 
//           defaultValue="negotiable" 
//           onChange={(e) => onDataChange('salaryType', e.target.value)}
//         >
//           <Radio value="range">Nhập</Radio>
//           <Radio value="exact">Hơn</Radio>
//           <Radio value="negotiable">Thương lượng</Radio>
//           <Radio value="competitive">Cạnh tranh</Radio>
//         </Radio.Group>
//       </FormField>

//       <FormField label="Mô tả công việc" required>
//         <JoditEditor
//           ref={editor}
//           value={data.jobDescription}
//           config={config}
//           onChange={handleEditorChange}
//         />
//       </FormField>

//     </div>
//   );
// };

import React, { useRef, useMemo, useCallback } from 'react';
import { Input, Radio, InputNumber, Select } from 'antd';
import type { JobPostData } from '../../../../pages/employer/PostJobPage';
import JoditEditor from 'jodit-react';
import debounce from 'lodash.debounce';
import 'jodit/es2021/jodit.min.css';

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">{children}</div>
  </div>
);

export const JobInfoFormSection: React.FC<Props> = ({ data, onDataChange }) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Mô tả công việc...',
      height: 200,
      showPoweredBy: false,
      toolbarAdaptive: false,
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'ul',
        'ol',
        '|',
        'alignleft',
        'aligncenter',
        'alignright',
        '|',
        'undo',
        'redo',
        '|',
        'find',
      ],
    }),
    []
  );

  const handleEditorChange = useCallback(
    debounce((content: string) => {
      onDataChange('jobDescription', content);
    }, 400),
    []
  );

  return (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-xl font-bold text-blue-700 mb-6">Thông tin công việc</h3>

    {/* --- Tên công việc --- */}
    <FormField label="Tên công việc" required>
      <Input
        size="large"
        placeholder="Nhập tiêu đề công việc"
        value={data.jobTitle}
        onChange={(e) => onDataChange('jobTitle', e.target.value)}
        required
      />
    </FormField>

    {/* --- Địa điểm --- */}
    <FormField label="Địa điểm" required>
      <Input
        size="large"
        placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
        value={data.location}
        onChange={(e) => onDataChange('location', e.target.value)}
        required
      />
    </FormField>

    {/* --- Hình thức lương --- */}
    <FormField label="Hình thức lương" required>
      <Radio.Group
        value={data.salaryType}
        onChange={(e) => onDataChange('salaryType', e.target.value)}
      >
        <Radio value="range">Theo khoảng</Radio>
        <Radio value="exact">Mức cụ thể</Radio>
        <Radio value="negotiable">Thương lượng</Radio>
        <Radio value="competitive">Cạnh tranh</Radio>
      </Radio.Group>
    </FormField>

    {/* --- Mức lương --- */}
    {data.salaryType !== 'negotiable' && data.salaryType !== 'competitive' && (
      <FormField label="Mức lương (VNĐ)">
        <InputNumber
          size="large"
          min={0}
          className="w-full"
          placeholder="Nhập mức lương"
          value={data.salaryValue ?? undefined}
          onChange={(value) => onDataChange('salaryValue', value ?? null)}
          required
        />
      </FormField>
    )}

    {/* --- Mô tả công việc --- */}
    <FormField label="Mô tả công việc" required>
      <JoditEditor
        ref={editor}
        value={data.jobDescription}
        config={config}
        onBlur={(newContent) => handleEditorChange(newContent)}
      />
    </FormField>

    {/* --- Yêu cầu công việc --- */}
    <FormField label="Yêu cầu công việc" required>
      <Input.TextArea
        rows={3}
        placeholder="Nhập yêu cầu về kỹ năng, kinh nghiệm..."
        value={data.requirements}
        onChange={(e) => onDataChange('requirements', e.target.value)}
      />
    </FormField>

    {/* --- Giờ làm việc --- */}
    <FormField label="Giờ làm việc" required>
      <Input
        size="large"
        placeholder="Ví dụ: Toàn thời gian, 8h-17h..."
        value={data.workHours}
        onChange={(e) => onDataChange('workHours', e.target.value)}
      />
    </FormField>

    {/* --- Danh mục công việc (CategoryID) --- */}
    <FormField label="Ngành nghề / Danh mục" required>
      <Select
        placeholder="Chọn ngành nghề"
        value={data.categoryID ?? undefined}
        onChange={(value) => onDataChange('categoryID', value)}
        options={[
          { value: 1, label: 'Công nghệ thông tin' },
          { value: 2, label: 'Kế toán - Tài chính' },
          { value: 3, label: 'Marketing' },
          { value: 4, label: 'Giáo dục' },
        ]}
      />
    </FormField>

    {/* --- Số điện thoại liên hệ --- */}
    <FormField label="Số điện thoại liên hệ" required>
      <Input
        size="large"
        placeholder="Nhập số điện thoại"
        value={data.contactPhone}
        onChange={(e) => onDataChange('contactPhone', e.target.value)}
      />
    </FormField>
  </div>
);

};
