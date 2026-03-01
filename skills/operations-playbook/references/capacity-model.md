# Capacity Model

## Version: 0.1.0

## Overview

This model helps determine how much work the team can take on, when to say no to new projects, and when to invest in growth.

---

## Available Hours Calculation

### Per Person
- Working days per week: 5
- Hours per day: 8
- Gross hours per week: 40
- Non-billable time (meetings, admin, learning): 20%
- **Net available hours per week per person: 32**

### Team Total
- Team members: [X]
- **Total available hours per week: [X * 32]**

---

## Project Hour Estimates

### By Project Phase

| Phase | Hours/Week | Duration | Total Hours |
|-------|-----------|----------|-------------|
| Discovery | 15-20 | 1 week | 15-20 |
| Design/Architecture | 15-20 | 1-2 weeks | 15-40 |
| Build (per sprint) | 25-35 | 1-2 weeks | 25-70 |
| QA/Testing | 10-15 | 1 week | 10-15 |
| Handoff | 5-10 | 1 week | 5-10 |
| Maintenance | 2-5 | Ongoing | 2-5/week |

### By Project Type

| Project Type | Total Hours | Duration | Weekly Demand |
|-------------|-------------|----------|---------------|
| Quick Automation | 40-80 | 2-3 weeks | 20-30 |
| Standard Agent Build | 160-250 | 6-8 weeks | 25-35 |
| Complex Multi-Agent | 400-600 | 10-14 weeks | 30-45 |
| Maintenance Retainer | Ongoing | Monthly | 5-10 |

---

## Capacity Check Process

### Weekly Check
1. List all active projects with current phase
2. Note hours per week needed for each
3. Sum total hours needed
4. Compare to total available hours
5. Calculate utilization: (hours needed / hours available) x 100

### Decision Matrix

| Utilization | Status | Action |
|-------------|--------|--------|
| Below 50% | Underutilized | Increase outreach and sales. Consider content creation |
| 50-70% | Healthy | Maintain pace. Accept new projects selectively |
| 70-85% | Optimal | Be selective. Only take high-value projects |
| 85-95% | Near capacity | Do not take new projects. Focus on delivery |
| Above 95% | Overloaded | Reassign, delay, or hire. Risk of burnout and quality drop |

---

## Capacity Planning Template

### Current Week: [Date]

**Team Capacity:**
- Available team members: [X]
- Total available hours: [X * 32]

**Project Demand:**

| Project | Phase | Hours/Week | Notes |
|---------|-------|-----------|-------|
| [Project 1] | [Phase] | [Hours] | |
| [Project 2] | [Phase] | [Hours] | |
| [Project 3] | [Phase] | [Hours] | |
| Internal ops | Ongoing | [Hours] | Outreach, admin, etc. |
| **Total** | | **[Sum]** | |

**Utilization:** [Sum / Available] x 100 = [X%]
**Status:** [Green / Yellow / Red]
**Open capacity:** [Available - Sum] hours

---

## Forward Planning

### 4-Week Lookahead

| Week | Project Demand | Internal | Total | Utilization | Notes |
|------|---------------|----------|-------|-------------|-------|
| This week | [X hrs] | [X hrs] | [X hrs] | [X%] | |
| Week +1 | [X hrs] | [X hrs] | [X hrs] | [X%] | |
| Week +2 | [X hrs] | [X hrs] | [X hrs] | [X%] | |
| Week +3 | [X hrs] | [X hrs] | [X hrs] | [X%] | |

### Pipeline Impact

If a pipeline deal closes, how does it affect capacity?

| Potential Deal | Hours/Week | Impact on Utilization | Can We Handle It? |
|---------------|-----------|----------------------|-------------------|
| [Deal 1] | [X hrs] | +[X%] | Yes / No / Need to adjust |
| [Deal 2] | [X hrs] | +[X%] | Yes / No / Need to adjust |

---

## When to Hire or Contract

Consider bringing on help when:
1. Utilization has been above 85% for 3+ consecutive weeks
2. Pipeline has 2+ deals likely to close within 30 days
3. Quality metrics are declining (late deliveries, client complaints)
4. Team members report consistent overtime

Consider types of help:
- **Contractor:** Short-term spike, specific skill needed, project-based
- **Part-time hire:** Consistent 50-70% utilization expected for 3+ months
- **Full-time hire:** Consistent 80%+ utilization expected for 6+ months
