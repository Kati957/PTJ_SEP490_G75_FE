import React, { useState, useMemo } from 'react';
import { Row, Col, Input, Typography, Spin, Pagination, Empty } from 'antd';
import { useEmployers } from '../hooks/useEmployers';
import EmployerCard from '../components/EmployerCard';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search } = Input;

const ListEmployerPage: React.FC = () => {
  const {
    employers,
    loading,
    filters,
    applyFilters,
    totalRecords,
    currentPage,
    pageSize
  } = useEmployers();

  const handleSearch = (keyword: string) => {
    applyFilters({ keyword, page: 1 });
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    applyFilters({ 
      page, 
      pageSize: newPageSize || pageSize 
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Title level={2} className="text-center mb-6">Nhà tuyển dụng </Title>
      <Row justify="center">
        <Col xs={24} md={20} lg={18}>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Row justify="space-between" align="middle" className="mb-4">
              <Col flex="auto">
                <Search
                  placeholder="Tìm tên nhà tuyển dụng"
                  onSearch={handleSearch}
                  enterButton
                  defaultValue={filters.keyword}
                  loading={loading}
                />
              </Col>
              <Col style={{ paddingLeft: '16px' }}>
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <Text strong>{totalRecords} nhà tuyển dụng đang có</Text>
                )}
              </Col>
            </Row>

            {loading ? (
              <div className="text-center p-10">
                <Spin size="large" />
              </div>
            ) : employers.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {employers.map((employer) => (
                    <Col key={employer.id} xs={24} sm={12} md={8} lg={6}>
                      <Link to={`/nha-tuyen-dung/chi-tiet/${employer.id}`} className="block h-full">
                         <EmployerCard employer={employer} />
                      </Link>
                    </Col>
                  ))}
                </Row>
                
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={handlePageChange}
                  className="text-center mt-6"
                  showSizeChanger={false}
                />
              </>
            ) : (
              <Empty description="Không tìm thấy nhà tuyển dụng nào phù hợp." />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ListEmployerPage;
