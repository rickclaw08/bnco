# Contract Update Notes - March 1, 2026

**Prepared by:** Quinn (CLO)  
**Purpose:** Review existing contract templates against new pricing ($2,500 setup + $497/mo) and AI Voice Receptionist compliance requirements.

---

## Summary

Reviewed all 18 templates in `claw-agency/legal/contracts/`. Several need pricing updates, and multiple need AI-specific clause additions now that the AI Voice Receptionist is a primary product.

---

## Contracts Requiring Pricing Updates

### 1. `sow-ai-receptionist.md`
**Status:** OUTDATED PRICING  
**Current:** Default pricing listed as "$2,000 setup + $300/month" (line 123)  
**Required:** Update default pricing to "$2,500 setup + $497/month"  
**Also update:**
- Monthly fee references throughout
- SLA credit calculations (currently based on percentage of "that month's fee" - math still works, just verify)
- Included SMS (currently 500/month at $0.03 overage - verify this still matches cost structure at new price point)
- Add-on pricing table: confirm priority support ($150/mo), additional language ($100/mo), and revision pricing ($150/rev) are still appropriate at the higher price tier

### 2. `msa-template.md`
**Status:** USES PLACEHOLDERS - OK  
**Current:** Uses `$[SETUP_FEE]` and `$[MONTHLY_FEE]` placeholders  
**Action:** No pricing change needed. Placeholders are correct approach.  
**Recommendation:** Add a "Default Pricing" reference note similar to the SOW, so sales team knows what to fill in.

### 3. `service-agreement-v2.md`
**Status:** CURRENT PRICING - GOOD  
**Current:** Already shows "$2,500 setup + $497/month" (line 20)  
**Also shows:** Agency White-Label at "$5,000 setup + $100/month per active seat"  
**Action:** No pricing change needed. This is the newest template.

### 4. `pilot-agreement.md`
**Status:** ALIGNED WITH NEW PRICING  
**Current:** Pilot at $1,250 setup + $249/month, auto-converts to $2,500 + $497/month  
**Action:** Pricing is correct and properly references the Standard Agreement conversion.

### 5. `retainer-agreement.md`
**Status:** INDEPENDENT PRODUCT - VERIFY  
**Current:** $5,000/month retainer for Fractional Automation Management  
**Action:** This is a different product (managed automation hours, not AI receptionist). Pricing is independent. However, verify if clients on the retainer who ALSO get AI receptionist should have bundled pricing documented.

### 6. `sprint-contract.md`
**Status:** USES PLACEHOLDERS - OK  
**Current:** Fee range $7,500-$15,000 for one-time sprint projects  
**Action:** No change needed. Sprint is project-based, not recurring.

### 7. Remaining Templates (No Pricing Issues)
- `msa-enterprise.md` - References SOW for pricing. OK.
- `service-agreement.md` (v1) - Should be deprecated in favor of `service-agreement-v2.md`
- `referral-agreement.md` - Referral commissions, not product pricing. Review commission rates.
- `results-guarantee.md` - Performance guarantees, pricing in SOW. OK.
- `proposal-template.md` - Template with fill-in pricing. OK.
- `project-sow.md` - Generic SOW template. OK.
- `independent-contractor.md` - Internal hiring, not client-facing. OK.
- `nda.md` / `nda-template.md` - No pricing. OK.
- `gdpr-dpa.md` - Data processing, no pricing. OK.
- `sow-agency-in-a-box.md` - Verify pricing for agency product.

---

## Contracts Requiring AI Voice Compliance Updates

### Priority Updates Needed

#### 1. `sow-ai-receptionist.md` - CRITICAL
- **Add:** Explicit AI disclosure requirement clause (reference TOS Section 5)
- **Add:** Recording consent configuration section (client responsibility for jurisdiction)
- **Add:** Prohibited use cases list (no professional advice, no sensitive data without BAA)
- **Add:** Human escalation path requirement (client must provide fallback contacts)
- **Add:** BIPA/biometric disclaimer
- **Add:** Emergency call protocol (what happens if someone calls 911-type situations)
- **Update:** Data retention terms to match TOS Section 5.3

