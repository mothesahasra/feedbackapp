import React, { useMemo } from 'react';
import type { Feedback } from '../types';
import { DashboardStats } from './DashboardStats';
import { FeedbackForm } from './FeedbackForm';
import { RatingFilter } from './RatingFilter';
import { FeedbackList } from './FeedbackList';
import { Sparkles } from 'lucide-react';

interface StudentDashboardProps {
  userName: string;
  feedbackList: Feedback[];
  allFeedback: Feedback[];
  averageRating: number;
  totalCount: number;
  loading: boolean;
  submitting: boolean;
  selectedRating: number | null;
  onRatingFilterChange: (rating: number | null) => void;
  onSubmitFeedback: (data: {
    studentName: string;
    courseName: string;
    rating: number;
    comments?: string;
  }) => Promise<void>;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userName,
  feedbackList,
  allFeedback,
  averageRating,
  totalCount,
  loading,
  submitting,
  selectedRating,
  onRatingFilterChange,
  onSubmitFeedback,
}) => {
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

  return (
    <div className="student-dashboard-container">
      {/* Student Welcome Banner */}
      <div className="student-welcome-banner">
        <div className="student-banner-text">
          <div className="student-role-badge">
            <Sparkles size={16} />
            <span>Student Dashboard</span>
          </div>
          <h2 className="welcome-heading">Welcome back, {userName}!</h2>
          <p className="welcome-subtext">
            Submit your course evaluations and explore feedback from fellow students.
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <section className="summary-section" aria-label="Course Feedback Summary">
        <DashboardStats
          averageRating={averageRating}
          totalCount={totalCount}
          allFeedback={allFeedback}
          loading={loading}
        />
      </section>

      {/* Two Column Layout: Form on Left, Reviews on Right */}
      <div className="content-grid">
        <aside className="left-column">
          <FeedbackForm
            onSubmit={onSubmitFeedback}
            submitting={submitting}
          />
        </aside>

        <section className="right-column" aria-label="Course Feedback Reviews">
          <div className="list-controls-card">
            <div className="list-header-row">
              <div className="list-title-group">
                <h3 className="section-title">Course Feedback Reviews</h3>
                <span className="results-badge">
                  {selectedRating !== null
                    ? `Showing ${feedbackList.length} reviews for ${selectedRating} Stars`
                    : `Showing all ${feedbackList.length} reviews`}
                </span>
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

          {/* Feedback Cards List */}
          <FeedbackList
            feedbackList={feedbackList}
            loading={loading}
            selectedRating={selectedRating}
            onResetFilter={() => onRatingFilterChange(null)}
          />
        </section>
      </div>
    </div>
  );
};
