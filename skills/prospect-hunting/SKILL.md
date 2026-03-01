# Prospect Hunting

**Version:** 0.1.0
**Owner:** Jordan (CRO)
**Description:** Find and qualify leads from Upwork, Reddit, LinkedIn, and cold outreach channels. Build a pipeline of potential clients for RickClaw AI services.

## Trigger Keywords

- "find leads"
- "prospect"
- "new clients"
- "Upwork jobs"
- "outreach"
- "lead generation"
- "cold outreach"
- "find work"
- "hunt for clients"

## When to Use

Use this skill when:
- Pipeline is dry and new leads are needed
- Expanding into a new market or niche
- Testing a new outreach channel
- Regular weekly prospecting cadence
- CEO asks to ramp up client acquisition

## Workflow

### Step 1: Choose Hunting Grounds

Select channels based on priority and current needs:

| Channel | Best For | Effort | Conversion Rate | Priority |
|---------|----------|--------|-----------------|----------|
| Upwork | Quick wins, project-based work | Medium | 5-15% | High |
| Reddit | Community trust, inbound interest | Low-Medium | 2-8% | Medium |
| LinkedIn | Enterprise/B2B, retainer deals | High | 3-10% | Medium |
| Cold Email | Targeted outreach at scale | High | 1-5% | Low (for now) |
| Referrals | Highest quality leads | Low | 20-40% | Always on |

### Step 2: Upwork Prospecting

#### Search for Jobs

Use search queries from `references/search-queries.md`. Focus on:

1. **Primary searches:**
   - "AI automation"
   - "AI chatbot"
   - "GPT integration"
   - "AI workflow automation"
   - "LLM application"

2. **Filter settings:**
   - Budget: $500+ (avoid race-to-bottom jobs)
   - Posted: Last 24-48 hours (freshness matters)
   - Client history: Prefer clients with payment history
   - Fixed price or hourly (both acceptable)

3. **Evaluate each job:**
   - Does it match our capabilities? (Yes/No)
   - Which tier does it fit? (Starter/Professional/Enterprise/Custom)
   - Is the budget reasonable? (Check against our pricing)
   - Is the client legit? (Check reviews, payment history)

#### Write the Proposal

For each qualified job:
1. Read the job posting carefully (twice)
2. Identify the core problem they need solved
3. Write a personalized proposal (not a template dump)
4. Reference something specific from their posting
5. Include a relevant example or brief case study
6. Keep it under 200 words for the cover letter
7. Include estimated timeline and ballpark price

See `references/outreach-templates.md` for Upwork proposal templates.

### Step 3: Reddit Prospecting

#### Where to Look

Subreddits to monitor:
- r/automation
- r/artificial
- r/smallbusiness
- r/entrepreneur
- r/SaaS
- r/startups
- r/ChatGPT
- r/OpenAI
- r/LocalLLaMA
- r/freelance
- r/forhire

#### How to Engage

1. **Be helpful first, sell second.** Answer questions genuinely.
2. Look for posts like:
   - "How do I automate [X]?"
   - "Looking for AI help with [Y]"
   - "Anyone built [Z] with AI?"
   - "Need developer for AI project"
3. Comment with genuine value and expertise
4. If appropriate, mention RickClaw's capabilities naturally
5. DM only if they explicitly ask for help or recommendations
6. Never spam. Reddit communities ban fast.

### Step 4: LinkedIn Prospecting

#### Target Profiles
- Founders/CEOs of companies with 10-100 employees
- Operations managers struggling with manual processes
- Marketing directors looking for AI content tools
- Tech leads evaluating AI integrations

#### Outreach Process
1. Identify target (company + person)
2. Research their business (website, recent posts, company news)
3. Connect with a personalized note (under 300 characters)
4. After connection, send a value-first message
5. Share a relevant insight or resource (not a pitch)
6. Only pitch after rapport is established (2-3 interactions)

See `references/outreach-templates.md` for LinkedIn message templates.

### Step 5: Qualify Every Lead

Before adding to the pipeline, check against `references/qualification-criteria.md`:

#### Must-Have Criteria (all must be true)
- [ ] Has a real business problem AI can solve
- [ ] Has budget (or can allocate budget)
- [ ] Has decision-making authority (or access to decision maker)
- [ ] Timeline is within 30 days
- [ ] Problem matches our capabilities

#### Nice-to-Have Criteria
- [ ] Repeat business potential (upsell path)
- [ ] Portfolio-worthy project
- [ ] Industry we want to break into
- [ ] Referral potential
- [ ] Clear ROI story

#### Lead Score

| Score | Criteria Met | Action |
|-------|-------------|--------|
| A (Hot) | All must-haves + 3+ nice-to-haves | Prioritize, respond within 2 hours |
| B (Warm) | All must-haves + 1-2 nice-to-haves | Respond within 24 hours |
| C (Cool) | Most must-haves met | Nurture, respond within 48 hours |
| D (Cold) | Missing must-haves | Skip or nurture long-term |

### Step 6: Log and Hand Off

For each qualified lead:

1. **Log in pipeline tracker** (see sales-pipeline skill)
   - Name, company, source, tier fit, lead score
2. **Notify the team** if it's an A or B lead
3. **Send initial outreach** if not already done
4. **Set follow-up reminder** (48-72 hours)
5. **Note in memory** file for the day

### Step 7: Track Performance

Weekly prospecting metrics:

```
PROSPECTING REPORT - Week of [Date]
Channels worked: [List]
Jobs/posts reviewed: [Number]
Proposals sent: [Number]
Connections made: [Number]
Leads qualified: [Number]
  - A leads: [Number]
  - B leads: [Number]
  - C leads: [Number]
Conversion to pipeline: [Number]
```

## Prospecting Cadence

Recommended weekly schedule:

| Day | Activity | Time |
|-----|----------|------|
| Monday | Upwork job search + proposals | 1-2 hours |
| Tuesday | Reddit scanning + engagement | 30-60 min |
| Wednesday | LinkedIn outreach + follow-ups | 1 hour |
| Thursday | Upwork follow-ups + new jobs | 1 hour |
| Friday | Weekly metrics + pipeline review | 30 min |

## Reference Files

- `references/search-queries.md` - Search queries for each platform
- `references/outreach-templates.md` - Message templates for each channel
- `references/qualification-criteria.md` - Full qualification checklist
