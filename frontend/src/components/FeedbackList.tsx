import React from 'react';
import type { Feedback } from '../types';
import { StarRating } from './StarRating';
import { Calendar, BookOpen, MessageSquareDashed, RotateCcw } from 'lucide-react';

interface FeedbackListProps {
  feedbackList: Feedback[];
  loading: boolean;
  selectedRating: number | null;
  onResetFilter: () => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbackList,
  loading,
  selectedRating,
  onResetFilter,
}) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ST';
  };

  if (loading) {
    return (
      <div className="feedback-list-loading">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrapper">
          <MessageSquareDashed size={40} className="empty-icon" />
        </div>
        <h3 className="empty-state-title">
          {selectedRating
            ? `No ${selectedRating}-Star Feedback Found`
            : 'No Feedback Records Yet'}
        </h3>
        <p className="empty-state-desc">
          {selectedRating
            ? `There are currently no reviews with a ${selectedRating}-star rating. Try selecting another rating or viewing all records.`
            : 'Be the first student to review a course! Fill out the submission form on the left to add your feedback.'}
        </p>
        {selectedRating && (
          <button
            type="button"
            className="reset-filter-btn"
            onClick={onResetFilter}
          >
            <RotateCcw size={16} />
            <span>Show All Ratings</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-cards-grid" role="feed" aria-label="Course feedback list">
      {feedbackList.map((feedback) => (
        <article key={feedback.id || `${feedback.studentName}-${feedback.courseName}`} className="feedback-card">
          <div className="card-top-row">
            <div className="student-profile">
              <div className="avatar-initials" aria-hidden="true">
                {getInitials(feedback.studentName)}
              </div>
              <div className="student-meta">
                <h4 className="student-name">{feedback.studentName}</h4>
                <div className="timestamp-wrapper">
                  <Calendar size={13} className="meta-icon" />
                  <time dateTime={feedback.submittedAt}>
                    {formatDate(feedback.submittedAt)}
                  </time>
                </div>
              </div>
            </div>

            <div className="rating-badge-container">
              <StarRating rating={feedback.rating} size={16} />
              <span className="rating-score-chip">{feedback.rating}.0</span>
            </div>
          </div>

          <div className="course-badge-row">
            <div className="course-chip">
              <BookOpen size={14} className="course-icon" />
              <span className="course-title">{feedback.courseName}</span>
            </div>
          </div>

          {feedback.comments ? (
            <p className="feedback-comment-text">{feedback.comments}</p>
          ) : (
            <p className="feedback-no-comment">No additional comments provided.</p>
          )}
        </article>
      ))}
    </div>
  );
};
