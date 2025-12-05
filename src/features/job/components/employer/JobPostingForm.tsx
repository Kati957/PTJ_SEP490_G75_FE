import React from 'react';
import type { JobPostData } from '../../jobTypes';
import { JobInfoFormSection } from './JobInfoFormSection';

type OnDataChange = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => void;

interface Props {
  data: JobPostData;
  onDataChange: OnDataChange;
}


export const JobPostingForm: React.FC<Props> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
      <JobInfoFormSection data={data} onDataChange={onDataChange} />
    </div>
  );
};
