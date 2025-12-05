import React, { useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Arrow Components
interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const NextArrow = ({ className, style, onClick }: ArrowProps) => (
  <div
    className={`${className} !z-10 !w-10 !h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-lg transition-all cursor-pointer`}
    style={{ ...style, display: "flex", right: "-15px" }}
    onClick={onClick}
  ></div>
);

const PrevArrow = ({ className, style, onClick }: ArrowProps) => (
  <div
    className={`${className} !z-10 !w-10 !h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-lg transition-all cursor-pointer`}
    style={{ ...style, display: "flex", left: "-15px" }}
    onClick={onClick}
  ></div>
);

const JobCategoriesSlider: React.FC = () => {
  const { jobCategories } = useSelector((state: RootState) => state.homepage);
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 5 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Top ngành nghề hấp dẫn
          </h2>
          <Link
            to="/jobs"
            className="text-blue-600 hover:text-blue-800 transition font-semibold text-sm"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #5B247A 0%, #1B1464 100%)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
        >
          {/* Glassmorphism overlay effect */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <Slider ref={sliderRef} {...settings}>
              {jobCategories.map((category) => (
                <div key={category.id} className="px-2 h-full">
                  <Link
                    to={`/jobs?category=${category.id}`}
                    className="group flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 border border-white/5 hover:border-white/20 h-full"
                  >
                    <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-8 h-8 object-contain filter brightness-0 invert"
                      />
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1 group-hover:text-blue-200 transition-colors line-clamp-2 min-h-[3rem] flex items-center justify-center">
                      {category.name}
                    </h3>
                    <span className="text-blue-200/80 text-sm">
                      {category.count.toLocaleString()} việc làm
                    </span>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSlider;
