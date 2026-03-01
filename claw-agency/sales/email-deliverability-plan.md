# Email Deliverability Improvement Plan

**Author:** Jordan (CRO)
**Date:** 2026-02-26
**Status:** CRITICAL - Must implement before ANY further outreach

---

## 1. Bounce Pattern Analysis

### The Numbers (All Three Batches)

| Batch | Date | Sent | Bounced/Failed | Bounce Rate | Notes |
|-------|------|------|----------------|-------------|-------|
| Batch 1 | Feb 23 | 12 | 5 | 42% | Mixed industries (dental, insurance, real estate, accounting) |
| Batch 2 | Feb 23 | 10 | 8 | 80% | Same prospects as batch 1 (follow-ups) |
| Batch 3 | Feb 25 | 16 sent, 14 failed | 14 of 30 | 47% (of total list) | Home services vertical. Hit Gmail daily limit after 16 sends |

**Overall: ~27 bounces/failures out of ~36 attempts = 75% failure rate across batches.**

### Root Causes Identified

**Problem 1: Guessed Emails That Don't Exist (Primary Issue)**
Every email in our prospect lists was GUESSED using the pattern info@domain.com or service@domain.com. No verification was done before sending. Of the 14 failed batch 3 emails I investigated:

- **4 had the WRONG email prefix** - Real emails were different:
  - AC Electric Austin: guessed info@ but real email is **acelec@gmail.com** (a Gmail, not their domain)
  - Watt Masters: guessed info@ but real email is **office@wattmasters.com**
  - Flow Plumbing: guessed info@ but real email is **service@flowplumbing.com**
  - Encantada Roofing: guessed info@ but real email is **service@encantadaroofing.com**

- **6 had DEAD/NON-EXISTENT DOMAINS** - The domain itself doesn't resolve:
  - romancavalryac.com - NO DNS records at all
  - majesticairconditioningandheating.com - NO DNS records at all
  - integrityhvaccharlotte.com - NO DNS records at all
  - geraldgriffinheating.com - NO DNS records at all
  - hogueservices.com - NO DNS records at all
  - professorplumb.com - Domain is FOR SALE on HugeDomains

- **1 had a broken/abandoned website:**
  - augerprosplumbing.com - Redirects to login page, no public site, no MX records

- **3 were plausible but unverified** (domain has MX records but no public email):
  - sewerstuds.com - Has Google MX but no email listed on site
  - reevesfamilyplumbing.com - Has professional MX, service@ is plausible
  - dialoneelectrical.com - Has NetSol MX, info@ could work

**Problem 2: No MX Record Verification**
43% of the failed domains (6/14) have ZERO MX records, meaning they literally cannot receive email. A simple DNS check would have eliminated these before sending.

**Problem 3: Fabricated/Outdated Prospect Data**
The prospect list appears to have been generated (likely by AI or a scraping tool) without verifying that the businesses actually exist at those domains. At least 6 domains are completely dead, and 1 is a parked domain for sale. This suggests the prospect data source is unreliable.

**Problem 4: Gmail Sending Limits**
Batch 3 hit Gmail's daily sending limit after only 16 emails. Gmail (even with Google Workspace) has strict limits:
- Free Gmail: ~500/day
- Google Workspace: ~2,000/day
- But NEW accounts or accounts with low sending history get throttled much sooner
- Sending to many invalid addresses compounds the problem (Google penalizes high bounce rates)

---

## 2. Email Verification Process (BEFORE Sending)

### Step 1: DNS/MX Record Check (FREE, 30 seconds per domain)
Before adding ANY prospect to a send list, run:
```bash
dig +short MX domain.com
```
- If **no MX records**: REMOVE immediately. Domain cannot receive email.
- If **MX records exist**: Proceed to Step 2.

### Step 2: Website Verification (FREE, 2-3 min per prospect)
Visit the actual website and check:
1. Contact page (look for mailto: links)
2. Footer (often contains email)
3. About/Team page
4. Privacy policy or terms (sometimes has admin email)

If the website is down, parked, or redirects to a login page: REMOVE.

### Step 3: Email Verification Service (Low Cost)
For emails that pass Steps 1-2 but were found on the website (or are plausible guesses with MX records), run through a verification service:

**Recommended Free/Cheap Options:**
- **Hunter.io** - 25 free verifications/month. Also has email finder (finds real emails from domains). $0 to start.
- **ZeroBounce** - 100 free monthly credits. Checks deliverability, spam traps, catch-all detection.
- **NeverBounce** - Pay-as-you-go at $0.003/email after free trial. Real-time verification API.
- **MillionVerifier** - Cheapest bulk option at $0.29/1,000 emails. Good for larger lists.
- **Reoon Email Verifier** - 100 free/month. Has bulk upload.

**Best for our volume (30-50 prospects/batch):**
Hunter.io free tier (25/month) + ZeroBounce free tier (100/month) = 125 free verifications/month. That's enough for our current pace.

