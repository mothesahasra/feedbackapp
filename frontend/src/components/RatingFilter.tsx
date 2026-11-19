import React from 'react';
import { Filter, Star } from 'lucide-react';

interface RatingFilterProps {
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  countMap?: Record<number, number>;
  totalCount: number;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({
  selectedRating,
  onSelectRating,
  countMap,
  totalCount,
}) => {
  const filterOptions = [
    { label: 'All Ratings', value: null, count: totalCount },
    { label: '5 Stars', value: 5, count: countMap ? countMap[5] : undefined },
    { label: '4 Stars', value: 4, count: countMap ? countMap[4] : undefined },
    { label: '3 Stars', value: 3, count: countMap ? countMap[3] : undefined },
    { label: '2 Stars', value: 2, count: countMap ? countMap[2] : undefined },
    { label: '1 Star', value: 1, count: countMap ? countMap[1] : undefined },
  ];

  return (
    <div className="filter-bar" role="toolbar" aria-label="Filter feedback by rating">
      <div className="filter-label-group">
        <Filter size={16} className="filter-icon" />
        <span className="filter-label-text">Filter by Rating:</span>
      </div>
      <div className="filter-pills-container">
        {filterOptions.map((opt) => {
          const isActive = selectedRating === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              className={`filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectRating(opt.value)}
              aria-pressed={isActive}
              id={`filter-${opt.value ?? 'all'}`}
            >
              {opt.value !== null && (
                <Star
                  size={14}
                  className="filter-star-icon"
                  fill="currentColor"
                />
              )}
              <span className="filter-pill-text">{opt.label}</span>
              {typeof opt.count === 'number' && (
                <span className={`filter-badge ${isActive ? 'active-badge' : ''}`}>
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
