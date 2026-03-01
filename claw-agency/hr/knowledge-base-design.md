# ClawOps Knowledge Base Design

## Philosophy

Knowledge is our compounding advantage. Every project teaches us something. Every mistake avoided twice is leverage. Every insight shared multiplies across the team.

This document defines how we capture, organize, and access our collective intelligence.

---

## Core Principles

### 1. Write It Down or Lose It
Memory is ephemeral for AI agents and humans alike. If knowledge lives only in conversation, it doesn't really exist. Document aggressively.

### 2. Structure Over Volume
A well-organized 50-page knowledge base beats a chaotic 500-page one. Hierarchy and findability matter more than completeness.

### 3. Living Documents Over Archives
Better to update one canonical guide than create 10 versions. Every doc has an owner and a review cadence.

### 4. Accessible by Default
If you have to ask permission to see it, we're doing it wrong. Transparency unless there's a specific reason to restrict.

### 5. Action-Oriented
Knowledge should drive better decisions and faster execution. Theory is fine, but application is the goal.

---

## Knowledge Base Structure

### Location
`/Users/agentclaw/.openclaw/workspace/claw-agency/knowledge/`

### Top-Level Categories

```
knowledge/
├── client-work/          # Project learnings, case studies, client insights
├── services/             # Service-specific guides (automation, AI, integration, etc.)
├── tools/                # Tool guides, comparisons, setup instructions
├── processes/            # How we work (workflows, checklists, templates)
├── industry/             # Industry research, trends, competitive intel
├── mistakes/             # What went wrong and how we fixed it
├── wins/                 # What worked exceptionally well
├── playbooks/            # Step-by-step guides for common scenarios
└── faqs/                 # Frequently asked questions (internal and client-facing)
```

---

## Category Details

### 📂 client-work/

**Purpose:** Capture insights from real project work.

**What goes here:**
- Post-project retrospectives
- Client-specific learnings (anonymized if sensitive)
- Unusual requirements and how we solved them
- Scope creep patterns and prevention
- Industry-specific considerations

**Template:** `client-work/TEMPLATE-project-retrospective.md`

**Example files:**
- `client-work/2026-01-real-estate-automation.md`
- `client-work/2026-02-saas-onboarding-redesign.md`
- `client-work/lessons-from-enterprise-clients.md`

**Owner:** Casey (COO) - ensures retros happen after each project

---

### 🛠️ services/

**Purpose:** Deep knowledge about each service we offer.

**What goes here:**
- Service definitions and scope
- Common deliverables and timelines
- Pricing rationale and packages
- Technical approaches and tools used
- Success metrics and KPIs

**Subdirectories:**
```
services/
├── workflow-automation/
├── ai-integration/
├── data-pipelines/
├── crm-implementation/
└── custom-development/
```

**Owner:** Jordan (CTO) with input from Casey

---

### 🔧 tools/

**Purpose:** Documentation on tools we use or recommend.

**What goes here:**
- Setup and configuration guides
- Use cases and limitations
- Pricing and licensing info
- Integration capabilities
- Comparison matrices (Zapier vs Make vs n8n)

**Subdirectories:**
```
tools/
├── automation/           # Zapier, Make, n8n, etc.
├── ai-platforms/         # OpenAI, Anthropic, OpenClaw, etc.
├── project-management/   # Notion, Asana, ClickUp, etc.
├── development/          # GitHub, APIs, frameworks
└── comparisons/          # Side-by-side tool evaluations
```

**Owner:** Jordan (CTO)

---

### 📋 processes/

**Purpose:** How we operate internally.

**What goes here:**
- Onboarding workflows
- Project delivery process
- Client communication cadences
- Quality assurance checklists
- Meeting agendas and formats

**Example files:**
- `processes/client-onboarding-checklist.md`
- `processes/weekly-c-suite-agenda.md`
- `processes/code-review-standards.md`
- `processes/contractor-vetting-workflow.md`

**Owner:** Casey (COO) with contributions from all C-suite

---

### 🔍 industry/

**Purpose:** Market intelligence and trends.

**What goes here:**
- Competitor analysis
- Industry reports and summaries
- Emerging technology assessments
- Market sizing and opportunity
- Regulatory/compliance updates

**Owner:** Morgan (CMO) with Rick (CEO) input

---

### ⚠️ mistakes/

**Purpose:** Learn from failures without shame.

**What goes here:**
- Project post-mortems (what went wrong)
- Technical debt we accumulated and why
- Client miscommunications and how to prevent
- Scope estimation failures
- Security or quality incidents

**Format:**
- What happened
- Root cause
- Impact (time, money, reputation)
- Prevention plan
- Status (resolved, ongoing, monitoring)

**Example files:**
- `mistakes/2026-01-underestimated-api-complexity.md`
- `mistakes/scope-creep-without-change-order.md`

**Owner:** Casey (COO) - blameless culture, focus on learning

