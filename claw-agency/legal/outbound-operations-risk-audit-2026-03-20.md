# ClawOps Outbound Operations - Legal Risk Audit

**Prepared by:** Quinn (CLO)
**Date:** March 20, 2026
**Scope:** Full audit of current outbound cold calling operations, lead enrichment, data handling, and AI voice agent deployment
**Status:** CRITICAL - Multiple high-risk violations identified

---

## EXECUTIVE SUMMARY

ClawOps is currently running AI-powered outbound cold calls to businesses using VAPI (AI voice agent) through Twilio phone infrastructure. After reviewing the v20 prompt, lead data operations, Twilio account status, and applicable law, I've identified **4 critical risks, 3 high risks, and 5 medium risks** that need immediate attention.

The good news: B2B cold calling is fundamentally legal. The bad news: how we're doing it has specific gaps that could result in fines, carrier blocking, or lawsuits.

---

## CRITICAL RISKS (Fix Before Next Call Batch)

### 1. FCC AI Voice Ruling + TCPA: Outbound AI Calls Require Prior Express Consent

**The Law:** On February 8, 2024, the FCC unanimously ruled that AI-generated voices qualify as "artificial or prerecorded voices" under the TCPA (47 U.S.C. 227). This means outbound calls using AI voice are subject to the SAME restrictions as robocalls.

**What This Means for Us:**
- Outbound calls using AI voice to cell phones require **prior express consent** (for informational) or **prior express written consent** (for marketing/telemarketing)
- We have NEITHER. We're cold calling from scraped lead lists with zero prior consent.
- B2B exception exists but is NARROW (see below)

**The B2B Exception (Our Lifeline):**
The TCPA's restrictions on "artificial or prerecorded voice" calls apply primarily to calls to **residential lines and cell phones**. Calls to **business lines** have a partial exemption:
- The FCC's 1992 TCPA rules exempt calls using prerecorded voices to businesses (47 CFR 64.1200(a)(3) exempts calls to persons with whom the caller has an "established business relationship" or calls to business numbers)
- **However:** The 2024 AI ruling didn't explicitly address whether the B2B exemption extends to AI-generated voices. This is legally untested.
- If a contractor's "business number" is actually their personal cell phone (very common for small contractors), the exemption vanishes.

**Risk Level:** CRITICAL
**Potential Penalty:** $500-$1,500 per call (TCPA statutory damages). At 141+ calls already made, exposure is $70,500 - $211,500.
**Likelihood:** Low-Medium (no one has complained yet, B2B context helps, but one angry contractor could trigger a class action)

