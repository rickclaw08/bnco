# March 18 Full Day Analysis

## Summary
- **141 total calls** (25 burned opener + 116 good)
- **$21.67 total cost** ($18.37 good-opener only)
- **$0.15 avg cost/call**
- **30 actionable contacts extracted**

## Batches Sent
| Batch | Time (ET) | Calls | Cost | Prompt |
|-------|-----------|-------|------|--------|
| Batch 1 (ET morning) | 8:30 AM | 50 | $7.60 | v18 (first 25 had wrong opener) |
| Batch 3 (CT morning) | 9:30 AM | 41 | $5.98 | v18 |
| Batch 2+5 (ET afternoon + MT morning) | 10:33 AM | 50 | $8.09 | v18.1 |

**Note:** Batch 1 first 25 leads burned - opened with inbound greeting "Clawhops, this is Jordan. How can I help?" instead of "Hey."

## Funnel (Good Opener Calls Only - 116)
```
116 calls
 -> 106 humans reached (91%)
 -> 23 past gatekeeper (22% of humans)
 -> 13 actionable with info (12% of humans)
 -> 1 owner conversation (Four Seasons - 53 turns)
```

## Disposition Breakdown (116 good-opener calls)
| Disposition | Count | % | Cost |
|-------------|-------|---|------|
| Voicemail | 1 | 0.9% | $0.04 |
| No Answer | 3 | 2.6% | $0.00 |
| No Connect | 2 | 1.7% | $0.01 |
| IVR Dead End | 4 | 3.4% | $0.47 |
| Quick Hangup (3-5t) | 24 | 20.7% | $1.48 |
| Quick Exit (6-7t) | 17 | 14.7% | $1.84 |
| Gatekeeper Wall (short) | 12 | 10.3% | $1.32 |
| Gatekeeper Wall (deep) | 30 | 25.9% | $6.84 |
| Gatekeeper PASS | 10 | 8.6% | $3.23 |
| INFO EXTRACTED | 12 | 10.3% | $2.88 |
| OWNER CONVERSATION | 1 | 0.9% | $0.25 |

## Model Behavior Issues
- **Filler words: 114 instances** in 45 calls (0.8/call avg) - WORSE on v18.1 (1.04/call) vs v18 (0.66/call)
- **Identity breaks: 15 calls** - Jordan said "with Claw Ops" during customer persona
- **Stutters: 2 calls** (improved from batch 3)
- **AI detected: 10 calls** - prospects identified Jordan as AI/bot

## v18.1 vs v18 Comparison
| Metric | v18 (Batch 1+3) | v18.1 (Batch 2+5) |
|--------|-----------------|-------------------|
| Fillers/call | 0.68 | 1.04 |
| Stutter fix | Multiple | 0 |
| Gatekeeper pass rate | ~20% | ~24% |

**Conclusion:** v18.1 fixed stutters but fillers got worse. The filler word problem is a GPT-4.1 model behavior, not prompt-fixable. Need VAPI-side filtering or model change.

## Extracted Contacts

### Tier 1: Email Extracted (13)
1. Redcap - Owner: John Smith - jsmith@redcapnow.com
2. J&W Heating - Owner: Brent Martler - info@jandwheatingandair.com
3. Royal Air - Owner: George - royalairtx@gmail.com
4. Keefe's - Owner: Keith Jitter - info@keefes.com
5. Summit HCKC - Owner: Brenda - info@summithckc.com
6. Champion AC - service@championac.com
7. Semperfi Heating - Owner: Jesse Keenan - customercare@semperfiheatingcooling.com
8. Same Day Utah - Owner: Sean - contact@samedayutah.com
9. Call Doctor Fixit - info@calldoctorfixit.com
10. Gettle - info@gettle.com
11. Horn HVAC - marketing@hornhvac.com
12. Burke's AC - burkesmarketing@burkes.com
13. John Moore Services - Owner: Claire Ballenger - assistance@johnmooreservices.com

### Tier 2: Owner Name, No Email (6)
1. Four Seasons HVAC (Chicago) - Owner: John - +17732192190
2. Strand Brothers - Owner: Ashley Deeper - +15125986625
3. 1st Choice - Owner: Jason - +17203274525
4. Plumbing (Nathaniel) - +18133030052 (Available Tuesdays 8 AM)
5. Aurora Plumbing - Owner: Philip - +13032224289
6. Boise - Owner: Bob - +12082040357

### Tier 3: Callback Left (11)
Gem Plumbing, Service Experts Fort Worth, CPI Plumbing, Gettle, Parker & Sons, Estes/Giovanni, Texas Quality Plumbing, Logan Services, James River AC, JP Electrical, Madison Plumbing

## Issues to Fix Before Tomorrow
1. **Filler words** - Not fixable via prompt. Need VAPI fillerDetection setting or model swap.
2. **Identity breaks** - Jordan says "Jordan with Claw Ops" when pressed. Identity rule not strong enough.
3. **AI detection** - 10/116 calls (8.6%). Prospects catching on. Consider shorter conversations or faster pivot to pitch.
4. **Second halves** - Batches 2 and 5 still have 25 leads each (50 total) unsent. Plus batches 4, 6, 7, 8 not started.

## Remaining Leads
- Batch 2 second half: 25 leads
- Batch 5 second half: 25 leads  
- Batch 4 (MT afternoon): 50 leads
- Batch 6 (PT morning): 50 leads
- Batch 7 (CT afternoon): 50 leads
- Batch 8 (PT afternoon): 50 leads
- **Total remaining: ~300 leads**
