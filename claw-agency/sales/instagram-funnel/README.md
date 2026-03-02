# Instagram Funnel: Complete Strategy Overview

## Funnel Architecture

```
Instagram Content (pain-point posts about missed calls)
        |
        v
CTA: "DM me DEMO to hear it yourself"
        |
        v
Lead DMs "DEMO" on Instagram
        |
        v
DM #1: Immediate response with phone number (888) 457-8980
        |
        v
Lead calls the AI demo line
        |
       / \
      /   \
     v     v
 Called     Did Not Call
   |            |
   v            v
 DM #2:      DM #3:
 Qualify     Nudge to call
   |            |
   v            v
 Qualified?  Responds?
   |            |
  / \          / \
 v   v        v   v
Yes  No     Yes  No
 |    |      |    |
 v    v      v    v
DM#4: Book  Pass  DM#4  DM#5
 Page               |
   |                v
   v             Final
theclawops.com   value-add
  /book/          (cold)
   |
   v
Form submission
   |
   v
Google Sheet notification
   |
   v
Personal follow-up call within 24h
   |
   v
Close at founding rate ($1,997)
or standard ($2,500 + $497/mo)
```

## Assets Created

| Asset | Location | Status |
|-------|----------|--------|
| Landing page (theclawops.com/book/) | `website/book/index.html` | Ready to deploy |
| DM templates (5-message sequence) | `sales/instagram-funnel/dm-templates.md` | Ready to use |
| Google Form backup specs | `sales/instagram-funnel/google-form-backup.md` | Needs manual creation |
| Qualification criteria | `sales/instagram-funnel/qualification-criteria.md` | Ready to use |
| This overview | `sales/instagram-funnel/README.md` | You are reading it |

## Deployment Checklist

- [ ] Deploy `website/book/index.html` to theclawops.com (git push to main)
- [ ] Create Google Form from specs in `google-form-backup.md`
- [ ] Create Google Sheet for responses
- [ ] Deploy Google Apps Script web app
- [ ] Copy Apps Script URL into `book/index.html` (replace `YOUR_GOOGLE_APPS_SCRIPT_URL`)
- [ ] Re-deploy website with the updated script URL
- [ ] Test the form submission end-to-end
- [ ] Set up DM automation or save templates for manual use
- [ ] Update Instagram bio with demo phone number and/or form link
- [ ] Create 3-5 Instagram posts about missed calls with "DM DEMO" CTA

## Key Metrics to Track

- **DMs received** per post (measures content effectiveness)
- **Demo calls made** per DM (measures DM #1 conversion)
- **Form submissions** per demo call (measures product-to-booking conversion)
- **Close rate** from form submission (measures sales effectiveness)
- **Revenue per lead** (total revenue / total DMs received)

## Competitor Analysis Reference

Wyatt Roderick's funnel for comparison:
- Trigger word: "Training"
- Qualification: Asks liquid cash ($500 to $5K+), experience level, motivation
- Target: People who want to start AI agencies
- Close: 1-on-1 sales call

Our funnel differences:
- Trigger word: "DEMO" (action-oriented, implies trying the product)
- Qualification: Business type, call volume, missed-call pain (outcome-oriented)
- Target: Contractors actively losing money to missed calls
- Close: Phone demo first, then booking form, then personal follow-up
- Key advantage: Our product demos itself. Their product requires explanation. Ours lets the lead experience the value before any sales conversation happens.

## Pricing Strategy (from DMs)

- **Lead with founding rate:** $1,997 one-time. No monthly. Creates urgency ("limited spots").
- **If founding spots are gone:** $2,500 setup + $497/month.
- **Never discount.** If someone pushes back on price, reframe with ROI math instead.
- **ROI framing:** "If you miss 2 calls a week at $500/job, that is $4,000/month in lost revenue. The AI costs less than one missed call."
