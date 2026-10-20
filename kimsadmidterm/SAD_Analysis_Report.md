# Systems Analysis and Design – Midterm Examination Section A
## Student Scholarship Monitoring and Academic Compliance System
### Analysis and Design Report

---

## A1 — Investigation and Planning

### Problem Statement

The Scholarship Office currently relies on a manual, fragmented process combining spreadsheets, email attachments, and paper grade records to administer Merit Scholar and Community Scholar grants. This disjointed approach results in duplicate semester entries, unverified grade evidence, missed processing deadlines, and inconsistent renewal decisions. Scholars lack visibility into the status of their submissions, leading to confusion and delayed corrective action. A browser-based monitoring system is needed to centralize submission, verification, compliance evaluation, and renewal decisions under defined policy rules.

### Problem–Cause–Effect Table

| ID | Problem | Cause | Effect |
|----|---------|-------|--------|
| PCE-01 | Duplicate semester entries exist in records | No unique constraint on scholar + academic year + semester in spreadsheets | Staff waste time resolving conflicts; scholars may receive contradictory decisions |
| PCE-02 | Grades remain unverified before decisions | Email attachments are not tracked against a verification checklist | Renewal decisions are based on unconfirmed academic data |
| PCE-03 | Scholars cannot see submission status | No self-service portal; status communicated only by email or in person | Scholars miss correction windows; staff handle repeated inquiries |
| PCE-04 | Inconsistent renewal decisions across staff | Policy thresholds are applied from memory or ad-hoc notes rather than stored program rules | Similar academic records receive different outcomes depending on which staff member processes them |

### Scope and Exclusions

**In Scope:**
- Scholar self-service submission of semester academic summaries with grade-document references
- Staff verification of submitted evidence
- Automated policy-based compliance evaluation per scholarship program
- Staff-controlled renewal decisions with recorded reasons
- Dashboard with summary counts, search, and filtering
- Audit history for verification, evaluation, and decision changes

**Exclusions:**
- Integration with the Registrar system (official grade source remains external)
- Scholarship payment processing or disbursement
- SMS/email notification gateway
- Full appeal or exception workflow
- Machine-learning-based predictions

### Development Tasks

| ID | Task | Duration |
|----|------|----------|
| DT-01 | Design and implement database schema, seed policy records, and configure role-based access | 15 min |
| DT-02 | Build scholar assignment UI and semester grade-submission form with input validation and duplicate prevention | 25 min |
| DT-03 | Implement staff verification workflow (Verified / Returned with reason) and correction–resubmission cycle | 25 min |
| DT-04 | Implement policy-driven compliance evaluation, deficiency reasoning, and staff renewal decision controls | 30 min |

### Risks and Responses

| ID | Risk | Likelihood | Impact | Response |
|----|------|------------|--------|----------|
| R-01 | Network or hosting failure prevents live demonstration | Medium | High | Maintain a fully local-runnable copy with localStorage fallback; provide offline run instructions |
| R-02 | Test data does not cover all boundary conditions, leading to hidden evaluation bugs | Medium | Medium | Pre-seed six synthetic records covering exact boundaries, failures, lateness, and pending verification; run all ten mandatory test cases before submission |

---

## A2 — Stakeholders and Elicitation

### Stakeholder Register

| ID | Stakeholder | Role | Actor? | Interest |
|----|-------------|------|--------|----------|
| SH-01 | Scholar | End user — submits academic data and views status | **Yes** (actual actor) | Timely feedback on submission, verification, and renewal status |
| SH-02 | Scholarship Staff | End user — verifies evidence, evaluates compliance, decides renewal | **Yes** (actual actor) | Accurate data, consistent policy application, audit trail |
| SH-03 | Registrar Office | External data authority — source of official grades | No (external entity, not a system actor) | Data referenced but not altered by the system |
| SH-04 | Scholarship Program Director | Management sponsor — defines policy thresholds | No (served by reports; does not interact directly in MVP) | Policy adherence, summary dashboards, program integrity |

