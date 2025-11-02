import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import HeroSection from '../components/HeroSection';
import FeaturedJobs from '../features/homepage-jobSeeker/components/FeaturedJobs';
import { fetchFeaturedJobs } from '../features/homepage-jobSeeker/homepageSlice';
import JobCategoriesSlider from '../features/homepage-jobSeeker/components/JobCategoriesSlider';
import TopEmployersSlider from '../features/homepage-jobSeeker/components/TopEmployersSlider';

const JobSeekerHomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Gọi thunk để lấy dữ liệu featured jobs khi component được mount
    dispatch(fetchFeaturedJobs());
  }, [dispatch]);

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Jobs Section */}
      <FeaturedJobs />

      {/* Job Categories Section */}
      <JobCategoriesSlider />

      {/* Top Employers Section */}
      <TopEmployersSlider />
    </>
  );
};
export default JobSeekerHomePage;