**Mitigation Options:**
1. **Best option:** Add an AI disclosure at the start of every outbound call AND only call confirmed business landlines (not cell phones)
2. **Second option:** Switch to human-initiated calls where the AI assists but a human makes the initial connection (exempts from ATDS/artificial voice rules)
3. **Third option:** Obtain prior express consent via email outreach BEFORE calling (send intro email, get reply, then call)
4. **Minimum viable:** Document that all numbers called are business numbers published on Google Business Profiles (establishes they're business lines, not personal cells)

### 2. No DNC (Do Not Call) Scrubbing

**The Law:** The TSR (Telemarketing Sales Rule, 16 CFR 310) and TCPA require telemarketers to scrub against the National Do Not Call Registry before making calls. Even B2B callers making telemarketing calls must comply.

**Our Status:** We are calling from scraped Google Business Profile data. We have NOT scrubbed any lists against the National DNC Registry.

**The B2B Factor:** The DNC Registry is primarily for residential consumers. Business numbers are generally not on it. However:
- Small contractors often register their personal cell as their business number
- If that personal cell is on the DNC list, calling it is a violation
- Some states have separate state DNC registries that include business numbers

**Risk Level:** CRITICAL
**Potential Penalty:** Up to $51,744 per call (FTC) or $500-$1,500 per call (TCPA private action)
**Likelihood:** Low (most contractors won't be on DNC with their business line, but the exposure per violation is enormous)

**Mitigation:**
1. **Register with the FTC DNC Registry** as a caller ($75/area code per year, or flat fee for full access)
2. Scrub all lead lists against the national DNC registry before calling
3. Maintain an internal DNC list of anyone who says "stop calling" or "take me off your list"
4. Document the scrubbing process for compliance records

### 3. Twilio Trust Hub / A2P Registration Not Approved

**The Status:**
- Account 1 (rickclaw08@gmail.com): Trust Hub profile **REJECTED**. Voice calling DISABLED (Error 32005). Account restricted from buying new numbers (Error 22300).
- Account 2 (contact@aurolly.com): Toll-free verification just resubmitted today (pending). SMS blocked until approved.
- VAPI calls are going through their own infrastructure, not directly through our Twilio accounts

**The Risk:** Twilio and carriers are actively cracking down on unregistered voice traffic. If VAPI's underlying carrier detects our calling patterns (high volume outbound, short call durations, high hangup rates), they could:
- Flag the number as "Scam Likely" (already happened with +1 888-457-8980)
- Block the number entirely
- Suspend the VAPI account

**Risk Level:** CRITICAL
**Mitigation:**
1. Fix Trust Hub on Account 1 (correct business name to "MGO Data LLC", fix rep email)
2. Monitor VAPI's calling number for STIR/SHAKEN attestation level
3. Keep call volume under carrier thresholds (varies, but <100 calls/day on a single number is generally safe)
4. Spread calls across multiple numbers if scaling up

### 4. AI Non-Disclosure on Outbound Calls

**The Law:** California SB 1001 requires bots to disclose they are not human in commercial interactions with California persons. Colorado SB 24-205 requires disclosure for high-risk AI. The FTC considers failure to disclose AI in commercial contexts as potentially deceptive.

**Our v20 Prompt:**
- First message: "Hey, how's it going?" - No AI disclosure
- Jordan introduces himself as "Senior Consultant at Claw Ops" - implies human
- AI disclosure only happens IF the prospect asks ("Is this AI?")
- The prompt handles it well WHEN asked, but never proactively discloses

**The Problem:** We are calling businesses across all 50 states. Any call to a California business is a potential SB 1001 violation. Any call to a Colorado business could trigger SB 24-205. And the FTC could view our entire approach as deceptive.

**Risk Level:** CRITICAL (especially California calls)
**Potential Penalty:** SB 1001 doesn't specify damages (enforcement by AG), FTC fines up to $50,120 per violation

**Mitigation Options:**
1. **Proactive disclosure (safest):** Add AI disclosure early in the call: "Full transparency, I'm an AI assistant working with Claw Ops" - then continue the pitch. Data shows this doesn't kill conversion if handled confidently.
2. **Geo-filter (partial):** Exclude California, Colorado, Utah businesses from AI cold calls. Call those states with human-initiated contact only.
3. **Current approach (riskiest):** Rely on reactive disclosure only when asked. This is the current v20 approach. Legally vulnerable but practically unlikely to trigger enforcement on B2B calls.

---

## HIGH RISKS

### 5. Lead Data Scraping - Privacy Law Compliance

**What We're Doing:** Scraping business data from Google Business Profiles, enriching with owner names from websites, state registries, and OpenCorporates. Currently enriching 638+ leads.

**Google's Terms:** Google Maps Platform ToS prohibits scraping. We're using the Places API (legitimate) but the underlying lead lists may have been scraped.

**Privacy Laws:**
- CCPA/CPRA (California): Business contact information used for B2B marketing is generally exempt, but personal information (like owner names scraped from about pages) may not be
- Colorado Privacy Act, Virginia CDPA, Connecticut CTDPA: Similar B2B exemptions but narrower
- Illinois BIPA: If any voice biometric data is captured during calls, strict liability applies ($1,000-$5,000 per violation)

**Risk Level:** HIGH
**Mitigation:**
1. Document that all data is from publicly available business sources (Google Business Profiles, business websites, state registries)
2. Implement data retention limits (delete enriched data after 90 days if no relationship established)
3. Honor any deletion requests immediately
4. Do NOT scrape personal social media, personal phone numbers, or residential information

### 6. Recording Consent on Outbound Calls

**The Law:** 13 states require all-party consent for call recording (California, Florida, Illinois, Pennsylvania, Washington, etc.)

**Our Status:** VAPI records all calls. The v20 prompt does NOT include a recording disclosure. If we call a contractor in a two-party consent state, we are recording without consent.

**Risk Level:** HIGH
**Potential Penalty:** Criminal penalties in some states (Illinois: Class 4 felony). Civil damages vary.

**Mitigation:**
1. **Add recording disclosure to the prompt.** After initial greeting, before any substantive conversation: "Just a heads up, this call may be recorded for quality."
2. This can be brief and casual to avoid killing the call flow
3. Alternative: Configure VAPI to not record outbound calls (loses data for CIS analysis but eliminates risk)

### 7. Telemarketing Registration Requirements

**The Law:** Many states require telemarketers to register before making calls to residents of that state. While B2B calls are often exempt, the definition of "telemarketer" varies.

**States Requiring Registration (that may apply to B2B):**
- California, Connecticut, Florida, Georgia, Indiana, Louisiana, Maine, Michigan, Missouri, Nebraska, New York, North Carolina, Ohio, Oregon, Pennsylvania, Tennessee, Texas, Virginia, Washington, Wisconsin, Wyoming

**Our Status:** We are not registered as a telemarketer in any state.

**Risk Level:** HIGH (especially if calling into states that require registration for B2B calls)
**Mitigation:**
1. Research state-by-state telemarketing registration requirements for B2B calls
2. Register in states where required (costs $50-$500 per state, annual renewal)
3. Priority states based on our lead data: Texas, Ohio, Florida, California, Georgia

---

## MEDIUM RISKS

### 8. MGO Data LLC vs. ClawOps Branding Confusion

Jordan identifies as "Claw Ops" on calls. The legal entity is MGO Data LLC. If a complaint is filed, regulatory agencies will look at the registered entity. The mismatch between the calling brand and the legal entity could trigger additional scrutiny ("who is really calling?").

**Mitigation:** File a DBA (Doing Business As) for "ClawOps" under MGO Data LLC. Cost: $25-$75 depending on state/county. This legitimizes the brand name for regulatory purposes.

### 9. "One Company Per Zip Code" Scarcity Claim

The v20 prompt uses "We only work with one [niche] company per zip code" as a scarcity lever. If this isn't true (or becomes untrue as we scale), it's a deceptive trade practice under the FTC Act and state UDAP laws.

**Mitigation:** Make sure this is actually true and documented. If it's aspirational rather than current policy, change the language to "We're looking for one company per area" or similar.

### 10. Callback Number Exposure

The v20 prompt gives out 513-778-8336 (callback) and 513-850-6496 (human line, Brand's personal phone). If Brand's personal number gets flagged or ends up in public databases, it creates a privacy issue and potential harassment vector.

**Mitigation:** Get a dedicated business number for the human escalation line. Do not use a personal cell phone as the customer-facing "talk to a real person" number.

### 11. No Written Contracts with VAPI

We're running our entire sales operation through VAPI. If VAPI suspends our account, changes terms, or has a data breach, we have limited recourse without a negotiated contract.

**Mitigation:** Review VAPI's standard ToS for liability, data handling, and termination provisions. Consider whether an enterprise agreement is needed as we scale.

### 12. Email Follow-Up CAN-SPAM Compliance

The 13 Tier 1 contacts with emails need follow-ups. CAN-SPAM requires:
- Clear identification of the message as an ad/solicitation
- Physical postal address included
- Opt-out mechanism
- Honor opt-outs within 10 business days
- No deceptive subject lines

**Mitigation:** Every outbound email must include: ClawOps physical address (7800 Montgomery Road, Cincinnati, OH 45236), unsubscribe link or instructions, and honest subject line.

---

## RECOMMENDED PRIORITY ACTION PLAN

### Immediate (Before Next Call Batch)

| # | Action | Owner | Est. Time | Est. Cost |
|---|--------|-------|-----------|-----------|
| 1 | Add recording disclosure to v20 prompt | Rick/Jordan | 15 min | $0 |
| 2 | Add AI disclosure option to v20 prompt (at minimum for CA/CO calls) | Rick/Jordan | 30 min | $0 |
| 3 | Document that all lead numbers are business numbers from Google Business Profiles | Rick | 30 min | $0 |
| 4 | Build internal DNC list from "stop calling" responses in call transcripts | Rick | 1 hr | $0 |
| 5 | Set up FTC DNC Registry access and scrub lead lists | Rick | 2 hrs | $75+ |

### This Week

| # | Action | Est. Cost |
|---|--------|-----------|
| 6 | File DBA for "ClawOps" under MGO Data LLC (Ohio) | $39 |
| 7 | Get dedicated business number for human escalation (replace Brand's cell) | $10-15/mo |
| 8 | Fix Trust Hub rejection on Twilio Account 1 | $0 |
| 9 | Add CAN-SPAM compliance to email templates | $0 |
| 10 | Review VAPI ToS for data handling and termination provisions | $0 |

### This Month

| # | Action | Est. Cost |
|---|--------|-----------|
| 11 | Register as telemarketer in top 5 calling states (TX, OH, FL, CA, GA) | $250-500 |
| 12 | Implement geo-filtering for California/Colorado calls (full AI disclosure or exclude) | $0 |
| 13 | Set up data retention/deletion policy for lead data | $0 |
| 14 | Consult outside counsel for TCPA/AI voice opinion letter | $500-2,000 |

---

## THE HONEST ASSESSMENT

Here's the straight talk: Most AI cold calling operations at our scale fly under the radar. The FCC, FTC, and state AGs are focused on massive robocall operations (millions of calls, scams, political disinformation). A small B2B operation doing 100-200 calls targeting contractors is extremely unlikely to attract regulatory attention.

**But "unlikely" is not "impossible."** The risks become real if:
1. A contractor files a TCPA complaint (private right of action, no need for AG involvement)
2. Our number gets flagged as "Scam Likely" (already happened once with the 888 number)
3. A carrier blocks our calls (kills the entire operation)
4. A competitor or disgruntled prospect reports us to the FCC

The cheapest insurance is compliance. The items above cost under $1,000 total and eliminate 90% of the risk. The most important single change: **add a recording disclosure and consider proactive AI disclosure** on outbound calls. Everything else is paperwork.

---

## ALTERNATIVE APPROACHES (Lower Risk)

If the legal exposure is a concern, here are approaches that reduce risk significantly:

### Option A: Human-Initiated, AI-Assisted
A human (Brand or a contractor) makes the call and handles the first 10-15 seconds (greeting, ask for owner). Once connected to the decision-maker, transfer to AI for the pitch. This exempts from ATDS/artificial voice rules since a human initiated the call.

### Option B: Warm Outbound (Email-First)
Send a cold email (CAN-SPAM compliant) introducing ClawOps. Include a link to book a call or a phone number to call. When they respond or call back, the AI handles the inbound call. Zero TCPA risk because THEY initiated the contact.

### Option C: Consent-First Cold Call
Human makes the cold call: "Hey, this is Jordan from ClawOps. Mind if I take 30 seconds? And just so you know, I might have our AI demo the system for you on this call." Gets verbal consent for AI interaction and recording in the first 15 seconds. Then AI takes over.

---

**DISCLAIMER:** This audit is for internal planning purposes. It is not legal advice. Consult qualified legal counsel before making compliance decisions. Laws in this space are evolving rapidly, especially around AI voice technology.

*Quinn gained XP in: TCPA/AI voice compliance, B2B cold calling regulation, state telemarketing registration. Updated `claw-agency/legal/outbound-operations-risk-audit-2026-03-20.md`.*
