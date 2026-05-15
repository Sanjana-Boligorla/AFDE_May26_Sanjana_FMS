# Feedback Management System — API Documentation

**Base URL:** `http://localhost:8000`  
**API Prefix:** `/api`  
**Format:** JSON  
**Interactive Docs:** http://localhost:8000/docs

---

## Table of Contents

1. [Health Endpoints](#1-health-endpoints)
2. [Dashboard](#2-dashboard)
3. [Submit Feedback](#3-submit-feedback)
4. [List Feedback](#4-list-feedback)
5. [Search Feedback](#5-search-feedback)
6. [Get Feedback by ID](#6-get-feedback-by-id)
7. [Update Feedback](#7-update-feedback)
8. [Delete Feedback](#8-delete-feedback)
9. [Data Models](#9-data-models)
10. [Error Responses](#10-error-responses)

---

## 1. Health Endpoints

### GET /

Returns basic API info.

**Response `200`:**
```json
{
  "project": "Feedback Management System",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

### GET /health

Database connectivity check.

**Response `200` (healthy):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Response `200` (degraded):**
```json
{
  "status": "degraded",
  "database": "unreachable"
}
```

---

## 2. Dashboard

### GET /api/dashboard/stats

Returns aggregated statistics for the dashboard.

**Response `200`:**
```json
{
  "total_feedback": 15,
  "average_rating": 4.07,
  "recommend_percentage": 73.3,
  "rating_distribution": {
    "1": 0,
    "2": 1,
    "3": 3,
    "4": 5,
    "5": 6
  },
  "category_distribution": {
    "Training": 12,
    "Product": 1,
    "Event": 2
  },
  "department_distribution": {
    "Engineering": 5,
    "Analytics": 2,
    "HR": 2
  },
  "top_programs": [
    {
      "program_name": "Python for Data Engineering",
      "count": 2,
      "avg_rating": 3.5
    }
  ],
  "top_trainers": [
    {
      "trainer_name": "Dr. Ramesh Kumar",
      "count": 3,
      "avg_rating": 5.0
    }
  ],
  "recent_feedback": [
    {
      "feedback_id": 15,
      "participant_name": "Olivia Walker",
      "email": "olivia.w@example.com",
      "department": "HR",
      "program_name": "Leadership & Communication",
      "category": "Training",
      "trainer_name": "Ms. Priya Sharma",
      "session_date": "2025-07-13",
      "rating": 5,
      "rating_label": "Excellent",
      "comments": "Transformational training.",
      "would_recommend": true,
      "submitted_at": "2026-05-15T06:37:06",
      "updated_at": "2026-05-15T06:37:06"
    }
  ]
}
```

---

## 3. Submit Feedback

### POST /api/feedback

Creates a new feedback record.

**Request Body:**
```json
{
  "participant_name": "Alice Johnson",
  "email": "alice.j@example.com",
  "department": "Engineering",
  "program_name": "Python for Data Engineering",
  "category": "Training",
  "trainer_name": "Dr. Ramesh Kumar",
  "session_date": "2025-07-01",
  "rating": 5,
  "comments": "Excellent course! Very well structured.",
  "would_recommend": true
}
```

**Required fields:** `participant_name`, `program_name`, `rating`  
**Optional fields:** `email`, `department`, `category`, `trainer_name`, `session_date`, `comments`, `would_recommend`

**Category values:** `Training` | `Product` | `Event` | `Service` | `Other`  
**Rating range:** `1` (Poor) to `5` (Excellent)

**Response `201`:**
```json
{
  "feedback_id": 16,
  "participant_name": "Alice Johnson",
  "email": "alice.j@example.com",
  "department": "Engineering",
  "program_name": "Python for Data Engineering",
  "category": "Training",
  "trainer_name": "Dr. Ramesh Kumar",
  "session_date": "2025-07-01",
  "rating": 5,
  "rating_label": "Excellent",
  "comments": "Excellent course! Very well structured.",
  "would_recommend": true,
  "submitted_at": "2026-05-15T10:00:00",
  "updated_at": "2026-05-15T10:00:00"
}
```

---

## 4. List Feedback

### GET /api/feedback

Returns paginated feedback records with optional filters.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | int | 0 | Pagination offset |
| `limit` | int | 10 | Records per page (max: 100) |
| `keyword` | string | — | Search across name, email, dept, program, trainer, comments |
| `rating` | int (1–5) | — | Filter by exact rating |
| `category` | string | — | Filter by category |
| `program_name` | string | — | Partial match on program name |
| `trainer_name` | string | — | Partial match on trainer name |
| `would_recommend` | bool | — | Filter by recommendation |

**Example requests:**
```
GET /api/feedback
GET /api/feedback?skip=10&limit=10
GET /api/feedback?rating=5&category=Training
GET /api/feedback?keyword=Python&would_recommend=true
```

**Response `200`:**
```json
{
  "total": 15,
  "skip": 0,
  "limit": 10,
  "data": [
    {
      "feedback_id": 15,
      "participant_name": "Olivia Walker",
      "email": "olivia.w@example.com",
      "department": "HR",
      "program_name": "Leadership & Communication",
      "category": "Training",
      "trainer_name": "Ms. Priya Sharma",
      "session_date": "2025-07-13",
      "rating": 5,
      "rating_label": "Excellent",
      "comments": "Transformational training.",
      "would_recommend": true,
      "submitted_at": "2026-05-15T06:37:06",
      "updated_at": "2026-05-15T06:37:06"
    }
  ]
}
```

---

## 5. Search Feedback

### GET /api/feedback/search

Dedicated search endpoint — same filters as list, no pagination limit.

**Query Parameters:** Same as List Feedback but uses `q` instead of `keyword`.

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Keyword search |
| `rating` | int (1–5) | Rating filter |
| `category` | string | Category filter |
| `program_name` | string | Program name filter |
| `trainer_name` | string | Trainer name filter |
| `would_recommend` | bool | Recommendation filter |

**Example:**
```
GET /api/feedback/search?q=Python
GET /api/feedback/search?rating=5&category=Training
```

**Response `200`:**
```json
{
  "total": 2,
  "data": [ ... ]
}
```

---

## 6. Get Feedback by ID

### GET /api/feedback/{id}

Returns a single feedback record.

**Path Parameter:** `id` — integer feedback ID

**Example:** `GET /api/feedback/1`

**Response `200`:**
```json
{
  "feedback_id": 1,
  "participant_name": "Alice Johnson",
  "email": "alice.j@example.com",
  "department": "Engineering",
  "program_name": "Python for Data Engineering",
  "category": "Training",
  "trainer_name": "Dr. Ramesh Kumar",
  "session_date": "2025-07-01",
  "rating": 5,
  "rating_label": "Excellent",
  "comments": "Absolutely outstanding course.",
  "would_recommend": true,
  "submitted_at": "2026-05-15T06:37:06",
  "updated_at": "2026-05-15T06:37:06"
}
```

**Response `404`:**
```json
{
  "detail": "Feedback with id=999 not found."
}
```

---

## 7. Update Feedback

### PUT /api/feedback/{id}

Updates a feedback record. Only provided fields are updated (partial update).

**Path Parameter:** `id` — integer feedback ID

**Request Body** (all fields optional):
```json
{
  "rating": 4,
  "comments": "Updated comment after reflection.",
  "would_recommend": true
}
```

**Response `200`:** Returns the full updated feedback object (same as GET by ID).

**Response `404`:**
```json
{
  "detail": "Feedback with id=999 not found."
}
```

---

## 8. Delete Feedback

### DELETE /api/feedback/{id}

Permanently deletes a feedback record.

**Path Parameter:** `id` — integer feedback ID

**Response `200`:**
```json
{
  "message": "Feedback id=16 deleted successfully."
}
```

**Response `404`:**
```json
{
  "detail": "Feedback with id=999 not found."
}
```

---

## 9. Data Models

### Feedback Object

| Field | Type | Required | Description |
|---|---|---|---|
| `feedback_id` | int | auto | Primary key |
| `participant_name` | string | ✅ | Full name |
| `email` | string | — | Email address |
| `department` | string | — | Department or team |
| `program_name` | string | ✅ | Training/event/product name |
| `category` | enum | — | Training / Product / Event / Service / Other |
| `trainer_name` | string | — | Instructor name |
| `session_date` | date | — | Date of session (YYYY-MM-DD) |
| `rating` | int (1–5) | ✅ | 1=Poor, 2=Fair, 3=Good, 4=Very Good, 5=Excellent |
| `rating_label` | string | auto | Human-readable rating label |
| `comments` | string | — | Detailed feedback |
| `would_recommend` | bool | — | Recommendation (default: true) |
| `submitted_at` | datetime | auto | Creation timestamp |
| `updated_at` | datetime | auto | Last update timestamp |

### Category Enum Values

| Value | Description |
|---|---|
| `Training` | Training sessions or courses |
| `Product` | Product feedback |
| `Event` | Events or conferences |
| `Service` | Service quality feedback |
| `Other` | General feedback |

---

## 10. Error Responses

### Validation Error `422`

Returned when required fields are missing or invalid.

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "participant_name"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

### Not Found `404`

```json
{
  "detail": "Feedback with id=999 not found."
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created successfully |
| 404 | Resource not found |
| 422 | Validation error (bad input) |
| 500 | Internal server error |
