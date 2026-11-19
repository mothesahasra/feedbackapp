# Student Course Feedback Management System

A full-stack web application designed for students and academic trainers to submit, review, and analyze course evaluations in real time with role-based authentication.

---

## 🔑 Demo Login Accounts

Quickly test both roles using the pre-seeded accounts (also clickable on the login screen):

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Student** | `student@example.com` | `Student123` | Submit course feedback, view all feedback & ratings, filter by rating |
| **Trainer** | `trainer@example.com` | `Trainer123` | View complete feedback submissions, average ratings, rating distribution, filter by rating and course. *(Protected from submitting feedback)* |

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 4 REST API
- **Security & Crypto**: BCrypt Password Hashing (`spring-security-crypto`), Server-side Session Management (`HttpSession`)
- **Persistence**: Spring Data JPA & Hibernate
- **Database**: H2 In-Memory Database (`jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1`)
- **Frontend**: React 19 with Vite & TypeScript
- **Styling**: Modern Vanilla CSS with dark mode, glassmorphism, responsive grid, and accessible controls
- **Build Tools**: Maven Wrapper (`mvnw.cmd`) and `npm`

---

## 🚀 Getting Started (Windows)

Open two separate terminals from the root `feedbackapp` directory:

### Terminal 1: Backend (Spring Boot REST API)

```powershell
.\mvnw.cmd spring-boot:run
```

- **Backend API**: `http://localhost:8080/api/feedback`
- **H2 Database Console**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1` (or `jdbc:h2:mem`)
  - **User**: `sa` | **Password**: *(leave blank)*

---

### Terminal 2: Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5173/`

---

## 📋 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with `email`, `password`, and `role`. Returns user profile and sets session cookie. |
| `GET` | `/api/auth/me` | Returns currently logged-in user profile or 401 Unauthorized. |
| `POST` | `/api/auth/logout` | Invalidates current server session. |

### Feedback Endpoints (Session-Protected)
| Method | Endpoint | Permissions | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | **Student Only** | Submit feedback (`studentName`, `courseName`, `rating` [1-5], `comments`). Rejects unauthenticated (401) and trainer requests (403). |
| `GET` | `/api/feedback` | **Student & Trainer** | Retrieve all feedback entries (supports optional `?rating=N`). |
| `GET` | `/api/feedback/average` | **Student & Trainer** | Returns overall average rating: `{"averageRating": 4.25}`. |
| `GET` | `/api/feedback/count` | **Student & Trainer** | Returns total number of feedback records: `{"count": 4}`. |
