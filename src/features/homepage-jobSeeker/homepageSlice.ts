import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { DataHomepage, JobCategory, Employer, Job } from '../../types'; // Thêm Employer
import { getFeaturedJobs } from './services';

// Async thunk để lấy dữ liệu featured jobs từ API
export const fetchFeaturedJobs = createAsyncThunk(
  'homepage/fetchFeaturedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const jobs = await getFeaturedJobs();
      return jobs;
    } catch {
      return rejectWithValue('Failed to fetch featured jobs.');
    }
  }
);

// Mock data for featured jobs
const mockFeaturedJobs: Job[] = [
  {
    id: '1',
    title: 'Marketing Assistant/Trợ Lý Marketing',
    description: 'Mô tả công việc Marketing Assistant...',
    company: 'Công ty TNHH Sản Xuất Superior Garment Việt Nam',
    location: 'Đà Nẵng',
    salary: 'Trên 12.5 triệu',
    updatedAt: '14 giờ trước',
    companyLogo: 'https://blob-careerlinkvn.careerlink.vn/company_logos/d2858cee3831b482cf1b429de8b809c5.png',
    isHot: true
  },
  {
    id: '2',
    title: 'TRỢ LÝ GIÁM ĐỐC',
    description: 'Mô tả công việc Trợ lý Giám đốc...',
    company: 'Công ty TNHH Hiển Long Việt Nam',
    location: 'Hà Nội',
    salary: 'Thương lượng',
    updatedAt: '2 ngày trước',
    companyLogo: 'https://blob-careerlinkvn.careerlink.vn/company_logos/63ca6d30b4ee17d4ae72e7a9c9da7c06.png',
    isHot: true
  },
  {
    id: '3',
    title: 'NHÂN VIÊN PHÒNG QUẢN LÝ CHẤT LƯỢNG',
    description: 'Mô tả công việc Nhân viên QLCL...',
    company: 'Công ty TNHH S&HV',
    location: 'Hồ Chí Minh',
    salary: 'Trên 12 triệu',
    updatedAt: '2 ngày trước',
    companyLogo: 'https://blob-careerlinkvn.careerlink.vn/company_logos/9d54e98fb190ade6c1a265e79f223b70.png',
    isHot: true
  },
  {
    id: '4',
    title: 'NHÂN VIÊN KẾ TOÁN GIÁ THÀNH',
    description: 'Mô tả công việc Kế toán giá thành...',
    company: 'Công ty TNHH HPK VIỆT NAM',
    location: 'Bắc Ninh',
    salary: 'Thương lượng',
    updatedAt: '5 ngày trước',
    companyLogo: 'https://static.careerlink.vn/image/0b407efc1cbe2d0b197e2400b603fc6f',
    isHot: true
  },
  {
    id: '5',
    title: 'Senior Marketing Executive',
    description: 'Mô tả công việc Senior Marketing Executive...',
    company: 'Công ty TNHH Khởi Phát',
    location: 'Đà Nẵng',
    salary: 'Thương lượng',
    updatedAt: '2 ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '6',
    title: 'Kỹ Sư thiết Kế (R&D) Làm Việc Tại Nhật Bản',
    description: 'Mô tả công việc Kỹ sư R&D...',
    company: 'CÔNG TY CỔ PHẦN QUỐC TẾ COCORO',
    location: 'Hồ Chí Minh Nhật Bản',
    salary: '60 triệu',
    updatedAt: '10 ngày trước',
    companyLogo: 'https://blob-careerlinkvn.careerlink.vn/company_logos/df916bbf0d136f5ef5b1b6c9b1bba03f.png',
    isHot: true
  },
  {
    id: '7',
    title: '04 KỸ SƯ GIÁM SÁT XÂY DỰNG',
    description: 'Mô tả công việc Kỹ sư giám sát...',
    company: 'CÔNG TY CỔ PHẦN ĐẦU TƯ CÔNG NGHIỆP SÀI GÒN',
    location: 'Hồ Chí Minh',
    salary: '12 triệu - 16 triệu',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '8',
    title: 'Nhân Viên Phục Vụ (Part-time)',
    description: 'Mô tả công việc Phục vụ...',
    company: 'Nhà Hàng Menya Hanabi',
    location: 'Hồ Chí Minh',
    salary: 'Thương lượng',
    updatedAt: '2 giờ trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '9',
    title: 'Nhân Viên Kế Toán',
    description: 'Mô tả công việc Kế toán...',
    company: 'Công ty cổ phần Đầu tư Phát triển Duy Tân',
    location: 'Kon Tum',
    salary: 'Thương lượng',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '10',
    title: 'Nhân Viên Kỹ Thuật',
    description: 'Mô tả công việc Kỹ thuật...',
    company: 'Công ty TNHH Tuiss Việt Nam',
    location: 'Hà Nội',
    salary: 'Thương lượng',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '11',
    title: 'NHÂN VIÊN BẾP (Full-time / Part-time)',
    description: 'Mô tả công việc Bếp...',
    company: 'Nhà Hàng Menya Hanabi',
    location: 'Hồ Chí Minh',
    salary: 'Thương lượng',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '12',
    title: 'TỔ TRƯỞNG SẢN XUẤT',
    description: 'Mô tả công việc Tổ trưởng sản xuất...',
    company: 'CÔNG TY CỔ PHẦN SÀI GÒN TÂN SƠN',
    location: 'Hồ Chí Minh',
    salary: 'Thương lượng',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
  {
    id: '13',
    title: 'TỔ TRƯỞNG SẢN XUẤT',
    description: 'Mô tả công việc Tổ trưởng sản xuất...',
    company: 'CÔNG TY CỔ PHẦN SÀI GÒN TÂN SƠN',
    location: 'Hồ Chí Minh',
    salary: 'Thương lượng',
    updatedAt: 'một ngày trước',
    companyLogo: '',
    isHot: true
  },
];

// Mock data for job categories
const mockJobCategories: JobCategory[] = [
  {
    id: 'cat1',
    name: 'Kế toán / Kiểm toán',
    count: 1748,
    icon: 'https://static.careerlink.vn/web/images/categories/25.svg'
  },
  {
    id: 'cat2',
    name: 'Quảng cáo / Marketing',
    count: 1007,
    icon: 'https://static.careerlink.vn/web/images/categories/26.svg'
  },
  {
    id: 'cat3',
    name: 'Nông nghiệp / Lâm nghiệp',
    count: 1393,
    icon: 'https://static.careerlink.vn/web/images/categories/27.svg'
  },
  {
    id: 'cat4',
    name: 'Nghệ thuật / Thiết kế',
    count: 678,
    icon: 'https://static.careerlink.vn/web/images/categories/28.svg'
  },
  {
    id: 'cat5',
    name: 'Ngân hàng / Tài chính',
    count: 949,
    icon: 'https://static.careerlink.vn/web/images/categories/29.svg'
  },
  {
    id: 'cat6',
    name: 'Thư ký / Hành chính',
    count: 1524,
    icon: 'https://static.careerlink.vn/web/images/categories/30.svg'
  },
  {
    id: 'cat7',
    name: 'Công nghệ thông tin',
    count: 2000,
    icon: 'https://static.careerlink.vn/web/images/categories/2.svg'
  },
  {
    id: 'cat8',
    name: 'Xây dựng',
    count: 1200,
    icon: 'https://static.careerlink.vn/web/images/categories/6.svg'
  },
];

// Mock data for top employers
const mockTopEmployers: Employer[] = [ 
  {
    id: 'emp1',
    name: 'Công Ty TNHH Aeon Delight Việt Nam',
    jobsCount: 11,
    location: 'Hà Nội, Hải Phòng',
    logo: 'https://static.careerlink.vn/image/e6ae22058eeeea5166fe0fc62abf303d',
    backgroundImage: 'https://static.careerlink.vn/image/6c39d2c56e6a82d2b608aeeabe0d7127',
    jobDescription: 'LONG BIÊN - HÀ NỘI] NHÂN VIÊN CHĂM SÓC KHÁCH HÀNG, [Hải Phòng] NHÂN VIÊN CHĂM SÓC KHÁCH HÀNG',
  },
  {
    id: 'emp2',
    name: 'Công Ty TNHH Vietnam Concentrix Service',
    jobsCount: 256,
    location: 'Hồ Chí Minh',
    logo: 'https://static.careerlink.vn/image/0a0094b245cef2f0cfe089cce59a607d',
    backgroundImage: 'https://blob-careerlinkvn.careerlink.vn/company_banners/5a29726598735d7017c7ce32fe099122',
    jobDescription: 'Quận 12- Thực Tập Sinh Tuyển Dụng, Tư Vấn Viên Sữa Dinh Dưỡng Hoa Kỳ',
  },
  {
    id: 'emp3',
    name: 'CÔNG TY TNHH KHÁNH PHONG PLASTICS (Nhựa)',
    jobsCount: 0,
    location: 'Đang tuyển',
    logo: 'https://static.careerlink.vn/image/8513f13159a569b638e2b8799e351ba3',
    backgroundImage: 'https://static.careerlink.vn/image/3307bb9f70fa0ae9ea4d97accec60f6c',
    jobDescription: '',
  },
  {
    id: 'emp4',
    name: 'CÔNG TY CỔ PHẦN ĐẦU TƯ CÔNG NGHỆ GIẢN ĐƠN',
    jobsCount: 0,
    location: 'Đang tuyển',
    logo: 'https://blob-careerlinkvn.careerlink.vn/company_logos/d3ce648c12244a30a2b338f7adf7b119.png',
    backgroundImage: 'https://blob-careerlinkvn.careerlink.vn/company_banners/805cb25c534520e1d51a6286b7591ee4',
    jobDescription: '',
  },
  {
    id: 'emp5',
    name: 'Công Ty TNHH FPT Software',
    jobsCount: 500,
    location: 'Hà Nội',
    logo: 'data:image/png;base64,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',
    backgroundImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSExIWFRUWGBkXGBUYGBgYHxsaGh0YGhoaGCAeHSggHRslGyAeITEiJSkrLi4uFyAzODMtNygtLisBCgoKDg0OGxAQGy0lHSUrLS0tLS0tKy0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLf/AABEIAJoBSAMBIgACEQEDEQH/xAAcAAAABwEBAAAAAAAAAAAAAAAAAQIDBAUGBwj/xABHEAACAQIEAwUFBQUFBwMFAAABAhEAAwQSITEFQVEGEyJhcTKBkaGxQlLB0fAHFCNy4RUzYoLxNERjkrLC00PS4xYkU4PD/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAJxEAAgICAwABAwQDAAAAAAAAAAECEQMhBBIxQVFxoQUUImETMvD/2gAMAwEAAhEDEQA/AOxRRxS4o4raznG4oRTkUUUWMRFHFLihFFiERQilxQilYCMtCKXFHFFgNxRxS4oRRYCIoZacihFFgN5aPLS4oRRYUIy0MtLijiiwERRZacijilYUNZaGWmsdjEtKSxA0JAkCYE89B6nSo3COL28RmVdGSMy7xPnsfd0osKJ2WhlqHxriQw9stlzNrC+gkk9FA3NUXB+2dq4jZzFxYhYOoIEagEb6SOtFhRqMtDLVZwHjS4nPAgoxB6bn37RyG9W0U0woby0WWnYoRTsVDOWhFOxRZaLChvLRZady0MtFhQ1loRTkUWWnYUN5aLLTsUUU7F1GooiKdIoiKLDqNZaLLTsUUVVioZy0dLIoU7FRMoRWF4Tx/EviMtt0vWu8lhmm4tskDMAY8IkTpp5Ct7Fc9m4iKEUqKEUWAmKKKVQosKCoRR0dFhQmKOKOjoChMUcUdCkFBRRxQoxQFBUIpVCgKExQilRQigKId/iNlCFa6iknLBYb9D0PrTfEuLWrNs3CykcgDufKJPyrBdruyS2zcv5mZmjuwSGJYyWJnU8hA9eVYy+mIW0Wa2ciQe88WUTGVV5HUyQJ5HlUtsRreL8euYy664YXnK9BoI2IUmQZJ/mgaaQdr2T4O2HtAO5Z21YZiQuswoJMROsVyjhHaZcKLnd21LFcovCQ8yCZGnKRI6CelE3bDF2zmFx1zeJZmIMjb7Q8zrPmKXZho6B2+fxKP4beAwhTUEnc3CcqKYjXrt059geEXmZreTIttwt1gGbKWEq8e3lIgadK0OA/aHba2RjrRuxoMqqQddc4kAnpp9aYs9uxaZzh7Zh2zMGfMswqjxbgaRrp0p9lQUjpHZzhK4awtsBQd2y5spMASAxJE9Ks4qg7Hdomxtss1sIymDlZWGu0akzHUenloYpqVq0OhEUUUuiqhUJiiil0VFhQmKEUqiosKE0RFKoUxUIihFKNFTChJFFFLoiKdgIiiilmkmnYhBFCjoU7CjiXZs91dslrDsUeSy+yVBmSRO38pkL767Zw3ilq/b71GGWJMkSvPxdNK4FwW7cNwnDMMgaSLhXLlBBAM+0RpMT5Vc4vFYnDHvbaW7Nq8CpIZLincsImQpK6NGg2MCuVSKR2rDYu3cnI6tG4BBjff4H4U/XDOzPaLEpeV7bzPtI0QFEkghdeuvWuz8Kx6X7YdGDA8xHzjY1adjWyXFFR0VMYKFChTGHQohR0hAoUKFAUGKOiFHQAKFFR0ACo+OxiWUNxzCjc1IqNxDBJettbuDMrCCPx9aQETA8Vw2KUlGDADKZEaNGmvIwNPSsh2/4ZeuMlqyA1tgz92PCAfCJMbzvJ+7pUbjfYUWLdy+lxiQ8JbX7phUBYy2aTJJ0M+VNcE49i0tW8PasMwkA3WBMRAaTAUCRz3BnzKYGLwGHLOBfm3hxcCvcVRqUEHlr/AFnWDV9YwmBxFxsPae6xYqVuQp8KKFAIUKQoGYkFdAJEkk07xDsLjcU5JC22D5G8KomQA5XQrq3Q6TtSuCdi8da7jEWHQgkEagMs6SQQQdN9ecVKsSRR9ouEEYgWu6ZGeC1tU00MSAGMhiJHWd5mrA9h2ClVS+3slmVVGWfZbIWDNpuNMp61qO2XBb122mJ76GLSToEtoQSASrGTMDNqOems11vtNiw9xLN1XNpsjZ1yZltrOYyc3tZgdB10qhUjOZ8Rwt2tMVzMFc6k6Scnh0yt5ESJrX9lO3qAFcSxhmEHfKCNZ5+4CB8qmYTA4Xi6d7fUC6gZBkcyNvEREmDIGpG/PbBXOBXLJKusIC3jkIfZGhB8yJAE6kDWo2txHTR1vF9rcOqFlbMAAZgga8pP2vKrDg3EO/t54jUj1iNR5GuP8KxVuzlYYcu1sqSXIZVd5guMoyqRoNdwK1fZ44/EXzcBSyikhgywyySSuTSATqddYBzHarTCzoVCiUadfOgaoYKFCimnQAoqE0JoEERQijoUwoTQNHSTTCgjSTRmiNFioI0KI0KLCjlHFezL4SzIvoz23ICkhPaYLnHMHcxBHiNZW73bEgg+zsLo9sRJ13nl1jWtI/ZfE4hnuXXAdLgPd3J1zHUs0LCwNwIaDHOhjeyVu9aZ7YC3ASvdqznMZA1kASDuqgABTqeeNDKHB8LLgIpVpGfIrSdBGwiDAAKmSZB1qzwnF7mCvOMNeKoxGjruNgQpHUdJAaoGF7O3O/e3bJUyciv7RVRqQRoZMbGBO8xOywfZ39+wzo2GW1ethUFx3aWaFzEgbDfrtHWlVgdA4Lxa3ibS3EYGRqNoPOJ5Tzqeaw3ZzsPfwt5HOJLIM2bLpzEAgzmBE6iCDG9boirQ0FQoU1exSIJZgBp89qoY8KFQbnFEHshm9B+v0KaucUaJyAfzED0pCLOhWafjLCc9+2o1ACAkjp11qFiOPWxvcuNttCjT4UAa44hBuwH+k/Sol/i9tRIJb+UZvpWMxHaNPs2wT1Yk+VRX7S3dhC+gApXuhtUuz8OlWboZQwmDrrp8aXXL+A/tBg5LoOmhcfiDvW94Zxu1eXMrBh1X8RuKYizoUSsDtUPiHFrVmBcaCYHXfr099ICYygiCJB0IqLicZZsKFbwqAAAFOUA6AaCPdTuGxdu5OS4jwYOVg0HoYNcY7b4++mJvC45zMTkUDLFo+yJOoMDYjn50mwOm9oLV5rDWLLEMwzW211C+I2zsZOwI1g+RNc242/EsK/crcJIQXClos2UuWMbbzOu/u1qy4Z22WzhLVpkl7QAVgxJlTpMDwgrmGk6T5Si5xTGWmXGW3S9n1yjMe7FwrAIgEywYDcbnQ1LaaAxdnG4gOs3XtsxJkkmC32iDOs6TGmlbLsZ2MTFg3nxIdcxFwLqxJAaM/Mag6jcfAu0GDtYjCvibiHDXnUslxmI73XxKV6GPaPUe/O8Ex5s2GtWLr94/ia2Ahlj4DGU5i0RA16+VKqEPY972AuMlt7i287KjAxsdVMQCeunKp+G4BiMSbVxb4d7g8QZiLm5DvDsZVW0IBBPSBJf7M4S7dw1zMVZkJNubmUq4aTn8XhkA6g7Gso7XbV1nNzM0lc4dSTrlJU5SWEkagbe8gaA9B4TArbAnxsAF7xguYgGRmIAmKktXGuyfabFNiktG5AQ5SDJkD2lEySTM9QR0rrWGuKeQ8WvkehHu/W1XF2MeVjGu+0fKmkv+LKxE8vOmMd4WETDSpjltB6DaPfUJsTmvCJMKJgczmEdBsN+taUBd5qFMB/OOcfiacz8t+vlQAqaFFRigAwaFJdoFQ/3tugosCaTSTUFsQ/X5U9hWJmTNFgP0RpUUhmA5igAjQps4lB9ofGhRYqGuNqubDkiD3uUNzUG3cnXppVcbn7xdU2l0AIF0jUgxmdZ1ynYHmCYmZUcTzYp7awAiMLpVh9gBgHuDlm+zb5iS3QXuFshQTGp67n+bz/05VJQMHgktiFGvXnT3hQEwFG+g6/1oXRKnUiRuND7qwPGUI71u8c5bgtqCZ5EmZ9KEhGpv8cAmMo/mb8BVZiO0X/F/5V/E1jS5602RVdRdjSP2gUGRnY/4nj5DSol3tE32VUecSfnVOaKKKQrJ13jV5vtH4x9KiPiHJ1NIo6dBYhieZNJRASATAJEnoOZpfP3Ul1B0NNUnsmV1ocwz2QWbKWXQKCTJMySfmPhTP7zFsqIktOw26Tvv9POkuukDSkWsOx2BPoCazmnKbk/C5xTxwgn5t/co8Phle2gPNXY9SQXjX3U3gLt62c9piPFkCgwc0Kfhr1qeMO1vIrqVYW3lWBUj+85Go+CjKAZ1vgaeYtSPhQ5Gta/7+zUcD/aLct+HEKT1YQI9eR/WtXvFr2D4ja0vEO7AgZ2SSFYBY+yDOpE1zlSrZLZE+OdZA1yiPTSm8i2wGU6kEkHyYqI6f0rKWT+LaE4l7xTgOJwYtLbuNdN1SpZJAS8BOUQSXuGGjaOu9OcKwGJxb3bF1c14PmYvsfBlJI3ElQM09N9IorvGb9s90WzAHNE89dZB33586suy3a44e2yKqW7jEu12JJAjwARz8z7xWSne14TWzZYbsDh2VSW8SzmQROm8gyC4EeR981GwnYpFvNbN51sN41QglbitE6ggq6EjXYZh/iFIw/FzbtNeUgYl1LAmNdcxn7wMjkIA5c8vh+J8VvpKm5ltXGbNzWVJykQWjKYGmWD7607odF5xnh9kC1Zu4nL3KurTmY96MxbNBkBoDKFK77gkVZ/s97IjC3WxJzBGX+CWKzkbbOsEq5GvhIEECJmsxw3g9ubV3EXQRfIxFxQSTlYMyKVbQueupGcct+r4DiVlwHQzpuSJ1+g+VWtiowHbvBYq6Bbt4NlRTnAQLDBh4pj2m0MgxEDQzNFw3shhu5TvDcN0rlNu5KgaEnKF1BG0gmMxjetrxbjFsD27Y0Mg3VHTo2lY3HdoLZOVrtsifvFtxEggSGE8unuNUKifhOHYLvAt22pZkUi6WJzA+zmBMK5In1OmtbS5osHUA6ETII2M/DX1rmGC7TWAuS4cxQBZykh003035HTl51KHby0ilE71xEAkAadD4tY68+dMdGx4liSpa2ZOYgZgJgEwC0ezHzIHnUG4i2bbXiTILBnB9oghRIPM5RoPvdKxq9upDZrTuWkZiwHIjkDMaVDftbcKd0bChACq9QDOo5ZuU/1p2FHTOGWw6BnOXXMVLSTGkE/dnlzjpvbDFptPwB/KuQHtxjBCqlpdBAgn6tFMHtdxByQLyrHIIv5GmFHZWxi+Z91JbGx9k1w692gxrgk4q5oJMGPhAFRL+IvMuZr11tYgux+poHR3DHY4QJdbcEalhyIJGsb7e+q+92gwye1ibI/zr+dcTu2RAaSfFGvpRYuwqqjDnv8ACihUdev9s8Ev+8g/yqzfRah3P2h4NfZa638qx9SK5dcQDKR9oGfURR4oAMIAAZf19aKGldHQL37SrJ9mzdb1Kj8TUK7+0hvsYSP5n/JaxN64M6kRqo26j/Wl4pvEDO4+lIEro0l/9omLJgWrSTtIY/iKFZziC/wrbQfC8TyhtvwoUMcUvk6ph7ZUZnvPeRvEfHAdh9p9ZAgADU7A9BWnwHGhclSGUiARExoOYJ93rXC8kMYOw5acpqTh+I37cZL1xd9mP0qSaO+X8bbj2wNt9PrWAx16bIM63Lzv7gAPxrO8M4/im7zPdzqhHtADXaZAmn1xbiNFjWARMSapCY6TSlUnYE+lRLmOccwPQDnNIXFXH0LsR607Jonthn+6R66fWjFiN2Qf5genSagBCRqabvQqknlzpSdIEiyKoDrdXbkCfqBSe+s/ec/5cv51lX4rGxBExAkjSNQdKO5iYu+C5q0SuU76aevLauaXIqh6Rd8U4giqQiuG5kkGAecAConDuMlVCMgZxrmYE5pJAjWDHlVHxTHyfD4SoGhUHTzP6501grmb2gTEsCBJ5az9D5b1zOU5PuZv02zY+7yyr6KBTN7G3ipm42x50xgsQLi5l221InTrGxp918Lfyn6V6EZJxtGsNtFDhu1WLtrDMLybC3cAcRrrqD0NSW4vYcSLIsujh2ys2RiI2kmNhoI2rJXzp/8AsP40+WEXd/aGnIdame1o1ovLeN1CoqtJBEjnoQdTHzqDisWfYIhtRAGu+2m+tRrjbiTpy/KkFmU7mdNdNK5VFK2S7foC7g7QRG++umvnQvXlLMGkHZcpAAI57aj4b02t8EyyZhMkTB+NS7GEtsGbvUQz4VcPtvAZQdeWoprSolD3CuK3bIPdvEzr7JIjrv7ianpxnEw+XEPLCTqZYkRJO+2lVVjhl5j4Fzx90hvf6VbHht0wTbWQNQXtqeZ18Y/Qqlp2kVEzq65czNqAJ3jkAdfL5VIw7KDBYsY5/Kn7djwkFlkMQBmWSZmVE6jfXbXSnrXDbbCHuoOntHbl4VJJ+VV1fwFC2tpnAjQ9fQmjtICraCZ+WlPKtqQTiFBXYBLrTuPu6Us3MMoJ7240jlZ9/O4K3HojBJAjQnf16+dG7DPB3Oka66cuVH+82PDHfnTfKi8/5mp9u7B1tsZ5ZxqNQPsdPOlbQErgWDRrOKLjxoqsm/lOnP8ArUG4OZ5bD5604mIFtLirbMsAPaOmuYHzI09Ypg4+Rm7m3oACGz6HTbxdPrSbsaDxD6jTXr76Srw200q9xFxqtu0QTpKBtOW/4zRtxK+W0Npc0Hw2bPPSPY0ql4IioRJBMaN/pSgrssAE6ToJ8+VLPEMQjQt5lmJKwPTajt4u8xOa9cJ1+23KRO/nRYWGeG33U5bV06g6I5/CpF/gWJNoDuWBBkZoXn/iIqI4YyuY6dSTPnqaau8KSCSvL86SmvByTdsl3eDuEXM1lSDrmv2BpqPv0MTgEIWcVhgR/wAXNp/kDVTWbClGIGoBI92v0in7llTbYgagTNaELwn3cNh4UHF2pB+yl9+UR/diiv28MAv8d2g8rBH/AFOKrbSqAxjYT+dIuMCCdfSaxySkvAdpl22Jwndm2TeIMaxbUggjbxMNwN+tCqS1eBIJXwjehWDyT+pNlszWY9u6CRvkRp6D+8FOvZQHMLhIB2K5TsIO5/RqKIAX18PLqf160q5fHi6CB79jHlpXQyy14WyAFiCATMzoI11qbiXEb8txVZwzGWQmV2cNqYCSNdtZECBVhjMOFQMzEZllAF8pnfpz03pp0S1ZEFw/jPpTxuBROwAn1pzCcHvMFfK2XUk6DadgfrU21wdGthnnK3MsE9AdNKaYmiNZxIKZzoIBPz/Ks5xHGXWJABYE6AAnTzAEdK2icGQ28tu2QNAMzXBO5iSBM++kf2O+oTBqwOqwXG2khi+XfWDUzdhRzuxbmGaFKNscy9D4oU6enXlUr94CubucDLqAm5JmJMa6SSan9qcFdw7d5dtpbDyFthwdo3AJIEfhWVfEhjr4Z2B/Pp+Vcssbm9mbRb4m4L4ktlKa7kzMQABPPyqFgcRkJzMYiAQTEdNOVIsXVZT4gpkCY057gagRzg+dHjbKkllUKCP8s66bk+dEI1r4BGz4NiDdEquVQJyhQJAmWPlpPlBq1a0WVgpGoyg5lAzESBJIExWT4NikWFuKWVgM4nLMDxeIa5Jk9TB0qXxK4UDq+SMxC6gENmIkRuBB5azVxlJPXhpDTIl7svilKi5hroliQFActufDkn19xqLesPbLm5ZZNfto6yfQ70kY28rSjHMeasV+GoirLDcex9sR+9Ov810EfAzW62a9qIVvSYG4nfXXy9OtNXnOg6Dy6manrxO/MMMPeJ+8EYmTO+h3PzqRiy3cFnwtsAsFF1SwhvESAA0TEjaN9qycJA5WUd182g08+sdaRYxDIxKNB158tJnypeHxFge1acmNSHy9ZMFD5cxtUFW8XQc+ZHwocdUyGyRlcAtHhMAxqAJgT76Xh7jDUHmRI02/1p1rdjZcYP8AEHt3lnUQCFRunWgqWFQgYlXO+UW7w6bFlA5c60UdbBejoWSNuUzUhBmLiNc3xifnFMFrUj+IysAAQqTInecw5RpUy1i8NbJl77MIyzZQRz1Pekx7qFZVoJyJTKv6FKtzLDlBMbfrSnsVdwqqhK39GaCq2xMxG77Eaj18qTbxGHLQtjFMY9mbY6csh/Rq0BEYHLljY/Wpd24Qbexgg7+hIn9b0dvF2GDA2LygCAzXBE6j+IVtaKIgQORpnF4+0uWcKYG4/eMwYctVTTUE9TFJjskMSX28JEmNeUn1qvvuT3hiOcfGPl9KnnFAgFbIZmY5kLvovhKKTI0HumBNK4dcW4z23tW1y2s05mEkFZmWj7R0H3RUx9B+FcjFkAHSPwoWidGkERpyn47zVndkoba4e0OQZcxbqdc0AZdzHMU9gNAQbeGJ3krbbfkC2gHQAEfGtnjldGayL1FJim8QiOWu5o0uQ0T760dzFWoBLYYMZ8K27WnqQKYHGVB0uopHskW0PMTPhIGlWsEqsh5op0Uth/GZYkk6eQjnUnDSxg6zpABip+P7QKwj95JHTb1mBTFnjpjw4q5M65WuDSDrpyH41EeP2fqHLP1XjIVjhbgkZWIf2YDazyECDtsKkYDgWLK5Thb20f3Tjy5ir7AP3+DxSB2JW33ivLSMjKxjXTQH41gLjHOVd3YA/eJ5edJx6urKjLsrL7D9l8ZENhmGkeLKPqajDgN9QEcIjxPiu2R/3xVI9m3n0GmnIUdpB4hyB2+dTJWqH6W1nhpQks9kRuO/tk+4K0/ChVUETN0BGnr+vrQqOiRJpXxjMsaRE/3VvQjmNNNvrvTC4toIyoQDBPdWgPf4AJ566+dHhcMYZTctsJ5XFI1KwuYEgHTz+dMjDHMVuPb8InKG05cxpufMk/GhGhIa/CiVtkt922BoPSNPOtb2XWzirN1nhbtoAGNTGoTKPPY85rJixNwfxU9kcz92dBEACpPZ7EnDXkv5gyh2zQr+JDAIEJM6yNN1FNITBxbHX8O0AuEOmpuqZE6HxAbe6qk8cusSCxUHpcvGdNm/iR8q7D2u4LbxdnMsFbihgw5EiVesT2O/Z+1458QctlGYMIZS5XSASB4OrDeNOooQOxXDDigWuqy2AFEjvSTJYELqdOU6RrvWj452rw+CKJZQFE8MDWRrIt/H2qZ7Q9oEBezhyEtBVBIGUZVEaclTlOk1zHivEVNwgMWM5SVg6bGD09KlyrSA0vazEJfzsyreuvAR1IPdr4R4yoAJmRECCNzXPcTcUmCYKzEAagx199XvE+LDvmuWHKplgAaaaiIn9QKhcMwFzEgtbyDIQCpyg5QJJnQGNPPxDlUUZsh4YiGZlyrAVY6zz84n11p22rmIBggypkzlJJOm+5+dSsPhmtl1LBxqNSEnmfMQNdYq54XgrLoLl1yhJOktAWSAywNTnXKSD9ueRqbEQeCLkYEqCrZZEsARMHUDXUHbaKl9peLLdUW7SwqmCxCyxE9IBAnQxOpqmt4p2GUuNASqiYUk6qs6666ec1Ee2YWATMt88v8A2041eyokrh1k98mv2qmdpbXjT+XqBz86rsJjktXFJBfKZMaddBNOcd4ol90ZUYBVykNGpknlygiumL/iNg4RYJxFnUR3ifaX7w866b2swjHBGMv+1QogzPdONTtEnYD61guzXDCb9qE7y4SrJaU66GZJBgQBrmgCRXUeJcZs4I21xLhcl9nIAZjJtHKQAJjxjWPsnoayU1LwqqOU3uE3rYlkJEEkqrEKBE5jECoqYR3aFR3IEkIpYx6KDFdTu/tXwMkZL7DqEWCPRmB+Ipmz+1DhlgM9vDXQzatlt21n18etJwthaqjlOIJEqdNdV2+NO4dyLbQTuAR13r0RxPD2MQAt61ZcNEd4oc67RPP0NUt3sZw20CWsoq7mWZV/6tN6sEcda+QVYEg5JBB9/upo4knMTJJGp+G9aTiuHsG63c2brqpuBTaMAIMpUAlG13jXblqKr/3RD/uOL1/4q/8AgpRBkJMSXtshJJAzAk7RBI+FNPiSfFJmYJ9wq2sYNAf9hxCg6FmvaAHef4I+ulJGBER/Z1+N/wDaP/hoGQsLj8xCd2vi0kTr669Jq1tWUezeZWzDuQRb1DBlKSY5gDNr0Y03awWQqw4ZekbTfJ//AJ1LwWZGWOHug9ksbpaFbRpBUA6TQ/AXpVW7bmCI5HeIBAEkmI2Op61bdnSi4ibhV1yXA8qWQKVPt6iTIgRzI15UuzhrQuOvcB1UCEV3z6DYRAiftMfdTCXb6sYwSlZ8KsxABgg5gGGc6nVp2EbVmtlsuOG8Z4Wtp3ud3cuNmKYVbTBAQGyDYguxyySdPjN8nafgRAAtWw0rI/d2MaiR7HSa5Va7PYgbWjI55l/91Fe4LiEDMUgbk5l257GtbRnTOuN2t4KQctpfCQZGGI0kEkeHpR4ztxwtVXJZLloKgWVWVzQxloAgTueVcot8HvQQokmJBYDz0MxSMJg3a+mHKhCo/iNmGqkgjc5ZE8qdhFX6dP7V8ZtYjCd/aVblu1etllKqGQAqWGQjmpA9GnrGNu9o7JxRvW7RyG0LZTKq6hiZiY20pzCYYZsfhLbuttrVu8Dcgsotuc4IWFLHXURsKojwVic1hwybZmK2zPMQT8+dKwcfobbsNbBbIfZuo1v/AJhH51zYkhiG32PqNDWl4JbxVh8/erlAMfxFaCNVIE7yP1NLN7HMSQ2FkyZ7vCEmefsUWgp+mWut504kzz8Q0nTbpWlFzH//AJ8KP8mE/wDHRnFcR2OLsCPKwI+FqhtArRlHVmOaNBuVGg9eQoVqjiOIx/ttv3FR9LdHR2QqNBjrWHw+Et3O6CXHIMIWAPIiTykRPRjR4jjtg21NpLjmAMneZY3O+x1qp4jjVxgZLZMlgWMDQcxEiNgNOkVFw1v9zRmYzJjUR131rzsvK66j/t9B7Jt3tIiEKbFwExp3p5+gqTisdbZUD2bpMscoumRsNYIPnVDwy7313vGQN56Ssc/KnbfDbvfi6WWAZjMZjptFZy5ji6dXX5FbNFg/2gfuwXCpYLIDEOxLCTMDU+vvp/jfbO7iFFvu7tlPtBFBnoCZ28hVJ/Z9o3O8IBfSSGO/pNUPaDixF029QBpEjXzoxc2eWXWK+N2GzR8SxlprQtv3vdZQzQogkkt4oOpExB5iqm3gcMdVtXoOxAA0pvhGF7614y4UxopGsc9ZrQ4a0qKFUGB8f61Gb9QljbSVsa2Z7GcEsRKJf9Cs8j08/pVTdVbXhtktGuQFlOkkZoIMqZb1y1unvQNEJ91YLE4xFvC5GUq0nL4R5wOk8vWq43Knmu14TJEe9ZKlZAYGWgAnoddtN9fI07bRn1zwZMDQAGSYGui7Eb7n33drh129F9WgMc0bQp10B02O21NtwXEpvl7tJIOgJGxA6GJMbe+tnyIrTasVMr7C2go7055YFiJAy8t4M7++Kv8AC4XBuQ13vcqoARMQfIz7JJJ9557t4rs+Ia47HQE5ZUA84GnlNVXCr5F5ILKpIkt7JEwR5afWojyFKLcfgEmjQ28LwWT4X055m1+Bojb4OCIsu2uvjbTz9rb8qe4jxa0kaIx6ac9vSjwfEBetkoAD06HkfMVl+/n17dNfc0ss+F8Y4dg8zWA6FgA0amBylmOxPKpnGOK4N7C4h7PfC6QJeCWyG4eYOiljpyzVkuG8Pa05dnDEgiAAN/Umldo+NkW7WHgjLnYmI9o7dOXKtsfM7y6x2K2XWB4hwtpJwtlY5ZUJ+gFTL/GuGWkzCxbPKFt2yfrWX4RiFuW5dAdSASo/KmuM4TOgW2qrrJMAadNBNT+9/n0ar+yrdG6w3afBOiuYH/LoRy3mjxPaTh/2nYT0yz8dxWG4NgmtA5wlyYifwmatcttt7SHyyr+UVE/1FRdJWCLbs/jMGTeDs5ZmvMBm/wDSykydd8oJmnLa8KOwcxv/ABB/76q8XhbWFuEEKZUgsVHs3FII9IJFVmMwGHVC4tLoOTN9J2q3zYp9XFg2aa6OEaqQ+o1hgdPXNUA3uHupZLzrl5XEttprzUqxHvOwrEpic7ZTqDuJ2MaZdSPh0ocN4bdDDvLZNsnXWNOexmtpZVFW9EqbZuMBjeHtmFy1clACWRswKndoJDADn0q1wOG4fdcW7XeFypYQw2XnvHxrN4PB2rTBrVvKw2IZj8mkEHzq94BZwtq731u0VuFCjqpIHiKElAWhQSIjl5Cs8PKx5XSWy7ZFsNwxJS49w3FYq8HLLAkHSascT/Znd28xfLByy3LMZ566z8azmP4Nhe9uHu/EXYmWcbknk300oXMBh2t27ZtgC3m+049pp6zUPn4k2qegt/UsxiuDq+Xx+pJj/qqXcucKuW3RVgMpBIAzAHmJkz51lb/B8IATlIj/ABvy99ZS3jpuQesADXr1O1a4eTHLbgvPqS5NHW8Ld4fmka6RlKpGmUTt5T/mPWlf/am5nUIbeSCsLOYGQwjTYkRHSsFg8Bh7qjxtmG8MY06Spp3/AOn00i7c9zKP+2pfOxp1L37DTfwa1MNa75r9xlCFWVlGuYEgqWJjbxaQf7w1Jt4rh1sCFCqTpCrBPurFtwRCIOIuH1K/lS24IjADvn05DL+VJ/qGH6/gLZuLXFuHqZEArBmAPORrrTd3G8ODsmUZkMHwjQ1g73Zi2RrcuHzGX8RTnG+G287Xg1wnLbJECJCKrTGsyDPnNVHm4peMVs2WHxWAuZiLXs7yi7dRrtSP37hhXNCxIB0UQT18WlcxGLIOSSFJgaidZ1H9at37NWz/AOs//KPw2qpcmEK7hbNpbxXDWE5DG3T/ALqFc5uYazbJHeE5TEHn1225UKtZ4vxfgXYT2XxxN32oQAnQTJPL1mteLitOu33o1+VJtINBAiOlLKiRpyP414mfKss+yVAlQaWU1gD1gfXLNRsdjUtLMFiTAAAP0qdZtLr4R8BVB2lY5InmPxqMMe+RJjlpFXa44zPmmBz9QNNdfWru9wezeIuuGMjrHx0kn31hebDkGUAdB4tBW14cxKLJJ8J+gr0uVDpThoiLLOzaVBofcSTp6DYU6LwGgien61qvY+H1FKQRoNNFPv615rhatssl3cVA2X3mPwrGY7AoWJN63J1hZ98eflVwznqdxUTH21ykwJ9POu3jL/G9fIpAudoCoVFMrAHnCwsHyq5TtJaI0bXnv028/wClZDDmII3J189TvUvEqA7QI8RrfPghN7RHZo1VnjCOJ/CnBjxEmAP5aobu08+vxqbZAyD0H0NcEsMV4V2M5xfFO15rgVmER7JGh92npVx2bxLalpVSNAfidD05VeJh0iMix0gULFpQNFG/Qf4a3ychPH0oEr2LCtyGnUkn8KafBIYzIDzgwYNSQI20o51TzJB+dcCk14WRksqhgIBA8h8OfOnjpHhH657a0nHXCDoSN9j6UaMSiEmTI1+NN7VsQoMvSPU8vTlQZF8/dAplmMjU/ommn3NNRthZD/aPiiMSBJju0KnpI3+UU3gMRcvWIXTTLmOXxGPP3c6P9oCjv7Wn+62v+q7UTs0f4T/5T7+tevyYrpZC9Gx2XuIQQ4IjWfw1jrrV7gu+jLcKTyymRHnS8OZZvKPpTl06kctNPfXnZMssiqRaVDeKxqWxLNHpJn0pOA49bzDIWJY93tvm0gfn5UL4ERy0094qsuqBcgAABwQBpGp2rTj443fyjTHHsX/GMeEdM7AF15yNRp0NMLfJErqPIzVfxhy4t5iW0ffXmvWqPAMRcUAwJ2+Na5+NFyckEoUrNYXkaj5fTyqux99YhbLSdmVG/wBTVsB4QfIfjUXFmAI0rjxtRkZvZQ8ML2wWLR1BGTXXqOXzmrbB8VDzMeROnOi4ogKCQDExWZwrEYhlnwgp4eXszt613rHHNFyfpF0baxLCRB9CT8ZospHMn0B/OqzgR1b0X8auSo6cxXn5I9Z0XehpnI5MfIa/Wm79oOIIMHfcVLYSB60phsOUDSsu1bQ2Uf8AYlmfY94Yz9fwqSLaqIJPvpVg6xy6fGidRB03aD5jpWznKTpskyXHdLhfQr+uY3oqsO0WHQLoijfkOW1CvZwtOCJo/9k=',
    jobDescription: 'Nhiều vị trí IT Developer, Tester, BA',
  },
  {
    id: 'emp6',
    name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    jobsCount: 150,
    location: 'Toàn quốc',
    logo: 'https://static.careerlink.vn/image/4470b50632038c68e8df1d3084f70bff',
    backgroundImage: 'https://static.careerlink.vn/image/4470b50632038c68e8df1d3084f70bff',
    jobDescription: 'Chuyên viên tín dụng, Giao dịch viên',
  },
];

const initialState = {
  featuredJobs: mockFeaturedJobs,
  jobCategories: mockJobCategories,
  topEmployers: mockTopEmployers,
  loading: false,
  error: null as string | null,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    setHomepageData: (state, action: PayloadAction<DataHomepage>) => {
      state.featuredJobs = action.payload.featuredJobs;
      state.jobCategories = action.payload.jobCategories;
      state.topEmployers = action.payload.topEmployers;
      state.loading = false;
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.featuredJobs = action.payload;
      })
      .addCase(fetchFeaturedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setHomepageData } = homepageSlice.actions;
export default homepageSlice.reducer;
