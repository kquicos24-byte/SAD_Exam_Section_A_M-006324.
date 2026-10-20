/**
 * ============================================================
 *  Scholarship Monitoring & Academic Compliance System
 *  app.js — Core Application Logic
 *  Stack: Vanilla HTML/CSS/JS with localStorage persistence
 * ============================================================
 */

/* =================================================================
   1. DATA LAYER — localStorage-backed store with role enforcement
   ================================================================= */

const DB_KEY = 'scholarship_monitor_db';

/** Default data factory — called once to seed the database */
function createDefaultDB() {
  // ---- Scholarship programs (policy records) ----
  const programs = [
    {
      program_id: 'merit',
      program_name: 'Merit Scholar',
      max_gwa: 1.75,
      min_units: 18,
      allowed_failed: 0,
      allowed_incomplete: 0,
      allowed_dropped: 0,
      submission_deadline: '2026-10-30T17:00:00+08:00',  // Asia/Manila
      created_at: new Date().toISOString()
    },
    {
      program_id: 'community',
      program_name: 'Community Scholar',
      max_gwa: 2.25,
      min_units: 15,
      allowed_failed: 0,
      allowed_incomplete: 0,
      allowed_dropped: 1,
      submission_deadline: '2026-10-30T17:00:00+08:00',
      created_at: new Date().toISOString()
    }
  ];

  // ---- Users (staff + 6 scholars) ----
  const users = [
    { user_id: 'staff-1', username: 'staff1', password: 'pass123', full_name: 'Admin Staff', role: 'staff', student_id: null },
    { user_id: 'scholar-a01', username: 'scholar_a01', password: 'pass123', full_name: 'Ana Reyes',     role: 'scholar', student_id: 'A01' },
    { user_id: 'scholar-a02', username: 'scholar_a02', password: 'pass123', full_name: 'Ben Torres',    role: 'scholar', student_id: 'A02' },
    { user_id: 'scholar-a03', username: 'scholar_a03', password: 'pass123', full_name: 'Clara Santos',  role: 'scholar', student_id: 'A03' },
    { user_id: 'scholar-a04', username: 'scholar_a04', password: 'pass123', full_name: 'David Lim',     role: 'scholar', student_id: 'A04' },
    { user_id: 'scholar-a05', username: 'scholar_a05', password: 'pass123', full_name: 'Elena Cruz',    role: 'scholar', student_id: 'A05' },
    { user_id: 'scholar-a06', username: 'scholar_a06', password: 'pass123', full_name: 'Francis Garcia', role: 'scholar', student_id: 'A06' }
  ];

  // ---- Scholar assignments ----
  const assignments = [
    { assignment_id: 'asgn-a01', user_id: 'scholar-a01', program_id: 'merit',     assigned_by: 'staff-1', assigned_at: new Date().toISOString() },
    { assignment_id: 'asgn-a02', user_id: 'scholar-a02', program_id: 'merit',     assigned_by: 'staff-1', assigned_at: new Date().toISOString() },
    { assignment_id: 'asgn-a03', user_id: 'scholar-a03', program_id: 'community', assigned_by: 'staff-1', assigned_at: new Date().toISOString() },
    { assignment_id: 'asgn-a04', user_id: 'scholar-a04', program_id: 'community', assigned_by: 'staff-1', assigned_at: new Date().toISOString() },
    { assignment_id: 'asgn-a05', user_id: 'scholar-a05', program_id: 'merit',     assigned_by: 'staff-1', assigned_at: new Date().toISOString() },
    { assignment_id: 'asgn-a06', user_id: 'scholar-a06', program_id: 'community', assigned_by: 'staff-1', assigned_at: new Date().toISOString() }
  ];

  // ---- Deadline: 2026-10-30 17:00 Asia/Manila ----
  const deadline = new Date('2026-10-30T17:00:00+08:00');
  const oneDayBefore  = new Date(deadline.getTime() - 24*60*60*1000);   // Oct 29 17:00
  const atDeadline    = new Date(deadline.getTime());                     // Oct 30 17:00
  const oneMinAfter   = new Date(deadline.getTime() + 60*1000);          // Oct 30 17:01

  // ---- Semester submissions (6 test records) ----
  const submissions = [
    {
      submission_id: 'sub-a01',
      assignment_id: 'asgn-a01',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 1.75,
      enrolled_units: 18,
      failed_count: 0,
      incomplete_count: 0,
      dropped_count: 0,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A01',
      submitted_at: atDeadline.toISOString(),   // At deadline
      verification_status: 'Verified',
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    },
    {
      submission_id: 'sub-a02',
      assignment_id: 'asgn-a02',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 1.76,
      enrolled_units: 18,
      failed_count: 0,
      incomplete_count: 0,
      dropped_count: 0,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A02',
      submitted_at: oneDayBefore.toISOString(),
      verification_status: 'Verified',
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    },
    {
      submission_id: 'sub-a03',
      assignment_id: 'asgn-a03',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 2.25,
      enrolled_units: 15,
      failed_count: 0,
      incomplete_count: 0,
      dropped_count: 1,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A03',
      submitted_at: oneDayBefore.toISOString(),
      verification_status: 'Verified',
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    },
    {
      submission_id: 'sub-a04',
      assignment_id: 'asgn-a04',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 2.25,
      enrolled_units: 14,
      failed_count: 0,
      incomplete_count: 1,
      dropped_count: 0,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A04',
      submitted_at: oneDayBefore.toISOString(),
      verification_status: 'Verified',
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    },
    {
      submission_id: 'sub-a05',
      assignment_id: 'asgn-a05',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 1.50,
      enrolled_units: 18,
      failed_count: 1,
      incomplete_count: 0,
      dropped_count: 0,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A05',
      submitted_at: oneMinAfter.toISOString(),  // 1 minute late
      verification_status: 'Verified',
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    },
    {
      submission_id: 'sub-a06',
      assignment_id: 'asgn-a06',
      academic_year: '2026-2027',
      semester: '1',
      gwa: 2.00,
      enrolled_units: 15,
      failed_count: 0,
      incomplete_count: 0,
      dropped_count: 0,
      evidence_reference: 'Official Grade Slip Ref GS-2026-A06',
      submitted_at: oneDayBefore.toISOString(),
      verification_status: 'Pending',           // Pending verification
      verification_reason: '',
      compliance_result: null,
      compliance_reasons: [],
      renewal_decision: null,
      renewal_reason: ''
    }
  ];

  const audit_log = [];

  return { programs, users, assignments, submissions, audit_log };
}

