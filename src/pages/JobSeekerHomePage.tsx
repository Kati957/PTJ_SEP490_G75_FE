import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import HeroSection from '../components/HeroSection';
import FeaturedJobs from '../features/homepage-jobSeeker/components/FeaturedJobs';
import { fetchFeaturedJobs } from '../features/homepage-jobSeeker/homepageSlice';
import JobCategoriesSlider from '../features/homepage-jobSeeker/components/JobCategoriesSlider';
import TopEmployersSlider from '../features/homepage-jobSeeker/components/TopEmployersSlider';
import LightningBadgeBanner from '../components/LightningBadgeBanner';
import FeaturedEmployersShowcase from '../components/FeaturedEmployersShowcase';

const JobSeekerHomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Gọi thunk để lấy dữ liệu featured jobs khi component được mount
    dispatch(fetchFeaturedJobs());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HeroSection />

      <div className="space-y-0">
        <div className="bg-white py-16">
          <FeaturedJobs />
        </div>

        <div className="bg-slate-50 py-16">
          <FeaturedEmployersShowcase />
        </div>

        <div className="bg-white py-16">
          <LightningBadgeBanner />
        </div>

        <div className="bg-slate-50 py-16">
          <JobCategoriesSlider />
        </div>

        <div className="bg-white py-16">
          <TopEmployersSlider />
        </div>
      </div>
    </div>
  );
};
export default JobSeekerHomePage;
