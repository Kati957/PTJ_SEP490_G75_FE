import React from 'react';
import type { JobPostData } from '../../../../pages/employer/PostJobPage';
import { JobInfoFormSection } from './JobInfoFormSection';
import { JobDetailsFormSection } from './JobDetailsFormSection';
import { ContactInfoFormSection } from './ContactInfoFormSection';
import { PostingScheduleFormSection } from './PostingScheduleFormSection';
import { JobBenefitsFormSection } from './JobBenefitsFormSection';

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

const CompanyInfoFormSection: React.FC<Props> = ({ data, onDataChange }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-xl font-bold text-blue-700 mb-4">Thông tin công ty</h3>
    <p>Tên công ty: {data.companyName}</p>
    <p>Số nhân viên: {data.companyEmployees}</p>
  </div>
);

export const JobPostingForm: React.FC<Props> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
      <CompanyInfoFormSection data={data} onDataChange={onDataChange} />
      <JobInfoFormSection data={data} onDataChange={onDataChange} />
      <JobBenefitsFormSection data={data} onDataChange={onDataChange} />
      <JobDetailsFormSection data={data} onDataChange={onDataChange} />
      <ContactInfoFormSection data={data} onDataChange={onDataChange} />
      <PostingScheduleFormSection data={data} onDataChange={onDataChange} />
    </div>
  );
};