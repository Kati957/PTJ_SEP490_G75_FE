import React, { useState } from 'react';
import { JobPostingForm } from '../../features/job/components/employer/JobPostingForm';
import { JobPostingPreview } from '../../features/job/components/employer/JobPostingPreview';
import { SimpleProgressBar } from '../../components/SimpleProgressBar';

export interface JobPostData {
  // Thông tin công ty
  companyName: string;
  companyEmployees: string;
  companyWebsite: string;
  companySummary: string;

  // Thông tin công việc
  jobTitle: string;
  locations: string[];
  salaryType: 'negotiable' | 'range' | 'exact' | 'competitive';
  jobDescription: string;
  jobBenefits: string;

  // Chi tiết công việc 
  educationLevel: string;
  experienceLevel: string;
  jobLevel: string;
  jobType: string;
  gender: string;
  jobCode: string;
  industry: string;
  keywords: string[];
  ageRange: string;

  // Thông tin liên hệ 
  contactPerson: string;
  contactPhone: string;
  contactAddress: string;
  contactDescription: string;

  // Ngày đăng 
  postingDate: string;
  applicationLanguage: string;
  languageCheckbox: boolean;
}

const PostJobPage: React.FC = () => {
  const [jobData, setJobData] = useState<JobPostData>({
    // Thông tin công ty
    companyName: 'zTech',
    companyEmployees: '100 - 499',
    companyWebsite: '',
    companySummary: '',

    // Thông tin công việc
    jobTitle: '',
    locations: [''],
    salaryType: 'negotiable',
    jobDescription: '',
    jobBenefits: '',
    
    // Chi tiết công việc
    educationLevel: 'Cử nhân',
    experienceLevel: '1 - 2 năm kinh nghiệm',
    jobLevel: 'Mới đi làm',
    jobType: 'Nhân viên bán thời gian',
    gender: 'Bất kỳ',
    jobCode: 'AAZZZ',
    industry: 'Bán lẻ / Bán sỉ',
    keywords: ['Nhân Viên Bán Hàng'],
    ageRange: 'Trên 18',

    // Thông tin liên hệ
    contactPerson: 'Donna Goldberg',
    contactPhone: '0918222222',
    contactAddress: '192 Lê Duẩn, Quận Hải Châu, Đà Nẵng, Việt Nam',
    contactDescription: '',

    // Ngày đăng
    postingDate: '2025-10-26',
    applicationLanguage: 'Tiếng Việt',
    languageCheckbox: false,
  });

  const handleDataChange = (
    section: keyof JobPostData, 
    value: any
  ) => {
    setJobData(prevData => ({
      ...prevData,
      [section]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Đăng công việc</h1>
      <SimpleProgressBar 
        percent={20} 
        label="Chi còn 4 bước nữa để hoàn thành công việc của bạn" 
      />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <main className="md:col-span-3 space-y-6">
          <JobPostingForm 
            data={jobData} 
            onDataChange={handleDataChange} 
          />
        </main>
        <aside className="md:col-span-2">
            <JobPostingPreview data={jobData} />
        </aside>
      </div>
    </div>
  );
};

export default PostJobPage;