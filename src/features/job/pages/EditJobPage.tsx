import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks';
import { JobPostingForm } from '../components/employer/JobPostingForm';
import JobPostingPreview from '../components/employer/JobPostingPreview';
import jobPostService from '../jobPostService';
import type { JobPostData, JobPostView } from '../jobTypes';
import { transformToEmployerPostDto } from '../utils';

const transformDtoToFormData = (dto: JobPostView): JobPostData => {
  const normalizedImages =
    dto.images?.map((img) => ({ imageId: img.imageId, url: img.url })) ??
    (dto.imageUrls ?? []).map((url, index) => ({
      imageId: -(index + 1),
      url,
    }));

  return {
    jobTitle: dto.title,
    jobDescription: dto.description || '',
    salaryMin: dto.salaryMin ?? null,
    salaryMax: dto.salaryMax ?? null,
    salaryType: dto.salaryType ?? null,
    salaryDisplay: dto.salaryDisplay ?? null,
    requirements: dto.requirements || '',
    workHours: dto.workHours || '',
    workHourStart: dto.workHourStart || null,
    workHourEnd: dto.workHourEnd || null,
    detailAddress: dto.detailAddress || '',
    provinceId: dto.provinceId ?? null,
    districtId: dto.districtId ?? null,
    wardId: dto.wardId ?? null,
    location: dto.location || '',
    categoryID: dto.categoryId ?? null,
    contactPhone: dto.phoneContact || '',
    images: [],
    imagePreviews: [],
    existingImages: normalizedImages,
    deleteImageIds: [],
    expiredAt: dto.expiredAtText ?? null,
  };
};

const emptyState: JobPostData = {
  jobTitle: '',
  jobDescription: '',
  salaryMin: null,
  salaryMax: null,
  salaryType: null,
  salaryDisplay: null,
  requirements: '',
  workHours: '',
  workHourStart: null,
  workHourEnd: null,
  detailAddress: '',
  provinceId: null,
  districtId: null,
  wardId: null,
  location: '',
  categoryID: null,
  contactPhone: '',
  images: [],
  imagePreviews: [],
  existingImages: [],
  deleteImageIds: [],
  expiredAt: null,
};

const EditJobPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || '0', 10);

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
        if (res.success && res.data) {
          setJobData(transformDtoToFormData(res.data));
          setStatus('idle');
        } else {
          toast.error(res.message || 'Không tìm thấy bài đăng.');
          setStatus('idle');
        }
      } catch (err) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Lỗi khi tải dữ liệu.';
        toast.error(errorMessage);
        setStatus('idle');
      }
    };

    fetchData();
  }, [jobId, user, navigate]);

  const handleDataChange = <K extends keyof JobPostData>(field: K, value: JobPostData[K]) => {
    setJobData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user.id || !jobId) return;

    setStatus('submitting');
    const dto = transformToEmployerPostDto(jobData, user.id);

    try {
      const res = await jobPostService.updateJobPost(jobId, dto);
      if (res.success) {
        toast.success(res.message);
        navigate('/nha-tuyen-dung/cong-viec');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Lỗi khi cập nhật.';
      toast.error(errorMessage);
    }
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa công việc</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <main className="md:col-span-3 space-y-6">
          <JobPostingForm data={jobData} onDataChange={handleDataChange} />
          <div className="flex justify-end p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <Button type="primary" size="large" onClick={handleSubmit} loading={status === 'submitting'}>
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