### Elicitation Questions

| ID | Question | Topic |
|----|----------|-------|
| EQ-01 | What specific documents or references does staff currently accept as valid grade evidence, and what makes evidence insufficient for verification? | Verification |
| EQ-02 | How far after the published deadline may a submission still be accepted, and does late submission automatically result in deficiency or only flag a warning? | Deadlines |
| EQ-03 | Under what circumstances, if any, may staff override a With Deficiency evaluation to approve renewal — and who has the authority to grant such exceptions? | Policy exceptions |
| EQ-04 | Should scholars see the detailed compliance breakdown (which specific checks passed or failed), or only the summary status? | Access & visibility |
| EQ-05 | What summary reports does the Scholarship Program Director need — for example, per-semester compliance rates by program, or lists of held renewals? | Reports |
| EQ-06 | When a staff member returns evidence for correction, what information must the return reason contain so the scholar can act on it without additional communication? | Verification |

---

## A3 — Requirements and Rules

### Functional Requirements

| ID | Requirement | Acceptance Criterion |
|----|-------------|---------------------|
| FR01 | The system shall authenticate users and assign them the Scholar or Staff role. | Login succeeds with valid credentials; role is reflected in the UI and enforced server-side. |
| FR02 | Staff shall register a scholar profile and assign exactly one scholarship program (Merit Scholar or Community Scholar). | A new scholar record is persisted with a linked program ID. |
| FR03 | A scholar shall submit a semester academic summary (GWA, enrolled units, failed count, incomplete count, dropped count) with a grade-document reference for a selected academic year and semester. | Submission is persisted with a timestamp; all fields are present. |
| FR04 | The system shall reject a submission if the scholar already has a record for the same academic year and semester. | A clear duplicate-rejection message is displayed; no second record is created. |
| FR05 | The system shall validate that GWA is between 1.00 and 5.00 inclusive, and that unit/count fields are non-negative integers. | Invalid values produce specific error messages; the record is not saved. |
| FR06 | Staff shall mark a submission's evidence as Verified or Returned, providing a reason when returning. | Verification status is updated and recorded with actor and timestamp. |
| FR07 | A scholar shall correct and resubmit a Returned submission, resetting its verification status to Pending. | The corrected record returns to Pending; previous verification history is preserved. |
| FR08 | Staff shall evaluate a verified submission against the assigned program's policy thresholds, producing Compliant or With Deficiency with specific reasons. | Evaluation references stored policy values; deficiency reasons list each failed check. |
| FR09 | Staff shall record an Approved or Held renewal decision for an evaluated submission; approval is blocked if compliance is With Deficiency. | Approval attempt on a deficient record is rejected with a message; Held is allowed on any evaluated record. |
| FR10 | The dashboard shall display total assigned scholars, pending verifications, compliant count, and with-deficiency count for a selected semester, with search by student ID or name and filter by program or compliance status. | Counts match the data; search and filter return correct subsets. |

### Non-Functional Requirements

| ID | Requirement | Measure |
|----|-------------|---------|
| NFR01 | Page load time shall not exceed 2 seconds on a standard broadband connection. | Measured with browser DevTools; 95th percentile ≤ 2 000 ms. |
| NFR02 | All role-access rules shall be enforced at the data layer, not only at the UI layer. | Verified by attempting direct data access from an unauthorized role; access is denied. |
| NFR03 | The system shall remain usable on viewports from 1024 px width and above. | All controls are accessible without horizontal scrolling at 1024 px. |
| NFR04 | Audit log entries shall be immutable; once written, they shall not be editable or deletable by any user role. | Attempt to modify a log entry fails; log retains original content. |

### Business Rules

