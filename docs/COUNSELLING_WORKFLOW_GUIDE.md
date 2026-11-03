# EduShield Human-Reviewed Counselling & Intervention Protocol

## 1. Ethical Governance Principles
EduShield operates under strict human-in-the-loop ethical guidelines designed to eliminate algorithmic stigmatization and protect student agency:

1. **Advisory Evidence Only**: Machine-learning predictions and SHAP scores are clinical indicators, not judicial verdicts. The model can never automatically place a student on probation, cancel financial aid, or initiate academic dismissal.
2. **Human Authority**: All disciplinary, grading, remediation, and status decisions remain exclusively under authorized human faculty discretion.
3. **Non-Stigmatizing Communication**: Explanations generated for students are framed constructively ("What's keeping you on track" and "Areas where campus support is available").
4. **Confidentiality of Wellness Information**: Self-reported voluntary well-being surveys (stress, sleep, commute) are protected clinical information and never visible in public rosters or administrative exports.

---

## 2. The 8-Stage Human-Reviewed Counselling Workflow

```
+-------------------------------------------------------------------------+
| Stage 1: Machine Learning Risk Inference                                 |
| - LightGBM computes dropout probability on student feature vector        |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 2: TreeSHAP Feature Attribution                                   |
| - Decomposes probability into positive risk drivers and negative assets |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 3: Human Review Triage Flagging                                   |
| - Flags student if risk >= 40%, backlogs >= 2, or attendance < 75%       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 4: Faculty Evidence Evaluation                                    |
| - Faculty advisor inspects longitudinal trajectory & SHAP waterfall     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 5: Structured Counselling Referral                                |
| - Advisor creates referral mapped to specific support categories        |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 6: Direct Intervention Sessions                                   |
| - Counsellor logs session notes, strategies applied, student feedback    |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 7: Action Plan Execution & Follow-Up                              |
| - Student executes concrete milestones with scheduled follow-up dates    |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Stage 8: Progress Monitoring & Outcome Resolution                       |
| - Status recorded as "Resolved", "Improving", or "Stable"               |
+-------------------------------------------------------------------------+
```

---

## 3. Intervention Categories & Support Catalog

1. **Academic Support**:
   - Remedial backlog tutoring
   - Assignment planning & submission schedule restructuring
   - Faculty office-hour check-ins
2. **Attendance Counselling**:
   - Transit feasibility & commute timetable adjustment
   - Course schedule conflict resolution
   - Weekly attendance check-in contracts
3. **Financial Assistance Referrals**:
   - Emergency student bursary grants
   - Deferred fee installment payment agreements
   - Work-study campus employment opportunities
4. **Well-Being & Stress Reduction**:
   - Voluntary campus psychological counselling
   - Sleep hygiene & study-life balance advising
   - Accessibility accommodations
5. **Campus Engagement & Belonging**:
   - Departmental peer study group pairing
   - Student organization and extracurricular onboarding
   - LMS digital portal orientation

