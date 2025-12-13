import React from "react";

const columns = [
  {
    title: "Khám phá",
    links: ["Trang chủ", "Việc làm", "Danh mục nghề", "Nhà tuyển dụng", "Liên hệ"],
  },
  {
    title: "Về PTJ",
    links: ["Giới thiệu", "Đội ngũ", "Tuyển dụng", "Khách hàng", "Blog"],
  },
  {
    title: "Hỗ trợ",
    links: ["FAQ", "Chính sách bảo mật", "Điều khoản", "Đối tác", "Trợ giúp"],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2d2f33] text-slate-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-2xl font-semibold text-white mb-4">PTJ</div>
            <p className="text-sm text-slate-400">
              Nền tảng kết nối việc làm bán thời gian uy tín, giúp bạn tìm kiếm cơ hội phù hợp chỉ trong vài bước.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h4 className="text-sm font-semibold uppercase text-white tracking-widest">{column.title}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {column.links.map((label) => (
                  <li key={label}>
                    <span className="transition hover:text-white cursor-default">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © 2025 Part-Time Job. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
