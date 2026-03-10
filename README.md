# Job Tracker API

A RESTful API for tracking job applications, built with Node.js, Express, and PostgreSQL.

## Live URL

```
https://job-tracker-backend-u6xr.onrender.com
```

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js
- **Database** — PostgreSQL (Neon)
- **Authentication** — JWT (Access + Refresh Tokens)
- **Password Hashing** — bcrypt
- **Validation** — Joi
- **Email** — Nodemailer + Gmail
- **Deployment** — Render

## Features

- User registration and login
- JWT authentication with refresh token rotation
- Password reset via email
- Full CRUD for job applications
- Input validation on all routes
- Centralized error handling
- User profile management

## Project Structure

```
src/
  controllers/
    authController.js     # register, login, logout, refresh, forgot/reset password, profile
    jobsController.js     # get, add, update, delete jobs
  middleware/
    authMiddleware.js     # JWT verification
    errorHandler.js       # centralized error handling
    validate.js           # Joi validation schemas
  routes/
    auth.js               # /api/auth routes
    jobs.js               # /api/jobs routes
  utils/
    errors.js             # custom error classes
    sendEmail.js          # nodemailer email utility
    seed.js               # database seeder
  db.js                   # PostgreSQL connection
  server.js               # entry point
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database (local or cloud)
- Gmail account with App Password

### Installation

```bash
# clone the repository
git clone https://github.com/yourusername/backend-job-tracker.git
cd backend-job-tracker

# install dependencies
npm install

# create .env file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_NAME=job_tracker
DB_PASSWORD=your_db_password
DB_PORT=5432
DATABASE_URL=your_neon_or_supabase_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Database Setup

```bash
# run SQL to create tables
psql -U postgres -d job_tracker -f schema.sql

# seed with fake data (optional)
npm run seed
```

### Running the Server

```bash
# development
npm run dev

# production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| POST | `/api/auth/refresh` | Get new access token | No |
| POST | `/api/auth/forgot-password` | Send password reset email | No |
| POST | `/api/auth/reset-password/:token` | Reset password | No |
| PUT | `/api/auth/profile` | Update name or password | Yes |

### Jobs Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all jobs for logged in user | Yes |
| POST | `/api/jobs` | Add a new job | Yes |
| PUT | `/api/jobs/:id` | Update a job | Yes |
| DELETE | `/api/jobs/:id` | Delete a job | Yes |

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer your_access_token
```

Access tokens expire after **1 hour**. Use the refresh token to get a new one:

```json
POST /api/auth/refresh
{
  "token": "your_refresh_token"
}
```

## Request & Response Examples

### Register

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Add Job

```json
POST /api/jobs
{
  "title": "Frontend Developer",
  "company": "Google",
  "location": "Nairobi, Kenya",
  "date_applied": "2026-03-01",
  "status": "Applied"
}

Response:
{
  "job_id": 1,
  "user_id": 1,
  "title": "Frontend Developer",
  "company": "Google",
  "location": "Nairobi, Kenya",
  "date_applied": "2026-03-01",
  "status": "Applied",
  "created_at": "2026-03-01T00:00:00.000Z"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Error message here"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |
| 500 | Internal server error |

## Scripts

```bash
npm run dev    # start development server with nodemon
npm start      # start production server
npm run seed   # seed database with fake data
```

## License

MIT