/** Load DB from localStorage, or seed defaults */
function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // corrupt data — reseed
    }
  }
  const db = createDefaultDB();
  saveDB(db);
  return db;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.removeItem(DB_KEY);
  location.reload();
}

/* =================================================================
   2. AUTHENTICATION & SESSION
   ================================================================= */

let currentUser = null;    // logged-in user object
let db = loadDB();

function authenticate(username, password) {
  const user = db.users.find(u => u.username === username && u.password === password);
  return user || null;
}

/** Enforce that a data operation belongs to the current user (scholar) */
function enforceAccess(userId) {
  if (!currentUser) return false;
  if (currentUser.role === 'staff') return true;
  return currentUser.user_id === userId;
}

function getAssignmentForUser(userId) {
  return db.assignments.find(a => a.user_id === userId) || null;
}

function getUserById(userId) {
  return db.users.find(u => u.user_id === userId) || null;
}

function getProgramById(programId) {
  return db.programs.find(p => p.program_id === programId) || null;
}

function getSubmission(submissionId) {
  return db.submissions.find(s => s.submission_id === submissionId) || null;
}

/* =================================================================
   3. BUSINESS LOGIC
   ================================================================= */

/** Validate academic input — returns array of error strings */
function validateAcademicInput(gwa, units, failed, incomplete, dropped) {
  const errors = [];
  const gwaNum = parseFloat(gwa);
  const unitsNum = parseInt(units, 10);
  const failedNum = parseInt(failed, 10);
  const incNum = parseInt(incomplete, 10);
  const dropNum = parseInt(dropped, 10);

  if (isNaN(gwaNum) || gwaNum < 1.00 || gwaNum > 5.00) {
    errors.push('GWA must be between 1.00 and 5.00 inclusive.');
  }
  if (isNaN(unitsNum) || unitsNum < 0 || !Number.isInteger(unitsNum)) {
    errors.push('Enrolled units must be a non-negative integer.');
  }
  if (isNaN(failedNum) || failedNum < 0 || !Number.isInteger(failedNum)) {
    errors.push('Failed count must be a non-negative integer.');
  }
  if (isNaN(incNum) || incNum < 0 || !Number.isInteger(incNum)) {
    errors.push('Incomplete count must be a non-negative integer.');
  }
  if (isNaN(dropNum) || dropNum < 0 || !Number.isInteger(dropNum)) {
    errors.push('Dropped count must be a non-negative integer.');
  }
  return errors;
}

/** Check duplicate submission */
function isDuplicateSubmission(assignmentId, academicYear, semester, excludeId) {
  return db.submissions.some(s =>
    s.assignment_id === assignmentId &&
    s.academic_year === academicYear &&
    s.semester === semester &&
    s.submission_id !== excludeId
  );
}

