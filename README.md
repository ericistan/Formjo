<img src="/frontend/src/assets/formjo-hero-github.png" />

# Formjo

**Coach Smarter. Train Better.**
Formjo is a platform for coaches to assign structured training, review athlete video submissions, and deliver personalised feedback.

---

## Technology Stack

**Frontend**

- **React** for UI components and state management
- **Vite** for fast build tooling and hot module replacement
- **Tailwind CSS** for utility-first styling and dual-mode theming
- **shadcn/ui** for accessible, composable UI primitives
- **Framer Motion** for scroll-driven animations
- **GSAP** for hamburger menu and card transition animations
- **React Router** for client-side routing and protected routes

**Backend**

- **Python + Flask** for the REST API
- **PostgreSQL** for the relational database (13 tables)
- **psycopg2** for raw SQL queries with parameterised inputs
- **PyJWT** for JSON Web Token authentication (7-day expiry)
- **bcrypt** for password hashing
- **Cloudinary** for voice feedback audio storage

**Tools**

- **Figma** for UI design, wireframing, and style guide
- **Bruno** for API testing and endpoint documentation
- **Claude** for AI-assisted development and code review

---

## Core Features

### Coach Dashboard

<img src="/frontend/src/assets/landingPage-feature_stat-tracking.png" width="300" />

- Overview of all assigned modules and student progress
- Create, edit, and delete lessons with structured steps, YouTube embeds, or file upload
- Organise lessons into modules and assign them to students with an optional due date
- Leave text or voice feedback on each student submission

### Student App

<img src="/frontend/src/assets/landingPage-feature_submitTraining.png" width="300" />

- View all assigned modules and lessons with simple to follow steps created by your coach
- Submit training videos for your coach to review via Video upload orYouTube link
- Get feedback from your coach with text or voice recordings.
- Track your progress as your coach reviews what you did and mark lessons as complete

### Voice Feedback

<img src="/frontend/src/assets/landingPage-feature_record-audio.png" width="300" />

- Records audio directly in the browser using the Web Audio API and MediaRecorder
- Preview before sending, discard and re-record at any time
- Uploads to Cloudinary and attaches to the feedback thread
- One-time consent gate persisted via localStorage

---

## Project Structure

```
formjo/
├── backend/
│   ├── db/
│   │   └── db_pool.py              # psycopg2 connection pool
│   ├── resources/
│   │   ├── auth.py                 # signup, signin, signout
│   │   ├── lesson.py               # lesson CRUD with steps
│   │   ├── module.py               # module CRUD
│   │   ├── assignment.py           # assignment CRUD, coach + student views
│   │   ├── submission.py           # submission CRUD
│   │   └── comment.py              # text + voice comment CRUD
│   └── main.py                     # Flask app, blueprint registration
└── frontend/
    └── src/
        ├── assets/
        ├── components/
        │   ├── landing/            # HeroSection, FeaturesSection, TimelineSection, TeamSection, FooterSection, CurvedLoop
        │   ├── ui/                 # shadcn primitives (Button, Input, Card, Label, AlertDialog)
        │   ├── StatusBadge.jsx     # shared status badge (card, pill, row, hero variants)
        │   ├── SubmissionCard.jsx  # shared submission card (coach + student via viewerRole prop)
        │   ├── VoiceRecorder.jsx
        │   ├── Navbar.jsx
        │   ├── CardNav.jsx         # GSAP animated mobile nav
        │   ├── Layout.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx     # JWT auth + dual-mode theme toggle
        ├── utils/
        │   ├── api.js              # apiFetch wrapper (base URL + auth header)
        │   ├── gradients.js        # deterministic cover gradient util
        │   └── youtube.js          # YouTube URL → embed ID regex
        └── pages/
            ├── Coach/
            │   ├── lessons/        # LessonList, LessonDetail, LessonCreate, LessonEdit
            │   ├── modules/        # ModuleList, ModuleDetail, ModuleCreate, ModuleEdit
            │   └── assignments/    # AssignmentList, AssignmentDetail, AssignmentCreate, CoachAssignmentLesson
            └── Student/
                ├── assignments/    # StudentAssignmentList, StudentAssignmentDetail, StudentLessonDetail
                ├── StudentDashboard.jsx
                └── CoachDashboard.jsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL running locally

### 1. Clone the repo

```bash
git clone https://github.com/your-username/formjo.git
cd formjo
```

### 2. Set up the database

Create a PostgreSQL database, then run the schema and seed data:

```bash
psql -d your_database_name -f backend/db/schema.sql
```

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```
DATABASE_URL=postgresql://localhost/your_database_name
JWT_SECRET_KEY=your_secret_key
```

```bash
python main.py
```

### 4. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

```bash
npm run dev
```

### Demo Accounts

| Role    | Email              | Password    |
| ------- | ------------------ | ----------- |
| Coach   | coach@formjo.com   | password123 |
| Student | student@formjo.com | password123 |

---

## Development Process

### Phase 1 - Foundations

Started with the data model - 13 database tables covering users, lessons, modules, assignments, submissions, and feedback. Built a secure Flask REST API with JWT authentication from the ground up.

### Phase 2 - Core Features

Built the full CRUD workflow for coaches and students. Lessons, modules, assignments, video submissions with YouTube and file upload support, and voice feedback recorded directly in the browser via the Web Audio API.

### Phase 3 - The Experience

Shipped a dual-mode app for Coaches and Students with a seeded demo dataset that walks through a full coaching cycle: lessons assigned, videos submitted, and feedback recorded via comments and voice. Live and fully functional end to end.

### Phase 4 - Stretch Goals

Features left on the roadmap for a production-ready coaching platform.

---

## Future Enhancements

- Push notifications when coaches leave voice or text feedback
- Coach-student invite system with roster management
- Direct video file uploads beyond YouTube-only submissions
- Password reset via email
- Analytics dashboard for coaches to track student progress over time
- Improve validator checks for submission URLs and file types
- Improve protected route handling to prevent unauthorized access to other users' data
