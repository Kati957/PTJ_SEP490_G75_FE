import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { NavLink } from 'react-router-dom';

export const JobLocations = () => {
  const { locationsByAlphabet, loading } = useSelector((state: RootState) => state.findJob);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Tìm kiếm việc làm nhanh theo địa điểm</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.keys(locationsByAlphabet).map((letter) => (
          <div key={letter}>
            <h3 className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 mb-3">{letter}</h3>
            <ul>
              {locationsByAlphabet[letter].map((location) => (
                <li key={location.id} className="mb-2">
                  <NavLink to={`/viec-lam/tai-${location.id}`} className="text-gray-700 hover:text-blue-600">
                    {location.name} ({location.count})
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
