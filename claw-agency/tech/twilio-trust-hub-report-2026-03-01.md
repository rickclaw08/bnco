# Twilio Trust Hub - Primary Customer Profile Report

**Date:** 2026-03-01
**Author:** Ethan (CTO)
**Status:** CRITICAL BLOCKER - ACTION REQUIRED (Console only)
**Priority:** P0 - Voice calling is fully disabled

---

## Executive Summary

Voice calling on our Twilio account is **disabled** (Error 32005). Twilio requires an approved **Primary Customer Profile** before voice will be re-enabled. The previous profile was noncompliant due to incorrect business data and has been deleted. A new profile **must be created via the Twilio Console** - the API blocks Primary Customer Profile creation.

---

## Current Account State

| Item | Value |
|------|-------|
| Account SID | [REDACTED-RICK-SID] |
| Account Type | Full (not trial) |
| Account Status | Active |
| Balance | $20.00 |
| Phone Number | +1 (702) 728-4638 |
| Phone Status | in-use, voice/sms/mms capable |
| Voice URL | https://clawops-receptionist.fly.dev/voice/incoming |
| Voice Calling | **DISABLED** (Error 32005) |
| Verified Caller ID | +15138506496 |

## Root Cause

Twilio disabled voice calling because the account lacks an approved Primary Customer Profile. This is a Twilio Trust Hub requirement - they will not enable voice without it.

The Twilio error 32005 documentation states:
> "Your account requires an approved Primary Customer Profile. Please create a Primary Customer Profile to enable Voice calling through Trust Hub."

---

## What Was Found (Old Profile)

A previous Primary Customer Profile existed (SID: `BUeecca2836e8b9d49574796a315a5efcb`) with the following problems:

### Problems with the Old Profile:

1. **Business Name was wrong:** Listed as "MGO Data" instead of "ClawOps"
2. **Business Type was wrong:** Listed as "Limited Liability Corporation" instead of "Sole Proprietorship"
3. **business_registration_identifier field was invalid:** Value "EIN" triggered Error 22215 ("The Business Registration Type is invalid")
4. **Profile was stuck in "in-review" status** but evaluation showed **noncompliant**

### Old Profile Evaluation Results:

| Requirement | Status |
|-------------|--------|
| Business Information | FAILED (invalid registration type) |
| Authorized Representative #1 | PASSED |
| Authorized Representative #2 | PASSED |
| Physical Business Address | PASSED |

### Action Taken:

I **deleted** the old noncompliant profile and all associated entities (end users, supporting documents) to start fresh. The slate is clean.

---

## What's Required for the New Profile

Based on the Twilio Policy (`RN6433641899984f951173ef1738c3bdd0` - "Primary Customer Profile of type Business"), these are the required components:

### 1. Business Information (End User)
| Field | Required Value |
|-------|---------------|
| business_name | ClawOps |
| business_type | Sole Proprietorship |
| business_registration_identifier | **MUST USE VALID VALUE** (see note below) |
| business_registration_number | Valid EIN or SSN-based identifier |
| business_identity | isv_reseller_or_partner |
| business_industry | ONLINE (or appropriate value) |
| website_url | https://theclawops.com |
| business_regions_of_operation | USA_AND_CANADA |
| social_media_profile_urls | (optional but recommended) |

**CRITICAL NOTE on `business_registration_identifier`:** The old profile used "EIN" which Twilio rejected as invalid. The valid values are likely from a specific enum that Twilio does not expose in their API schema (just says "String"). You MUST select the correct value from the **Twilio Console dropdown** during profile creation. Common valid values may include things like "DUNS", "GIIN", "LEI", etc. For a Sole Proprietorship, you may need to use a different identifier entirely.

### 2. Authorized Representative #1 (Required)
| Field | Value |
|-------|-------|
| first_name | Brandon |
| last_name | Liao |
| email | rickclaw08@gmail.com |
| phone_number | +15138506496 |
| business_title | CEO |
| job_position | CEO |

