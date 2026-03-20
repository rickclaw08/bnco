#!/usr/bin/env python3
"""
ClawOps Call Improvement System - Daily Report Generator
Runs the full CIS pipeline: score calls -> analyze patterns -> generate daily report.

Usage:
    python3 generate-report.py                         # Today's report
    python3 generate-report.py --date 2026-03-19       # Specific date
    python3 generate-report.py --from 2026-03-18 --to 2026-03-19  # Date range
    python3 generate-report.py --skip-scored            # Don't re-score existing calls

Can be imported:
    from generate_report import generate_daily_report
    generate_daily_report(date="2026-03-19")
"""

import os
import sys
import csv
from datetime import datetime, timezone
from pathlib import Path

SALES_DIR = Path(__file__).resolve().parent
REPORTS_DIR = SALES_DIR / "reports"

# Ensure the score/analyze modules are importable
sys.path.insert(0, str(SALES_DIR))


# ---------------------------------------------------------------------------
# Import scoring and analysis modules
# ---------------------------------------------------------------------------
def _import_modules():
    """Import sister modules, handling the hyphenated filenames."""
    import importlib.util

    score_spec = importlib.util.spec_from_file_location(
        "score_calls", SALES_DIR / "score-calls.py"
    )
    score_mod = importlib.util.module_from_spec(score_spec)
    score_spec.loader.exec_module(score_mod)

    analyze_spec = importlib.util.spec_from_file_location(
        "analyze_patterns", SALES_DIR / "analyze-patterns.py"
    )
    analyze_mod = importlib.util.module_from_spec(analyze_spec)
    analyze_spec.loader.exec_module(analyze_mod)

    return score_mod, analyze_mod