/** Evaluate compliance against program policy — returns { result, reasons, checks } */
function evaluateCompliance(submission) {
  const assignment = db.assignments.find(a => a.assignment_id === submission.assignment_id);
  if (!assignment) return { result: null, reasons: ['Scholar assignment not found.'], checks: [] };

  const policy = getProgramById(assignment.program_id);
  if (!policy) return { result: null, reasons: ['Policy record not found.'], checks: [] };

  const checks = [];
  const reasons = [];

  // GWA check (lower is better)
  const gwaPass = submission.gwa <= policy.max_gwa;
  checks.push({
    label: `GWA ≤ ${policy.max_gwa.toFixed(2)}`,
    actual: submission.gwa.toFixed(2),
    pass: gwaPass
  });
  if (!gwaPass) reasons.push(`GWA ${submission.gwa.toFixed(2)} exceeds ${policy.program_name} limit of ${policy.max_gwa.toFixed(2)}.`);

  // Units check
  const unitsPass = submission.enrolled_units >= policy.min_units;
  checks.push({
    label: `Enrolled units ≥ ${policy.min_units}`,
    actual: String(submission.enrolled_units),
    pass: unitsPass
  });
  if (!unitsPass) reasons.push(`Enrolled units ${submission.enrolled_units} is below ${policy.program_name} minimum of ${policy.min_units}.`);

  // Failed check
  const failedPass = submission.failed_count <= policy.allowed_failed;
  checks.push({
    label: `Failed subjects ≤ ${policy.allowed_failed}`,
    actual: String(submission.failed_count),
    pass: failedPass
  });
  if (!failedPass) reasons.push(`${submission.failed_count} failed subject(s) exceeds allowed ${policy.allowed_failed} for ${policy.program_name}.`);

  // Incomplete check
  const incPass = submission.incomplete_count <= policy.allowed_incomplete;
  checks.push({
    label: `Incomplete grades ≤ ${policy.allowed_incomplete}`,
    actual: String(submission.incomplete_count),
    pass: incPass
  });
  if (!incPass) reasons.push(`${submission.incomplete_count} incomplete grade(s) exceeds allowed ${policy.allowed_incomplete} for ${policy.program_name}.`);

  // Dropped check
  const dropPass = submission.dropped_count <= policy.allowed_dropped;
  checks.push({
    label: `Dropped subjects ≤ ${policy.allowed_dropped}`,
    actual: String(submission.dropped_count),
    pass: dropPass
  });
  if (!dropPass) reasons.push(`${submission.dropped_count} dropped subject(s) exceeds allowed ${policy.allowed_dropped} for ${policy.program_name}.`);

  // Deadline check — Asia/Manila (UTC+8)
  const subTime = new Date(submission.submitted_at).getTime();
  const deadlineTime = new Date(policy.submission_deadline).getTime();
  const onTime = subTime <= deadlineTime;
  checks.push({
    label: `Submitted on or before deadline`,
    actual: onTime ? 'On time' : 'Late',
    pass: onTime
  });
  if (!onTime) reasons.push(`Submission was received after the ${policy.program_name} deadline of ${formatDateTime(policy.submission_deadline)}.`);

  const result = reasons.length === 0 ? 'Compliant' : 'With Deficiency';
  return { result, reasons, checks };
}

/** Add audit log entry */
function addAuditLog(submissionId, actionType, oldValue, newValue, reason) {
  db.audit_log.push({
    log_id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2,5),
    submission_id: submissionId,
    action_type: actionType,
    old_value: oldValue,
    new_value: newValue,
    reason: reason || '',
    performed_by: currentUser ? currentUser.user_id : 'system',
    performed_at: new Date().toISOString()
  });
  saveDB(db);
}

/* =================================================================
   4. UI HELPERS
   ================================================================= */

function $(id) { return document.getElementById(id); }

function showToast(message, type = 'info') {
  const container = $('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .3s, transform .3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-PH', { timeZone: 'Asia/Manila', year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12: true });
}

function formatAY(ay) {
  return ay.replace('-', '–');
}

function badgeFor(status, type) {
  const map = {
    'Pending':          'badge-pending',
    'Verified':         'badge-verified',
    'Returned':         'badge-returned',
    'Compliant':        'badge-compliant',
    'With Deficiency':  'badge-deficiency',
    'Approved':         'badge-approved',
    'Held':             'badge-held',
    'Merit Scholar':    'badge-merit',
    'Community Scholar':'badge-community'
  };
  const cls = map[status] || 'badge-pending';
  return `<span class="badge ${cls}">${status || '—'}</span>`;
}

function closeModal(id) {
  $(id).classList.add('hidden');
}

function openModal(id) {
  $(id).classList.remove('hidden');
}

/* =================================================================
   5. RENDER FUNCTIONS
   ================================================================= */

