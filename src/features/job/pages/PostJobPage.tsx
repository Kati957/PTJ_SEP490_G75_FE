import React, { useEffect } from 'react';
import { Button, Card } from 'antd';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks';
import { JobPostingForm } from '../components/employer/JobPostingForm';
import JobPostingPreview from '../components/employer/JobPostingPreview';
import { useEmployerJobPosting } from '../employerJobHooks';
import type { JobPostData } from '../jobTypes';
import { useNavigate } from 'react-router-dom';

export const transformToEmployerPostDto = (data: JobPostData, userId: number) => ({
  userID: userId,
  title: data.jobTitle,
  description: data.jobDescription,
  salary: data.salaryValue,
  salaryText: data.salaryText,
  requirements: data.requirements,
  workHourStart: data.workHourStart,
  workHourEnd: data.workHourEnd,
  provinceId: data.provinceId,
  districtId: data.districtId,
  wardId: data.wardId,
  detailAddress: data.detailAddress,
  categoryID: data.categoryID,
  subCategoryId: data.subCategoryId ?? null,
  phoneContact: data.contactPhone,
});

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
      <Card className="bg-gradient-to-r from-sky-600 to-blue-700 text-white border-none shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">PTJ for Business</p>
            <h1 className="text-3xl font-bold mb-1">Đăng công việc mới</h1>
            <p className="text-white/80 max-w-2xl">
              Thu hút ứng viên phù hợp bằng mô tả rõ ràng, mức lương minh bạch và thông tin liên hệ đầy đủ.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <main className="md:col-span-3 space-y-6">
          <Card className="shadow-sm border border-slate-100">
            <JobPostingForm data={jobData} onDataChange={handleDataChange} />
          </Card>
          <Card className="shadow-sm border border-slate-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-500">
                Kiểm tra kỹ nội dung trước khi đăng để đạt hiệu quả tốt nhất.
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={status === 'loading'}
                className="bg-sky-600 hover:bg-sky-500"
              >
                Đăng bài
              </Button>
            </div>
          </Card>
        </main>

        <aside className="md:col-span-2 space-y-4">
          <Card className="shadow-sm border border-slate-100">
            <JobPostingPreview data={jobData} />
          </Card>
          <Card className="shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2">Gợi ý nhanh</h3>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li>Tiêu đề nêu rõ vị trí, cấp bậc, địa điểm.</li>
              <li>Mô tả ngắn gọn nhiệm vụ chính và quyền lợi.</li>
              <li>Ghi mức lương rõ (hoặc “Thỏa thuận”) để tăng lượt ứng tuyển.</li>
              <li>Đặt thông tin liên hệ chính xác.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default PostJobPage;
