# Project Velocity - Pre-Foreclosure Flipping System
# Master Operations Playbook

## Mission
Automate the identification, valuation, and assignment of distressed residential properties in Hamilton County, Ohio.
**Target: $5,000/day profit. $100/month operating budget.**

## Revenue Model
1. Scout finds pre-foreclosure properties via public records
2. Analyst calculates MAO (Maximum Allowable Offer) using free data
3. Closer contacts distressed homeowners via automated SMS
4. Seller signs Purchase & Sale Agreement (with assignment clause)
5. Dispo Specialist flips the contract to cash buyers/hedge funds for $4K-$12K markup

## Agent Hierarchy

### 1. The Scout (Data Scraper)
- **Source**: Hamilton County Court Clerk (courtclerk.org) + County Auditor (hamiltoncountyauditor.org)
- **Target**: "Notice of Trustee Sale", "Judicial Sale", "Private Selling Officer" notices
- **Filter**: Auction dates 14-30 days out (7-day minimum buffer)
- **Equity Check**: Auditor Total Value - Total Judgment Amount >= $40,000
- **Output**: Property address, owner name, auction date, judgment amount, auditor value -> leads database

### 2. The Analyst (Zero-Cost Valuator)
- **Data**: Zillow/Redfin scraped via Python for median zip code PPSF
- **Formula**: (SqFt x MedianZipPPSF x 0.70) - $15,000 (repairs) - $10,000 (profit) = Offer Price
- **Safety Gate**: If Mortgage Debt > MAO -> move to "Short Sale - Refer to Partner" (DO NOT TOUCH)
- **Output**: MAO, ARV estimate, repair estimate, recommended offer price

### 3. The Closer (GHL Automator)
- **Channel**: Automated SMS sequence via GHL or Twilio
- **Tone**: Empathetic but urgent
- **Script**: "I saw the notice for [Address]. I can buy this cash today, pay off your mortgage, and save your credit before the auction on [Date]."
- **Logic**:
  - Reply "Stop"/"No" -> kill lead
  - Reply "How much?"/"Yes" -> send pre-filled PandaDoc/DocuSign link
  - Complex question -> ping Brand's phone via GHL app
- **Human Escalation**: Brand at +1 (513) 850-6496

### 4. The Dispo Specialist (Social Scraper + Hedge Fund Finder)
- **Primary**: 10+ Cincinnati REI Facebook groups, post formatted assignment deals
- **Secondary**: Craigslist real estate investor section
- **Hedge Fund Hack**: Scrape Hamilton County Auditor transfer records (last 90 days) for entities ending in LLC, Homes 4 Rent, AMH, Capital, Properties, Investments
- **Post Format**: "ASSIGNMENT DEAL: [Zip], [Beds/Baths], $XX,XXX Cash. Closing on [Date]. DM for Address."
- **Output**: Buyer list, contact emails, assignment contract submissions

## Safety & Logic Gates

### Gate 1: Under-Water Check
If Mortgage Debt > MAO -> "Short Sale - Refer to Partner"
We ONLY want fast $5K-$12K flips. Short sales take months. Do not touch.

### Gate 2: Auction Buffer
If auction date < 7 days away -> DISCARD
We need minimum 7 days to find a buyer and close the assignment.

### Gate 3: Equity Floor
If (Auditor Total Value - Total Judgment Amount) < $40,000 -> SKIP
Not enough margin to make the deal work after repairs and profit.

### Gate 4: Assignment Clause (NON-NEGOTIABLE)
Every PSA MUST include: "Buyer reserves the right to assign this contract to any third party for a fee without prior notice to Seller."

## Project Isolation Rules
- All files in /velocity_root/ ONLY
- NEVER reference /clawops/, /bnco/, or /claw-agency/ data
- Dedicated Twilio sub-account (separate from ClawOps lines)
- Separate leads database, separate memory files
- Zero data leakage between projects

## Budget Breakdown ($100/month)
| Item | Cost |
|------|------|
| Data Sourcing (Court Clerk, Auditor) | $0 |
| Skip Tracing (TruePeopleSearch free tier) | $0 |
| Batch Skip Tracing (backup) | $40-60 |
| Valuation (Zillow/Redfin scraping) | $0 |
| SMS Outreach (Twilio/GHL) | $15 |
| Disposition (Facebook/Craigslist) | $0 |
| E-Sign (PandaDoc/DocuSign free tier) | $0 |
| **Total** | **$55-75** |

## Sequential Execution Order
1. [x] Create project structure and config
2. [x] Write master playbook (this file)
3. [ ] Build Scout scraper for Hamilton County Court Clerk
4. [ ] Build Scout scraper for Hamilton County Auditor (property values)
5. [ ] Build Analyst valuation script (Zillow/Redfin PPSF)
6. [ ] Create PSA template with assignment clause
7. [ ] Build Closer SMS sequence templates
8. [ ] Build Dispo post templates + buyer list scraper
9. [ ] Build transfer record scraper (hedge fund identification)
10. [ ] Integration testing (full pipeline: lead -> value -> offer -> sign -> assign)
11. [ ] Go live with first batch of leads

## Key Files
- Config: `config/config.json`
- Leads DB: `leads/` (CSV + JSON)
- Contracts: `contracts/psa-template.md`, `contracts/assignment-template.md`
- Scripts: `scripts/` (Python scrapers, valuation, skip trace)
- Dispo: `dispo/` (buyer lists, post templates)
- Legal: `legal/` (compliance notes, Ohio-specific rules)
- Memory: `memory/` (daily logs, deal tracking)