// ---- STAFF: Dashboard stats ----
function renderStats() {
  const subs = db.submissions;
  const totalScholars = db.assignments.length;
  const pendingVerification = subs.filter(s => s.verification_status === 'Pending').length;
  const compliant = subs.filter(s => s.compliance_result === 'Compliant').length;
  const deficiency = subs.filter(s => s.compliance_result === 'With Deficiency').length;

  $('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon purple">👥</div>
      <div class="stat-info">
        <h3>Total Scholars</h3>
        <div class="stat-value">${totalScholars}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber">⏳</div>
      <div class="stat-info">
        <h3>Pending Verification</h3>
        <div class="stat-value">${pendingVerification}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green">✅</div>
      <div class="stat-info">
        <h3>Compliant</h3>
        <div class="stat-value">${compliant}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red">⚠️</div>
      <div class="stat-info">
        <h3>With Deficiency</h3>
        <div class="stat-value">${deficiency}</div>
      </div>
    </div>
  `;
}

// ---- STAFF: Dashboard table ----
function renderDashTable() {
  const searchVal = ($('dashSearchInput')?.value || '').toLowerCase();
  const filterProg = $('dashFilterProgram')?.value || '';
  const filterComp = $('dashFilterCompliance')?.value || '';

  let rows = db.submissions.map(sub => {
    const assignment = db.assignments.find(a => a.assignment_id === sub.assignment_id);
    if (!assignment) return null;
    const user = getUserById(assignment.user_id);
    const program = getProgramById(assignment.program_id);
    if (!user || !program) return null;
    return { sub, assignment, user, program };
  }).filter(Boolean);

  // Search
  if (searchVal) {
    rows = rows.filter(r =>
      (r.user.student_id || '').toLowerCase().includes(searchVal) ||
      r.user.full_name.toLowerCase().includes(searchVal)
    );
  }

  // Filter by program
  if (filterProg) {
    rows = rows.filter(r => r.program.program_name === filterProg);
  }

  // Filter by compliance
  if (filterComp) {
    if (filterComp === 'Not Evaluated') {
      rows = rows.filter(r => !r.sub.compliance_result);
    } else {
      rows = rows.filter(r => r.sub.compliance_result === filterComp);
    }
  }

  const tbody = $('dashTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding:32px;color:var(--text-muted);">No submissions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.user.student_id}</strong></td>
      <td>${r.user.full_name}</td>
      <td>${badgeFor(r.program.program_name)}</td>
      <td>${formatAY(r.sub.academic_year)} / Sem ${r.sub.semester}</td>
      <td>${r.sub.gwa.toFixed(2)}</td>
      <td>${badgeFor(r.sub.verification_status)}</td>
      <td>${badgeFor(r.sub.compliance_result || 'Not Evaluated')}</td>
      <td>${badgeFor(r.sub.renewal_decision || '—')}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-xs" onclick="openSubmissionDetail('${r.sub.submission_id}')">View</button>
          ${r.sub.verification_status === 'Pending' ? `<button class="btn btn-primary btn-xs" onclick="openVerifyModal('${r.sub.submission_id}')">Verify</button>` : ''}
          ${r.sub.verification_status === 'Verified' && !r.sub.compliance_result ? `<button class="btn btn-success btn-xs" onclick="performEvaluation('${r.sub.submission_id}')">Evaluate</button>` : ''}
          ${r.sub.compliance_result && !r.sub.renewal_decision ? `<button class="btn btn-warning btn-xs" onclick="openRenewalModal('${r.sub.submission_id}')">Decide</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- STAFF: Scholars table ----
function renderScholarsTable() {
  const tbody = $('scholarsTableBody');
  const scholarUsers = db.users.filter(u => u.role === 'scholar');

  tbody.innerHTML = scholarUsers.map(u => {
    const asgn = getAssignmentForUser(u.user_id);
    const prog = asgn ? getProgramById(asgn.program_id) : null;
    return `
      <tr>
        <td><strong>${u.student_id || '—'}</strong></td>
        <td>${u.full_name}</td>
        <td>${prog ? badgeFor(prog.program_name) : '<span class="badge badge-pending">Unassigned</span>'}</td>
        <td>${asgn ? formatDateTime(asgn.assigned_at) : '—'}</td>
        <td>—</td>
      </tr>
    `;
  }).join('');
}

// ---- STAFF: Submission detail ----
function openSubmissionDetail(subId) {
  // Switch to submissions tab
  switchTab('staffTabs', 'submissions');

  const sub = getSubmission(subId);
  if (!sub) return;

  const assignment = db.assignments.find(a => a.assignment_id === sub.assignment_id);
  const user = assignment ? getUserById(assignment.user_id) : null;
  const program = assignment ? getProgramById(assignment.program_id) : null;

  const logs = db.audit_log.filter(l => l.submission_id === subId).sort((a,b) => new Date(b.performed_at) - new Date(a.performed_at));

  // Build policy check display if evaluated
  let checksHtml = '';
  if (sub.compliance_result) {
    const evalResult = evaluateCompliance(sub);
    checksHtml = `
      <h3 style="margin:16px 0 10px;">Policy Checks</h3>
      <ul class="policy-checks">
        ${evalResult.checks.map(c => `
          <li class="policy-check">
            <span class="check-icon ${c.pass ? 'pass' : 'fail'}">${c.pass ? '✓' : '✗'}</span>
            <span>${c.label}: <strong>${c.actual}</strong></span>
          </li>
        `).join('')}
      </ul>
      ${sub.compliance_reasons.length > 0 ? `
        <div style="margin-top:12px;padding:12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:var(--radius-md);">
          <strong style="color:var(--danger-400);font-size:.85rem;">Deficiency Reasons:</strong>
          <ul style="margin-top:6px;padding-left:18px;font-size:.85rem;color:var(--text-secondary);">
            ${sub.compliance_reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
  }

  // Audit trail
  let auditHtml = '';
  if (logs.length > 0) {
    auditHtml = `
      <h3 style="margin:20px 0 10px;">Audit History</h3>
      <div class="audit-timeline">
        ${logs.map(l => {
          const actor = getUserById(l.performed_by);
          return `
            <div class="audit-entry">
              <div class="audit-action">${capitalizeFirst(l.action_type)}</div>
              <div class="audit-meta">by ${actor ? actor.full_name : l.performed_by} — ${formatDateTime(l.performed_at)}</div>
              ${l.old_value || l.new_value ? `<div class="audit-detail">${l.old_value ? l.old_value + ' → ' : ''}${l.new_value || ''}</div>` : ''}
              ${l.reason ? `<div class="audit-detail" style="font-style:italic;">"${l.reason}"</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  $('submissionDetailCard').innerHTML = `
    <div class="card-header">
      <h2>Submission Detail — ${user ? user.student_id : '?'}</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${sub.verification_status === 'Pending' ? `<button class="btn btn-primary btn-sm" onclick="openVerifyModal('${sub.submission_id}')">Verify Evidence</button>` : ''}
        ${sub.verification_status === 'Verified' && !sub.compliance_result ? `<button class="btn btn-success btn-sm" onclick="performEvaluation('${sub.submission_id}')">Evaluate Compliance</button>` : ''}
        ${sub.compliance_result && !sub.renewal_decision ? `<button class="btn btn-warning btn-sm" onclick="openRenewalModal('${sub.submission_id}')">Renewal Decision</button>` : ''}
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><label>Scholar</label><div class="value">${user ? user.full_name : '—'}</div></div>
      <div class="detail-item"><label>Student ID</label><div class="value">${user ? user.student_id : '—'}</div></div>
      <div class="detail-item"><label>Program</label><div class="value">${program ? badgeFor(program.program_name) : '—'}</div></div>
      <div class="detail-item"><label>Academic Year</label><div class="value">${formatAY(sub.academic_year)}</div></div>
      <div class="detail-item"><label>Semester</label><div class="value">${sub.semester}</div></div>
      <div class="detail-item"><label>Submitted</label><div class="value">${formatDateTime(sub.submitted_at)}</div></div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><label>GWA</label><div class="value">${sub.gwa.toFixed(2)}</div></div>
      <div class="detail-item"><label>Enrolled Units</label><div class="value">${sub.enrolled_units}</div></div>
      <div class="detail-item"><label>Failed</label><div class="value">${sub.failed_count}</div></div>
      <div class="detail-item"><label>Incomplete</label><div class="value">${sub.incomplete_count}</div></div>
      <div class="detail-item"><label>Dropped</label><div class="value">${sub.dropped_count}</div></div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><label>Evidence</label><div class="value">${sub.evidence_reference}</div></div>
      <div class="detail-item"><label>Verification</label><div class="value">${badgeFor(sub.verification_status)}</div></div>
      <div class="detail-item"><label>Compliance</label><div class="value">${badgeFor(sub.compliance_result || '—')}</div></div>
      <div class="detail-item"><label>Renewal</label><div class="value">${badgeFor(sub.renewal_decision || '—')}</div></div>
    </div>
    ${sub.verification_status === 'Returned' && sub.verification_reason ? `
      <div style="margin-top:12px;padding:12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:var(--radius-md);">
        <strong style="color:var(--danger-400);font-size:.85rem;">Return Reason:</strong>
        <p style="margin-top:4px;font-size:.85rem;">${sub.verification_reason}</p>
      </div>
    ` : ''}
    ${sub.renewal_decision && sub.renewal_reason ? `
      <div style="margin-top:12px;padding:12px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:var(--radius-md);">
        <strong style="color:var(--primary-400);font-size:.85rem;">Renewal Notes:</strong>
        <p style="margin-top:4px;font-size:.85rem;">${sub.renewal_reason}</p>
      </div>
    ` : ''}
    ${checksHtml}
    ${auditHtml}
  `;
}

// ---- STAFF: Full audit history ----
function renderAuditHistory() {
  const container = $('auditHistoryContainer');
  const logs = [...db.audit_log].sort((a,b) => new Date(b.performed_at) - new Date(a.performed_at));

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No audit entries yet</h3>
        <p>Actions like verification, evaluation, and renewal will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="audit-timeline">
      ${logs.map(l => {
        const actor = getUserById(l.performed_by);
        const sub = getSubmission(l.submission_id);
        const assignment = sub ? db.assignments.find(a => a.assignment_id === sub.assignment_id) : null;
        const scholar = assignment ? getUserById(assignment.user_id) : null;
        return `
          <div class="audit-entry">
            <div class="audit-action">${capitalizeFirst(l.action_type)} — ${scholar ? scholar.student_id + ' ' + scholar.full_name : l.submission_id}</div>
            <div class="audit-meta">by ${actor ? actor.full_name : l.performed_by} — ${formatDateTime(l.performed_at)}</div>
            ${l.old_value || l.new_value ? `<div class="audit-detail">${l.old_value ? l.old_value + ' → ' : ''}${l.new_value || ''}</div>` : ''}
            ${l.reason ? `<div class="audit-detail" style="font-style:italic;">"${l.reason}"</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ---- SCHOLAR: My submissions ----
function renderScholarSubmissions() {
  if (!currentUser) return;
  const assignment = getAssignmentForUser(currentUser.user_id);
  if (!assignment) {
    $('scholarSubmissionsBody').innerHTML = `<tr><td colspan="10" class="text-center" style="padding:32px;color:var(--text-muted);">No scholarship assignment found.</td></tr>`;
    return;
  }

  const mySubs = db.submissions.filter(s => s.assignment_id === assignment.assignment_id);

  if (mySubs.length === 0) {
    $('scholarSubmissionsBody').innerHTML = `<tr><td colspan="10" class="text-center" style="padding:32px;color:var(--text-muted);">No submissions yet. Create one from the New Submission tab.</td></tr>`;
    return;
  }

  $('scholarSubmissionsBody').innerHTML = mySubs.map(sub => `
    <tr>
      <td>${formatAY(sub.academic_year)} / Sem ${sub.semester}</td>
      <td>${sub.gwa.toFixed(2)}</td>
      <td>${sub.enrolled_units}</td>
      <td>${sub.failed_count}</td>
      <td>${sub.incomplete_count}</td>
      <td>${sub.dropped_count}</td>
      <td>${badgeFor(sub.verification_status)}</td>
      <td>${badgeFor(sub.compliance_result || '—')}</td>
      <td>${badgeFor(sub.renewal_decision || '—')}</td>
      <td>
        ${sub.verification_status === 'Returned' ? `<button class="btn btn-primary btn-xs" onclick="openResubmitModal('${sub.submission_id}')">Correct</button>` : '—'}
      </td>
    </tr>
  `).join('');
}

/* =================================================================
   6. ACTIONS (Staff)
   ================================================================= */

// ---- Verification ----
let activeVerifySubId = null;

function openVerifyModal(subId) {
  if (currentUser.role !== 'staff') {
    showToast('Access denied: only staff can verify.', 'error');
    return;
  }
  activeVerifySubId = subId;
  const sub = getSubmission(subId);
  const assignment = db.assignments.find(a => a.assignment_id === sub.assignment_id);
  const user = assignment ? getUserById(assignment.user_id) : null;

  $('vmScholar').textContent = user ? `${user.student_id} — ${user.full_name}` : '—';
  $('vmEvidence').textContent = sub.evidence_reference;
  $('vmReason').value = '';
  $('vmError').classList.add('hidden');
  openModal('verifyModal');
}

$('vmVerifyBtn').addEventListener('click', () => {
  if (!activeVerifySubId) return;
  const sub = getSubmission(activeVerifySubId);
  if (!sub) return;

  addAuditLog(sub.submission_id, 'verification', sub.verification_status, 'Verified', '');
  sub.verification_status = 'Verified';
  sub.verification_reason = '';
  saveDB(db);

  closeModal('verifyModal');
  showToast('Evidence verified successfully.', 'success');
  refreshStaffView();
});

$('vmReturnBtn').addEventListener('click', () => {
  if (!activeVerifySubId) return;
  const reason = $('vmReason').value.trim();
  if (!reason) {
    $('vmError').textContent = 'A reason is required when returning evidence.';
    $('vmError').classList.remove('hidden');
    return;
  }
  const sub = getSubmission(activeVerifySubId);
  if (!sub) return;

  addAuditLog(sub.submission_id, 'verification', sub.verification_status, 'Returned', reason);
  sub.verification_status = 'Returned';
  sub.verification_reason = reason;
  // Clear compliance & renewal when returning
  sub.compliance_result = null;
  sub.compliance_reasons = [];
  sub.renewal_decision = null;
  sub.renewal_reason = '';
  saveDB(db);

  closeModal('verifyModal');
  showToast('Evidence returned to scholar.', 'warning');
  refreshStaffView();
});

// ---- Evaluation ----
function performEvaluation(subId) {
  if (currentUser.role !== 'staff') {
    showToast('Access denied: only staff can evaluate.', 'error');
    return;
  }
  const sub = getSubmission(subId);
  if (!sub) return;

  if (sub.verification_status !== 'Verified') {
    showToast('Evidence must be verified before evaluation.', 'error');
    return;
  }

  const evalResult = evaluateCompliance(sub);
  addAuditLog(sub.submission_id, 'evaluation', sub.compliance_result || 'None', evalResult.result,
    evalResult.reasons.length > 0 ? evalResult.reasons.join(' | ') : 'All checks passed.');
  sub.compliance_result = evalResult.result;
  sub.compliance_reasons = evalResult.reasons;
  saveDB(db);

  showToast(`Evaluation complete: ${evalResult.result}`, evalResult.result === 'Compliant' ? 'success' : 'warning');
  refreshStaffView();
  openSubmissionDetail(subId);
}

// ---- Renewal Decision ----
let activeRenewalSubId = null;

function openRenewalModal(subId) {
  if (currentUser.role !== 'staff') {
    showToast('Access denied: only staff can decide renewals.', 'error');
    return;
  }
  activeRenewalSubId = subId;
  const sub = getSubmission(subId);
  const assignment = db.assignments.find(a => a.assignment_id === sub.assignment_id);
  const user = assignment ? getUserById(assignment.user_id) : null;

  $('rmScholar').textContent = user ? `${user.student_id} — ${user.full_name}` : '—';
  $('rmCompliance').innerHTML = badgeFor(sub.compliance_result || '—');
  $('rmNotes').value = '';
  $('rmError').classList.add('hidden');

  // Disable approve button if deficient
  $('rmApproveBtn').disabled = (sub.compliance_result !== 'Compliant');

  openModal('renewalModal');
}

$('rmApproveBtn').addEventListener('click', () => {
  if (!activeRenewalSubId) return;
  const sub = getSubmission(activeRenewalSubId);
  if (!sub) return;

  if (sub.compliance_result !== 'Compliant') {
    $('rmError').textContent = 'Cannot approve: record is With Deficiency.';
    $('rmError').classList.remove('hidden');
    return;
  }

  if (!sub.compliance_result) {
    $('rmError').textContent = 'Cannot approve: compliance not evaluated.';
    $('rmError').classList.remove('hidden');
    return;
  }

  const notes = $('rmNotes').value.trim();
  addAuditLog(sub.submission_id, 'renewal', sub.renewal_decision || 'None', 'Approved', notes);
  sub.renewal_decision = 'Approved';
  sub.renewal_reason = notes;
  saveDB(db);

  closeModal('renewalModal');
  showToast('Renewal approved.', 'success');
  refreshStaffView();
  openSubmissionDetail(sub.submission_id);
});

$('rmHoldBtn').addEventListener('click', () => {
  if (!activeRenewalSubId) return;
  const sub = getSubmission(activeRenewalSubId);
  if (!sub) return;

  const notes = $('rmNotes').value.trim();
  addAuditLog(sub.submission_id, 'renewal', sub.renewal_decision || 'None', 'Held', notes);
  sub.renewal_decision = 'Held';
  sub.renewal_reason = notes;
  saveDB(db);

  closeModal('renewalModal');
  showToast('Renewal held.', 'warning');
  refreshStaffView();
  openSubmissionDetail(sub.submission_id);
});

// ---- Register Scholar ----
$('addScholarBtn').addEventListener('click', () => openModal('registerScholarModal'));

$('registerScholarForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const studentId = $('regStudentId').value.trim();
  const fullName  = $('regFullName').value.trim();
  const programId = $('regProgram').value;
  const username  = $('regUsername').value.trim();
  const password  = $('regPassword').value;

  if (!studentId || !fullName || !programId || !username || !password) {
    $('regFormError').textContent = 'All fields are required.';
    $('regFormError').classList.remove('hidden');
    return;
  }

  // Check unique username
  if (db.users.some(u => u.username === username)) {
    $('regFormError').textContent = 'Username already taken.';
    $('regFormError').classList.remove('hidden');
    return;
  }

  // Check unique student ID
  if (db.users.some(u => u.student_id === studentId)) {
    $('regFormError').textContent = 'Student ID already exists.';
    $('regFormError').classList.remove('hidden');
    return;
  }

  const userId = 'scholar-' + studentId.toLowerCase();
  db.users.push({
    user_id: userId, username, password, full_name: fullName, role: 'scholar', student_id: studentId
  });
  db.assignments.push({
    assignment_id: 'asgn-' + studentId.toLowerCase(),
    user_id: userId,
    program_id: programId,
    assigned_by: currentUser.user_id,
    assigned_at: new Date().toISOString()
  });
  saveDB(db);

  closeModal('registerScholarModal');
  $('registerScholarForm').reset();
  $('regFormError').classList.add('hidden');
  showToast(`Scholar ${fullName} registered successfully.`, 'success');
  refreshStaffView();
});

/* =================================================================
   7. ACTIONS (Scholar)
   ================================================================= */

// ---- Submit grades ----
$('scholarSubmissionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const assignment = getAssignmentForUser(currentUser.user_id);
  if (!assignment) {
    showToast('No scholarship assignment found.', 'error');
    return;
  }

  const ay = $('subAcademicYear').value;
  const sem = $('subSemester').value;
  const gwa = $('subGWA').value;
  const units = $('subUnits').value;
  const failed = $('subFailed').value;
  const incomplete = $('subIncomplete').value;
  const dropped = $('subDropped').value;
  const evidence = $('subEvidence').value.trim();

  if (!ay || !sem) {
    showFormError('subFormError', 'Please select academic year and semester.');
    return;
  }

  if (!evidence) {
    showFormError('subFormError', 'Grade-document reference is required.');
    return;
  }

  // Validate
  const errors = validateAcademicInput(gwa, units, failed, incomplete, dropped);
  if (errors.length > 0) {
    showFormError('subFormError', errors.join(' '));
    return;
  }

  // Duplicate check
  if (isDuplicateSubmission(assignment.assignment_id, ay, sem, null)) {
    showFormError('subFormError', 'A submission for this academic year and semester already exists.');
    return;
  }

  const subId = 'sub-' + Date.now();
  db.submissions.push({
    submission_id: subId,
    assignment_id: assignment.assignment_id,
    academic_year: ay,
    semester: sem,
    gwa: parseFloat(gwa),
    enrolled_units: parseInt(units, 10),
    failed_count: parseInt(failed, 10),
    incomplete_count: parseInt(incomplete, 10),
    dropped_count: parseInt(dropped, 10),
    evidence_reference: evidence,
    submitted_at: new Date().toISOString(),
    verification_status: 'Pending',
    verification_reason: '',
    compliance_result: null,
    compliance_reasons: [],
    renewal_decision: null,
    renewal_reason: ''
  });
  saveDB(db);

  addAuditLog(subId, 'submission', '', 'New submission created', '');

  $('scholarSubmissionForm').reset();
  $('subFormError').classList.add('hidden');
  showToast('Submission created successfully!', 'success');
  switchTab('scholarTabs', 'scholar-submissions');
  renderScholarSubmissions();
});

// ---- Resubmit (correction) ----
let activeResubmitSubId = null;

function openResubmitModal(subId) {
  // Access check: scholar can only resubmit own records
  const sub = getSubmission(subId);
  if (!sub) return;
  const assignment = db.assignments.find(a => a.assignment_id === sub.assignment_id);
  if (!assignment || !enforceAccess(assignment.user_id)) {
    showToast('Access denied.', 'error');
    return;
  }
  if (sub.verification_status !== 'Returned') {
    showToast('Only returned submissions can be corrected.', 'error');
    return;
  }

  activeResubmitSubId = subId;
  $('resGWA').value = sub.gwa;
  $('resUnits').value = sub.enrolled_units;
  $('resFailed').value = sub.failed_count;
  $('resIncomplete').value = sub.incomplete_count;
  $('resDropped').value = sub.dropped_count;
  $('resEvidence').value = sub.evidence_reference;
  $('resFormError').classList.add('hidden');
  openModal('resubmitModal');
}

$('resubmitForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!activeResubmitSubId) return;

  const sub = getSubmission(activeResubmitSubId);
  if (!sub) return;

  const gwa = $('resGWA').value;
  const units = $('resUnits').value;
  const failed = $('resFailed').value;
  const incomplete = $('resIncomplete').value;
  const dropped = $('resDropped').value;
  const evidence = $('resEvidence').value.trim();

  const errors = validateAcademicInput(gwa, units, failed, incomplete, dropped);
  if (!evidence) errors.push('Evidence reference is required.');
  if (errors.length > 0) {
    showFormError('resFormError', errors.join(' '));
    return;
  }

  // Log resubmission
  addAuditLog(sub.submission_id, 'resubmission',
    `GWA:${sub.gwa} Units:${sub.enrolled_units} F:${sub.failed_count} I:${sub.incomplete_count} D:${sub.dropped_count}`,
    `GWA:${gwa} Units:${units} F:${failed} I:${incomplete} D:${dropped}`,
    'Scholar corrected and resubmitted');

  sub.gwa = parseFloat(gwa);
  sub.enrolled_units = parseInt(units, 10);
  sub.failed_count = parseInt(failed, 10);
  sub.incomplete_count = parseInt(incomplete, 10);
  sub.dropped_count = parseInt(dropped, 10);
  sub.evidence_reference = evidence;
  sub.submitted_at = new Date().toISOString();
  sub.verification_status = 'Pending';
  sub.verification_reason = '';
  sub.compliance_result = null;
  sub.compliance_reasons = [];
  sub.renewal_decision = null;
  sub.renewal_reason = '';
  saveDB(db);

  closeModal('resubmitModal');
  showToast('Submission corrected and resubmitted. Status reset to Pending.', 'success');
  renderScholarSubmissions();
});

/* =================================================================
   8. TAB & VIEW SWITCHING
   ================================================================= */

function switchTab(tabGroupId, tabName) {
  const group = $(tabGroupId);
  group.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  group.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');

  // Hide sibling panels, show target
  const prefix = tabGroupId === 'staffTabs' ? 'panel-' : 'panel-';
  group.querySelectorAll('.tab-btn').forEach(btn => {
    const panel = $(`panel-${btn.dataset.tab}`);
    if (panel) panel.classList.remove('active');
  });
  const target = $(`panel-${tabName}`);
  if (target) target.classList.add('active');
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-btn')) {
    const tabGroup = e.target.closest('.tabs');
    if (tabGroup) {
      switchTab(tabGroup.id, e.target.dataset.tab);
      // Refresh content on tab switch
      if (e.target.dataset.tab === 'dashboard') { renderStats(); renderDashTable(); }
      if (e.target.dataset.tab === 'scholars') renderScholarsTable();
      if (e.target.dataset.tab === 'history') renderAuditHistory();
      if (e.target.dataset.tab === 'scholar-submissions') renderScholarSubmissions();
    }
  }
});

/* =================================================================
   9. LOGIN / LOGOUT
   ================================================================= */

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = $('loginUsername').value.trim();
  const password = $('loginPassword').value;

  const user = authenticate(username, password);
  if (!user) {
    $('loginError').textContent = 'Invalid username or password.';
    $('loginError').classList.remove('hidden');
    return;
  }

  currentUser = user;
  sessionStorage.setItem('currentUserId', user.user_id);
  $('loginError').classList.add('hidden');
  showApp();
});

$('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  sessionStorage.removeItem('currentUserId');
  $('loginPage').classList.remove('hidden');
  $('appMain').classList.add('hidden');
  $('staffView').classList.add('hidden');
  $('scholarView').classList.add('hidden');
  $('loginUsername').value = '';
  $('loginPassword').value = '';
});

function showApp() {
  $('loginPage').classList.add('hidden');
  $('appMain').classList.remove('hidden');
  $('currentUserDisplay').textContent = `${currentUser.full_name} (${capitalizeFirst(currentUser.role)})`;

  if (currentUser.role === 'staff') {
    $('staffView').classList.remove('hidden');
    $('scholarView').classList.add('hidden');
    refreshStaffView();
  } else {
    $('staffView').classList.add('hidden');
    $('scholarView').classList.remove('hidden');
    renderScholarSubmissions();
  }
}

function refreshStaffView() {
  renderStats();
  renderDashTable();
  renderScholarsTable();
  renderAuditHistory();
}

/* =================================================================
   10. FILTER EVENT LISTENERS
   ================================================================= */

$('dashSearchInput')?.addEventListener('input', renderDashTable);
$('dashFilterProgram')?.addEventListener('change', renderDashTable);
$('dashFilterCompliance')?.addEventListener('change', renderDashTable);

/* =================================================================
   11. UTILITY
   ================================================================= */

function capitalizeFirst(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function showFormError(elementId, message) {
  const el = $(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/* =================================================================
   12. RESTORE SESSION ON RELOAD
   ================================================================= */

(function init() {
  const savedUserId = sessionStorage.getItem('currentUserId');
  if (savedUserId) {
    const user = getUserById(savedUserId);
    if (user) {
      currentUser = user;
      showApp();
      return;
    }
  }
  // Show login
  $('loginPage').classList.remove('hidden');
})();
