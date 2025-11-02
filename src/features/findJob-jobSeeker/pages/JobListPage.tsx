import React from 'react';
import { useParams } from 'react-router-dom';
import JobCard from '../../homepage-jobSeeker/components/JobCard';
import { mockJobs } from '../mockData';
import { Breadcrumb, Select, Pagination } from 'antd';
import { SearchBar } from '../components/SearchBar';

const { Option } = Select;

// Mock data for job list
const JobListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const title = slug ? slug.replace(/-/g, ' ').replace(/^(nganh|tai) /, '') : 'Việc làm';

  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page);
    // Implement pagination logic here
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item href="/viec-lam">Việc làm</Breadcrumb.Item>
        <Breadcrumb.Item className="capitalize">{title}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-2xl font-bold mb-4 capitalize">Việc làm {title}</h1>

      {/* Main Content - Job List */}
      <div className="max-w-4xl mx-auto">
        {/* Filters and Result Count */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
          <div>
            <span>Sắp xếp theo: </span>
            <Select defaultValue="newest" style={{ width: 150 }}>
              <Option value="newest">Mới nhất</Option>
              <Option value="relevance">Liên quan nhất</Option>
            </Select>
          </div>
          <div className="text-gray-600">
            Hiển thị <strong>{mockJobs.length}</strong> kết quả
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination defaultCurrent={1} total={mockJobs.length * 2} pageSize={mockJobs.length} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default JobListPage;