# ---------------------------------------------------------------------------
# Report assembly
# ---------------------------------------------------------------------------
def build_daily_report(scored_rows, pattern_report, date_label, total_cost):
    """Combine scoring summary + pattern analysis into a single daily report."""
    lines = []
    lines.append(f"# ClawOps Daily CIS Report - {date_label}")
    lines.append(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M ET')}")
    lines.append("")

    # --- Executive Summary ---
    total = len(scored_rows)
    if total == 0:
        lines.append("## No calls found for this period.")
        return "\n".join(lines)

    total_scores = [r["total_score"] for r in scored_rows]
    avg_score = sum(total_scores) / total

    # Score buckets
    excellent = sum(1 for s in total_scores if s >= 20)
    good = sum(1 for s in total_scores if 15 <= s < 20)
    mid = sum(1 for s in total_scores if 10 <= s < 15)
    poor = sum(1 for s in total_scores if s < 10)

    # Dispositions
    from collections import Counter
    disp_counts = Counter(r.get("disposition", "UNKNOWN") for r in scored_rows)

    # Connect rate (connect >= 3)
    connected = sum(1 for r in scored_rows if r.get("connect", 0) >= 3)
    connect_rate = connected / total * 100

    # Revenue potential
    hot_leads = disp_counts.get("DEMO_BOOKED", 0) + disp_counts.get("SALE", 0)
    warm_leads = disp_counts.get("PITCH_DELIVERED", 0) + disp_counts.get("INFO_EXTRACTED", 0)

    lines.append("## Executive Summary")
    lines.append("")
    lines.append(f"| Metric | Value |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Total Calls | {total} |")
    lines.append(f"| Avg CIS Score | {avg_score:.1f}/25 |")
    lines.append(f"| Human Connect Rate | {connect_rate:.0f}% |")
    lines.append(f"| Total Cost | ${total_cost:.2f} |")
    lines.append(f"| Cost Per Call | ${total_cost/total:.3f} |")
    lines.append(f"| Hot Leads (Demo/Sale) | {hot_leads} |")
    lines.append(f"| Warm Leads (Pitch/Info) | {warm_leads} |")
    lines.append("")

    # --- Score Distribution ---
    lines.append("## Score Distribution")
    lines.append("")
    lines.append("```")
    ex_bar = "#" * excellent
    gd_bar = "#" * good
    md_bar = "#" * mid
    pr_bar = "#" * poor
    lines.append(f"  Excellent (20-25): {ex_bar} {excellent}")
    lines.append(f"  Good     (15-19): {gd_bar} {good}")
    lines.append(f"  Mid      (10-14): {md_bar} {mid}")
    lines.append(f"  Poor     ( 5-9):  {pr_bar} {poor}")
    lines.append("```")
    lines.append("")

    # --- Top Failures (from scored data directly) ---
    lines.append("## Top Call Failures")
    lines.append("")
    failure_reasons = Counter()
    fixes = {}
    for r in scored_rows:
        reason = r.get("failure_reason", "").strip()
        fix = r.get("fix_suggestion", "").strip()
        if reason:
            failure_reasons[reason] += 1
            if fix and reason not in fixes:
                fixes[reason] = fix

    for reason, count in failure_reasons.most_common(5):
        lines.append(f"- **{reason}** ({count}x)")
        if reason in fixes:
            lines.append(f"  - Fix: {fixes[reason]}")
    if not failure_reasons:
        lines.append("No failure reasons recorded.")
    lines.append("")

    # --- Recommended Prompt Changes ---
    lines.append("## Recommended Prompt Changes")
    lines.append("")
    recommendations = derive_prompt_recommendations(scored_rows, disp_counts, connect_rate, avg_score)
    if recommendations:
        for i, rec in enumerate(recommendations, 1):
            lines.append(f"{i}. **[{rec['priority']}]** {rec['recommendation']}")
            lines.append(f"   _Evidence: {rec['evidence']}_")
            lines.append("")
    else:
        lines.append("No urgent recommendations at this time.")
    lines.append("")

    # --- Full Pattern Analysis ---
    lines.append("---")
    lines.append("")
    lines.append(pattern_report)

    return "\n".join(lines)


def derive_prompt_recommendations(scored_rows, disp_counts, connect_rate, avg_score):
    """Derive actionable prompt change recommendations from scored data."""
    recs = []
    total = len(scored_rows)
    if total == 0:
        return recs

    # 1. Low connect rate
    if connect_rate < 40:
        recs.append({
            "priority": "HIGH",
            "recommendation": "Improve IVR handling. Too many calls failing to reach a human.",
            "evidence": f"Connect rate is only {connect_rate:.0f}%. Target: 50%+."
        })

    # 2. High no-connect rate
    no_connect = disp_counts.get("NO_CONNECT", 0)
    nc_rate = no_connect / total * 100
    if nc_rate > 40:
        recs.append({
            "priority": "HIGH",
            "recommendation": "Review call list quality. Too many unanswered calls.",
            "evidence": f"NO_CONNECT: {nc_rate:.0f}% of all calls. Pre-screen numbers or adjust call times."
        })

    # 3. Engage drops off
    connected_rows = [r for r in scored_rows if r.get("connect", 0) >= 3]
    if connected_rows:
        engaged = sum(1 for r in connected_rows if r.get("engage", 0) >= 3)
        engage_rate = engaged / len(connected_rows) * 100
        if engage_rate < 50:
            recs.append({
                "priority": "HIGH",
                "recommendation": "Opener needs work. Reaching humans but not holding attention.",
                "evidence": f"Only {engage_rate:.0f}% of connected calls reach meaningful engagement."
            })

    # 4. Pitch never delivered
    engaged_rows = [r for r in scored_rows if r.get("engage", 0) >= 3]
    if engaged_rows:
        pitched = sum(1 for r in engaged_rows if r.get("pitch", 0) >= 3)
        pitch_rate = pitched / len(engaged_rows) * 100
        if pitch_rate < 40:
            recs.append({
                "priority": "MEDIUM",
                "recommendation": "Transition to pitch is weak. Getting engaged but never delivering value prop.",
                "evidence": f"Only {pitch_rate:.0f}% of engaged calls receive the pitch."
            })

    # 5. AI quality issues
    ai_scores = [r.get("ai_quality", 3) for r in scored_rows if r.get("num_turns", 0) > 0]
    if ai_scores:
        ai_avg = sum(ai_scores) / len(ai_scores)
        low_ai = sum(1 for s in ai_scores if s <= 2)
        if ai_avg < 3.0 or low_ai / len(ai_scores) > 0.2:
            recs.append({
                "priority": "HIGH",
                "recommendation": "AI naturalness needs improvement. Check for filler words, stuttering, identity breaks.",
                "evidence": f"AI quality avg: {ai_avg:.2f}/5. {low_ai} calls scored 1-2."
            })

    # 6. Gatekeeper success rate
    gk_attempts = disp_counts.get("GATEKEEPER_WALL", 0) + disp_counts.get("GATEKEEPER_PASS", 0)
    if gk_attempts >= 5:
        gk_pass = disp_counts.get("GATEKEEPER_PASS", 0)
        gk_rate = gk_pass / gk_attempts * 100
        if gk_rate < 30:
            recs.append({
                "priority": "MEDIUM",
                "recommendation": "Gatekeeper bypass needs work. Only getting past the front desk {:.0f}% of attempts.".format(gk_rate),
                "evidence": f"{gk_pass}/{gk_attempts} gatekeeper attempts successful."
            })

    # 7. Quick rejects
    quick_reject = disp_counts.get("QUICK_REJECT", 0)
    qr_rate = quick_reject / total * 100
    if qr_rate > 25:
        recs.append({
            "priority": "MEDIUM",
            "recommendation": "Too many quick rejects. First impression may be triggering 'sales call' alarm.",
            "evidence": f"QUICK_REJECT: {qr_rate:.0f}% of all calls."
        })

    # 8. Advance rate
    pitched_rows = [r for r in scored_rows if r.get("pitch", 0) >= 3]
    if pitched_rows:
        advanced = sum(1 for r in pitched_rows if r.get("advance", 0) >= 3)
        adv_rate = advanced / len(pitched_rows) * 100
        if adv_rate < 30:
            recs.append({
                "priority": "MEDIUM",
                "recommendation": "Closing mechanics need improvement. Pitching but not converting to next steps.",
                "evidence": f"Only {adv_rate:.0f}% of pitched calls result in a next step."
            })

    return sorted(recs, key=lambda x: 0 if x["priority"] == "HIGH" else 1)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def generate_daily_report(date=None, date_from=None, date_to=None, skip_scored=False, limit=None):
    """
    Full pipeline: score -> analyze -> report.
    Returns path to the generated report.
    """
    score_mod, analyze_mod = _import_modules()

    # Determine date range
    if date:
        date_from = date_from or date
        date_to = date_to or date
        date_label = date
    elif date_from and date_to:
        date_label = f"{date_from} to {date_to}"
    elif date_from:
        date_label = f"{date_from} to today"
    else:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        date_from = date_from or today
        date_to = date_to or today
        date_label = today

    # Set up output paths
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    safe_label = date_label.replace(" to ", "_to_")
    report_path = REPORTS_DIR / f"daily-{safe_label}.md"
    scores_csv = SALES_DIR / f"cis-scores-{safe_label}.csv"

    print(f"\n{'#' * 60}")
    print(f"  ClawOps CIS Daily Report Pipeline")
    print(f"  Period: {date_label}")
    print(f"  Report: {report_path}")
    print(f"{'#' * 60}")

    # Step 1: Score calls
    print(f"\n{'=' * 60}")
    print(f"  STEP 1: SCORING CALLS")
    print(f"{'=' * 60}")
    scored_rows = score_mod.score_all_calls(
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        output=str(scores_csv),
        skip_scored=skip_scored,
    )

    if not scored_rows:
        # Try loading from CSV if score returned empty but CSV exists
        if scores_csv.exists():
            with open(scores_csv, "r", newline="") as f:
                reader = csv.DictReader(f)
                scored_rows = []
                for row in reader:
                    for dim in ["connect", "engage", "pitch", "advance", "ai_quality", "total_score", "num_turns", "failure_turn"]:
                        try:
                            row[dim] = int(row.get(dim, 0))
                        except (ValueError, TypeError):
                            row[dim] = 0
                    for fld in ("duration_seconds", "cost"):
                        try:
                            row[fld] = float(row.get(fld, 0))
                        except (ValueError, TypeError):
                            row[fld] = 0.0
                    scored_rows.append(row)

    # Step 2: Analyze patterns
    print(f"\n{'=' * 60}")
    print(f"  STEP 2: ANALYZING PATTERNS")
    print(f"{'=' * 60}")
    pattern_md_path = SALES_DIR / f"cis-patterns-{safe_label}.md"
    pattern_report = analyze_mod.analyze_patterns(
        input_csv=str(scores_csv),
        output_md=str(pattern_md_path),
        date_from=date_from,
        date_to=date_to,
    )

    # Step 3: Generate combined report
    print(f"\n{'=' * 60}")
    print(f"  STEP 3: GENERATING DAILY REPORT")
    print(f"{'=' * 60}")

    total_cost = sum(r.get("cost", 0) if isinstance(r.get("cost"), (int, float)) else 0 for r in scored_rows)
    report_content = build_daily_report(scored_rows, pattern_report, date_label, total_cost)

    with open(report_path, "w") as f:
        f.write(report_content)

    print(f"\n  Daily report written to: {report_path}")
    print(f"  Scores CSV: {scores_csv}")
    print(f"  Patterns MD: {pattern_md_path}")

    # Also copy/symlink to latest
    latest_path = REPORTS_DIR / "latest.md"
    try:
        if latest_path.exists() or latest_path.is_symlink():
            latest_path.unlink()
        # Write a copy instead of symlink for compatibility
        with open(latest_path, "w") as f:
            f.write(report_content)
        print(f"  Latest report: {latest_path}")
    except Exception:
        pass

    print(f"\n{'#' * 60}")
    print(f"  PIPELINE COMPLETE")
    if scored_rows:
        total_scores = [r["total_score"] for r in scored_rows]
        print(f"  Calls: {len(scored_rows)}")
        print(f"  Avg Score: {sum(total_scores)/len(total_scores):.1f}/25")
        print(f"  Cost: ${total_cost:.2f}")
    print(f"  Report: {report_path}")
    print(f"{'#' * 60}\n")

    return str(report_path)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    import argparse
    parser = argparse.ArgumentParser(description="ClawOps CIS Daily Report Generator")
    parser.add_argument("--date", help="Generate report for a specific date (YYYY-MM-DD)")
    parser.add_argument("--from", dest="date_from", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="End date (YYYY-MM-DD)")
    parser.add_argument("--skip-scored", action="store_true", help="Skip already-scored calls")
    parser.add_argument("--limit", type=int, help="Max calls to process")
    args = parser.parse_args()

    generate_daily_report(
        date=args.date,
        date_from=args.date_from,
        date_to=args.date_to,
        skip_scored=args.skip_scored,
        limit=args.limit,
    )


if __name__ == "__main__":
    main()
