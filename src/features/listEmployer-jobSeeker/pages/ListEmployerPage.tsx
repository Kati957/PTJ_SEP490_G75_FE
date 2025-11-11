import React, { useState, useMemo } from 'react';
import { Row, Col, Input, Typography, Spin, Pagination, Empty } from 'antd';
import { useEmployers } from '../hooks/useEmployers';
import EmployerCard from '../components/EmployerCard';

const { Title, Text } = Typography;
const { Search } = Input;

const ListEmployerPage: React.FC = () => {
  const {
    employers,
    loading,
    filters,
    applyFilters,
  } = useEmployers();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const paginatedEmployers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return employers.slice(startIndex, startIndex + pageSize);
  }, [employers, currentPage, pageSize]);

  const handleSearch = (keyword: string) => {
    setCurrentPage(1);
    applyFilters({ keyword });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-6">
      <Title level={2} className="text-center mb-6">Nhà tuyển dụng hàng đầu</Title>
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
                />
              </Col>
              <Col style={{ paddingLeft: '16px' }}>
                {loading ? <Spin /> : <Text strong>{employers.length} nhà tuyển dụng được tìm thấy</Text>}
              </Col>
            </Row>

            {loading ? (
              <div className="text-center p-10">
                <Spin size="large" />
              </div>
            ) : paginatedEmployers.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {paginatedEmployers.map((employer) => (
                    <Col key={employer.id} xs={24} sm={12} md={8} lg={6}>
                      <EmployerCard employer={employer} />
                    </Col>
                  ))}
                </Row>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={employers.length}
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
