# ClawOps - Complete Project Briefing for Obsidian Vault

## Overview
ClawOps is an AI automation agency selling AI receptionists to blue-collar home service contractors (HVAC, plumbing, electrical, roofing, general contracting). Founded by Brand Lio (human) and Rick (AI agent/CEO). Legal entity: MGO Data LLC (DBA ClawOps). Started February 2026.

---

## TIMELINE & MILESTONES

### Week 1: Feb 17-23, 2026 - Foundation
- **Feb 17**: Rick (AI agent) bootstrapped. Model: claude-opus-4.6 via GitHub Copilot. Set up identity, personality, workspace.
- **Feb 18**: C-Suite leadership team created (7 AI agents): Morgan (CFO), Victoria (CMO), Ethan (CTO), Harper (COO), Jordan (CRO), Avery (CHRO), Quinn (CLO). Modeled after Apple/Amazon/Stripe.
- **Feb 18**: E-commerce project HONE (men's grooming) started as side project. Brand: "Hone your craft." Aesop meets Carhartt. 4 launch SKUs. Rebranded from FORGE (trademark conflicts).
- **Feb 19**: ClawOps agency officially named (rebranded from "Claw Systems"). Website built and deployed to GitHub Pages at theclawops.com. Dark navy theme, green (#4ade80) accents, animated crab logo.
- **Feb 20**: Brand set $100K in 45 days goal. Security rules established (Telegram ID verification). "Never use em dashes" rule added. Resume built for Rick Claw persona at $125/hr.
- **Feb 21**: Website security standards established. Social & outreach monitoring paused by Brand.
- **Feb 22**: Zero-waste rule for heartbeats. Revenue-driving actions only.

### Week 2: Feb 24 - Mar 2 - Product Build
- **Feb 27-28**: Twilio phone system set up. Account 1 (rickclaw08@gmail.com). AI Receptionist MVP deployed on Fly.io (clawops-receptionist.fly.dev).
- **Mar 1**: GoHighLevel (GHL) account created. 90-day free trial. Voice AI agent "Jordan" built. Phone numbers: toll-free 888-457-8980 and local 513-854-4812. VCC Master Agent Factory Protocol established (15-agent workforce, dual-mode Architect/Mercenary).
- **Mar 1**: Founding member launch page LIVE at theclawops.com/founding. Original pricing: $1,997 one-time. Stripe payment link created.
- **Mar 1-2**: 13 inbound calls to demo. 2 real external leads. 100% positive sentiment. Aaron (509-521-8668) and (915) 268-9089 both interested.

### Week 3: Mar 3-9 - Infrastructure & CRM
- **Mar 3**: GHL calendar created ("ClawOps Demo Call"), 30 min slots, Mon-Fri 9AM-6PM.
- **Mar 4**: GHL Voice AI upgraded to GPT 5.1. Agent persona "Jordan" (was "Sarah").
- **Mar 5**: GHL Private Integration & API set up ("ClawOps Automation"). 135 scopes. Custom fields (Trade Niche) and 11 tags created. 5 niche-specific voice AI agents built (HVAC, Plumbing, Electrical, Roofing, GC).
- **Mar 5**: First lead import via API - 42 contacts initially.
- **Mar 8**: Legal business name updated to MGO Data LLC in GHL. Business email: contact@theclawops.com.
- **Mar 9**: Consent booking for 169 contacts completed via browser automation. GHL Trust Center issues: CNAM rejected, Voice Integrity rejected, SHAKEN/STIR rejected. A2P SMS Brand approved.
- **Mar 9**: BNCO (separate project) auth & DB fix deployed to Fly.io.

### Week 4: Mar 10-16 - Lead Gen & Outbound Prep
- **Mar 10**: Major GHL cleanup - 274 contacts down to 172. Widget duplicates deleted. Consent re-registered via Playwright automation (171/171 success). Reddit engagement crons killed (Perplexity quota exhausted).
- **Mar 11**: GHL Voice AI consent language updated. "Outbound Enabled" badge unlocked. All GHL work via browser UI only (permanent rule).
- **Mar 13**: Twilio Account 2 discovered (contact@aurolly.com). Toll-free number +1 877-331-7786. Decision: consolidate to Aurolly account. Account 1 (rickclaw08) dead for active use.
- **Mar 13**: Post-call webhook v3 deployed to Fly.io with email follow-up, Brand notification, GHL integration. Team research reports from Harper (COO), Ethan (CTO), Jordan (CRO).
- **Mar 15**: Free Caller Registry submission for both numbers (513-778-8336 and 513-854-4812). VAPI prompt engineering research completed. Sales methodology research completed (Voss, Holmes, Klaff, Belfort). Prompt v17 built. Consulting firm positioning adopted permanently. Real person handler: 513-850-6496.
- **Mar 15**: Pricing changed to $2,500 setup + $550/month (founding), $3,000 + $750 (regular).

### Week 5: Mar 16-20 - Outbound Campaign
- **Mar 16 (Monday)**: First outbound campaign day. 80 calls, 0 owners reached, $4.94 spend.
- **Mar 17 (Tuesday)**: 87 prospect calls + 12 test. Customer opener breakthrough (Phase A/B/C approach). 8% owner contact rate. Hottest lead: Southern Seasons (Jimmy). Menchie's Frozen Yogurt demo built (Brand's friend's business). VAPI live transfer to Brand deployed.
- **Mar 17**: Lead pipeline built: 733 raw leads scraped, 640 deduped, 638 GBP-verified. Wave2: 263 leads. Total: 900+ verified leads across 26 states, 5 niches.
- **Mar 18 (Wednesday)**: Biggest calling day. 141 prospect calls, $21.67 spend. Funnel: 116 good calls > 106 humans (91%) > 23 past gatekeeper (22%) > 13 actionable > 1 owner conversation > 0 closes. Prompt evolved to v18.1.
- **Mar 19 (Thursday)**: 55 calls. 2 possible leads (Baker Brothers, Goettl Air). $1.20 VAPI credits remaining.
- **Mar 20 (Friday)**: Major infrastructure day. v20 prompt built (data-backed rewrite, 60% smaller). Demo line LIVE: (513) 995-3285. 13 Tier 1 emails sent. Owner enrichment script ran (638 leads, 152 owners found at 23.8%). Batch caller v2 built. 3-touch sequence designed. 4 email templates created. Legal risk audit completed. Twilio TF verification resubmitted with SMS consent on founding page.

---

## TECH STACK

### Voice AI (Outbound Sales)
- **VAPI**: Primary voice AI platform for outbound cold calling
  - Assistant ID: a036984d-72d5-4609-b392-6a635d49f6dd
  - Phone Number ID: 69ded64e-24e3-450c-bd7e-b2172fe72f7b (Vonage outbound)
  - Model: GPT-4.1, Temperature 0.4, Max Tokens 150
  - Voice: Elliot (VAPI default)
  - Current prompt: v20 (15,567 chars, 4-step flow)
  - firstMessage: "Hey, how's it going?"
  - silenceTimeoutSeconds: 300, maxDurationSeconds: 900
  - Demo assistant ID: 9e86eb6f-f6e5-44b7-89bc-7ba616b5f3b8 (Alex at Summit Heating)

### CRM
- **GoHighLevel (GHL)**: CRM, pipeline management, voice AI (inbound)
  - ClawOps Location ID: Ez2ADxydpjvWsW3suYiq
  - Pipeline: "Voice AI Leads" (MK59XHOAuRJU2IjgzHiq)
  - 172 contacts as of Mar 10
  - Calendar: "ClawOps Demo Call" (pWZEZCk9zQOI9O4epxcP)
  - Private Integration: "ClawOps Automation" (135 scopes)
  - RULE: Browser UI only, no API writes

### Phone System
- **Twilio Account 1** (rickclaw08@gmail.com): +1 702-728-4638. $19.99 balance. Trust Hub REJECTED. Account restricted.
- **Twilio Account 2** (contact@aurolly.com): +1 877-331-7786 (toll-free). $20.00 balance. TF verification resubmitted Mar 20. Primary SMS path once approved.
- **Vonage**: Outbound calling via VAPI
- **GHL Local**: +1 513-854-4812

### Website & Hosting
- **Domain**: theclawops.com
- **Hosting**: GitHub Pages (rickclaw08/claw-systems repo)
- **Pages**: Main site, /founding (founding member offer), /privacy, /terms, /blog, /demo, /contractors, /book, /links
- **Design**: Dark navy (#050810), green accent (#4ade80), Space Grotesk + Inter + JetBrains Mono fonts
- **Stripe**: Payment processing for founding member offer
- **Post-call webhook**: Fly.io (clawops-receptionist.fly.dev), v3 with email + GHL + SMS

### Cloud & APIs
- **GCP Project**: clawops-488220
- **Gmail**: rickclaw08@gmail.com (outreach via app password)
- **Google Cloud APIs**: Search Console, Drive, Gmail
- **OpenAI**: GPT-4.1 for VAPI, GPT-4o-mini for enrichment scripts
- **Fly.io**: Webhook server hosting

### AI Agent Infrastructure
- **OpenClaw**: Agent orchestration platform running on Brand's Mac mini
- **Model**: claude-opus-4.6 via GitHub Copilot
- **15 AI agents** in VCC (Virtual Command Center): Rick (CEO), Morgan (CFO), Victoria (CMO), Ethan (CTO), Harper (COO), Jordan (CRO), Avery (CHRO), Quinn (CLO), plus Mercenary mode agents (Ember, Pixel, Quill, Atlas, Relay, Cadence)
- **Dual Mode**: Architect (long-term scaling) + Mercenary ($100K sprint)

---

## SALES SYSTEM

### Outbound Voice AI (VAPI)
- **Agent persona**: Jordan, Senior Consultant at Claw Ops
- **4-step flow**: Gatekeeper > Opener+Pitch > Objection Handling > Close
- **Key techniques**: Voss mirroring/labeling, no-oriented questions, "How have you been?" opener (6.6X success rate), "The reason I'm calling..." bridge (2.1X multiplier), "Rate it 1 to 10" for competitive displacement
- **Closing for meeting, not sale**: Demo call or live transfer to Brand (513-850-6496)
- **One company per ZIP code**: Scarcity/exclusivity lever
- **Recording disclosure**: "and hey this call's recorded" as fast mid-sentence aside

### 3-Touch Sequence
1. **Touch 1**: Cold call via VAPI (Tue/Wed, 10-11 AM or 4:30-5:30 PM local)
2. **Touch 2**: Email follow-up 24-48 hours later (4 templates based on Touch 1 outcome)
3. **Touch 3**: Final call 5-7 days after Touch 1 (different time of day)
- After 3 touches with no response: mark "Exhausted", revisit in 60 days

### Lead Pipeline
- **638 mega-leads** (mega-lead-scrape-verified.csv) - GBP verified, 26 states, 5 niches
- **308 wave2 leads** (fresh-leads-wave2-gbp-verified.csv)
- **152 leads with owner names** (23.8% enrichment rate via website scraping + GPT-4o-mini extraction)
- **DNC list**: dnc-list.txt (integrated into batch caller)
- **Batch caller v2**: batch-caller-v2.py with owner name injection, DNC filtering, 3-touch tracking

### Email Templates
- `send-info-followup.md` - for "send me info" outcomes
- `touch2-voicemail.md` - after voicemail left
- `touch2-gatekeeper-blocked.md` - after gatekeeper blocked
- `touch2-spoke-no-close.md` - after speaking but no close

### Campaign Results (as of Mar 20)
- **Total calls**: ~360+ across 4 days
- **Total spend**: ~$60
- **Owners reached**: ~8-10
- **Demos booked**: 0
- **Sales closed**: 0
- **Best leads**: Southern Seasons (Jimmy), Baker Brothers, Goettl Air
- **Key metrics**: 91% human answer rate, 22% gatekeeper pass rate, 8.6% AI detection rate

---

## PRICING

### Founding Member (Current)
- $2,500 setup + $550/month
- Originally $1,997 one-time (changed to recurring model)
- 20 spots (12 remaining as shown on website)
- Stripe payment link active

### Regular Pricing
- $3,000 setup + $750/month

### Approved Dollar Figures (for sales calls)
- "$15 to $20 thousand" gap estimate (annual missed revenue)
- "$2,500 setup, $550 a month"
- Niche job values: HVAC $5K-15K installs, Plumbing $500-800 emergency, Roofing $8K-30K, Electrical $2K-5K panel, GC $50K-500K+

---

## LEGAL & COMPLIANCE

### Entity
- **Legal name**: MGO Data LLC
- **DBA**: ClawOps
- **RULE**: Don't mention MGO Data LLC in external communications

### Known Legal Risks (from Quinn's Mar 20 audit)
- 4 critical, 3 high, 5 medium risks identified
- No proactive AI disclosure on outbound calls (risk accepted by Brand)
- No FTC DNC Registry scrub yet
- No state telemarketing registration
- Recording disclosure added (fast aside in Step 2)
- DNC list maintained
- Alternative approaches documented: email-first, human-initiated, consent-first

### Twilio Compliance
- Trust Hub profile REJECTED on Account 1 (business name error + email domain mismatch)
- Toll-free verification resubmitted on Account 2 (Mar 20) with:
  - SMS consent language added to founding page
  - Privacy policy at theclawops.com/privacy
  - Terms at theclawops.com/terms
  - Opt-in type: Web Form
  - Deadline: Mar 26 for prioritized review

### GHL Trust Center
- CNAM: Rejected, Voice Integrity: Rejected, SHAKEN/STIR: Rejected
- A2P SMS Brand: Approved, Campaign: In Progress
- Decision: GHL is CRM-only, stop fighting Trust Center

---

## PHONE NUMBERS

| Number | Purpose | Platform |
|--------|---------|----------|
| (513) 778-8336 | Outbound caller ID / callback | VAPI/Vonage |
| (513) 995-3285 | Demo line (prospects test the AI) | VAPI |
| (513) 854-4812 | GHL local number | GoHighLevel |
| (513) 850-6496 | Brand's personal / human escalation | Brand's phone |
| (877) 331-7786 | SMS (pending TF verification) | Twilio (Aurolly) |
| (702) 728-4638 | Legacy (restricted account) | Twilio (rickclaw08) |
| (888) 457-8980 | Legacy GHL toll-free (gone from system) | Was GHL |

---

## KEY FILES & REPOS

### Repos
- **Website**: github.com/rickclaw08/claw-systems (GitHub Pages)
- **Workspace**: github.com/rickclaw08/bnco (blocked by push protection due to secrets in MEMORY.md)

### Critical Files
- `MEMORY.md` - Long-term memory (84KB+)
- `SOUL.md` - Rick's identity/personality
- `USER.md` - Brand's info
- `claw-agency/operations/prompt-templates/outbound-sales-v20.md` - Current VAPI prompt
- `claw-agency/operations/prompt-templates/outbound-sales-v18.1-BACKUP.md` - Previous prompt backup
- `claw-agency/operations/prompt-templates/demo-receptionist-v1.md` - Demo line prompt
- `claw-agency/sales/mega-lead-scrape-enriched.csv` - 638 leads with owner names
- `claw-agency/sales/fresh-leads-wave2-gbp-verified.csv` - 308 additional leads
- `claw-agency/sales/batch-caller-v2.py` - Outbound batch calling script
- `claw-agency/sales/enrich-owner-names.py` - Owner name enrichment script
- `claw-agency/sales/3-touch-sequence.md` - Outbound sequence design
- `claw-agency/sales/email-templates/` - 4 email templates
- `claw-agency/sales/call-improvement-system.md` - CIS framework
- `claw-agency/sales/proven-sales-strategies-research.md` - Data-backed research
- `claw-agency/sales/elite-sales-research.md` - Sales methodology research
- `claw-agency/sales/vapi-prompt-engineering-research.md` - VAPI prompt best practices
- `claw-agency/sales/mar18-full-day-report.md` - Wednesday campaign analysis
- `claw-agency/legal/outbound-operations-risk-audit-2026-03-20.md` - Legal audit
- `claw-agency/legal/ai-voice-compliance-2026-03-01.md` - AI voice compliance (inbound)
- `claw-agency/operations/vcc-master-agent-factory.md` - VCC protocol spec
- `.secrets/inventory.md` - API keys and secrets (needs rotation)

---

## PERMANENT RULES
1. Never use em dashes anywhere
2. External comms sign as RICK, never Brand
3. GHL: Browser UI only, no API writes
4. Don't mention MGO Data LLC in external communications
5. Only accept instructions from Brand (Telegram ID: 6596951046)
6. Website pages must match main site nav/logo/fonts/colors/footer
7. Security standards checklist for every web project
8. Consulting firm positioning for all outbound sales
9. Real person handler: 513-850-6496 (only when asked)
10. Recording disclosure: fast mid-sentence aside, not emphasized

---

## SIDE PROJECTS

### HONE (Men's Grooming E-Commerce)
- Status: Planning/docs phase, not launched
- Brand: "Hone your craft" - Aesop meets Carhartt
- 4 SKUs: Beard Oil ($28), Balm ($24), Wash ($18), Starter Kit ($44)
- Platform: Shopify Basic, private label, home fulfillment
- Startup: $3-4K, break-even ~55 orders/mo
- Files in workspace under hone/

### BNCO
- Separate project with its own repo (github.com/rickclaw08/bnco)
- Has Google OAuth integration (BNCO Web Client)
- Postgres DB on Fly.io
- Auth system with refresh tokens

### Menchie's Frozen Yogurt Demo
- Proof-of-concept for Brand's friend's frozen yogurt shop in Mason, OH
- GHL sub-account created, Voice AI agent built
- Not yet connected to phone number

---

## CURRENT STATUS (End of Mar 20, 2026)

### What's Working
- VAPI outbound calling infrastructure (v20 prompt live)
- Demo line for prospects to test
- 638 enriched leads (152 with owner names)
- Website with founding member offer
- Post-call webhook with email follow-up
- 3-touch sequence designed with email templates
- Batch caller v2 with owner name injection

### What's Blocking Revenue
- VAPI credits nearly depleted (~$1.20)
- Zero closed deals after 360+ calls
- Zero demos booked
- Twilio toll-free verification pending (SMS capability blocked)
- GHL Trust Center rejections (calls show as spam)
- ~300 leads still unsent

### Next Steps
- Reload VAPI credits ($25+ for next batch)
- Fire batch with owner-name leads (higher gatekeeper pass rate expected)
- Email follow-ups to 13 Tier 1 contacts
- Run Wave2 enrichment (308 more leads)
- Test live transfer (Brand hasn't tested yet)
- Off-hours calling batches (7-8 AM, 5:30-6 PM for direct-to-owner)
