# Scholarship Monitoring System — README

## Student Scholarship Monitoring and Academic Compliance System
**SAD Laboratory Midterm Examination — Section A**

---

## Setup & Run Instructions

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox)
- No server or Node.js required — runs entirely in the browser

### How to Run
1. Open `index.html` in your browser (double-click or File → Open)
2. The application uses **localStorage** for persistence — data survives page refresh
3. The database seeds automatically on first load with 2 policies, 7 users, 6 scholar assignments, and 6 test submissions

### To Reset Data
Open browser console (F12) and run:
```javascript
localStorage.removeItem('scholarship_monitor_db');
location.reload();
```

---

## Environment Variables
- None required — this is a fully client-side application
- No API keys, service-role keys, or external services needed

---

## Test Accounts

| Username | Password | Role | Student ID |
|----------|----------|------|------------|
| staff1 | pass123 | Staff | — |
| scholar_a01 | pass123 | Scholar | A01 |
| scholar_a02 | pass123 | Scholar | A02 |
| scholar_a03 | pass123 | Scholar | A03 |
| scholar_a04 | pass123 | Scholar | A04 |
| scholar_a05 | pass123 | Scholar | A05 |
| scholar_a06 | pass123 | Scholar | A06 |

---

## Seeded Test Records

| ID | Program | GWA | Units | Failed | INC | Drop | Special Condition |
|----|---------|-----|-------|--------|-----|------|-------------------|
| A01 | Merit Scholar | 1.75 | 18 | 0 | 0 | 0 | Submitted at exact deadline |
| A02 | Merit Scholar | 1.76 | 18 | 0 | 0 | 0 | One day before deadline |
| A03 | Community Scholar | 2.25 | 15 | 0 | 0 | 1 | One day before deadline |
| A04 | Community Scholar | 2.25 | 14 | 0 | 1 | 0 | One day before deadline |
| A05 | Merit Scholar | 1.50 | 18 | 1 | 0 | 0 | One minute after deadline (late) |
| A06 | Community Scholar | 2.00 | 15 | 0 | 0 | 0 | Pending verification |

---

## Policy Thresholds (Seeded)

| Rule | Merit Scholar | Community Scholar |
|------|---------------|-------------------|
| Maximum GWA | 1.75 | 2.25 |
| Minimum Units | 18 | 15 |
| Allowed Failed | 0 | 0 |
| Allowed Incomplete | 0 | 0 |
| Allowed Dropped | 0 | 1 |
| Deadline | 2026-10-30 17:00 PHT | 2026-10-30 17:00 PHT |

---

## Architecture

```
index.html      — Single-page application structure
styles.css      — Design system (dark mode, tokens, components)
app.js          — Core logic (auth, CRUD, evaluation, audit)
```

### Data Layer
- All data stored in `localStorage` under key `scholarship_monitor_db`
- Role access enforced in JavaScript data access functions (not just UI hiding)
- Audit log entries are append-only — no delete/edit operations exposed

### Key Design Decisions
1. **localStorage over Supabase**: Ensures the app runs offline without network dependencies
2. **Policy-driven evaluation**: Compliance checks read thresholds from stored program records, not hardcoded values
3. **Separate statuses**: Verification status, compliance result, and renewal decision are independent fields
4. **Immutable audit log**: All state changes are logged with actor, timestamp, old/new values, and reason

---

## Known Defects
- None identified during testing. All TC01–TC10 pass as expected.

---

## File Structure

```
SAD_Exam_Section_A/
├── index.html              — Main HTML
├── styles.css              — CSS Design System
├── app.js                  — Application Logic
├── README.md               — This file
├── SAD_Analysis_Report.md  — Part I Analysis & Design (A1–A6)
└── Test_Results.md         — Part II Test Results (TC01–TC10)
```
