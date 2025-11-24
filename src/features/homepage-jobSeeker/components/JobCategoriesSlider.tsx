import React from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { Link } from 'react-router-dom';

const PrevArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white"
    style={{
      position: 'absolute',
      left: '0px',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}
  >
    <LeftOutlined className="!text-xl !text-slate-700" />
  </div>
);

const NextArrow = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="custom-arrow !w-12 !h-12 !rounded-full !bg-white/90 !shadow-lg !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-white"
    style={{
      position: 'absolute',
      right: '0px',
      top: '50%',
      transform: 'translate(50%, -50%)'
    }}
  >
    <RightOutlined className="!text-xl !text-slate-700" />
  </div>
);

const newsItems = [
  {
    id: 'news-1',
    title: 'TopCV ra mắt huy hiệu Tia Sét cho tin tuyển dụng tương tác cao',
    summary: 'Huy hiệu giúp ứng viên nhận diện nhanh những tin tuyển dụng được nhà tuyển dụng phản hồi tích cực.',
    date: '22/11/2025',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    link: '/news/huy-hieu-tia-set'
  },
  {
    id: 'news-2',
    title: 'Cập nhật bảo mật tài khoản: Xác thực 2 bước cho nhà tuyển dụng',
    summary: 'Bổ sung lớp bảo vệ mới, giảm thiểu rủi ro truy cập trái phép vào tài khoản doanh nghiệp.',
    date: '20/11/2025',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
    link: '/news/xac-thuc-2-buoc'
  },
  {
    id: 'news-3',
    title: 'Thị trường IT cuối năm: Lương Fresher tăng 8%',
    summary: 'Báo cáo nhân sự cho thấy mức đãi ngộ Fresher/Junior tăng nhẹ, nhu cầu Java, .NET tiếp tục cao.',
    date: '18/11/2025',
    image:
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80',
    link: '/news/thi-truong-it-cuoi-nam'
  },
  {
    id: 'news-4',
    title: 'Gợi ý CV cho sinh viên mới tốt nghiệp',
    summary: 'Checklist nhanh cho CV ngành kinh tế, CNTT, marketing kèm các mẫu miễn phí.',
    date: '15/11/2025',
    image:
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
    link: '/news/cv-cho-sinh-vien'
  },
  {
    id: 'news-5',
    title: 'Workshop online: Phỏng vấn nhóm và bài test tính cách',
    summary: 'Chia sẻ từ HR lead về cách chuẩn bị cho vòng interview nhóm và bài đánh giá năng lực.',
    date: '12/11/2025',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    link: '/news/workshop-phong-van-nhom'
  },
  {
    id: 'news-6',
    title: 'Top ngành hot cuối 2025: Data, Security, Product',
    summary: 'Phân tích nhu cầu tuyển dụng và kỹ năng cần chuẩn bị cho 3 nhóm ngành nổi bật.',
    date: '10/11/2025',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    link: '/news/nganh-hot-cuoi-nam'
  }
];

const JobCategoriesSlider: React.FC = () => {
  const sliderRef = React.useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    rows: 1,
    slidesPerRow: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4, slidesToScroll: 1 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  return (
    <section className="px-4">
      <div className="max-w-[120rem] mx-auto bg-white border border-gray-200 rounded-3xl p-12 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 text-slate-900">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-blue-500">Tin tức</p>
            <h2 className="text-3xl font-bold">Tin tức mới nhất</h2>
          </div>
          <Link
            to="/news"
            className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div className="relative px-4 md:px-10">
          <Slider ref={sliderRef} {...settings} autoplay>
            {newsItems.map((item) => (
              <div key={item.id} className="p-2">
                <div className="p-5 rounded-2xl shadow-lg bg-white text-slate-800 flex flex-col h-full border border-blue-50 hover:border-blue-400 transition">
                  <div className="h-32 w-full rounded-xl overflow-hidden mb-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-500">{item.date}</p>
                    <h3 className="text-md font-semibold leading-tight">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-snug">{item.summary}</p>
                  </div>
                  <Link
                    to={item.link}
                    className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Đọc tiếp <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </Slider>

          <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
          <NextArrow onClick={() => sliderRef.current?.slickNext()} />
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSlider;
