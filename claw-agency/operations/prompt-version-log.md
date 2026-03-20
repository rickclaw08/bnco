# Prompt Version Log

Track every prompt change with hypothesis, baseline, and results. Minimum 100 calls before measuring. One change at a time when possible.

---

## v17 - 2026-03-15
What changed: Full rewrite. Cut from ~4,500 to ~2,000 words. Added Voss mirroring/labeling, micro-commitment chain, two-path close, vocabulary exclusion. Hard 30-word response limit.
Hypothesis: Shorter prompt = faster responses, data-backed techniques = higher conversion
Baseline (v16.5): No structured measurement
Result: 360+ calls, 0 demos, 0 closes. ~22% gatekeeper pass rate, 8.6% AI detection.
Decision: Iterate

## v18.1 - 2026-03-18
What changed: IVR ZIP code handling, name recognition fixes, recording disclosure added
Hypothesis: Fix technical failures (IVR stuck, name tracking bugs)
Baseline (v17): 49 calls stuck in IVR systems
Result: Not measured independently (merged into v20 quickly)
Decision: Merged into v20

## v20 - 2026-03-20
What changed: 60% size reduction from v18.1. 4-step flow. "How have you been?" opener. Recording disclosure mid-sentence. Inbound call handling added. Demo line references.
Hypothesis: Shorter = faster, data-backed opener (6.6X from Gong) = better engagement
Baseline (v18.1): 0 demos over ~200 calls
Result: 55 calls on Mar 19 before switch, then deployed. Not enough data yet.
Decision: Superseded by v21 same day based on Claude Code audit

## v21 - 2026-03-20
What changed: 12 fixes from structured audit:
1. Jordan renamed to Cole (eliminate CRO/VAPI persona collision)
2. Active listening removed (was triggering VAPI interruption detection)
3. Binary close ("Tuesday at 10 or Thursday at 4") replaces yes/no ask
4. Pitch compressed to 35 seconds (was 57, median owner bails at 74s)
5. Zip code urgency in Step 4 close
6. Founding member pricing urgency added
7. Rule contradictions fixed (removed banned words from step scripts)
8. Niche job values on single unbroken lines
9. "I'll think about it" uses Voss label + binary pivot
10. "demo" replaced with "10-minute call" throughout
11. After-hours challenge question for "we're fine" pushback
12. Context-first FIRST MESSAGE section

Hypothesis: 35s pitch + binary close + urgency = first demo booking. Active listening removal = lower AI detection rate.
Baseline (v20): 0 demos, 0 closes, 8.6% AI detection, 74s median owner conversation
Result: PENDING - needs VAPI credits reload + 100 calls
Decision: PENDING