| ID | Rule |
|----|------|
| BR01 | A Merit Scholar must maintain a GWA ≤ 1.75, enroll in ≥ 18 units, have 0 failed subjects, 0 incomplete grades, and 0 dropped subjects. |
| BR02 | A Community Scholar must maintain a GWA ≤ 2.25, enroll in ≥ 15 units, have 0 failed subjects, 0 incomplete grades, and ≤ 1 dropped subject. |
| BR03 | Submissions must be received on or before 2026-10-30 17:00 Asia/Manila time. A submission at the exact deadline is on time; one after is late. |
| BR04 | A submission for a scholar–academic-year–semester combination that already exists shall be rejected as a duplicate. |
| BR05 | Evidence must be verified before compliance evaluation can proceed. Missing or unverified evidence blocks evaluation. |
| BR06 | Staff may hold renewal on any evaluated record but may approve only a Compliant record. A deficient record cannot be approved. |

---

## A4 — UML Use Case Modeling

### Use Case Diagram (Textual Specification)

```
┌──────────────────────────────────────────────────────────────────────┐
│                  Scholarship Monitoring System                       │
│                                                                      │
│   ┌──────────────────┐      ┌─────────────────────────┐             │
│   │  UC01: Log In     │      │  UC09: Manage Scholar   │             │
│   └──────────────────┘      │        Profile           │             │
│                              └─────────────────────────┘             │
│   ┌──────────────────┐      ┌─────────────────────────┐             │
│   │  UC02: Submit     │      │  UC05: Verify Evidence  │             │
│   │   Semester Grades │      └─────────────────────────┘             │
│   └────────┬─────────┘                                               │
│            │ «include»         ┌─────────────────────────┐           │
│            ▼                   │  UC06: Evaluate          │           │
│   ┌──────────────────┐        │       Compliance         │           │
│   │  UC03: Validate   │        └─────────────────────────┘           │
│   │   Academic Input  │                                              │
│   └──────────────────┘        ┌─────────────────────────┐           │
│                                │  UC07: Record Renewal   │           │
│   ┌──────────────────┐        │       Decision           │           │
│   │  UC04: Check      │        └─────────────────────────┘           │
│   │   Duplicate       │                                              │
│   └──────────────────┘        ┌─────────────────────────┐           │
│            ▲ «include»        │  UC08: View Dashboard   │           │
│            │                   └─────────────────────────┘           │
│   From UC02                                                          │
│                                ┌─────────────────────────┐          │
│                                │  UC10: Flag Late         │          │
│                                │   Submission  «extend»   │          │
│                                │   ← extends UC06         │          │
│                                └─────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘

    ┌─────┐                                              ┌─────┐
    │     │ Scholar                              Staff    │     │
    │ 👤  │──── UC01, UC02, UC08                         │ 👤  │
    │     │                                              │     │
    └─────┘     UC01, UC05, UC06, UC07, UC08, UC09 ──── └─────┘
```

### Use Case List

| ID | Use Case | Primary Actor(s) |
|----|----------|-------------------|
| UC01 | Log In | Scholar, Staff |
| UC02 | Submit Semester Grades | Scholar |
| UC03 | Validate Academic Input | — (included by UC02) |
| UC04 | Check Duplicate Submission | — (included by UC02) |
| UC05 | Verify Evidence | Staff |
| UC06 | Evaluate Compliance | Staff |
| UC07 | Record Renewal Decision | Staff |
| UC08 | View Dashboard | Staff (primary), Scholar (own status) |
| UC09 | Manage Scholar Profile | Staff |
| UC10 | Flag Late Submission | — (extends UC06) |

### Relationship Justifications

| Relationship | From → To | Justification |
|---|---|---|
| **«include» #1** | UC02 → UC03 | Every submission **must** validate GWA range (1.00–5.00), non-negative integers, and required fields. This is mandatory reused behavior that is never skipped, making *include* correct. |
| **«include» #2** | UC02 → UC04 | Every submission **must** check for a duplicate scholar–year–semester entry before persisting. This check is mandatory and is logically a separate reusable step, warranting *include*. |
| **«extend» #1** | UC10 → UC06 | Late-submission flagging occurs **only when** the submission timestamp is after the deadline. It is conditional behavior added at the "check deadline" extension point inside Evaluate Compliance, making *extend* correct. |

