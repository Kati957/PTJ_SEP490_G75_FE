import React from 'react';
import { EmployerBanner } from '../../employer-landingpage/components/EmployerBanner';
import { ServiceList } from '../../employer-landingpage/components/ServiceList';
import { WhyChoose } from '../../employer-landingpage/components/WhyChoose';
import { HandbookSection } from '../../article/components/HandbookSection';
import { EmployerLoginForm } from '../../auth/components/EmployerLoginForm';
import { OfficeLocations } from '../../../components/Contact/OfficeLocations';

const EmployerPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <main className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <EmployerBanner />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ServiceList />
              <WhyChoose />
            </div>
          </div>
          
          <HandbookSection />
        </main>

        <aside className="md:col-span-1 space-y-6">
          <EmployerLoginForm />
          <OfficeLocations />
        </aside>

      </div>
    </div>
  );
};

export default EmployerPage;