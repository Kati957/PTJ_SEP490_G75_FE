import React, { useEffect } from 'react';
import { Button, Card, Typography } from 'antd';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks';
import { JobPostingForm } from '../components/employer/JobPostingForm';
import JobPostingPreview from '../components/employer/JobPostingPreview';
import { useEmployerJobPosting } from '../employerJobHooks';
import { useNavigate } from 'react-router-dom';
import { transformToEmployerPostDto } from '../utils';

const PostJobPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { jobData, status, handleDataChange, submitPost, resetForm } = useEmployerJobPosting();

  const handleSubmit = () => {
    if (!user || !user.id) {
      toast.error('Bạn phải đăng nhập để đăng bài.');
      return;
    }

    const userIdAsNumber = user.id;
    const dto = transformToEmployerPostDto(jobData, userIdAsNumber);

    submitPost(dto);
  };

  useEffect(() => {
    if (status === 'succeeded') {
      resetForm();
      navigate('/nha-tuyen-dung/cong-viec');
    }
  }, [status, resetForm, navigate]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg border-none">
        <div className="space-y-2 p-4 md:p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            PTJ for Business
          </p>
          <Typography.Title level={3} className="!text-white !mb-0">
            Đăng bài tuyển dụng việc làm
          </Typography.Title>
          <p className="text-white/85 max-w-3xl">
            Thu hút ứng viên phù hợp bằng mô tả rõ ràng, mức lương minh bạch và thông tin liên hệ đầy đủ.
          </p>
        </div>
      </Card>

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
