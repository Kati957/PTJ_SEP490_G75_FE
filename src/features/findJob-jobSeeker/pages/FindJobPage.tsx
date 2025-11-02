import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchFindJobData } from '../slice';
import type { AppDispatch } from '../../../app/store';
import { SearchBar } from '../components/SearchBar';
import { JobCategories } from '../components/JobCategories';
import { JobLocations } from '../components/JobLocations';
import { PopularLocations } from '../components/PopularLocations';

const FindJobPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchFindJobData());
  }, [dispatch]);

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <JobCategories />
          <JobLocations />
        </div>
        <div className="lg:w-1/4">
          <PopularLocations />
        </div>
      </div>
    </div>
  );
};

export default FindJobPage;
