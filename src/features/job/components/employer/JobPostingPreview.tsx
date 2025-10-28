import React from "react";
import type { JobPostData } from "../../../../pages/employer/PostJobPage";
import { Button, Space, Tag } from "antd";
import {
  CameraOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ApartmentOutlined,
  TeamOutlined,
  ReadOutlined,
  ManOutlined,
  ClockCircleOutlined,
  TagOutlined,
  BookOutlined,
  LinkOutlined,
  PhoneOutlined,
  GlobalOutlined,
  FacebookFilled,
  LinkedinFilled,
  TwitterCircleFilled,
  MailOutlined,
} from "@ant-design/icons";

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start text-sm">
    <span className="text-gray-500 mr-2 mt-0.5">{icon}</span>
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-800">{value}</div>
    </div>
  </div>
);

export const JobPostingPreview: React.FC<{ data: JobPostData }> = ({
  data,
}) => {
  const postDate = data.postingDate ? new Date(data.postingDate) : new Date();
  const expiryDate = new Date(postDate.setDate(postDate.getDate() + 60));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="relative">
        <img
          src="https://via.placeholder.com/600x200?text=Banner"
          alt="Banner"
          className="w-full h-36 object-cover rounded-t-lg"
        />
        <Button
          icon={<CameraOutlined />}
          className="absolute top-4 right-4 bg-white bg-opacity-80"
        >
          Thay đổi ảnh bìa
        </Button>

        <div className="absolute top-24 left-6 w-20 h-20 bg-gray-100 border-4 border-white rounded-md flex items-center justify-center text-gray-400 text-4xl">
          <ApartmentOutlined />
        </div>
      </div>

      <div className="p-6 pt-10">
        <h2 className="text-2xl font-bold text-gray-800">
          {data.jobTitle || "(Chưa có tiêu đề)"}
        </h2>
        <p className="text-base text-gray-700 mb-4">{data.companyName}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <EnvironmentOutlined className="mr-2" />
            <span>(Địa điểm)</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarCircleOutlined className="mr-2" />
            <span className="font-semibold text-blue-600">Trên 12 triệu</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserOutlined className="mr-2" />
            <span>{data.experienceLevel}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CalendarOutlined className="mr-2" />
            <span>
              Ngày đăng:{" "}
              {new Date(data.postingDate).toLocaleDateString("vi-VN")} | Hết hạn
              trong: <strong>60 Ngày tới</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="border-y border-gray-200 px-6 flex space-x-6 text-sm font-medium text-gray-500">
        <a
          href="#mo-ta"
          className="text-blue-600 border-b-2 border-blue-600 py-3"
        >
          Mô tả
        </a>
        <a href="#quyen-loi" className="hover:text-blue-600 py-3">
          Quyền lợi
        </a>
        <a href="#ky-nang" className="hover:text-blue-600 py-3">
          Kỹ năng yêu cầu
        </a>
        <a href="#chi-tiet" className="hover:text-blue-600 py-3">
          Chi tiết công việc
        </a>
        <a href="#lien-he" className="hover:text-blue-600 py-3">
          Liên hệ
        </a>
        <a href="#ve-cong-ty" className="hover:text-blue-600 py-3">
          Về công ty
        </a>
      </div>

      <div className="p-6 space-y-8">
        <section id="mo-ta">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Mô tả công việc
          </h3>
          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: data.jobDescription || "<p>(Chưa có mô tả)</p>",
            }}
          />
        </section>

        <section id="phuc-loi">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Phúc lợi</h3>
          {data.jobBenefits.trim() ? (
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: data.jobBenefits || "<p>(Chưa có phúc lợi)</p>",
              }}
            />
          ) : (
            <div className="text-center text-gray-500 p-6 bg-gray-50 rounded-md">
              <p>Bạn chưa thêm phúc lợi nào vào công việc này!</p>
              <p className="text-xs">
                Hãy thêm phúc lợi mà công ty bạn có thể cung cấp...
              </p>
            </div>
          )}
        </section>

        <section id="ky-nang">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Kinh nghiệm / Kỹ năng chi tiết
          </h3>
          <p className="text-gray-700">(Chưa có kỹ năng chi tiết)</p>
        </section>

        <section id="chi-tiet">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mô tả</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-5 bg-gray-50 rounded-lg">
            <InfoRow
              icon={<TagOutlined />}
              label="Mã việc làm"
              value={data.jobCode}
            />
            <InfoRow
              icon={<ApartmentOutlined />}
              label="Loại công việc"
              value={data.jobType}
            />
            <InfoRow
              icon={<TeamOutlined />}
              label="Cấp bậc"
              value={data.jobLevel}
            />
            <InfoRow
              icon={<ReadOutlined />}
              label="Học vấn"
              value={data.educationLevel}
            />
            <InfoRow
              icon={<BookOutlined />}
              label="Kinh nghiệm"
              value={data.experienceLevel}
            />
            <InfoRow
              icon={<ManOutlined />}
              label="Giới tính"
              value={data.gender}
            />
            <InfoRow
              icon={<ClockCircleOutlined />}
              label="Tuổi"
              value={data.ageRange}
            />
            <InfoRow
              icon={<GlobalOutlined />}
              label="Ngành nghề"
              value={data.industry}
            />
          </div>
        </section>

        <section id="lien-he">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Thông tin liên hệ
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <MailOutlined className="mr-3 text-lg text-gray-500" />
              <div>
                Tên liên hệ:{" "}
                <span className="font-semibold">{data.contactPerson}</span>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <EnvironmentOutlined className="mr-3 text-lg text-gray-500" />
              <div>{data.contactAddress}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Nhận hồ sơ bằng ngôn ngữ:{" "}
            <strong>{data.applicationLanguage}</strong>
          </p>
        </section>

        <section id="ve-cong-ty">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Về công ty</h3>
          <p className="font-bold text-lg text-gray-800">{data.companyName}</p>
          <a
            href={data.companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm break-all"
          >
            {data.companyWebsite || "(Chưa có website)"}
          </a>
          <div className="flex space-x-4 text-sm text-gray-600 my-3">
            <span>
              <TeamOutlined className="mr-1" /> {data.companyEmployees} nhân
              viên
            </span>
            <span>
              <PhoneOutlined className="mr-1" /> Liên hệ: {data.contactPerson}
            </span>
          </div>
          <p className="text-gray-700">
            {data.companySummary || "(Chưa có sơ lược công ty)"}
          </p>

          <h4 className="font-bold text-gray-800 mt-4 mb-2">Từ khoá</h4>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((kw) => (
              <Tag key={kw} className="rounded-full">
                {kw}
              </Tag>
            ))}
          </div>

          <h4 className="font-bold text-gray-800 mt-4 mb-2">Chia sẻ</h4>
          <Space>
            <Button icon={<FacebookFilled />} />
            <Button icon={<LinkedinFilled />} />
            <Button icon={<TwitterCircleFilled />} />
            <Button icon={<LinkOutlined />} />
          </Space>
        </section>
      </div>
    </div>
  );
};
