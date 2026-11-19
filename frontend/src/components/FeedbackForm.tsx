import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Send, User, BookOpen, MessageSquare, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ApiError } from '../api';

interface FeedbackFormProps {
  onSubmit: (feedback: {
    studentName: string;
    courseName: string;
    rating: number;
    comments?: string;
  }) => Promise<void>;
  submitting: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, submitting }) => {
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!studentName.trim()) {
      errors.studentName = 'Student name is required.';
    }

    if (!courseName.trim()) {
      errors.courseName = 'Course name is required.';
    }

    if (!rating || rating < 1 || rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5 stars.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        studentName: studentName.trim(),
        courseName: courseName.trim(),
        rating,
        comments: comments.trim() ? comments.trim() : undefined,
      });

      setSuccessMessage('Feedback submitted successfully! Thank you for your review.');
      setStudentName('');
      setCourseName('');
      setRating(5);
      setComments('');
      setFormErrors({});

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.data?.errors) {
        setFormErrors(err.data.errors);
        setErrorMessage('Please correct the highlighted errors.');
      } else if (err instanceof Error) {
        setErrorMessage(err.message || 'Failed to submit feedback. Please try again.');
      } else {
        setErrorMessage('Failed to submit feedback. Please check your connection.');
      }
    }
  };

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Submit Course Feedback</h2>
          <p className="card-subtitle">Share your honest classroom experience to help improve future courses.</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 size={18} className="alert-icon" />
          <div className="alert-content">
            <span className="alert-title">Success</span>
            <p className="alert-message">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} className="alert-icon" />
          <div className="alert-content">
            <span className="alert-title">Submission Error</span>
            <p className="alert-message">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="feedback-form">
        {/* Student Name */}
        <div className="form-group">
          <label htmlFor="studentName" className="form-label">
            Student Name <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              id="studentName"
              type="text"
              className={`form-input ${formErrors.studentName ? 'input-error' : ''}`}
              placeholder="e.g., Jane Doe"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (formErrors.studentName) {
                  setFormErrors((prev) => ({ ...prev, studentName: '' }));
                }
              }}
              disabled={submitting}
              autoComplete="name"
            />
          </div>
          {formErrors.studentName && (
            <p className="field-error-text" role="alert">{formErrors.studentName}</p>
          )}
        </div>

        {/* Course Name */}
        <div className="form-group">
          <label htmlFor="courseName" className="form-label">
            Course Name <span className="required-star">*</span>
          </label>
          <div className="input-with-icon">
            <BookOpen size={18} className="input-icon" />
            <input
              id="courseName"
              type="text"
              className={`form-input ${formErrors.courseName ? 'input-error' : ''}`}
              placeholder="e.g., CS201: Data Structures & Algorithms"
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                if (formErrors.courseName) {
                  setFormErrors((prev) => ({ ...prev, courseName: '' }));
                }
              }}
              disabled={submitting}
            />
          </div>
          {formErrors.courseName && (
            <p className="field-error-text" role="alert">{formErrors.courseName}</p>
          )}
        </div>

        {/* Rating Selector */}
        <div className="form-group">
          <label className="form-label">
            Course Rating <span className="required-star">*</span>
          </label>
          <div className="rating-selector-box">
            <StarRating
              rating={rating}
              size={26}
              interactive={!submitting}
              onChange={(newRating) => {
                setRating(newRating);
                if (formErrors.rating) {
                  setFormErrors((prev) => ({ ...prev, rating: '' }));
                }
              }}
              showLabel
            />
          </div>
          {formErrors.rating && (
            <p className="field-error-text" role="alert">{formErrors.rating}</p>
          )}
        </div>

        {/* Comments */}
        <div className="form-group">
          <label htmlFor="comments" className="form-label">
            Comments & Feedback
          </label>
          <div className="textarea-with-icon">
            <MessageSquare size={18} className="input-icon textarea-icon" />
            <textarea
              id="comments"
              className="form-textarea"
              rows={4}
              placeholder="What did you like about this course? What could be improved?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={submitting}
              maxLength={2000}
            />
          </div>
          <div className="char-count">{comments.length} / 2000 characters</div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={submitting}
          id="submit-feedback-btn"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="spin-icon" />
              <span>Submitting Feedback...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit Feedback</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
