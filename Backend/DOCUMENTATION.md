# TafLocal AI Backend Documentation

AI-powered Career Assistant REST API built with Django 5 and Django REST Framework.

## Features

- JWT Authentication with role-based access control (Admin, Candidate, Company)
- User management with candidate and company profiles
- Job posting and management
- Application tracking and status management
- CV analysis with AI-powered skill detection
- Interview session management with AI-generated questions
- Interview feedback generation
- Notification system
- Audit logging
- API documentation with Swagger/Redoc
- Rate limiting and security features

## Tech Stack

- Python 3.13+
- Django 5
- Django REST Framework
- PostgreSQL
- JWT Authentication (SimpleJWT)
- drf-spectacular (OpenAPI)
- django-filter
- Pillow
- python-dotenv
- django-cors-headers
- Celery (prepared)
- Redis (prepared)
- pytest
- Black
- isort
- flake8

## Project Structure

```
Backend/
├── apps/
│   ├── authentication/    # Authentication endpoints
│   ├── users/            # User models and profiles
│   ├── companies/        # Company management
│   ├── jobs/             # Job postings
│   ├── applications/     # Job applications
│   ├── cv_analysis/      # CV analysis and AI
│   ├── interviews/       # Interview management
│   ├── notifications/    # Notification system
│   ├── ai/               # AI services
│   └── common/           # Shared utilities
├── config/               # Django settings
├── media/                # User uploads
├── tests/                # Test suite
└── manage.py
```

## Installation

1. Create virtual environment:
```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## API Documentation

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Testing

Run tests with pytest:
```bash
pytest
```

## Code Quality

Format code with Black:
```bash
black .
```

Sort imports with isort:
```bash
isort .
```

Lint with flake8:
```bash
flake8 .
```

## API Endpoints

### Authentication
- POST /api/auth/register/ - Register new user
- POST /api/auth/login/ - Login and get JWT tokens
- POST /api/auth/logout/ - Logout (blacklist token)
- POST /api/auth/token/refresh/ - Refresh access token
- GET /api/auth/me/ - Get current user profile
- POST /api/auth/change-password/ - Change password
- POST /api/auth/reset-password/ - Request password reset

### Jobs
- GET /api/jobs/ - List jobs (filtering, searching, ordering)
- POST /api/jobs/ - Create job (Company only)
- GET /api/jobs/{id}/ - Get job details
- PUT/PATCH /api/jobs/{id}/ - Update job (Company only)
- DELETE /api/jobs/{id}/ - Delete job (Company only)
- POST /api/jobs/{id}/archive/ - Archive job
- POST /api/jobs/{id}/activate/ - Activate job
- POST /api/jobs/{id}/view/ - Increment view count

### Applications
- GET /api/applications/ - List applications
- POST /api/applications/ - Create application (Candidate only)
- GET /api/applications/{id}/ - Get application details
- PATCH /api/applications/{id}/ - Update status (Company only)
- DELETE /api/applications/{id}/ - Withdraw application (Candidate only)
- POST /api/applications/{id}/withdraw/ - Withdraw application

### CV Analysis
- GET /api/cv-analysis/cvs/ - List CVs
- POST /api/cv-analysis/cvs/ - Upload CV (Candidate only)
- GET /api/cv-analysis/cvs/{id}/ - Get CV details
- POST /api/cv-analysis/cvs/{id}/analyze/ - Trigger CV analysis
- GET /api/cv-analysis/analyses/ - List CV analyses
- GET /api/cv-analysis/analyses/{id}/ - Get analysis details

### Interviews
- GET /api/interviews/sessions/ - List interview sessions
- POST /api/interviews/sessions/ - Create interview session
- GET /api/interviews/sessions/{id}/ - Get session details
- POST /api/interviews/sessions/{id}/start/ - Start interview
- POST /api/interviews/sessions/{id}/complete/ - Complete interview
- GET /api/interviews/answers/ - List interview answers
- POST /api/interviews/answers/ - Submit answer (Candidate only)

### Notifications
- GET /api/notifications/ - List notifications
- PATCH /api/notifications/{id}/ - Mark as read/unread
- POST /api/notifications/mark_all_read/ - Mark all as read
- GET /api/notifications/unread_count/ - Get unread count

### AI Services
- POST /api/ai/match_job/ - Match CV to job
- GET /api/ai/health/ - Check AI service health

## User Roles

### Admin
- Full access to all resources
- Can manage users, jobs, applications
- View audit logs

### Candidate
- Manage profile and CV
- View and apply to jobs
- Track applications
- Participate in interviews
- View notifications

### Company
- Manage company profile
- Create and manage job postings
- View and manage applications
- Conduct interviews
- View notifications

## Security Features

- JWT authentication with token rotation
- Role-based access control
- Rate limiting (burst and sustained)
- CORS configuration
- Input validation
- Audit logging
- Password validation

## AI Integration

The AI services are prepared with mock data. To integrate with real AI providers:

1. OpenAI integration: Update `ai/services.py` with OpenAI API calls
2. CV analysis: Implement PDF text extraction in `cv_analysis/services.py`
3. Job matching: Implement AI-powered matching algorithm
4. Interview generation: Integrate with LLM for question generation
5. Feedback generation: Use AI for comprehensive feedback
