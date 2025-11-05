import React from 'react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks';
import { JobPostingForm } from '../components/employer/JobPostingForm';
import JobPostingPreview from '../components/employer/JobPostingPreview';
import { useEmployerJobPosting } from '../employerJobHooks';
import type { JobPostData } from '../jobTypes';

export const transformToEmployerPostDto = (data: JobPostData, userId: number) => ({
  userID: userId,
  title: data.jobTitle,
  description: data.jobDescription,
  salary: (data.salaryType === 'negotiable' || data.salaryType === 'competitive') ? null : data.salaryValue,
  requirements: data.requirements,
  workHours: data.workHours,
  location: data.location,
  categoryID: data.categoryID,
  phoneContact: data.contactPhone,
});

const PostJobPage: React.FC = () => {
  const { user } = useAuth();
  
  const { jobData, status, handleDataChange, submitPost } = useEmployerJobPosting();

  const handleSubmit = () => {
    if (!user || !user.id) {
      toast.error('Bạn phải đăng nhập để đăng bài.');
      return;
    }

    const userIdAsNumber = user.id;
    const dto = transformToEmployerPostDto(jobData, userIdAsNumber);

    submitPost(dto);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Đăng công việc</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <main className="md:col-span-3 space-y-6">
          <JobPostingForm 
            data={jobData} 
            onDataChange={handleDataChange} 
          />
          <div className="flex justify-end p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <Button 
              type="primary" 
              size="large"
              onClick={handleSubmit}
              loading={status === 'loading'}
            >
              Đăng tuyển dụng
            </Button>
          </div>
        </main>
        
        <aside className="md:col-span-2">
            <JobPostingPreview data={jobData} />
        </aside>
      </div>
    </div>
  );
};

export default PostJobPage;
