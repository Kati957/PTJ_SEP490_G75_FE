import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, message } from 'antd';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { RootState } from '../../../app/store';
import { mockJobs } from '../mockData';
import JobCard from '../../homepage-jobSeeker/components/JobCard';
import { fetchJobDetail } from '../jobDetailSlice';
import { addSavedJob, fetchSavedJobs, removeSavedJob } from '../../savedJob-jobSeeker/slice';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { job, status, error } = useAppSelector((state: RootState) => state.jobDetail);
  const { jobs: savedJobs } = useAppSelector((state: RootState) => state.savedJobs);
  const jobSeekerId = useAppSelector((state: RootState) => state.auth.user?.id);

  const [isSticky, setIsSticky] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobSeekerId) {
      dispatch(fetchSavedJobs(jobSeekerId));
    }
  }, [dispatch, jobSeekerId]);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (job && savedJobs.some((savedJob) => savedJob.id === String(job.employerPostId))) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [job, savedJobs]);

  const handleSaveToggle = async () => {
    if (!job || !jobSeekerId) return;
    const jobId = String(job.employerPostId);

    try {
      if (isSaved) {
        await dispatch(removeSavedJob({ jobSeekerId, jobId })).unwrap();
        message.success('Đã hủy lưu công việc');
        setIsSaved(false);
      } else {
        await dispatch(addSavedJob({ jobSeekerId, jobId })).unwrap();
        message.success('Đã lưu công việc thành công');
        setIsSaved(true);
      }
    } catch (err) {
      message.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Failed to save/unsave the job: ', err);
    }
  };

  const handleSimilarJobSaveToggle = async (jobId: string) => {
    if (!jobSeekerId) return;
    const jobIsSaved = savedJobs.some((j) => j.id === jobId);
    if (jobIsSaved) {
      dispatch(removeSavedJob({ jobSeekerId, jobId }));
    } else {
      dispatch(addSavedJob({ jobSeekerId, jobId }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const offsetTop = navRef.current.offsetTop;
        setIsSticky(window.scrollY > offsetTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-4 text-center">Đang tải...</div>;
  }

  if (status === 'failed') {
    return <div className="container mx-auto p-4 text-center">Lỗi: {error}</div>;
  }

  if (!job) {
    return null;
  }

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {/* Job Header */}
          <div className="flex items-start mb-4">
            <img src="/src/assets/no-logo.png" alt="company logo" className="w-24 h-24 object-contain mr-6" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{job.title}</h1>
              <p className="text-lg text-gray-700 mt-1">{job.employerName}</p>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <i className="fas fa-briefcase mr-2"></i>
                <span>{job.workHours}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ngày đăng: {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <Button type="primary" size="large" className="bg-blue-600">Nộp đơn ngay</Button>
            <Button size="large" onClick={handleSaveToggle} icon={isSaved ? <i className="fas fa-heart text-red-500"></i> : <i className="far fa-heart"></i>}>
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </Button>
          </div>

          {/* Sticky Nav */}
          <div ref={navRef} className={`bg-white border-b transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 shadow-md z-10' : ''}`}>
            <div className="container mx-auto">
              <nav className="flex space-x-8 p-4">
                {['Mô tả công việc', 'Yêu cầu', 'Chi tiết công việc', 'Liên hệ'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={(e) => { e.preventDefault(); scrollToSection(item.toLowerCase().replace(/ /g, '-')); }} className="text-gray-600 hover:text-blue-600 font-semibold">
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Sections */}
          <div id="mô-tả-công-việc" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Mô tả công việc</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || '') }}></div>
          </div>

          <div id="yêu-cầu" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Yêu cầu ứng viên</h2>
            <ul className="list-disc pl-5 prose max-w-none">
              {job.requirements && job.requirements.split('\n').map((line, index) => (
                line.trim() && <li key={index}>{line.replace(/^- /, '')}</li>
              ))}
            </ul>
          </div>

          <div id="chi-tiết-công-việc" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Chi tiết công việc</h2>
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="font-semibold">Lương</p><p>{job.salary ? `${job.salary.toLocaleString()} VNĐ` : 'Thương lượng'}</p></div>
                <div><p className="font-semibold">Giờ làm việc</p><p>{job.workHours}</p></div>
                <div><p className="font-semibold">Ngành nghề</p><p>{job.categoryName}</p></div>
                <div><p className="font-semibold">Trạng thái</p><p>{job.status}</p></div>
              </div>
            </Card>
          </div>

          <div id="liên-hệ" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
            <p><span className="font-semibold">Điện thoại:</span> {job.phoneContact}</p>
            <p className="mt-2"><span className="font-semibold">Địa chỉ:</span> {job.location}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Việc làm tương tự">
            <div className="space-y-4">
              {mockJobs.slice(0, 5).map(j => (
                <JobCard 
                  key={j.id} 
                  job={j} 
                  isSaved={savedJobs.some(sj => sj.id === j.id)}
                  onSaveToggle={() => handleSimilarJobSaveToggle(j.id)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Apply/Save Popup */}
      {isSticky && job && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-10 border-t">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.employerName}</p>
            </div>
            <div className="flex space-x-4">
              <Button size="large" onClick={handleSaveToggle} icon={isSaved ? <i className="fas fa-heart text-red-500"></i> : <i className="far fa-heart"></i>}>
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Button>
              <Button type="primary" size="large" className="bg-blue-600">Nộp đơn ngay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