---

## A5 — Detailed Use Cases and Data Design

### Use Case: Submit Semester Grades (UC02)

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC02 |
| **Name** | Submit Semester Grades |
| **Actor** | Scholar |
| **Trigger** | Scholar selects "New Submission" from their portal |
| **Preconditions** | Scholar is authenticated (UC01 completed); scholar is assigned to a scholarship program |
| **Linked FRs** | FR03, FR04, FR05 |
| **Linked BRs** | BR03, BR04 |

**Main Flow:**

1. Scholar navigates to the submission form.
2. Scholar selects Academic Year (e.g., 2026–2027) and Semester (1 or 2).
3. Scholar enters GWA, enrolled units, failed-subject count, incomplete count, and dropped-subject count.
4. Scholar provides a grade-document reference (text field describing the document).
5. System **includes UC03 — Validate Academic Input**: checks GWA ∈ [1.00, 5.00], counts ≥ 0, units ≥ 0, all fields present.
6. System **includes UC04 — Check Duplicate Submission**: queries for existing record with same scholar + year + semester.
7. System records the submission with status = Pending, timestamps the entry in Asia/Manila time.
8. System displays confirmation with submission ID and Pending status.

**Alternative Flows:**

- **5a — Validation failure:** System displays specific error messages (e.g., "GWA must be between 1.00 and 5.00"). Scholar corrects and re-attempts from step 3.
- **6a — Duplicate found:** System displays "A submission for this academic year and semester already exists." Scholar is returned to step 2.

**Exception Flows:**

- **E1 — Session expired:** System redirects to login; unsaved data is lost. Scholar re-authenticates and restarts.

**Postconditions:**

- A new semester submission record exists with status Pending, verification status Pending, and a recorded timestamp.

---

### Use Case: Evaluate Compliance (UC06)

| Element | Description |
|---------|-------------|
| **Use Case ID** | UC06 |
| **Name** | Evaluate Compliance |
| **Actor** | Staff |
| **Trigger** | Staff selects "Evaluate" on a verified submission |
| **Preconditions** | Staff is authenticated; submission evidence is Verified (FR06 satisfied) |
| **Linked FRs** | FR08, FR09 |
| **Linked BRs** | BR01, BR02, BR03, BR05, BR06 |

**Main Flow:**

1. Staff selects a submission with verification status = Verified.
2. System retrieves the scholar's assigned scholarship program and its policy thresholds.
3. System compares submission GWA against the program's maximum GWA threshold.
4. System compares enrolled units against the program's minimum units threshold.
5. System checks failed-subject count against the program's allowed-failed limit.
6. System checks incomplete count against the program's allowed-incomplete limit.
7. System checks dropped-subject count against the program's allowed-dropped limit.
8. **Extension point — "check deadline":** If submission timestamp > deadline, UC10 Flag Late Submission extends this flow, adding "Late submission" to deficiency reasons.
9. All checks pass → system records compliance result as Compliant.
10. System displays compliance result with a breakdown of each policy check.

**Alternative Flows:**

- **9a — One or more checks fail:** System records compliance as With Deficiency, listing each specific failed check (e.g., "GWA 1.76 exceeds Merit Scholar limit of 1.75"). Staff views the deficiency reasons.

**Exception Flows:**

- **E1 — Submission not verified:** System blocks evaluation and displays "Evidence must be verified before evaluation."
- **E2 — Policy record missing:** System displays an error; staff must assign a program before evaluating.

**Postconditions:**

- Compliance result (Compliant or With Deficiency) and specific reasons are recorded with actor and timestamp. The submission is ready for a renewal decision (UC07).

---

### Entity-Relationship Diagram (ERD)

