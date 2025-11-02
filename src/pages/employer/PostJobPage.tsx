import React, { useState } from 'react';
import { JobPostingForm } from '../../features/job/components/employer/JobPostingForm';
import JobPostingPreview from '../../features/job/components/employer/JobPostingPreview';
import { SimpleProgressBar } from '../../components/SimpleProgressBar';
import { useAuth } from '../../features/auth/hooks';
import { message } from 'antd';
import baseService from '../../services/baseService';
import jobPostService from '../../features/job/components/employer/jobPostService';

export interface JobPostData {
  // Thông tin công ty
  // companyName: string;
  // companyEmployees: string;
  // companyWebsite: string;
  // companySummary: string;

  // // Thông tin công việc
  // jobTitle: string;
  // locations: string[];
  // salaryType: 'negotiable' | 'range' | 'exact' | 'competitive';
  // jobDescription: string;
  // jobBenefits: string;

  // // Chi tiết công việc 
  // educationLevel: string;
  // experienceLevel: string;
  // jobLevel: string;
  // jobType: string;
  // gender: string;
  // jobCode: string;
  // industry: string;
  // keywords: string[];
  // ageRange: string;

  // // Thông tin liên hệ 
  // contactPerson: string;
  // contactPhone: string;
  // contactAddress: string;
  // contactDescription: string;

  // // Ngày đăng 
  // postingDate: string;
  // applicationLanguage: string;
  // languageCheckbox: boolean;

  jobTitle: string;   
  jobDescription: string; 
  salaryValue: number | null; 
  requirements: string;
  workHours: string;      
  location: string;      
  categoryID: number | null; 
  contactPhone: string;     

  salaryType: 'negotiable' | 'range' | 'exact' | 'competitive';
  
}

export interface EmployerPostDto {
  userID: number;
  title: string;
  description: string | null;
  salary: number | null;
  requirements: string | null;
  workHours: string | null;
  location: string | null;
  categoryID: number | null;
  phoneContact: string | null;
}

export const transformToEmployerPostDto = (data: JobPostData, userId: number): EmployerPostDto => ({
  userID: userId,
  title: data.jobTitle,
  description: data.jobDescription || null,
  salary:
    data.salaryType === 'negotiable' || data.salaryType === 'competitive'
      ? null
      : data.salaryValue,
  requirements: data.requirements || null,
  workHours: data.workHours || null,
  location: data.location || null,
  categoryID: data.categoryID,
  phoneContact: data.contactPhone || null,
});

const PostJobPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [jobData, setJobData] = useState<JobPostData>({
    jobTitle: '',
    jobDescription: '',
    salaryValue: null,
    requirements: '',
    workHours: '',
    location: '',
    categoryID: null,
    contactPhone: '',
    salaryType: 'negotiable',
  });

  const handleDataChange = (field: keyof JobPostData, value: any) => {
    setJobData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id) {
      message.error('Bạn phải đăng nhập để đăng bài.');
      return;
    }

    setIsLoading(true);
    const dto = transformToEmployerPostDto(jobData, Number(user.id));

    try {
      const response = await jobPostService.createJobPost(dto);

      if (response.success) {
        message.success(response.message || 'Đăng việc thành công!');
        // Reset form nếu cần
        setJobData({
          jobTitle: '',
          jobDescription: '',
          salaryValue: null,
          requirements: '',
          workHours: '',
          location: '',
          categoryID: null,
          contactPhone: '',
          salaryType: 'negotiable',
        });
      } else {
        message.error(response.message || 'Đăng việc thất bại.');
      }
    } catch (error: any) {
      console.error('Job Post Error:', error);
      message.error(error.response?.data?.message || 'Lỗi máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Đăng công việc</h1>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-60"
        >
          {isLoading ? 'Đang đăng...' : 'Đăng ngay'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <main className="md:col-span-3 space-y-6">
          <JobPostingForm data={jobData} onDataChange={handleDataChange} />
        </main>
        <aside className="md:col-span-2">
          <JobPostingPreview data={jobData} />
        </aside>
      </div>
    </div>
  );
};
export default PostJobPage;