import React from 'react';
import { Input } from 'antd';
import type { JobPostData } from '../../../../pages/employer/PostJobPage';

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

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

export const ContactInfoFormSection: React.FC<Props> = ({ data, onDataChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">Thông tin liên hệ</h3>

      <FormField label="Người liên hệ" required>
        <Input size="large" value={data.contactPerson} onChange={(e) => onDataChange('contactPerson', e.target.value)} />
      </FormField>

      <FormField label="Điện thoại liên lạc">
        <Input size="large" value={data.contactPhone} onChange={(e) => onDataChange('contactPhone', e.target.value)} />
      </FormField>

      <FormField label="Địa chỉ liên hệ" required>
        <Input size="large" value={data.contactAddress} onChange={(e) => onDataChange('contactAddress', e.target.value)} />
      </FormField>

      <FormField label="Mô tả">
        <Input.TextArea rows={5} value={data.contactDescription} onChange={(e) => onDataChange('contactDescription', e.target.value)} />
      </FormField>
    </div>
  );
};