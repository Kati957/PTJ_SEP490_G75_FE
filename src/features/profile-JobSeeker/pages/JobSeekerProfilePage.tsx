import React from 'react';
import { Card, Tabs } from 'antd';
import ProfileDetails from '../components/ProfileDetails';
import ProfileOverview from '../components/ProfileOverview';
import { useJobSeekerProfile } from '../hooks/useJobSeekerProfile';
import { useAuth } from '../../auth/hooks';

const JobSeekerProfilePage: React.FC = () => {
  const { profile, loading, error } = useJobSeekerProfile();
  const { user } = useAuth();

  const email = user?.username ? `${user.username}@gmail.com` : undefined;

  const tabItems = [
    {
      key: 'overview',
      label: 'Tong quan',
      children: <ProfileOverview profile={profile} loading={loading} email={email} />,
    },
    {
      key: 'edit',
      label: 'Chinh sua ho so',
      children: <ProfileDetails profile={profile} loading={loading} error={error} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="shadow-lg">
          <Tabs defaultActiveKey="overview" items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerProfilePage;
