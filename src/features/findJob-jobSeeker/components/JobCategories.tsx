import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { NavLink } from 'react-router-dom';

export const JobCategories = () => {
  const { majors, loading } = useSelector((state: RootState) => state.findJob);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Tìm kiếm việc làm nhanh theo ngành nghề</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {majors.map((major) => (
          <div key={major.id}>
            <h3 className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 mb-3">{major.name}</h3>
            <ul>
              {major.categories.map((category) => (
                <li key={category.id} className="mb-2">
                  <NavLink to={`/viec-lam/nganh-${category.id}`} className="text-gray-700 hover:text-blue-600">
                    {category.name} ({category.count})
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