```
┌──────────────────────┐       ┌──────────────────────────┐
│      USERS            │       │   SCHOLARSHIP_PROGRAMS    │
├──────────────────────┤       ├──────────────────────────┤
│ PK  user_id           │       │ PK  program_id            │
│     email              │       │     program_name          │
│     full_name          │       │     max_gwa               │
│     role (scholar/     │       │     min_units             │
│          staff)        │       │     allowed_failed        │
│     student_id         │       │     allowed_incomplete    │
│     created_at         │       │     allowed_dropped       │
└──────┬───────────────┘       │     submission_deadline    │
       │                        │     created_at             │
       │ 1                      └──────────┬───────────────┘
       │                                    │
       ▼ *                                  │ 1
┌──────────────────────┐                   │
│  SCHOLAR_ASSIGNMENTS  │                   │
├──────────────────────┤                   │
│ PK  assignment_id     │◄──────────────────┘
│ FK  user_id           │        *
│ FK  program_id        │
│     assigned_by       │
│     assigned_at       │
└──────┬───────────────┘
       │ 1
       │
       ▼ *
┌──────────────────────────┐
│   SEMESTER_SUBMISSIONS    │
├──────────────────────────┤
│ PK  submission_id         │
│ FK  assignment_id         │
│     academic_year         │
│     semester              │
│     gwa                   │
│     enrolled_units        │
│     failed_count          │
│     incomplete_count      │
│     dropped_count         │
│     evidence_reference    │
│     submitted_at          │
│     verification_status   │  ← Pending | Verified | Returned
│     compliance_result     │  ← null | Compliant | With Deficiency
│     compliance_reasons    │
│     renewal_decision      │  ← null | Approved | Held
│     renewal_reason        │
│     UNIQUE(assignment_id, │
│       academic_year,      │
│       semester)           │
└──────┬───────────────────┘
       │ 1
       │
       ▼ *
┌──────────────────────────┐
│      AUDIT_LOG            │
├──────────────────────────┤
│ PK  log_id                │
│ FK  submission_id         │
│     action_type           │  ← verification | evaluation | renewal | resubmission
│     old_value             │
│     new_value             │
│     reason                │
│     performed_by          │
│     performed_at          │
└──────────────────────────┘
```

**Cardinalities:**
- A **User** has zero or many **Scholar Assignments** (1:*).
- A **Scholarship Program** is linked to zero or many **Scholar Assignments** (1:*).
- A **Scholar Assignment** has zero or many **Semester Submissions** (1:*), constrained by the UNIQUE(assignment_id, academic_year, semester) rule.
- A **Semester Submission** has zero or many **Audit Log** entries (1:*).

---

## A6 — Traceability Matrix

| FR | Actor | Use Case | Business Rule | Screen / Function | Test ID | Expected Result |
|----|-------|----------|---------------|-------------------|---------|-----------------|
| FR03 | Scholar | UC02 Submit Semester Grades | BR03 (deadline), BR04 (duplicate) | Scholar Submission Form → `submitGrades()` | TC01, TC07 | Submission persists with timestamp; duplicate rejected |
| FR05 | Scholar | UC03 Validate Academic Input (via UC02) | BR01, BR02 (thresholds define valid ranges) | Scholar Submission Form → `validateInput()` | TC07 | GWA 0.50 or negative count rejected with specific message |
| FR08 | Staff | UC06 Evaluate Compliance | BR01, BR02, BR03, BR05 | Staff Evaluation Panel → `evaluateCompliance()` | TC01–TC05 | Compliant/Deficiency with correct reasons per program policy |
| FR09 | Staff | UC07 Record Renewal Decision | BR06 (approve only compliant) | Staff Renewal Panel → `recordRenewal()` | TC06, TC10 | Approval blocked on deficient record; held decision saved |

### Planned but Not Implemented

| Requirement | Reason |
|-------------|--------|
| Email/SMS notifications on status change | Out of MVP scope; no gateway integrated |
| Full appeal/exception workflow | Explicitly excluded per exam instructions |

---

*End of Part I — Analysis and Design Report*
