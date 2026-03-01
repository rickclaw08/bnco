# Brand Management

- **Name:** brand-management
- **Version:** 0.1.0
- **Owner:** Victoria (CMO)
- **Description:** Maintain brand consistency across all channels, review outbound content for voice and visual alignment, and enforce ClawOps brand standards.

## Trigger Keywords

- "brand check"
- "review content"
- "is this on-brand"
- "brand guidelines"
- "brand voice"
- "brand review"
- "tone check"

## Prerequisites

- Brand guidelines (see references/brand-guidelines.md)
- Visual identity specs (see references/visual-identity.md)
- Tone examples (see references/tone-examples.md)

## Workflow

### Step 1: Identify What Needs Review

1. Determine the content type:
   - Blog post or article
   - Social media post
   - Email or newsletter
   - Marketing copy (landing page, ad, etc.)
   - Client-facing document
   - Internal communication going external
2. Note the target platform and audience
3. Gather the full content to review

### Step 2: Voice and Tone Check

Run through each checkpoint. Every item must pass.

**Mandatory Rules:**
- [ ] **No em dashes.** Search for " -- " and the unicode em dash character. Replace with commas, periods, colons, semicolons, or parentheses
- [ ] **No en dashes used as em dashes.** En dashes are only acceptable in number ranges (e.g., "pages 10-15")
- [ ] **Active voice.** Passive voice is acceptable only when the actor is genuinely unknown or irrelevant
- [ ] **No corporate jargon.** Flag and replace: "synergy," "leverage," "paradigm," "disrupt," "ecosystem," "holistic," "best-in-class," "cutting-edge," "world-class"
- [ ] **No buzzword bingo.** Phrases like "AI-powered" are fine sparingly, but avoid stacking them
- [ ] **Direct and pragmatic.** Every sentence should say something specific. Cut fluff

**Tone Markers (should feel like):**
- A smart colleague explaining something useful
- Confident but not arrogant
- Technical but accessible
- Honest about limitations
- Specific over vague ("saves 3 hours per week" not "dramatically improves efficiency")

**Tone Red Flags (should NOT feel like):**
- A press release
- A corporate memo
- An overly enthusiastic startup pitch
- A textbook
- Condescending or talking down

### Step 3: Messaging Alignment

1. Check that core value propositions are accurate:
   - ClawOps builds AI agent systems for businesses
   - Focus on practical automation that works today
   - Not hype, not vaporware, real solutions
2. Verify claims are supportable:
   - No "best in the industry" without evidence
   - No promises about outcomes we cannot control
   - Use "can" instead of "will" for potential benefits
3. Check consistency with existing published content:
   - Does this contradict anything we have said before?
   - Does it align with our positioning?
   - Is the product/service described accurately?

### Step 4: Visual Consistency (If Applicable)

For content with visual elements, check references/visual-identity.md:

1. **Colors:**
   - Primary: Dark navy background
   - Accent: #4ade80 (green)
   - Verify colors match the palette
2. **Typography:**
   - Check font usage matches guidelines
   - Heading hierarchy is consistent
3. **Logo usage:**
   - Proper spacing and placement
   - No distortion or unapproved modifications
4. **Imagery:**
   - Style matches brand aesthetic
   - No stock photo cliches (handshakes, pointing at screens)
   - Screenshots are clean and current

### Step 5: Platform-Specific Check

Verify content follows platform formatting rules:
- **Discord:** No markdown tables, use bullet lists, under 2000 chars per message
- **WhatsApp:** No headers (# syntax), use **bold** or CAPS for emphasis
- **Reddit:** Match subreddit tone, proper flair, no excessive self-promotion
- **Twitter/X:** Under 280 chars, no markdown
- **Email:** Responsive HTML, alt text on images, plain text fallback
- **Blog/Web:** Full markdown, proper heading hierarchy, meta descriptions

### Step 6: Generate Review Report

After completing the review, provide a structured report:

```
## Brand Review Report

**Content:** [title or description]
**Platform:** [target platform]
**Date:** [review date]

### Pass / Needs Revision

**Voice & Tone:**
- Em dash check: PASS/FAIL
- Jargon check: PASS/FAIL
- Active voice: PASS/FAIL
- Directness: PASS/FAIL
- Tone match: PASS/FAIL

**Messaging:**
- Value prop accuracy: PASS/FAIL
- Claims supportable: PASS/FAIL
- Consistency: PASS/FAIL

**Visual (if applicable):**
- Color palette: PASS/FAIL
- Typography: PASS/FAIL
- Logo usage: PASS/FAIL

**Platform Formatting:**
- Format rules: PASS/FAIL

### Issues Found
1. [Issue description and location]
2. [Issue description and location]

### Suggested Fixes
1. [Specific fix for each issue]
2. [Specific fix for each issue]

### Overall: APPROVED / NEEDS REVISION
```

### Step 7: Apply Fixes (If Requested)

1. Make the suggested revisions
2. Re-run the review checklist on the revised content
3. Confirm all checks pass
4. Deliver the approved content

## Quick Brand Check (Abbreviated)

For fast reviews when full process is not needed:

1. Search for em dashes and replace them
2. Read the first and last paragraphs for tone
3. Check for jargon and buzzwords
4. Verify the CTA is clear
5. Confirm platform formatting is correct
6. Approve or flag issues

## Brand Voice Quick Reference

**We are:** Pragmatic, direct, technical but accessible, honest, specific
**We are not:** Corporate, buzzwordy, hyperbolic, vague, condescending
**We say:** "Our agents handle X so you can focus on Y"
**We do not say:** "Our cutting-edge AI solution revolutionizes your workflow paradigm"

## Common Fixes

| Problem | Fix |
|---------|-----|
| Em dash used | Replace with comma, period, colon, or parentheses |
| "Leverage" | Use "use" or "take advantage of" |
| "Synergy" | Describe the specific benefit instead |
| "Best-in-class" | Remove or replace with specific evidence |
| Passive voice | Restructure: "X was done by Y" becomes "Y did X" |
| Vague benefit | Add specifics: numbers, timeframes, concrete outcomes |

## Reference Files

| File | Purpose |
|------|---------|
| references/brand-guidelines.md | Complete brand guidelines document |
| references/visual-identity.md | Colors, typography, logo usage, imagery |
| references/tone-examples.md | Before/after examples of on-brand vs off-brand writing |
