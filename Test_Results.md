# Test Results — TC01 through TC10

## Student Scholarship Monitoring and Academic Compliance System
### Mandatory Functional Test Evidence

---

## Test Results Summary

| Test ID | Input / Action | Expected Result | Actual Result | Pass/Fail | Evidence |
|---------|---------------|-----------------|---------------|-----------|----------|
| TC01 | Evaluate record A01 (Merit, GWA 1.75, 18 units, 0/0/0, at deadline) | Compliant — boundary GWA and exact deadline both pass | **Compliant** — all 6 policy checks pass (GWA ≤ 1.75 ✓, units ≥ 18 ✓, failed ≤ 0 ✓, INC ≤ 0 ✓, dropped ≤ 0 ✓, on time ✓) | **PASS** | Staff Dashboard → View A01 → Evaluate → all checks green |
| TC02 | Evaluate record A02 (Merit, GWA 1.76, 18 units, 0/0/0) | With Deficiency — GWA exceeds 1.75 limit | **With Deficiency** — reason: "GWA 1.76 exceeds Merit Scholar limit of 1.75" | **PASS** | Staff Dashboard → View A02 → Evaluate → GWA check red |
| TC03 | Evaluate record A03 (Community, GWA 2.25, 15 units, 0/0/1 drop) | Compliant — 1 drop allowed by Community Scholar policy | **Compliant** — all checks pass including dropped ≤ 1 ✓ | **PASS** | Staff Dashboard → View A03 → Evaluate → all checks green |
| TC04 | Evaluate record A04 (Community, GWA 2.25, 14 units, 0/1/0) | With Deficiency — both insufficient units AND incomplete grade | **With Deficiency** — 2 reasons: "Enrolled units 14 below minimum 15" and "1 incomplete grade exceeds allowed 0" | **PASS** | Staff Dashboard → View A04 → Evaluate → units + INC checks red |
| TC05 | Evaluate record A05 (Merit, GWA 1.50, 18 units, 1/0/0, 1 min late) | With Deficiency — failed subject AND late submission | **With Deficiency** — 2 reasons: "1 failed subject exceeds allowed 0" and "Submission received after deadline" | **PASS** | Staff Dashboard → View A05 → Evaluate → failed + deadline checks red |
| TC06 | Attempt evaluate + renewal on A06 (Pending verification) | Both blocked — verification required first | **Blocked** — "Evidence must be verified before evaluation" toast. No Evaluate or Decide buttons shown for Pending records. | **PASS** | Staff Dashboard → A06 row shows only Verify button |
| TC07 | Submit duplicate AY 2026-2027 Sem 1 for A01; submit GWA 0.50 | Duplicate rejected; GWA 0.50 rejected | **Duplicate**: "A submission for this academic year and semester already exists." **GWA 0.50**: "GWA must be between 1.00 and 5.00 inclusive." | **PASS** | Scholar A01 login → New Submission → attempt duplicate + invalid GWA |
| TC08 | Login as scholar_a01; attempt to view A02's records | Access denied — scholar sees only own submissions | **Own records only** — Scholar view shows only A01's submission. No access to other scholar data. API-level check via `enforceAccess()`. | **PASS** | Scholar A01 login → My Submissions shows only A01 data |
| TC09 | Return A01 evidence with reason; scholar corrects and resubmits; refresh page | After resubmit: Pending verification. History preserved. Data persists after refresh. | **Correct** — Returned → scholar corrects → status resets to Pending. Audit log records both return and resubmission. Data persists on refresh (localStorage). | **PASS** | Staff returns A01 → Scholar A01 corrects → Refresh → Pending + audit trail |
| TC10 | Staff approve compliant record; staff hold deficient record; scholar attempts to change decision | Compliant → Approved. Deficient → Held only (Approve disabled). Scholar has no decision controls. | **Correct** — A01 (Compliant) → Approved ✓. A02 (Deficient) → Approve button disabled, only Hold available. Scholar view has no renewal decision buttons. | **PASS** | Staff: Approve A01, Hold A02. Scholar login: no decision controls visible |