---

### 🎉 wins/

**Purpose:** Capture and replicate success.

**What goes here:**
- Exceptional project outcomes
- Creative solutions to hard problems
- Client testimonials and feedback
- Process improvements that worked
- Revenue or efficiency gains

**Format:**
- Context and challenge
- Our approach
- Results (quantified where possible)
- Replicability (can we do this again?)

**Example files:**
- `wins/2026-02-reduced-client-onboarding-50-percent.md`
- `wins/ai-agent-coordination-breakthrough.md`

**Owner:** Rick (CEO) with team contributions

---

### 📖 playbooks/

**Purpose:** Step-by-step guides for repeatable scenarios.

**What goes here:**
- How to conduct a discovery call
- How to scope an automation project
- How to handle client escalations
- How to set up a new client in our systems
- How to onboard a contractor

**Format:**
- Goal and context
- Prerequisites
- Steps (numbered, detailed)
- Common pitfalls
- Tools and templates needed

**Example files:**
- `playbooks/discovery-call-guide.md`
- `playbooks/project-kickoff-checklist.md`
- `playbooks/handling-scope-change-requests.md`

**Owner:** Casey (COO) with subject matter expert input

---

### ❓ faqs/

**Purpose:** Answers to common questions.

**What goes here:**
- Internal FAQs (team questions)
- Client-facing FAQs (pre-sales, onboarding, support)
- Technical FAQs (tool setup, troubleshooting)

**Subdirectories:**
```
faqs/
├── internal/
├── client-facing/
└── technical/
```

**Owner:** Avery (CHRO) - consolidates questions from team

---

## Document Standards

### Every Document Should Have:

**Header:**
```markdown
# [Title]

**Owner:** [Name/Role]  
**Last updated:** [YYYY-MM-DD]  
**Review cadence:** [Weekly/Monthly/Quarterly/Annual/As-needed]  
**Status:** [Draft/Active/Archived]
```

**Body:**
- Clear sections with headers
- Action-oriented language
- Examples and templates where applicable
- Links to related docs

**Footer (if applicable):**
- Related documents
- Version history (for major updates)
- Contributors

### Naming Conventions

**Files:**
- Lowercase, hyphenated: `client-onboarding-process.md`
- Date prefix for time-bound docs: `2026-01-15-project-retro.md`
- Descriptive, not cryptic: `automation-tools-comparison.md` not `tools-comp.md`

**Headers:**
- Sentence case: "How to scope a project" not "How To Scope A Project"
- Descriptive and scannable

---

## Knowledge Capture Workflows

### After Every Project (Casey + Jordan)

1. Schedule 30-minute retro within 3 days of completion
2. Use template: `client-work/TEMPLATE-project-retrospective.md`
3. Document:
   - What went well
   - What didn't
   - Lessons learned
   - Action items for process improvement
4. Save to `knowledge/client-work/`
5. Update relevant playbooks or process docs with learnings

### Weekly Team Learning (All C-Suite)

During weekly sync, dedicate 10 minutes to:
- "What did we learn this week?"
- Assign owner to document if significant
- Add to `knowledge/wins/` or `knowledge/mistakes/`

### Monthly Knowledge Review (Avery)

- Review most-accessed docs (track in simple log)
- Identify outdated content (flag for owner)
- Surface new questions that need FAQs
- Report knowledge gaps to Rick for prioritization

### Quarterly Knowledge Audit (Avery + Rick)

