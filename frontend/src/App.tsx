import { useState, useEffect, useCallback } from 'react';
import type { Feedback, User } from './types';
import {
  getFeedbackList,
  getAverageRating,
  getTotalCount,
  submitFeedback,
  getCurrentUser,
  logoutUser,
} from './api';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import {
  GraduationCap,
  LogOut,
  ExternalLink,
  User as UserIcon,
  Shield,
  Loader2,
} from 'lucide-react';
import './App.css';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load dashboard data for the authenticated session
  const loadData = useCallback(async (currentRatingFilter: number | null = null) => {
    setLoading(true);
    try {
      const [avg, count, allRecords, filteredRecords] = await Promise.all([
        getAverageRating(),
        getTotalCount(),
        getFeedbackList(),
        getFeedbackList(currentRatingFilter || undefined),
      ]);

      setAverageRating(avg);
      setTotalCount(count);
      setAllFeedback(allRecords);
      setFeedbackList(filteredRecords);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('401')) {
        // Session expired
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check existing session on application start
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  // When user is authenticated, load dashboard data
  useEffect(() => {
    if (currentUser) {
      loadData(null);
    }
  }, [currentUser, loadData]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSelectedRating(null);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setCurrentUser(null);
      setFeedbackList([]);
      setAllFeedback([]);
      setSelectedRating(null);
    }
  };

  const handleRatingFilterChange = async (rating: number | null) => {
    setSelectedRating(rating);
    setLoading(true);
    try {
      const records = await getFeedbackList(rating || undefined);
      setFeedbackList(records);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('401')) {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (data: {
    studentName: string;
    courseName: string;
    rating: number;
    comments?: string;
  }) => {
    setSubmitting(true);
    try {
      await submitFeedback(data);
      await loadData(selectedRating);
    } finally {
      setSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={36} className="spin-icon" />
        <p>Loading application...</p>
      </div>
    );
  }

  // Not authenticated: Show Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-icon-wrapper">
              <GraduationCap size={28} className="brand-icon" />
            </div>
            <div>
              <h1 className="brand-title">Student Course Feedback</h1>
              <p className="brand-subtitle">
                {currentUser.role === 'TRAINER'
                  ? 'Instructor Feedback & Course Quality Portal'
                  : 'Student Course Evaluation Dashboard'}
              </p>
            </div>
          </div>

          <div className="header-actions">
            {/* User Profile Pill */}
            <div className="user-profile-badge">
              {currentUser.role === 'TRAINER' ? (
                <Shield size={15} className="role-icon trainer-role" />
              ) : (
                <UserIcon size={15} className="role-icon student-role" />
              )}
              <span className="user-name-text">{currentUser.name}</span>
              <span className={`role-tag ${currentUser.role === 'TRAINER' ? 'tag-trainer' : 'tag-student'}`}>
                {currentUser.role}
              </span>
            </div>

            {/* H2 Console Link */}
            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="header-link-btn"
              title="Open H2 Database Console"
            >
              <span>H2 Console</span>
              <ExternalLink size={14} />
            </a>

            {/* Logout Button */}
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Log out of session"
              id="logout-btn"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Role-Specific View */}
      <main className="main-content">
        {currentUser.role === 'TRAINER' ? (
          <TrainerDashboard
            userName={currentUser.name}
            feedbackList={feedbackList}
            allFeedback={allFeedback}
            averageRating={averageRating}
            totalCount={totalCount}
            loading={loading}
            selectedRating={selectedRating}
            onRatingFilterChange={handleRatingFilterChange}
          />
        ) : (
          <StudentDashboard
            userName={currentUser.name}
            feedbackList={feedbackList}
            allFeedback={allFeedback}
            averageRating={averageRating}
            totalCount={totalCount}
            loading={loading}
            submitting={submitting}
            selectedRating={selectedRating}
            onRatingFilterChange={handleRatingFilterChange}
            onSubmitFeedback={handleSubmitFeedback}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Student Course Feedback Management &bull; Spring Boot + React &bull; Authenticated as {currentUser.email} ({currentUser.role})</p>
      </footer>
    </div>
  );
}

export default App;