---

## Detailed Test Narratives

### TC01 — Valid Boundary
1. Login as `staff1`
2. Dashboard shows A01 with Verified status
3. Click **Evaluate** on A01 row
4. System displays 6 policy checks, all passing:
   - GWA ≤ 1.75: **1.75** ✓
   - Enrolled units ≥ 18: **18** ✓
   - Failed subjects ≤ 0: **0** ✓
   - Incomplete grades ≤ 0: **0** ✓
   - Dropped subjects ≤ 0: **0** ✓
   - Submitted on or before deadline: **On time** ✓
5. Result: **Compliant**

### TC02 — GWA Above Limit
1. Click **Evaluate** on A02
2. GWA check fails: 1.76 > 1.75
3. Result: **With Deficiency**
4. Reason: "GWA 1.76 exceeds Merit Scholar limit of 1.75"

### TC03 — Program Variation
1. Click **Evaluate** on A03
2. Community Scholar allows 1 dropped subject
3. A03 has 1 dropped → passes the threshold
4. All other checks pass
5. Result: **Compliant**

### TC04 — Multiple Deficiencies
1. Click **Evaluate** on A04
2. Two checks fail:
   - Enrolled units 14 < minimum 15
   - Incomplete count 1 > allowed 0
3. Result: **With Deficiency** with both reasons listed

### TC05 — Failure and Lateness
1. Click **Evaluate** on A05
2. Two checks fail:
   - Failed count 1 > allowed 0
   - Submitted 1 minute after deadline
3. Result: **With Deficiency** with both reasons listed

### TC06 — Verification Gate
1. A06 has verification_status = Pending
2. Dashboard row for A06 shows only "Verify" button (no Evaluate or Decide)
3. Attempting to call `performEvaluation('sub-a06')` from console shows error toast
4. Renewal cannot be attempted without evaluation

### TC07 — Duplicate and Invalid Input
1. Login as `scholar_a01`
2. Navigate to New Submission tab
3. Select AY 2026-2027, Semester 1 (already exists)
4. Enter valid academic data and submit → "A submission for this academic year and semester already exists."
5. Change AY to new value, enter GWA = 0.50 → "GWA must be between 1.00 and 5.00 inclusive."
6. Enter negative failed count (-1) → "Failed count must be a non-negative integer."

### TC08 — Role Isolation
1. Login as `scholar_a01`
2. My Submissions table shows only A01's submission
3. No UI controls to view, verify, evaluate, or decide on other scholars' records
4. Backend: `enforceAccess()` function checks `currentUser.user_id` matches the submission owner
5. Scholar has no access to staff tabs (Scholars, full Submissions, Audit History)

### TC09 — Persistence and Correction
1. Login as `staff1`, find A01 (Verified)
2. Click Verify → Return with reason "Document image is blurry, please resubmit clearer copy"
3. Audit log records: Verification: Verified → Returned, with reason
4. Status resets to Returned; compliance and renewal cleared
5. Login as `scholar_a01`, see Returned status with "Correct" button
6. Click Correct → update evidence reference → Resubmit
7. Status becomes Pending; audit log records resubmission with old/new values
8. Refresh browser (F5) → Data persists, status still Pending, audit trail intact

### TC10 — Renewal Authority
1. Login as `staff1`
2. Evaluate A01 → Compliant. Click **Decide** → click **Approve** → Decision: Approved ✓
3. Evaluate A02 → With Deficiency. Click **Decide** → Approve button is **disabled** (grayed out). Click **Hold** → Decision: Held ✓
4. Login as any scholar → No "Decide" button or renewal controls visible in scholar view
5. Scholar cannot modify the renewal_decision field

---

## Summary

**All 10 mandatory tests pass.** No defects detected. The system correctly:
- Enforces policy thresholds from stored program records
- Handles boundary values (exact GWA limit, exact deadline)
- Blocks evaluation on unverified submissions
- Blocks approval on deficient records
- Isolates scholar data by role
- Persists all data through refresh via localStorage
- Maintains immutable audit trail for all state changes
