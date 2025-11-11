import React from 'react';
import { Row, Col } from 'antd';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileDetails from '../components/ProfileDetails';

const JobSeekerProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <ProfileSidebar />
        </Col>
        <Col xs={24} md={18}>
          <ProfileDetails />
        </Col>
      </Row>
    </div>
  );
};

export default JobSeekerProfilePage;