### Step 4: Catch-All Detection
Some domains accept ALL email addresses (catch-all). These look "verified" but may silently discard or spam-filter your message. Hunter.io and ZeroBounce flag these. Treat catch-all domains as lower priority.

---

## 3. Gmail Sending Best Practices

### Rate Limits and Warm-Up
- **Never send more than 20 cold emails/day** from a new or low-volume Gmail account
- Increase by 5-10/day per week (warm-up schedule):
  - Week 1: 10-15/day
  - Week 2: 20-25/day
  - Week 3: 30-40/day
  - Week 4+: 50/day max (stay well under Gmail's technical limit)
- **Space emails apart**: Minimum 45-60 seconds between sends (we were doing this in batch 3, good)

### Avoid Spam Triggers
- Don't use the same exact subject line for every email (we did: "Quick question about missed calls at [Company]")
- Personalize the body beyond just swapping the company name
- Don't include more than 1-2 links per email
- Avoid spam words: "free," "guaranteed," "act now," "limited time"
- Set up SPF, DKIM, and DMARC records for the sending domain (if using custom domain in the future)

### Sender Reputation Protection
- **Keep bounce rate under 2%** (industry standard). We were at 42-80%. Google will throttle or suspend accounts that bounce this much.
- **Monitor for bounce-back emails** in the Gmail inbox after each batch
- If bounce rate exceeds 5% on any batch: STOP sending and investigate before continuing

### Consider a Dedicated Sending Domain
- Don't send cold outreach from rickclaw08@gmail.com (or any primary business email)
- Set up a separate domain (e.g., outreach.theclawops.com) with proper DNS records
- This protects the main domain's reputation if things go wrong
- Cost: ~$12/year for a domain + free Zoho or custom DNS setup

---

## 4. Updated Process (Going Forward)

### Pre-Send Checklist (MANDATORY for every prospect)

1. **Domain alive?** - Check if website loads (web_fetch or browser visit)
2. **MX records exist?** - `dig +short MX domain.com` must return results
3. **Real email found?** - Check contact page, footer, about page for actual email
4. **Email verified?** - Run through Hunter.io or ZeroBounce
5. **Not a catch-all?** - Verification service flags these

Only prospects that pass ALL 5 checks go on the send list.

### Prospect Sourcing Fix
The current approach of generating prospect lists with guessed emails needs to change:

**Better Sources:**
- **Google Maps + manual website check**: Search "[trade] near [city]", visit each site, find real contact info
- **Hunter.io Domain Search**: Input a company's domain, get verified employee emails
- **LinkedIn Sales Navigator**: Find actual decision-makers with real contact info (paid but high quality)
- **Yelp/BBB listings**: Often have verified business emails
- **Industry directories**: Trade-specific directories (e.g., HomeAdvisor, Angi for home services)

**The rule: If you can't find a real email on their website or through a verification service, they don't go on the list.** No more guessing info@whatever.com.

### Send Cadence
- Max 20 emails/day while warming up the Gmail account
- Send in batches of 5, spaced 3-5 minutes apart
- Monitor inbox for bounces after each batch of 5
- If more than 1 bounce in a batch of 5: STOP. Investigate remaining addresses before continuing.

### Tracking
After every send, log:
- Sent/bounced/delivered status (check Gmail for bounce notifications)
- Open tracking (if using a tool like Mailtrack)
- Reply tracking
- Weekly report on deliverability metrics

---

## 5. Verified Batch 3 Results Summary

Of the 14 failed emails from batch 3:

| Status | Count | Action |
|--------|-------|--------|
| VERIFIED - Email found on website and corrected | 4 | Ready to send |
| PLAUSIBLE - MX records exist, email not on site | 3 | Send with caution |
| DEAD DOMAIN - No DNS/MX records | 6 | REMOVE permanently |
| DEAD SITE - Parked/abandoned/broken | 1 | REMOVE permanently |

**Ready to send: 7 emails** (4 verified + 3 plausible)
**Remove from pipeline: 7 prospects** (dead domains/sites)

The verified list is saved to: `leads/batch3-verified-emails.json`

---

## 6. Immediate Action Items

1. **DO NOT send any more emails** until this verification process is in place
2. **Sign up for Hunter.io free tier** (25 verifications/month)
3. **Sign up for ZeroBounce free tier** (100 verifications/month)
4. **Run the 7 "ready to send" emails** through ZeroBounce before sending
5. **Set up a dedicated outreach domain** to protect the primary Gmail
6. **Re-verify ALL prospects** from batches 1 and 2 that didn't bounce (confirm they actually delivered and weren't silently dropped)
7. **Rebuild prospect sourcing process** - manual website verification for every lead, no more bulk-guessed emails

---

## Bottom Line

We burned sender reputation and wasted time because we guessed emails instead of verifying them. Nearly half our "prospects" had fake or dead domains. The fix is simple but non-negotiable: verify every email before it goes on a send list. The tools are free for our volume. There's no excuse to skip this step.
