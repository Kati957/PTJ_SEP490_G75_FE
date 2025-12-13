import React, { useEffect } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
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
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);

  const validateJobData = (): string | null => {
    // Tiêu đề: 5-120 ký tự
    if (!jobData.jobTitle || jobData.jobTitle.trim().length < 5 || jobData.jobTitle.trim().length > 120) {
      return "Tiêu đề phải từ 5 đến 120 ký tự";
    }

    // Mô tả: 20-5000 ký tự
    const descLength = (jobData.jobDescription || "").replace(/<[^>]*>/g, "").trim().length;
    if (descLength < 20 || descLength > 5000) {
      return "Mô tả phải từ 20 đến 5000 ký tự";
    }

    // Giờ làm việc
    if (!jobData.workHourStart) {
      return "Giờ bắt đầu làm việc là bắt buộc";
    }
    if (!jobData.workHourEnd) {
      return "Giờ kết thúc làm việc là bắt buộc";
    }

    // Địa điểm
    if (!jobData.provinceId) {
      return "Tỉnh/Thành phố là bắt buộc";
    }
    if (!jobData.districtId) {
      return "Quận/Huyện là bắt buộc";
    }
    if (!jobData.wardId) {
      return "Phường/Xã là bắt buộc";
    }

    // Địa chỉ chi tiết
    if (!jobData.detailAddress || jobData.detailAddress.trim().length === 0) {
      return "Địa chỉ chi tiết không được để trống";
    }
    if (jobData.detailAddress.length > 255) {
      return "Địa chỉ tối đa 255 ký tự";
    }

    // Ngành nghề
    if (!jobData.categoryID) {
      return "Danh mục công việc là bắt buộc";
    }

    // Số điện thoại
    const phoneRegex = /^0[35789][0-9]{8}$/;
    if (!jobData.contactPhone || !phoneRegex.test(jobData.contactPhone.trim())) {
      return "Số điện thoại không đúng định dạng Việt Nam";
    }

    // Yêu cầu (nếu nhập thì 10-3000 ký tự)
    const req = (jobData.requirements || "").trim();
    if (req && (req.length < 10 || req.length > 3000)) {
      return "Yêu cầu phải từ 10 đến 3000 ký tự";
    }

    // Ngày hết hạn
    if (!jobData.expiredAt || jobData.expiredAt.trim().length === 0) {
      return "Ngày hết hạn là bắt buộc";
    }
    const expiredRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!expiredRegex.test(jobData.expiredAt.trim())) {
      return "Ngày hết hạn phải theo định dạng dd/MM/yyyy";
    }

    return null;
  };

  const handleSubmit = () => {
    if (!user || !user.id) {
      toast.error('Bạn phải đăng nhập để đăng bài.');
      return;
    }

    if (!user.verified) {
      toast.error('Vui lòng xác thực tài khoản để thực hiện chức năng này.');
      return;
    }

    const validationError = validateJobData();
    if (validationError) {
      setErrorBanner(validationError);
      toast.error(validationError);
      return;
    }

    setErrorBanner(null);
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

      {errorBanner && (
        <Alert
          message="Vui lòng nhập đúng thông tin"
          description={errorBanner}
          type="error"
          showIcon
          className="max-w-3xl"
        />
      )}

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