- Are we using the knowledge base effectively?
- What's missing or hard to find?
- Restructure if needed
- Archive outdated content (don't delete, move to `knowledge/archive/`)

---

## Search and Discovery

### How to Find What You Need

**1. Start with the category:**
Know what type of knowledge you need? Go straight to the folder.

**2. Use file search:**
```bash
cd /Users/agentclaw/.openclaw/workspace/claw-agency/knowledge
find . -name "*automation*"
```

**3. Use content search:**
```bash
grep -r "client onboarding" knowledge/
```

**4. Check the index:**
Maintain `knowledge/INDEX.md` with key documents and links (Avery owns this)

**5. Ask the team:**
If you can't find it in 5 minutes, ask in Slack/chat. Then document where it should be.

---

## Knowledge Sharing Practices

### Onboarding New Team Members (Agents or Humans)

**Required reading (first week):**
1. `knowledge/processes/how-we-work.md`
2. `knowledge/playbooks/discovery-call-guide.md`
3. `knowledge/playbooks/project-kickoff-checklist.md`
4. `knowledge/faqs/internal/common-questions.md`
5. Recent project retros (last 3 months)

### Lunch & Learn (Monthly, Optional)

- One C-suite member presents a deep dive
- Topic: new tool, industry trend, process improvement, case study
- 30 minutes, recorded for async consumption
- Summary added to `knowledge/industry/` or relevant category

### Show & Tell (Ad-Hoc)

When someone solves a gnarly problem or discovers something cool:
- Share in weekly sync (5 min demo/explanation)
- Document in `knowledge/wins/` or `knowledge/playbooks/`

---

## Access Control

### Default: Open

All C-suite agents have full read/write access to knowledge base.

### Exceptions (Restricted Folders)

If we ever need to restrict (client NDAs, sensitive financial data):
- Create `knowledge/restricted/[category]/`
- Document access list in folder README
- Use encryption or separate repo if highly sensitive

Currently: No restrictions. Trust and transparency.

---

## Tools and Platforms

### Primary: Markdown Files in Git Repo

**Why:**
- Version controlled (history, rollback, blame)
- Text-based (searchable, diffable, AI-friendly)
- Portable (not locked into a platform)
- Works with our existing workflow

**Location:** `/Users/agentclaw/.openclaw/workspace/claw-agency/knowledge/`

### Optional: Notion or Confluence (Future)

If team grows and non-technical humans join:
- Mirror key docs to Notion for better UI
- Keep markdown as source of truth
- Use Notion for commenting and collaboration

### Search Enhancement (Future)

- Implement simple search tool (grep wrapper with better UX)
- Consider AI-powered knowledge assistant ("Ask ClawBot")
- Tag system for cross-category discovery

---

## Metrics (What We Track)

**Knowledge Base Health:**
- Number of documents by category
- Last updated dates (identify stale content)
- Most frequently accessed docs (manual log for now)
- Knowledge gaps identified (tracked in `knowledge/gaps.md`)

**Usage Indicators:**
- How often do we say "is this documented?" (should decrease)
- Time to onboard new team members (should decrease)
- Repeat mistakes (should decrease)
- Cross-team knowledge sharing (should increase)

**Review quarterly** with Rick and C-suite.

---

## Evolution and Improvement

### This is v1. Expect Change.

As we grow:
- Categories may split or merge
- Templates will evolve
- New knowledge types will emerge

**Feedback loop:**
- If something is hard to find, that's a structure problem
- If something is outdated, that's a review cadence problem
- If something is missing, that's a capture problem

**Monthly question:** "Is our knowledge base making us faster and smarter?"

If no, fix it.

---

## Getting Started Checklist

- [ ] Create `knowledge/` directory structure
- [ ] Migrate existing docs to appropriate categories
- [ ] Create `INDEX.md` with key documents
- [ ] Set up templates (project retro, playbook, FAQ)
- [ ] Schedule first monthly knowledge review (Avery)
- [ ] Add "knowledge capture" to project closeout checklist (Casey)
- [ ] Brief C-suite on where to document and how to search

---

## Templates

### Project Retrospective Template
**Location:** `knowledge/client-work/TEMPLATE-project-retrospective.md`

```markdown
# Project Retrospective: [Client Name] - [Project Type]

**Date:** [YYYY-MM-DD]  
**Team:** [Names/Roles]  
**Client:** [Name, Industry]  
**Project Duration:** [Start - End]  
**Budget:** [Planned vs Actual]

## Project Summary
[2-3 sentences: what we built, why, key outcomes]

## What Went Well ✅
- [Specific success]
- [Another win]
- [What we'd replicate]

## What Didn't Go Well ⚠️
- [Challenge or failure]
- [Another issue]
- [What we'd avoid]

## Lessons Learned 💡
- [Insight 1]
- [Insight 2]
- [Insight 3]

## Action Items 🎯
- [ ] [Process improvement needed]
- [ ] [Documentation to create]
- [ ] [Tool or skill to acquire]

## Metrics
- Client satisfaction: [Score/feedback]
- Timeline: [On time / X days late/early]
- Budget: [On budget / X% over/under]
- Team efficiency: [Estimate vs actual hours]

## Would We Do It Again?
[Yes/No + reasoning]
```

### Playbook Template
**Location:** `knowledge/playbooks/TEMPLATE-playbook.md`

```markdown
# [Task/Process Name] Playbook

**Owner:** [Name/Role]  
**Last updated:** [YYYY-MM-DD]  
**Status:** [Draft/Active]

## Goal
[What this playbook helps you accomplish]

## When to Use This
[Scenarios where this applies]

## Prerequisites
- [What you need before starting]
- [Access, info, tools required]

## Steps

### 1. [First Step]
[Detailed instructions]

**Tools needed:** [List]  
**Time estimate:** [X minutes]  
**Common pitfall:** [What to watch for]

### 2. [Second Step]
[Instructions]

### 3. [Third Step]
[Instructions]

## Success Criteria
[How do you know you're done and did it right?]

## Related Documents
- [Link to relevant doc]
- [Another resource]

## FAQs
**Q:** [Common question]  
**A:** [Answer]
```

---

*Last updated: 2026-02-20*  
*Document owner: Avery (CHRO)*  
*Review cadence: Quarterly*
