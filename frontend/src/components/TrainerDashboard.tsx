import React, { useState, useMemo } from 'react';
import type { Feedback } from '../types';
import { DashboardStats } from './DashboardStats';
import { RatingFilter } from './RatingFilter';
import { FeedbackList } from './FeedbackList';
import { ShieldCheck, Search } from 'lucide-react';

interface TrainerDashboardProps {
  userName: string;
  feedbackList: Feedback[];
  allFeedback: Feedback[];
  averageRating: number;
  totalCount: number;
  loading: boolean;
  selectedRating: number | null;
  onRatingFilterChange: (rating: number | null) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  userName,
  feedbackList,
  allFeedback,
  averageRating,
  totalCount,
  loading,
  selectedRating,
  onRatingFilterChange,
}) => {
  const [courseFilter, setCourseFilter] = useState('');

  // Extract unique courses for filtering
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    allFeedback.forEach((f) => {
      if (f.courseName) set.add(f.courseName.trim());
    });
    return Array.from(set).sort();
  }, [allFeedback]);

  // Compute breakdown map for rating filter pills
  const ratingCountMap = useMemo(() => {
    const map: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allFeedback.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        map[f.rating] = (map[f.rating] || 0) + 1;
      }
    });
    return map;
  }, [allFeedback]);

  // Filter feedback by course on the trainer view
  const displayedFeedback = useMemo(() => {
    if (!courseFilter.trim()) return feedbackList;
    return feedbackList.filter((f) =>
      f.courseName.toLowerCase().includes(courseFilter.toLowerCase().trim())
    );
  }, [feedbackList, courseFilter]);

  return (
    <div className="trainer-dashboard-container">
      {/* Trainer Banner */}
      <div className="trainer-welcome-banner">
        <div className="trainer-banner-text">
          <div className="trainer-role-badge">
            <ShieldCheck size={16} />
            <span>Trainer / Instructor Portal</span>
          </div>
          <h2 className="welcome-heading">Welcome, {userName}!</h2>
          <p className="welcome-subtext">
            Monitor overall course ratings, inspect student reviews, and analyze instructional feedback.
          </p>
        </div>
      </div>

      {/* Overview Statistics */}
      <section className="summary-section" aria-label="Course Analytics Overview">
        <DashboardStats
          averageRating={averageRating}
          totalCount={totalCount}
          allFeedback={allFeedback}
          loading={loading}
        />
      </section>

      {/* Main Review Section */}
      <section className="trainer-reviews-section">
        <div className="list-controls-card">
          <div className="trainer-controls-header">
            <div>
              <h3 className="section-title">All Course Feedback Submissions</h3>
              <span className="results-badge">
                Showing {displayedFeedback.length} of {totalCount} total submissions
              </span>
            </div>

            {/* Course Filter Dropdown & Search */}
            <div className="course-filter-group">
              <div className="course-search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="course-search-input"
                  placeholder="Filter by course name..."
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  list="course-suggestions"
                />
                <datalist id="course-suggestions">
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {courseFilter && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setCourseFilter('')}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rating Filter Component */}
          <RatingFilter
            selectedRating={selectedRating}
            onSelectRating={onRatingFilterChange}
            countMap={ratingCountMap}
            totalCount={totalCount}
          />
        </div>

        {/* Feedback List */}
        <FeedbackList
          feedbackList={displayedFeedback}
          loading={loading}
          selectedRating={selectedRating}
          onResetFilter={() => {
            onRatingFilterChange(null);
            setCourseFilter('');
          }}
        />
      </section>
    </div>
  );
};