#### 2. `msa-template.md` - HIGH
- **Add:** AI-specific indemnification clause (mirror TOS Section 6.4)
- **Add:** Data processing sub-processor disclosure (Twilio, OpenAI, cloud)
- **Add:** Voice data / biometric data disclaimer
- **Add:** Breach notification timeline (72 hours)
- **Add:** AI output disclaimer and limitation (mirror TOS Section 10)

#### 3. `pilot-agreement.md` - HIGH
- **Add:** AI disclosure and recording consent provisions (even for pilot, compliance is mandatory from day 1)
- **Add:** Conversion terms should reference full compliance onboarding checklist

#### 4. `service-agreement-v2.md` - MEDIUM
- **Add:** More detail on compliance requirements (currently very slim at ~2,600 bytes)
- **Add:** Reference to TOS and compliance guide
- **Add:** AI disclosure acknowledgment signature line

#### 5. `gdpr-dpa.md` - MEDIUM
- **Review:** Does it cover AI-specific processing activities?
- **Add:** Voice data processing description
- **Add:** Sub-processor list update (ensure Twilio, OpenAI are listed)
- **Add:** Data retention schedule specific to voice services

---

## Contracts to Deprecate

| Template | Reason | Replace With |
|----------|--------|-------------|
| `service-agreement.md` (v1) | Superseded by v2 | `service-agreement-v2.md` |
| `nda.md` | Appears to be older version | `nda-template.md` (newer, dated Feb 28) |

---

## New Contracts to Create

| Template | Purpose | Priority |
|----------|---------|----------|
| `hipaa-baa.md` | Business Associate Agreement for healthcare clients | HIGH - before any healthcare client goes live |
| `ai-voice-compliance-addendum.md` | Standalone addendum for AI voice-specific terms that can attach to any MSA | MEDIUM - simplifies onboarding |
| `client-onboarding-checklist.md` | Executable checklist (see compliance doc Section 4) | HIGH - operational necessity |

---

## Referral Agreement Commission Review

`referral-agreement.md` should be reviewed for:
- Commission rates appropriate for $2,500 + $497/month pricing
- Whether setup fee, monthly fee, or both generate referral commission
- Duration of commission payments (one-time vs. recurring for client lifetime)
- These details weren't visible in the grep scan - full review recommended

---

## Action Items

| # | Action | Owner | Priority | Deadline |
|---|--------|-------|----------|----------|
| 1 | Update `sow-ai-receptionist.md` default pricing to $2,500/$497 | Quinn/Legal | P0 | Before next client signs |
| 2 | Add AI compliance clauses to `sow-ai-receptionist.md` | Quinn/Legal | P0 | Before next client signs |
| 3 | Add AI indemnification to `msa-template.md` | Quinn/Legal | P0 | Before next client signs |
| 4 | Update `pilot-agreement.md` with compliance provisions | Quinn/Legal | P1 | Within 1 week |
| 5 | Create `hipaa-baa.md` template | Quinn/Legal | P1 | Before any healthcare client |
| 6 | Create `ai-voice-compliance-addendum.md` | Quinn/Legal | P1 | Within 2 weeks |
| 7 | Deprecate `service-agreement.md` v1 | Quinn/Ops | P2 | This month |
| 8 | Review referral commission structure for new pricing | Quinn/Jordan | P2 | This month |
| 9 | Bulk `service-agreement-v2.md` with more detail | Quinn/Legal | P2 | Within 2 weeks |
| 10 | Create `client-onboarding-checklist.md` | Quinn/Harper | P1 | Before next client signs |

---

*[Quinn] gained XP in regulatory compliance. Updated this file with contract gap analysis and pricing alignment findings.*
