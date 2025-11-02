import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { NavLink } from 'react-router-dom';

export const PopularLocations = () => {
  const { popularLocations, loading } = useSelector((state: RootState) => state.findJob);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-4 border-b pb-2">Địa điểm phổ biến</h3>
      <ul>
        {popularLocations.map((location) => (
          <li key={location.id} className="mb-2">
            <NavLink to={`/viec-lam/tai-${location.id}`} className="text-gray-700 hover:text-blue-600 flex justify-between">
              <span>{location.name}</span>
              <span>({location.count})</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
