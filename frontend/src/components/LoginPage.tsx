import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, UserCheck, AlertCircle, Loader2, ArrowRight, UserPlus, User } from 'lucide-react';
import type { User as UserType, LoginPayload, RegisterPayload } from '../types';
import { loginUser, registerUser } from '../api';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (isSignUp && !name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (isSignUp && password.length < 4) {
      errors.password = 'Password must be at least 4 characters long.';
    }

    if (!role) {
      errors.role = 'Please select a role.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Register new user
        const payload: RegisterPayload = {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        };
        const newUser = await registerUser(payload);
        setSuccessMessage('Account created successfully! Welcome aboard.');
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 500);
      } else {
        // Login existing user
        const payload: LoginPayload = {
          email: email.trim(),
          password,
          role,
        };
        const user = await loginUser(payload);
        onLoginSuccess(user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || (isSignUp ? 'Registration failed.' : 'Login failed. Please check your credentials.'));
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string, demoRole: 'STUDENT' | 'TRAINER') => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormErrors({});
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormErrors({});
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-box">
            <GraduationCap size={32} />
          </div>
          <h1 className="login-app-title">Student Course Feedback</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create a new account' : 'Sign in to your academic portal'}
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              if (isSignUp) toggleAuthMode();
            }}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              if (!isSignUp) toggleAuthMode();
            }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            <div className="alert-content">
              <span className="alert-title">Account Created</span>
              <p className="alert-message">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-error auth-error-card" role="alert">
            <AlertCircle size={20} className="alert-icon" />
            <div className="alert-content">
              <span className="alert-title">{isSignUp ? 'Sign Up Failed' : 'Authentication Failed'}</span>
              <p className="alert-message">{errorMessage}</p>
              {!isSignUp && (
                <button
                  type="button"
                  className="alert-signup-link-btn"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                    if (email && !name) {
                      const prefix = email.split('@')[0];
                      setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
                    }
                  }}
                >
                  <UserPlus size={14} />
                  <span>Click here to Sign Up now</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} noValidate className="login-form">
          {/* Role Selection Tabs */}
          <div className="role-selector-group">
            <label className="form-label">
              {isSignUp ? 'Register as' : 'Select Your Role'}
            </label>
            <div className="role-toggle-container" role="radiogroup" aria-label="Role selection">
              <button
                type="button"
                className={`role-toggle-btn ${role === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setRole('STUDENT')}
                role="radio"
                aria-checked={role === 'STUDENT'}
                id="role-student-btn"
              >
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === 'TRAINER' ? 'active' : ''}`}
                onClick={() => setRole('TRAINER')}
                role="radio"
                aria-checked={role === 'TRAINER'}
                id="role-trainer-btn"
              >
                <span>Trainer / Instructor</span>
              </button>
            </div>
            {formErrors.role && <p className="field-error-text">{formErrors.role}</p>}
          </div>

          {/* Full Name (Sign Up only) */}
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">
                Full Name
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g., Sahasra"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formErrors.name) setFormErrors((p) => ({ ...p, name: '' }));
                  }}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {formErrors.name && <p className="field-error-text">{formErrors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors((p) => ({ ...p, email: '' }));
                }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {formErrors.email && <p className="field-error-text">{formErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password {isSignUp && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(min 4 chars)</span>}
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors((p) => ({ ...p, password: '' }));
                }}
                disabled={loading}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
            {formErrors.password && <p className="field-error-text">{formErrors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button login-btn"
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>
                  {isSignUp
                    ? `Create Account as ${role === 'STUDENT' ? 'Student' : 'Trainer'}`
                    : `Sign In as ${role === 'STUDENT' ? 'Student' : 'Trainer'}`}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Prominent Secondary Toggle Button */}
          <button
            type="button"
            className="secondary-action-btn"
            onClick={toggleAuthMode}
            id="auth-toggle-mode-btn"
          >
            {isSignUp ? (
              <>
                <span>Already have an account?</span>
                <strong style={{ color: 'var(--text-accent)', marginLeft: '4px' }}>Sign In</strong>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Don't have an account?</span>
                <strong style={{ color: 'var(--text-accent)', marginLeft: '4px' }}>Sign Up Here</strong>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Accounts Box */}
        <div className="demo-accounts-box">
          <div className="demo-header">
            <UserCheck size={14} />
            <span>Quick Demo Accounts</span>
          </div>
          <div className="demo-chips-grid">
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemoAccount('sahasra@gmail.com', 'Student123', 'STUDENT')}
              title="Click to fill Sahasra Student credentials"
            >
              <div className="demo-chip-role">Sahasra (Student)</div>
              <div className="demo-chip-cred">sahasra@gmail.com / Student123</div>
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemoAccount('student@example.com', 'Student123', 'STUDENT')}
              title="Click to fill Student credentials"
            >
              <div className="demo-chip-role">Alex (Student)</div>
              <div className="demo-chip-cred">student@example.com / Student123</div>
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillDemoAccount('trainer@example.com', 'Trainer123', 'TRAINER')}
              title="Click to fill Trainer credentials"
            >
              <div className="demo-chip-role">Prof. Davis (Trainer)</div>
              <div className="demo-chip-cred">trainer@example.com / Trainer123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
