import React from 'react';
import type { JobPostData } from '../../jobTypes';
import { JobInfoFormSection } from './JobInfoFormSection';
interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}


export const JobPostingForm: React.FC<Props> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
      <JobInfoFormSection data={data} onDataChange={onDataChange} />
    </div>
  );
};