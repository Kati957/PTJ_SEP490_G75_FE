import type { JobMajor, JobLocation} from './types';
import type { Job } from '../../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    description: 'We are looking for a talented Senior React Developer to join our team.',
    company: 'TechCorp',
    location: 'Hồ Chí Minh',
    salary: 'Thương lượng',
    updatedAt: '2025-10-26T10:00:00Z',
    companyLogo: '/src/assets/LogoWeb.png',
    isHot: true,
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    description: 'Join our creative team as a UI/UX Designer.',
    company: 'DesignHub',
    location: 'Hà Nội',
    salary: '$1500 - $2000',
    updatedAt: '2025-10-25T14:30:00Z',
    companyLogo: '/src/assets/LogoWeb2.png',
    isHot: false,
  },
  {
    id: '3',
    title: 'Node.js Backend Developer',
    description: 'Seeking an experienced Node.js developer for backend services.',
    company: 'ServerSide Solutions',
    location: 'Đà Nẵng',
    salary: 'Up to $3000',
    updatedAt: '2025-10-24T09:15:00Z',
    companyLogo: '/src/assets/no-logo.png',
    isHot: true,
  },
  {
    id: '4',
    title: 'Fullstack Engineer (React/Node)',
    description: 'Develop and maintain both frontend and backend systems.',
    company: 'Global Innovations',
    location: 'Hồ Chí Minh',
    salary: '$2500 - $3500',
    updatedAt: '2025-10-23T11:00:00Z',
    companyLogo: '/src/assets/LogoWeb.png',
    isHot: false,
  },
  {
    id: '5',
    title: 'Data Scientist',
    description: 'Analyze complex data sets and build predictive models.',
    company: 'Data Insights Inc.',
    location: 'Hà Nội',
    salary: 'Competitive',
    updatedAt: '2025-10-22T16:45:00Z',
    companyLogo: '/src/assets/LogoWeb2.png',
    isHot: false,
  },
];

export const jobMajors: JobMajor[] = [
  {
    id: 'bo-phan-ho-tro',
    name: 'BỘ PHẬN HỖ TRỢ',
    categories: [
      { id: 'bien-phien-dich', name: 'Biên phiên dịch / Thông dịch viên', count: 1868 },
      { id: 'tieng-nhat', name: 'Tiếng Nhật', count: 361 },
      { id: 'nhan-su', name: 'Nhân sự', count: 924 },
      { id: 'phap-ly', name: 'Pháp lý / Luật', count: 215 },
      { id: 'thu-ky-hanh-chinh', name: 'Thư ký / Hành chính', count: 1582 }
    ]
  },
  {
    id: 'ho-tro-san-xuat',
    name: 'HỖ TRỢ SẢN XUẤT',
    categories: [
      { id: 'quan-ly-chat-luong', name: 'Quản lý chất lượng (QA / QC)', count: 1048 },
      { id: 'van-chuyen', name: 'Vận chuyển / Giao thông / Kho bãi', count: 1080 },
      { id: 'vat-tu-thu-mua', name: 'Vật tư / Thu mua', count: 591 },
      { id: 'xuat-nhap-khau', name: 'Xuất nhập khẩu / Ngoại thương', count: 530 }
    ]
  },
  {
    id: 'dich-vu',
    name: 'DỊCH VỤ',
    categories: [
      { id: 'an-ninh-bao-ve', name: 'An Ninh / Bảo Vệ', count: 86 },
      { id: 'ban-le', name: 'Bán lẻ / Bán sỉ', count: 2724 },
      { id: 'cham-soc-suc-khoe', name: 'Chăm sóc sức khỏe / Y tế', count: 1202 },
      { id: 'dich-vu-khach-hang', name: 'Dịch vụ khách hàng', count: 5733 },
      { id: 'giao-duc-dao-tao', name: 'Giáo dục / Đào tạo / Thư viện', count: 2030 },
      { id: 'phi-chinh-phu', name: 'Phi chính phủ / Phi lợi nhuận', count: 0 }
    ]
  },
  {
    id: 'it-cong-nghe-thong-tin',
    name: 'IT - CÔNG NGHỆ THÔNG TIN',
    categories: [
      { id: 'cntt-phan-cung', name: 'CNTT - Phần cứng / Mạng', count: 259 },
      { id: 'cntt-phan-mem', name: 'CNTT - Phần mềm', count: 627 }
    ]
  },
  {
    id: 'dich-vu-tai-chinh',
    name: 'DỊCH VỤ TÀI CHÍNH',
    categories: [
      { id: 'bao-hiem', name: 'Bảo hiểm', count: 488 },
      { id: 'ke-toan-kiem-toan', name: 'Kế toán / Kiểm toán', count: 1795 },
      { id: 'ngan-hang-chung-khoan', name: 'Ngân hàng / Chứng khoán', count: 1021 },
      { id: 'tai-chinh-dau-tu', name: 'Tài chính / Đầu tư', count: 2124 }
    ]
  },
  {
    id: 'khach-san-du-lich',
    name: 'KHÁCH SẠN / DU LỊCH',
    categories: [
      { id: 'du-lich', name: 'Du lịch', count: 175 },
      { id: 'khach-san', name: 'Khách sạn', count: 788 },
      { id: 'nha-hang-dich-vu-an-uong', name: 'Nhà hàng / Dịch vụ ăn uống', count: 918 }
    ]
  }
];

