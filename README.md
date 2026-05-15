# AFDE_Jul2025_Sanjana_FMS — Feedback Management System

> **Phase 1 Capstone Project** | AFDE Batch Jul 2025 | Sanjana

A centralized, full-stack web application for collecting, managing, and analyzing feedback from participants, employees, and customers. Built to replace scattered feedback channels (Google Forms, Excel, email) with a single professional platform.

---

## Live Preview

| Interface | URL |
|---|---|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Features

### User Features
- Submit detailed feedback with name, email, department, program, category, trainer, session date, rating and comments
- Browse all feedback in a searchable, filterable, paginated table
- View complete feedback detail for any entry
- Interactive star rating selector (1–5 with labels)
- Recommendation toggle (Yes / No)

### Admin Features
- Dedicated Admin Panel with full management controls
- Edit any feedback record (pre-filled form)
- Delete feedback with confirmation dialog
- Search and filter within the admin view

### Dashboard
- Live statistics: total feedback, average rating, recommendation rate, satisfaction score
- Animated rating distribution bar chart
- Animated category breakdown donut chart
- Top Programs leaderboard with progress bars
- Top Trainers leaderboard with star ratings
- Department activity breakdown
- Recent 5 feedback entries with quick navigation

### Search & Filter
- Full-text keyword search across name, email, department, program, trainer, comments
- Filter by rating (1–5 stars)
- Filter by category (Training / Product / Event / Service / Other)
- Filter by recommendation (Yes / No)
- Pagination with record count display

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18.3 |
| UI Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.12 |
| Icons | Lucide React | 0.400 |
| Notifications | React Hot Toast | 2.4 |
| Routing | React Router DOM | 6.24 |
| HTTP Client | Axios | 1.7 |
| Build Tool | Vite | 5.3 |
| Backend | Python FastAPI | 0.115 |
| ORM | SQLAlchemy | 2.0 |
| Database | MySQL | 8.0 |
| DB Driver | PyMySQL | 1.1 |
| Validation | Pydantic v2 | 2.10 |
| Server | Uvicorn | 0.32 |

---

## Project Structure

```
AFDE_Jul2025_Sanjana_FMS/
│
├── frontend/                        # React + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/              # Sidebar, Navbar, Layout wrapper
│   │   │   └── ui/                  # StatCard, RatingStars, Badge, Modal, Pagination
│   │   ├── pages/                   # Dashboard, FeedbackList, Submit, Detail, Admin, Edit
│   │   ├── services/
│   │   │   └── api.js               # Axios API service layer
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind + global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── backend/                         # FastAPI backend
│   ├── main.py                      # App entry, CORS, router registration
│   ├── database.py                  # SQLAlchemy engine & session
│   ├── models.py                    # ORM model: Feedback
│   ├── schemas.py                   # Pydantic v2 request/response schemas
│   ├── crud.py                      # All DB operations
│   ├── routers/
│   │   └── feedback.py              # API route handlers
│   ├── services/                    # Reserved for future services
│   ├── .env                         # DB connection string (not committed)
│   └── requirements.txt
│
├── database/
│   └── schema.sql                   # MySQL DDL + 15 seed records
│
├── docs/
│   └── API_DOCUMENTATION.md         # Full API reference
│
├── screenshots/                     # UI & API screenshots
│
├── README.md
├── requirements.txt                 # Root pointer (see backend/requirements.txt)
└── .gitignore
```

---

## Database Schema

```sql
CREATE TABLE feedback (
    feedback_id       INT            AUTO_INCREMENT PRIMARY KEY,
    participant_name  VARCHAR(255)   NOT NULL,
    email             VARCHAR(255),
    department        VARCHAR(255),
    program_name      VARCHAR(255)   NOT NULL,
    category          ENUM('Training','Product','Event','Service','Other') DEFAULT 'Training',
    trainer_name      VARCHAR(255),
    session_date      DATE,
    rating            TINYINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments          TEXT,
    would_recommend   TINYINT(1)     NOT NULL DEFAULT 1,
    submitted_at      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Setup Instructions

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.13+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjana-Boligorla/AFDE_Jul2025_Sanjana_FMS.git
cd AFDE_Jul2025_Sanjana_FMS
```

---

### 2. Database Setup

Open MySQL and run:
```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in MySQL Workbench and execute it. This will:
- Create the `FMS_db` database
- Create the `feedback` table with all constraints and indexes
- Insert 15 realistic seed records

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database connection (edit if your credentials differ)
# backend/.env
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/FMS_db

# Start the server
uvicorn main:app --reload --port 8000
```

**Verify:** Open http://localhost:8000/health — should return `"database": "connected"`

---

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

**Verify:** Open http://localhost:3000 — dashboard should load with charts and data

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Dashboard aggregated statistics |
| GET | `/api/feedback` | List all feedback (paginated, filterable) |
| POST | `/api/feedback` | Submit new feedback |
| GET | `/api/feedback/search` | Search and filter feedback |
| GET | `/api/feedback/{id}` | Get single feedback entry |
| PUT | `/api/feedback/{id}` | Update feedback entry |
| DELETE | `/api/feedback/{id}` | Delete feedback entry |
| GET | `/health` | API health check |

### Query Parameters for GET /api/feedback

| Parameter | Type | Description |
|---|---|---|
| `keyword` | string | Search across name, email, dept, program, trainer, comments |
| `rating` | int (1–5) | Filter by exact star rating |
| `category` | string | Filter by category enum value |
| `program_name` | string | Partial match on program name |
| `trainer_name` | string | Partial match on trainer name |
| `would_recommend` | bool | Filter by recommendation (true/false) |
| `skip` | int | Pagination offset (default: 0) |
| `limit` | int | Page size, max 100 (default: 10) |

> Full API documentation with request/response examples: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

---

## System Users

| Role | Access | Route |
|---|---|---|
| Participant | Submit feedback, view all listings, view detail | `/`, `/feedback`, `/submit` |
| Administrator | Full CRUD — view, edit, delete all records | `/admin`, `/admin/edit/:id` |

> Note: Phase 1 does not implement authentication. The Admin Panel is accessible via direct navigation. Authentication and role-based access control are planned for Phase 2.

---

## Screenshots

| Page | Screenshot |
|---|---|
| Dashboard | `screenshots/dashboard.png` |
| Feedback List | `screenshots/feedback-list.png` |
| Submit Feedback | `screenshots/submit-feedback.png` |
| Feedback Detail | `screenshots/feedback-detail.png` |
| Admin Panel | `screenshots/admin-panel.png` |
| Edit Feedback | `screenshots/edit-feedback.png` |
| API Swagger UI | `screenshots/swagger-ui.png` |

---

## Author

**Sanjana** | AFDE Batch Jul 2025 | sanjana.ab@prodapt.com

GitHub: [Sanjana-Boligorla/AFDE_Jul2025_Sanjana_FMS](https://github.com/Sanjana-Boligorla/AFDE_Jul2025_Sanjana_FMS)
