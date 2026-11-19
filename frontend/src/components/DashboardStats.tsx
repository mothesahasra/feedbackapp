import React from 'react';
import { StarRating } from './StarRating';
import { Award, MessageSquare, TrendingUp } from 'lucide-react';
import type { Feedback } from '../types';

interface DashboardStatsProps {
  averageRating: number;
  totalCount: number;
  allFeedback: Feedback[];
  loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  averageRating,
  totalCount,
  allFeedback,
  loading = false,
}) => {
  // Calculate distribution for mini breakdown
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allFeedback.forEach((f) => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingCounts[f.rating] = (ratingCounts[f.rating] || 0) + 1;
    }
  });

  return (
    <div className="stats-grid">
      {/* Average Rating Card */}
      <div className="stat-card primary-stat">
        <div className="stat-card-header">
          <span className="stat-title">Average Rating</span>
          <div className="stat-icon-badge amber-badge">
            <Award size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-number-row">
            <span className="stat-big-number">
              {loading ? '--' : averageRating.toFixed(2)}
            </span>
            <span className="stat-max-number">/ 5.00</span>
          </div>
          <div className="stat-stars-row">
            <StarRating rating={Math.round(averageRating)} size={18} />
            <span className="stat-caption">
              {totalCount === 0 ? 'No ratings yet' : `Across all courses`}
            </span>
          </div>
        </div>
      </div>

      {/* Total Submissions Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-title">Total Feedback</span>
          <div className="stat-icon-badge indigo-badge">
            <MessageSquare size={18} />
          </div>
        </div>
        <div className="stat-body">
          <div className="stat-number-row">
            <span className="stat-big-number">
              {loading ? '--' : totalCount}
            </span>
            <span className="stat-unit">reviews</span>
          </div>
          <p className="stat-caption">
            {totalCount === 1 ? '1 student review recorded' : `${totalCount} student reviews recorded`}
          </p>
        </div>
      </div>

      {/* Satisfaction / Breakdown Card */}
      <div className="stat-card distribution-stat">
        <div className="stat-card-header">
          <span className="stat-title">Rating Breakdown</span>
          <div className="stat-icon-badge emerald-badge">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="stat-body distribution-body">
          {[5, 4, 3, 2, 1].map((r) => {
            const count = ratingCounts[r] || 0;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={r} className="distribution-row">
                <span className="dist-star-label">{r}★</span>
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{ width: `${percentage}%` }}
                    title={`${count} reviews (${percentage.toFixed(0)}%)`}
                  />
                </div>
                <span className="dist-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
