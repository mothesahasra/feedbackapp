export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'TRAINER';
}

export interface LoginPayload {
  email: string;
  password: string;
  role: 'STUDENT' | 'TRAINER';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TRAINER';
}

export interface Feedback {
  id?: number;
  studentName: string;
  courseName: string;
  rating: number;
  comments?: string;
  submittedAt?: string;
}

export interface AverageRatingResponse {
  averageRating: number;
}

export interface CountResponse {
  count: number;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  errors?: Record<string, string>;
}
