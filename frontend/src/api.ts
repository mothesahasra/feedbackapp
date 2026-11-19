import type { Feedback, AverageRatingResponse, CountResponse, ApiErrorResponse, User, LoginPayload } from './types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:8080' : '');

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse;

  constructor(status: number, message: string, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = await res.json();
    } catch {
      // response might not be JSON
    }

    let errorMsg = `Server error (${res.status})`;
    if (errorData?.errors) {
      errorMsg = Object.values(errorData.errors).join(', ');
    } else if (errorData?.message) {
      errorMsg = errorData.message;
    }

    throw new ApiError(res.status, errorMsg, errorData);
  }
  return res.json() as Promise<T>;
}

// Authentication APIs
export async function loginUser(payload: LoginPayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<User>(res);
}

export async function registerUser(payload: import('./types').RegisterPayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<User>(res);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.status === 401) {
      return null;
    }
    return handleResponse<User>(res);
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

// Feedback APIs
export async function getFeedbackList(rating?: number): Promise<Feedback[]> {
  const url = rating
    ? `${API_BASE_URL}/api/feedback?rating=${rating}`
    : `${API_BASE_URL}/api/feedback`;
  const res = await fetch(url, {
    credentials: 'include',
  });
  return handleResponse<Feedback[]>(res);
}

export async function getAverageRating(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/api/feedback/average`, {
    credentials: 'include',
  });
  const data = await handleResponse<AverageRatingResponse>(res);
  return data.averageRating ?? 0;
}

export async function getTotalCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/api/feedback/count`, {
    credentials: 'include',
  });
  const data = await handleResponse<CountResponse>(res);
  return data.count ?? 0;
}

export async function submitFeedback(feedback: {
  studentName: string;
  courseName: string;
  rating: number;
  comments?: string;
}): Promise<Feedback> {
  const res = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(feedback),
  });
  return handleResponse<Feedback>(res);
}
