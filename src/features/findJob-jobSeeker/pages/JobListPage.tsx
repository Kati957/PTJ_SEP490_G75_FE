import React from "react";
import { useParams } from "react-router-dom";
import JobCard from "../../homepage-jobSeeker/components/JobCard";
import { mockJobs } from "../mockData";
import { Breadcrumb, Select, Pagination } from "antd";
import { SearchBar } from "../components/SearchBar";
import type { JobSearchFilters } from "../types";

const { Option } = Select;

const JobListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const title = slug
    ? slug.replace(/-/g, " ").replace(/^(nganh|tai) /, "")
    : "Viec lam";

  const placeholderFilters: JobSearchFilters = {
    keyword: "",
    provinceId: null,
    categoryId: null,
    subCategoryId: null,
    salary: "all",
  };

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar value={placeholderFilters} onSearch={() => {}} />
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Trang chu</Breadcrumb.Item>
        <Breadcrumb.Item href="/viec-lam">Viec lam</Breadcrumb.Item>
        <Breadcrumb.Item className="capitalize">{title}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-2xl font-bold mb-4 capitalize">Viec lam {title}</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
          <div>
            <span>Sap xep theo: </span>
            <Select defaultValue="newest" style={{ width: 150 }}>
              <Option value="newest">Moi nhat</Option>
              <Option value="relevance">Lien quan nhat</Option>
            </Select>
          </div>
          <div className="text-gray-600">
            Hien thi <strong>{mockJobs.length}</strong> ket qua
          </div>
        </div>

        <div className="space-y-4">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            defaultCurrent={1}
            total={mockJobs.length * 2}
            pageSize={mockJobs.length}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default JobListPage;
