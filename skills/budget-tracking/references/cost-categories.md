# Cost Categories

Standard cost categories for tracking all RickClaw AI expenses.

---

## Category 1: API & AI Models

Costs for using AI model APIs.

| Subcategory | Provider | Typical Monthly Range | Notes |
|------------|----------|----------------------|-------|
| GPT-4o / GPT-4o-mini | OpenAI | $10-$200 | Main workhorse models |
| GPT-4 Turbo | OpenAI | $20-$300 | Heavy reasoning tasks |
| Claude Opus | Anthropic | $30-$500 | Complex analysis, long context |
| Claude Sonnet | Anthropic | $10-$200 | Balanced cost/quality |
| Claude Haiku | Anthropic | $1-$20 | Quick, cheap tasks |
| Embeddings | OpenAI/Other | $1-$20 | If used for RAG/search |
| Fine-tuning | OpenAI | $0-$100 | If fine-tuning models |

**Tracking method:** Check provider dashboards monthly
- OpenAI: https://platform.openai.com/usage
- Anthropic: Console or API

---

## Category 2: Infrastructure

Hosting, servers, and core infrastructure.

| Subcategory | Provider | Monthly Cost | Notes |
|------------|----------|-------------|-------|
| Mac Mini | Apple | $0 | Owned hardware, no recurring cost |
| Electricity | Utility | ~$5-$15 | Estimated portion for Mac Mini |
| Internet | ISP | Shared | Not separately tracked |
| Domain registration | Registrar | $1-$5 | Per domain, amortized monthly |
| DNS hosting | Cloudflare/etc | $0-$5 | Usually free tier |
| Cloud storage | iCloud/S3/etc | $1-$10 | Backup and storage |
| SSL certificates | Let's Encrypt | $0 | Free |

**Tracking method:** Fixed monthly tally, update quarterly

---

## Category 3: Tools & Subscriptions

Software tools and recurring subscriptions.

| Subcategory | Provider | Monthly Cost | Notes |
|------------|----------|-------------|-------|
| GitHub | GitHub | $0-$4 | Free or Pro plan |
| Brave Search API | Brave | $0-$5 | Free tier or paid |
| ElevenLabs (TTS) | ElevenLabs | $0-$22 | If sag is configured |
| OpenClaw | Self-hosted | $0 | Open source, self-hosted |
| Email service | TBD | $0-$10 | If using paid email |
| Analytics | TBD | $0-$10 | If using analytics tools |
| Design tools | Canva/etc | $0-$15 | If needed for proposals |
| Project management | TBD | $0-$10 | If using paid PM tool |

**Tracking method:** Monthly subscription audit

---

## Category 4: Marketing & Outreach

Costs related to acquiring clients and building reputation.

| Subcategory | Description | Typical Cost | Notes |
|------------|-------------|-------------|-------|
| Upwork fees | Platform commission on contracts | 10-20% of contract | Upwork takes a cut |
| LinkedIn Premium | Enhanced outreach capabilities | $0-$60/month | If used for prospecting |
| Content creation | Blog posts, case studies | $0-$100 | Mostly internal effort |
| Paid ads | Google, LinkedIn, Reddit ads | $0-$500 | If running paid campaigns |
| Sponsored content | Sponsored posts or placements | $0-$200 | Per placement |
| Email marketing | Newsletter tool | $0-$30 | If using Mailchimp, etc. |

**Tracking method:** Per-campaign tracking with ROI calculation

---

## Category 5: Subcontractors

External help hired for specific projects.

| Subcategory | Description | Typical Cost | Notes |
|------------|-------------|-------------|-------|
| Freelance developers | Extra dev capacity | $50-$150/hour | For overflow work |
| Designers | UI/UX, graphics | $40-$100/hour | Per project |
| Specialists | Domain experts | $75-$200/hour | Niche expertise |
| Virtual assistants | Admin tasks | $15-$30/hour | If needed |

**Tracking method:** Per-project, per-invoice tracking

---

## Category 6: Miscellaneous

One-off and irregular expenses.

| Subcategory | Description | Notes |
|------------|-------------|-------|
| Hardware | Keyboards, monitors, cables | As needed |
| Software licenses | One-time purchases | As needed |
| Training/courses | Upskilling | As needed |
| Legal | Contract review, business formation | As needed |
| Accounting | Tax prep, bookkeeping | Annual or quarterly |
| Travel | Client meetings (rare) | As needed |

**Tracking method:** Log as incurred

---

## Cost Logging Format

When logging a new expense:

```
Date: YYYY-MM-DD
Category: [1-6]
Subcategory: [specific item]
Amount: $X.XX
Recurring: [Yes/No]
Description: [Brief note]
Related project: [Client/project name if applicable]
```

## Monthly Audit Checklist

- [ ] Check all API provider dashboards
- [ ] Review active subscriptions
- [ ] Log any new one-time expenses
- [ ] Total each category
- [ ] Compare against previous month
- [ ] Flag any category with >20% increase
- [ ] Update budget report