### 3. Authorized Representative #2 (Required per policy)
Need a second authorized rep. Can potentially use the same person with a different title or another team member.

### 4. Physical Business Address (Supporting Document)
A US business address must be provided. This gets created as a Twilio Address resource and linked as a supporting document.

---

## WHY This Can't Be Done Via API

When I attempted to create a new Primary Customer Profile via the Trust Hub API:

```
POST https://trusthub.twilio.com/v1/CustomerProfiles
```

Twilio returned:
```json
{
  "code": 400,
  "message": "This operation is restricted via API for Primary Customer Profiles. Use Twilio Console instead."
}
```

**Primary Customer Profiles can ONLY be created through the Twilio Console UI.** The API supports Secondary Business Profiles and other trust products, but not the Primary one.

---

## Step-by-Step Console Instructions

### Steps to Complete (ALL via browser at console.twilio.com):

1. **Go to:** https://console.twilio.com/us1/account/trust-hub/customer-profiles
2. **Click "Create a Customer Profile"** (or similar button)
3. **Fill in Business Information:**
   - Business Name: **ClawOps**
   - Business Type: **Sole Proprietorship**
   - Business Registration ID Type: **Select from dropdown** (try "EIN" from the dropdown, or if not available, select whatever matches - the dropdown will show valid options)
   - Business Registration Number: A valid number matching the ID type
   - Business Identity: ISV/Reseller or Partner
   - Industry: Online/Technology
   - Website: https://theclawops.com
   - Regions: USA and Canada
4. **Add Authorized Representative #1:**
   - Name: Brandon Liao
   - Email: rickclaw08@gmail.com
   - Phone: +15138506496
   - Title: CEO
5. **Add Authorized Representative #2:**
   - A second authorized rep is required by policy
   - Could use: Rick Claw, rickclaw08@gmail.com, +17027284638, CTO
6. **Add Physical Business Address:**
   - Enter a valid US business address
7. **Submit for Review**

### After Submission:
- Twilio reviews the profile (typically 1-3 business days)
- Once approved, voice calling should automatically re-enable
- Monitor status at the Trust Hub dashboard

---

## Additional Concerns

### Account May Be Flagged
The error 32005 docs mention two possible causes:
1. Missing Primary Customer Profile (confirmed)
2. Account flagged for suspicious activity

If completing the Trust Hub profile doesn't re-enable voice, you may need to:
- Check email (rickclaw08@gmail.com) for any Twilio security/compliance emails
- Contact Twilio support directly
- File a support ticket at https://support.twilio.com

### Incoming Calls Also Blocked
Error 32005 alerts show incoming calls to +17027284638 are also being rejected. This means prospects trying to call the demo number get nothing. Both inbound AND outbound voice are disabled.

### The $20 Balance
The account shows a $20 balance (up from the earlier $15.50 noted in TOOLS.md). The account type is "Full" (not trial), so this isn't a trial limitation.

---

## Timeline

| Date | Event |
|------|-------|
| 2026-02-28 14:29 | Account created |
| 2026-02-28 19:30 | Old Trust Hub profile created (with wrong data) |
| 2026-02-28 19:48 | First 32005 voice disabled alerts appear |
| 2026-03-01 00:07 | Last update to old profile entities |
| 2026-03-01 17:17 | Evaluation run: NONCOMPLIANT (invalid registration type) |
| 2026-03-01 17:18 | Old profile + entities deleted (clean slate) |
| 2026-03-01 17:18 | API creation attempt blocked ("Use Console instead") |

---

## Bottom Line

**Someone needs to log into the Twilio Console and create the Primary Customer Profile manually.** There is no API workaround. The form takes about 10 minutes. Until it's approved, zero voice calls work on our number - no demos, no inbound, no outbound. This is the #1 blocker for closing deals.

Console URL: https://console.twilio.com/us1/account/trust-hub/customer-profiles
