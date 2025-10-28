import React from 'react';
import { DatePicker, Select, Checkbox } from 'antd';
import type { JobPostData } from '../../../../pages/employer/PostJobPage';
import dayjs from 'dayjs';

const { Option } = Select;

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

// Helper
const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">
      {children}
    </div>
  </div>
);

export const PostingScheduleFormSection: React.FC<Props> = ({ data, onDataChange }) => {
  
  const postDate = data.postingDate ? dayjs(data.postingDate) : null;
  const expiryDate = postDate ? postDate.add(60, 'day').format('DD/MM/YYYY') : '...';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">Ngày đăng</h3>
      
      <FormField label="Ngày đăng" required>
        <DatePicker 
          size="large" 
          value={postDate}
          onChange={(date, dateString) => onDataChange('postingDate', dateString)}
          className="w-full"
          format="DD/MM/YYYY"
        />
      </FormField>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-start-2 col-span-2 text-sm text-gray-500">
          Ngày hết hạn: <strong className="text-gray-800">{expiryDate}</strong> (DD/MM/YYYY)
        </div>
      </div>

      <h3 className="text-xl font-bold text-blue-700 my-6">Ngôn ngữ nhận hồ sơ ứng viên</h3>
      
      <FormField label="Ngôn ngữ nhận hồ sơ ứng viên" required>
        <Select size="large" value={data.applicationLanguage} onChange={(v) => onDataChange('applicationLanguage', v)} className="w-1/2">
          <Option value="Tiếng Việt">Tiếng Việt</Option>
          <Option value="Tiếng Anh">Tiếng Anh</Option>
        </Select>
      </FormField>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-start-2 col-span-2">
          <Checkbox 
            checked={data.languageCheckbox} 
            onChange={(e) => onDataChange('languageCheckbox', e.target.checked)}
          >
            Chỉ nhận hồ sơ theo ngôn ngữ đã chọn
          </Checkbox>
        </div>
      </div>
    </div>
  );
};