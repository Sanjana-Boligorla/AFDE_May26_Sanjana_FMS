# AFDE_Jul2025_Sanjana_FMS — Feedback Management System

A centralized, full-stack web application for collecting, managing, and analyzing feedback from participants, employees, or customers.

---

## Features

- Submit feedback with name, program, rating (1–5), and comments
- View all feedback in a searchable, filterable table
- View detailed feedback entries
- Edit and delete feedback records (Admin Panel)
- Dashboard with live stats: total count, average rating, rating distribution
- Search by keyword across name, program, and comments
- Filter by rating and program name

---

## Technology Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18 + Tailwind CSS |
| Backend    | Python FastAPI          |
| Database   | MySQL 8                 |
| ORM        | SQLAlchemy 2.0          |
| HTTP Client| Axios                   |
| API Testing| Postman                 |

---

## Project Structure

```
AFDE_Jul2025_Sanjana_FMS/
├── frontend/          # React + Tailwind frontend
├── backend/           # FastAPI backend
├── database/          # SQL schema scripts
├── screenshots/       # UI & API screenshots
├── docs/              # API documentation
├── README.md
└── .gitignore
```

---

## Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js 18+
- MySQL 8.0+

---

### Database Setup

1. Start MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS FMS_db;
```
Or run the schema script:
```bash
mysql -u root -p < database/schema.sql
```

---

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App will be available at: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint                   | Description                      |
|--------|----------------------------|----------------------------------|
| GET    | /api/feedback              | List all feedback (with filters) |
| POST   | /api/feedback              | Submit new feedback              |
| GET    | /api/feedback/{id}         | Get single feedback entry        |
| PUT    | /api/feedback/{id}         | Update feedback entry            |
| DELETE | /api/feedback/{id}         | Delete feedback entry            |
| GET    | /api/feedback/search       | Search feedback                  |
| GET    | /api/dashboard/stats       | Dashboard statistics             |

### Query Parameters for GET /api/feedback

| Param        | Type    | Description                    |
|-------------|---------|--------------------------------|
| keyword     | string  | Search across name/program/comments |
| rating      | int     | Filter by exact rating (1–5)   |
| program_name| string  | Filter by program name         |
| skip        | int     | Pagination offset (default: 0) |
| limit       | int     | Page size (default: 10)        |

---

## Screenshots

*(Screenshots will be added after UI completion)*

---

## Author

**Sanjana** — AFDE Batch Jul 2025
