import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks';
import { JobPostingForm } from '../components/employer/JobPostingForm';
import JobPostingPreview from '../components/employer/JobPostingPreview';
import { useParams, useNavigate } from 'react-router-dom';
import jobPostService from '../jobPostService';
import type { JobPostData, JobPostView } from '../jobTypes';
import { transformToEmployerPostDto } from './PostJobPage';

const transformDtoToFormData = (dto: JobPostView): JobPostData => {
  return {
    jobTitle: dto.title,
    jobDescription: dto.description || '',
    salaryValue: dto.salary || null,
    requirements: dto.requirements || '',
    workHours: dto.workHours || '',
    location: dto.location || '',
    categoryID: dto.categoryName ? 1 : null,
    contactPhone: dto.phoneContact || '',
  };
};

const emptyState: JobPostData = {
  jobTitle: '', jobDescription: '', salaryValue: null, requirements: '',
  workHours: '', location: '', categoryID: null, contactPhone: '',
};

const EditJobPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || '0');

  const [jobData, setJobData] = useState<JobPostData>(emptyState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting'>('loading');

  useEffect(() => {
    if (!jobId || !user) {
      toast.error('ID công việc không hợp lệ hoặc bạn chưa đăng nhập.');
      navigate('/nha-tuyen-dung/cong-viec');
      return;
    }

    const fetchData = async () => {
      setStatus('loading');
      try {
        const res = await jobPostService.getJobById(jobId);
        if (res.success) {
          setJobData(transformDtoToFormData(res.data));
          setStatus('idle');
        } else {
          toast.error(res.message || 'Không tìm thấy bài đăng.');
          setStatus('idle');
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Lỗi khi tải dữ liệu.');
        setStatus('idle');
      }
    };

    fetchData();
  }, [jobId, user, navigate]);

  const handleDataChange = (field: keyof JobPostData, value: any) => {
    setJobData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id || !jobId) return;

    setStatus('submitting');
    const userIdAsNumber = user.id;
    const dto = transformToEmployerPostDto(jobData, userIdAsNumber);

    try {
      const res = await jobPostService.updateJobPost(jobId, dto);
      if (res.success) {
        toast.success(res.message);
        navigate('/nha-tuyen-dung/cong-viec');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật.');
    }
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa công việc</h1>
      
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
              loading={status === 'submitting'}
            >
              Cập nhật công việc
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

export default EditJobPage;