export const popularLocations: JobLocation[] = [
  { id: 'ho-chi-minh', name: 'Hồ Chí Minh', count: 7711 },
  { id: 'ha-noi', name: 'Hà Nội', count: 6046 },
  { id: 'da-nang', name: 'Đà Nẵng', count: 1767 },
  { id: 'binh-duong', name: 'Bình Dương', count: 1664 },
  { id: 'dong-nai', name: 'Đồng Nai', count: 1458 },
  { id: 'bac-ninh', name: 'Bắc Ninh', count: 1076 },
  { id: 'hai-phong', name: 'Hải Phòng', count: 986 },
  { id: 'ba-ria-vung-tau', name: 'Bà Rịa - Vũng Tàu', count: 784 },
  { id: 'long-an', name: 'Long An', count: 774 },
  { id: 'hung-yen', name: 'Hưng Yên', count: 710 }
];

export const locationsByAlphabet: { [key: string]: JobLocation[] } = {
  A: [{ id: 'an-giang', name: 'An Giang', count: 280 }],
  B: [
    { id: 'ba-ria-vung-tau', name: 'Bà Rịa - Vũng Tàu', count: 784 },
    { id: 'bac-kan', name: 'Bắc Kạn', count: 97 },
    { id: 'bac-giang', name: 'Bắc Giang', count: 359 },
    { id: 'bac-lieu', name: 'Bạc Liêu', count: 214 },
    { id: 'bac-ninh', name: 'Bắc Ninh', count: 1076 },
    { id: 'ben-tre', name: 'Bến Tre', count: 268 },
    { id: 'binh-dinh', name: 'Bình Định', count: 275 },
    { id: 'binh-duong', name: 'Bình Dương', count: 1664 },
    { id: 'binh-phuoc', name: 'Bình Phước', count: 371 },
    { id: 'binh-thuan', name: 'Bình Thuận', count: 233 }
  ],
  C: [
    { id: 'ca-mau', name: 'Cà Mau', count: 200 },
    { id: 'can-tho', name: 'Cần Thơ', count: 388 },
    { id: 'cao-bang', name: 'Cao Bằng', count: 92 }
  ],
  D: [
    { id: 'da-nang', name: 'Đà Nẵng', count: 1767 },
    { id: 'dak-lak', name: 'Đắk Lắk', count: 404 },
    { id: 'dak-nong', name: 'Đắk Nông', count: 205 },
    { id: 'dien-bien', name: 'Điện Biên', count: 91 },
    { id: 'dong-nai', name: 'Đồng Nai', count: 1458 },
    { id: 'dong-thap', name: 'Đồng Tháp', count: 301 }
  ],
  G: [{ id: 'gia-lai', name: 'Gia Lai', count: 239 }],
  H: [
    { id: 'ha-giang', name: 'Hà Giang', count: 99 },
    { id: 'ha-nam', name: 'Hà Nam', count: 501 },
    { id: 'ha-noi', name: 'Hà Nội', count: 6046 },
    { id: 'ha-tinh', name: 'Hà Tĩnh', count: 176 },
    { id: 'hai-duong', name: 'Hải Dương', count: 394 },
    { id: 'hai-phong', name: 'Hải Phòng', count: 986 },
    { id: 'hau-giang', name: 'Hậu Giang', count: 232 },
    { id: 'hoa-binh', name: 'Hòa Bình', count: 128 },
    { id: 'hung-yen', name: 'Hưng Yên', count: 710 }
  ]
  // ... and so on for other letters
};

export const jobLevels = [
  { id: 'intern', name: 'Thực tập' },
  { id: 'fresh', name: 'Mới đi làm' },
  { id: 'staff', name: 'Nhân viên' },
  { id: 'manager', name: 'Trưởng phòng / Quản lý' },
  { id: 'director', name: 'Giám đốc' },
];

export const jobExperiences = [
  { id: 'under-1', name: 'Dưới 1 năm' },
  { id: '1-2', name: '1 - 2 năm' },
  { id: '2-5', name: '2 - 5 năm' },
  { id: '5-10', name: '5 - 10 năm' },
  { id: 'over-10', name: 'Trên 10 năm' },
];

export const jobEducations = [
  { id: 'high-school', name: 'Trung học phổ thông' },
  { id: 'intermediate', name: 'Trung cấp' },
  { id: 'college-university', name: 'Cao đẳng / Đại học' },
  { id: 'master', name: 'Thạc sĩ' },
  { id: 'phd', name: 'Tiến sĩ' },
];
