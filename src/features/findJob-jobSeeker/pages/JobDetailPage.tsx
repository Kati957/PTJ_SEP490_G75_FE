import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tag } from 'antd';
import { mockJobs } from '../mockData'; // Assuming similar jobs are in mockData
import JobCard from '../../homepage-jobSeeker/components/JobCard';

// Mock detailed job data based on the image
const mockJobDetail = {
  id: '1',
  title: 'NHÂN VIÊN LẬP TRÌNH CNC',
  company: 'A-PRO TECHNOLOGY',
  location: 'Thành phố Thủ Dầu Một, Bình Dương',
  salary: 'Thương lượng',
  experience: '2 - 5 năm kinh nghiệm',
  postedDate: '2025-10-10',
  deadline: '2025-11-21',
  description: [
    'Xây dựng tiến trình công việc.',
    'Thiết kế và lập trình gia công chi tiết.',
    'Lựa chọn dụng cụ cắt, đồ gá và chương trình gia công chi tiết.',
    'Lựa chọn dụng cụ đo.',
    'Vận hành máy phay CNC để kiểm tra và đường truyền chi tiết.',
    'Xác định chế độ cắt.',
    'Lập quy trình vận hành.',
    'Chuẩn bị và bàn giao máy CNC và hướng dẫn.',
    'Kiểm tra bản vẽ và các yêu cầu kỹ thuật của khách hàng.',
    'Phân tích và xử lý các vấn đề kỹ thuật phát sinh.',
    'Tiến hành chạy và chương trình để gia công chi tiết.',
  ],
  benefits: [
    'Quà chúc mừng sinh nhật',
    'Hỗ trợ ăn trưa và tăng ca tại công ty',
    'Được hưởng chế độ BHXH, BHYT, BHTN theo quy định',
    'Lương tháng 13',
    '12 ngày nghỉ phép năm có lương',
    'Có cơ hội được đào tạo ở nước ngoài',
    'Môi trường làm việc hòa đồng, thân thiện',
  ],
  skills: [
    'Yêu cầu có từ 2 năm trở lên kinh nghiệm sử dụng phần mềm Master Cam',
    'Từng làm khuôn, tự chủ động trong công việc',
    'Ưu tiên làm ngành xe đạp và giày da',
  ],
  jobDetails: {
    'Mã việc làm': 'CNC',
    'Cấp bậc': 'Nhân viên',
    'Học vấn': 'Chứng chỉ',
    'Kinh nghiệm': '2 - 5 năm kinh nghiệm',
    'Giới tính': 'Nam',
    'Ngành nghề': 'Kỹ thuật ứng dụng / Cơ khí', 
  },
  contact: {
    address: 'Lô B-4, B-5, B-6, Đường Đại Đăng 3, KCN Đại Đăng, Phường Phú Tân, Thành phố Thủ Dầu Một, Bình Dương , Việt Nam',
    note: 'Có nhu cầu vui lòng gửi cv qua email hoặc số zalo 0345673789 liên lạc zalo không kết bạn được nhưng vẫn nhắn tin được.',
    language: 'Nhận hồ sơ bằng ngôn ngữ: Tiếng Việt',
  },
  aboutCompany: {
    name: 'A-PRO TECHNOLOGY',
    description: 'A-PRO TECHNOLOGY chuyên sản xuất, gia công các sản phẩm cơ khí chính xác, sản xuất và lắp ráp các loại linh kiện phụ tùng cho xe máy, xe ô tô, xe đạp điện, dụng cụ cầm tay, hàng gia dụng, hàng trang trí nội thất, hàng rào, lan can, cầu thang, cửa cổng, mái che, nhà xưởng, nhà thép tiền chế, các sản phẩm cơ khí xây dựng và các sản phẩm cơ khí khác.',
    size: '1,000 - 4,999 nhân viên',
    website: 'Liên hệ: Chị Lương',
  },
};

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!id) {
      navigate('/not-found');
      return;
    }
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      if (id === mockJobDetail.id) {
        setJob(mockJobDetail);
      } else {
        navigate('/not-found');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (!job) {
    return null; // Render nothing while navigating
  }

  const remainingDays = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
              <p className="text-lg text-gray-700 mt-1">{job.company}</p>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <i className="fas fa-briefcase mr-2"></i>
                <span>{job.experience}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Hạn nộp hồ sơ: {job.deadline} <span className="text-red-500 ml-2">{remainingDays > 0 ? `(còn ${remainingDays} ngày)` : '(đã hết hạn)'}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <Button type="primary" size="large" className="bg-blue-600">Nộp đơn ngay</Button>
            <Button size="large">Lưu</Button>
          </div>

          {/* Sticky Nav */}
          <div ref={navRef} className={`bg-white border-b transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 shadow-md z-10' : ''}`}>
            <div className="container mx-auto">
              <nav className="flex space-x-8 p-4">
                {['Mô tả công việc', 'Quyền lợi', 'Kỹ năng yêu cầu', 'Chi tiết công việc', 'Liên hệ', 'Về công ty'].map(item => (
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
            <ul className="list-disc list-inside space-y-2">
              {job.description.map((item: string, index: number) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div id="quyền-lợi" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Quyền lợi</h2>
            <ul className="list-disc list-inside space-y-2">
              {job.benefits.map((item: string, index: number) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div id="kỹ-năng-yêu-cầu" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Kinh nghiệm / Kỹ năng chi tiết</h2>
            <ul className="list-disc list-inside space-y-2">
              {job.skills.map((item: string, index: number) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div id="chi-tiết-công-việc" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Mô tả</h2>
            <Card>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(job.jobDetails).map(([key, value]) => (
                  <div key={key}>
                    <p className="font-semibold">{key}</p>
                    <p>{value as string}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div id="liên-hệ" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
            <p><span className="font-semibold">Địa chỉ:</span> {job.contact.address}</p>
            <p className="mt-2"><span className="font-semibold">Ghi chú:</span> {job.contact.note}</p>
            <p className="mt-2"><span className="font-semibold">Ngôn ngữ hồ sơ:</span> {job.contact.language}</p>
          </div>

          <div id="về-công-ty" className="pt-8">
            <h2 className="text-xl font-bold mb-4">Về công ty</h2>
            <p className="font-semibold">{job.aboutCompany.name}</p>
            <p className="mt-2">{job.aboutCompany.description}</p>
            <p className="mt-2"><span className="font-semibold">Quy mô:</span> {job.aboutCompany.size}</p>
            <p className="mt-2"><span className="font-semibold">Website:</span> {job.aboutCompany.website}</p>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Việc làm tương tự">
            <div className="space-y-4">
              {mockJobs.slice(0, 5).map(j => <JobCard key={j.id} job={j} />)}
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Apply/Save Popup */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-10 border-t">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
            </div>
            <div className="flex space-x-4">
              <Button size="large">Lưu</Button>
              <Button type="primary" size="large" className="bg-blue-600">Nộp đơn ngay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
