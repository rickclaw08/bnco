#!/usr/bin/env python3
"""
ClawOps Call Improvement System - Pattern Analyzer
Reads scored CSV from score-calls.py, finds patterns, identifies fixable problems.

Usage:
    python3 analyze-patterns.py                              # Analyze default CSV
    python3 analyze-patterns.py --input scores.csv           # Custom input
    python3 analyze-patterns.py --output patterns.md         # Custom output
    python3 analyze-patterns.py --from 2026-03-18 --to 2026-03-19  # Filter by date

Can be imported:
    from analyze_patterns import analyze_patterns
    report = analyze_patterns(input_csv="cis-scores.csv")
"""

import csv
import sys
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter, defaultdict

SALES_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = SALES_DIR / "cis-scores.csv"
DEFAULT_OUTPUT = SALES_DIR / "cis-patterns.md"

DIMENSIONS = ["connect", "engage", "pitch", "advance", "ai_quality"]
DIMENSION_LABELS = {
    "connect": "Connect (Reaching a Human)",
    "engage": "Engage (Having a Conversation)",
    "pitch": "Pitch (Presenting Value Prop)",
    "advance": "Advance (Moving to Next Step)",
    "ai_quality": "AI Quality (Natural Performance)",
}


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------
def load_scores(input_path, date_from=None, date_to=None):
    """Load scored CSV, optionally filter by date range."""
    rows = []
    with open(input_path, "r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse date for filtering
            created = row.get("created_at", "")
            if date_from or date_to:
                try:
                    dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                    if date_from:
                        df = datetime.strptime(date_from, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        if dt < df:
                            continue
                    if date_to:
                        dt2 = datetime.strptime(date_to, "%Y-%m-%d").replace(
                            hour=23, minute=59, second=59, tzinfo=timezone.utc
                        )
                        if dt > dt2:
                            continue
                except Exception:
                    pass

            # Convert numeric fields
            for dim in DIMENSIONS + ["total_score", "num_turns", "failure_turn"]:
                try:
                    row[dim] = int(row.get(dim, 0))
                except (ValueError, TypeError):
                    row[dim] = 0
            for fld in ("duration_seconds", "cost"):
                try:
                    row[fld] = float(row.get(fld, 0))
                except (ValueError, TypeError):
                    row[fld] = 0.0
            rows.append(row)
    return rows


# ---------------------------------------------------------------------------
# Niche detection from customer name
# ---------------------------------------------------------------------------
NICHE_KEYWORDS = {
    "hvac": ["hvac", "heating", "cooling", "air conditioning", "a/c", "ac ", "furnace", "heat pump"],
    "plumbing": ["plumb", "drain", "sewer", "pipe", "water heater"],
    "roofing": ["roof", "gutter", "shingle"],
    "electrical": ["electr", "wiring", "panel", "light"],
    "general": ["general", "contractor", "construction", "remodel", "renovation", "handyman"],
}


def detect_niche(customer_name):
    """Guess the niche from customer name."""
    name_lower = (customer_name or "").lower()
    for niche, keywords in NICHE_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return niche
    return "unknown"


# ---------------------------------------------------------------------------
# Time bucket extraction
# ---------------------------------------------------------------------------
def get_hour_bucket(created_at):
    """Return hour bucket string from createdAt timestamp."""
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        # Convert to ET (UTC-4 for EDT, rough)
        et_hour = (dt.hour - 4) % 24
        return f"{et_hour:02d}:00"
    except Exception:
        return "unknown"


def get_day_of_week(created_at):
    """Return day of week name."""
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        return dt.strftime("%A")
    except Exception:
        return "unknown"


# ---------------------------------------------------------------------------
# Analysis functions
# ---------------------------------------------------------------------------
def compute_dimension_stats(rows):
    """Compute average, min, max, distribution for each dimension."""
    stats = {}
    for dim in DIMENSIONS:
        values = [r[dim] for r in rows]
        if not values:
            stats[dim] = {"avg": 0, "min": 0, "max": 0, "dist": {}}
            continue
        dist = Counter(values)
        stats[dim] = {
            "avg": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
            "dist": {k: dist.get(k, 0) for k in range(1, 6)},
        }
    return stats


def compute_niche_performance(rows):
    """Break down scores by detected niche."""
    niche_data = defaultdict(list)
    for r in rows:
        niche = detect_niche(r.get("customer_name", ""))
        niche_data[niche].append(r)

    results = {}
    for niche, niche_rows in niche_data.items():
        total_scores = [r["total_score"] for r in niche_rows]
        results[niche] = {
            "count": len(niche_rows),
            "avg_total": sum(total_scores) / len(total_scores) if total_scores else 0,
            "avg_dims": {
                dim: sum(r[dim] for r in niche_rows) / len(niche_rows)
                for dim in DIMENSIONS
            },
        }
    return results


def compute_time_performance(rows):
    """Break down scores by hour of day."""
    hour_data = defaultdict(list)
    for r in rows:
        bucket = get_hour_bucket(r.get("created_at", ""))
        hour_data[bucket].append(r)

    results = {}
    for hour, hour_rows in sorted(hour_data.items()):
        total_scores = [r["total_score"] for r in hour_rows]
        results[hour] = {
            "count": len(hour_rows),
            "avg_total": sum(total_scores) / len(total_scores) if total_scores else 0,
            "connect_rate": sum(1 for r in hour_rows if r["connect"] >= 3) / len(hour_rows) * 100,
        }
    return results


def compute_day_performance(rows):
    """Break down scores by day of week."""
    day_data = defaultdict(list)
    for r in rows:
        day = get_day_of_week(r.get("created_at", ""))
        day_data[day].append(r)

    results = {}
    for day, day_rows in day_data.items():
        total_scores = [r["total_score"] for r in day_rows]
        results[day] = {
            "count": len(day_rows),
            "avg_total": sum(total_scores) / len(total_scores) if total_scores else 0,
        }
    return results


def compute_disposition_stats(rows):
    """Count and analyze dispositions."""
    disp_counts = Counter(r.get("disposition", "UNKNOWN") for r in rows)
    disp_scores = defaultdict(list)
    for r in rows:
        disp_scores[r.get("disposition", "UNKNOWN")].append(r["total_score"])
    return {
        d: {"count": disp_counts[d], "avg_score": sum(disp_scores[d]) / len(disp_scores[d])}
        for d in disp_counts
    }


def find_top_failures(rows, top_n=5):
    """Find the top N most fixable problems based on failure analysis."""
    failure_reasons = Counter()
    fix_suggestions = defaultdict(list)
    failure_turns = []

    for r in rows:
        reason = r.get("failure_reason", "").strip()
        fix = r.get("fix_suggestion", "").strip()
        turn = r.get("failure_turn", 0)
        if reason:
            failure_reasons[reason] += 1
            if fix:
                fix_suggestions[reason].append(fix)
            if turn > 0:
                failure_turns.append(turn)

    # Group similar failure reasons (simple dedup by first 50 chars)
    grouped = defaultdict(lambda: {"count": 0, "fixes": [], "full_reasons": []})
    for reason, count in failure_reasons.items():
        key = reason[:60].lower().strip()
        grouped[key]["count"] += count
        grouped[key]["fixes"].extend(fix_suggestions.get(reason, []))
        grouped[key]["full_reasons"].append(reason)

    sorted_failures = sorted(grouped.items(), key=lambda x: -x[1]["count"])

    results = []
    for key, data in sorted_failures[:top_n]:
        results.append({
            "problem": data["full_reasons"][0],  # Most representative reason
            "occurrences": data["count"],
            "fix": data["fixes"][0] if data["fixes"] else "No fix suggestion available",
        })

    avg_failure_turn = sum(failure_turns) / len(failure_turns) if failure_turns else 0

    return results, avg_failure_turn


def find_drop_off_funnel(rows):
    """Find where calls drop off in the CIS funnel."""
    stages = {
        "connect": {"pass": 0, "fail": 0},
        "engage": {"pass": 0, "fail": 0},
        "pitch": {"pass": 0, "fail": 0},
        "advance": {"pass": 0, "fail": 0},
    }
    for r in rows:
        if r["connect"] >= 3:
            stages["connect"]["pass"] += 1
            if r["engage"] >= 3:
                stages["engage"]["pass"] += 1
                if r["pitch"] >= 3:
                    stages["pitch"]["pass"] += 1
                    if r["advance"] >= 3:
                        stages["advance"]["pass"] += 1
                    else:
                        stages["advance"]["fail"] += 1
                else:
                    stages["pitch"]["fail"] += 1
            else:
                stages["engage"]["fail"] += 1
        else:
            stages["connect"]["fail"] += 1
    return stages


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------
def generate_report(rows, top_failures, avg_failure_turn, dim_stats, niche_perf,
                    time_perf, day_perf, disp_stats, funnel):
    """Generate markdown report from analysis results."""
    total = len(rows)
    if total == 0:
        return "# CIS Pattern Analysis\n\nNo scored calls to analyze.\n"

    total_scores = [r["total_score"] for r in rows]
    avg_total = sum(total_scores) / total

    lines = []
    lines.append("# CIS Pattern Analysis Report")
    lines.append(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M ET')}")
    lines.append(f"\nTotal calls analyzed: **{total}**")
    lines.append(f"Average total score: **{avg_total:.1f}/25**")
    lines.append("")

    # --- Dimension breakdown ---
    lines.append("## Dimension Scores")
    lines.append("")
    lines.append("| Dimension | Avg | 1 | 2 | 3 | 4 | 5 |")
    lines.append("|-----------|-----|---|---|---|---|---|")
    weakest_dim = None
    weakest_avg = 6
    for dim in DIMENSIONS:
        s = dim_stats[dim]
        dist = s["dist"]
        avg = s["avg"]
        if avg < weakest_avg:
            weakest_avg = avg
            weakest_dim = dim
        lines.append(
            f"| {DIMENSION_LABELS[dim]} | **{avg:.2f}** | "
            f"{dist.get(1,0)} | {dist.get(2,0)} | {dist.get(3,0)} | "
            f"{dist.get(4,0)} | {dist.get(5,0)} |"
        )
    lines.append(f"\n**Weakest dimension: {DIMENSION_LABELS.get(weakest_dim, 'N/A')} ({weakest_avg:.2f})**")
    lines.append("")

    # --- Funnel ---
    lines.append("## Call Funnel (Drop-off Analysis)")
    lines.append("")
    lines.append("```")
    passed_prev = total
    for stage in ["connect", "engage", "pitch", "advance"]:
        passed = funnel[stage]["pass"]
        rate = (passed / passed_prev * 100) if passed_prev > 0 else 0
        bar = "#" * int(rate / 2)
        lines.append(f"  {stage.upper():10s} {bar:50s} {passed:4d}/{passed_prev:4d} ({rate:.0f}%)")
        passed_prev = passed
    lines.append("```")
    lines.append("")

    # --- Disposition breakdown ---
    lines.append("## Disposition Breakdown")
    lines.append("")
    lines.append("| Disposition | Count | % | Avg Score |")
    lines.append("|------------|-------|---|-----------|")
    for d, data in sorted(disp_stats.items(), key=lambda x: -x[1]["count"]):
        pct = data["count"] / total * 100
        lines.append(f"| {d} | {data['count']} | {pct:.0f}% | {data['avg_score']:.1f} |")
    lines.append("")

    # --- Top failures ---
    lines.append("## Top 5 Fixable Problems")
    lines.append("")
    if avg_failure_turn > 0:
        lines.append(f"Average failure turn: **{avg_failure_turn:.1f}** (where calls stall)")
        lines.append("")
    for i, fail in enumerate(top_failures, 1):
        lines.append(f"### {i}. {fail['problem']} ({fail['occurrences']} occurrences)")
        lines.append(f"**Fix:** {fail['fix']}")
        lines.append("")

    # --- Niche performance ---
    lines.append("## Performance by Niche")
    lines.append("")
    lines.append("| Niche | Calls | Avg Score | Connect | Engage | Pitch | Advance | AI Quality |")
    lines.append("|-------|-------|-----------|---------|--------|-------|---------|------------|")
    for niche, data in sorted(niche_perf.items(), key=lambda x: -x[1]["avg_total"]):
        dims = data["avg_dims"]
        lines.append(
            f"| {niche.upper()} | {data['count']} | {data['avg_total']:.1f} | "
            f"{dims['connect']:.1f} | {dims['engage']:.1f} | {dims['pitch']:.1f} | "
            f"{dims['advance']:.1f} | {dims['ai_quality']:.1f} |"
        )
    lines.append("")

    # --- Time performance ---
    lines.append("## Performance by Time of Day (ET)")
    lines.append("")
    lines.append("| Hour (ET) | Calls | Avg Score | Connect Rate |")
    lines.append("|-----------|-------|-----------|-------------|")
    for hour, data in sorted(time_perf.items()):
        lines.append(
            f"| {hour} | {data['count']} | {data['avg_total']:.1f} | {data['connect_rate']:.0f}% |"
        )
    lines.append("")

    # --- Day performance ---
    lines.append("## Performance by Day of Week")
    lines.append("")
    lines.append("| Day | Calls | Avg Score |")
    lines.append("|-----|-------|-----------|")
    for day, data in sorted(day_perf.items(), key=lambda x: -x[1]["avg_total"]):
        lines.append(f"| {day} | {data['count']} | {data['avg_total']:.1f} |")
    lines.append("")

    # --- High performers ---
    lines.append("## Best Calls (Score >= 18)")
    lines.append("")
    best = sorted([r for r in rows if r["total_score"] >= 18], key=lambda x: -x["total_score"])
    if best:
        for r in best[:10]:
            lines.append(
                f"- **{r.get('customer_name', 'Unknown')}** - Score: {r['total_score']}/25, "
                f"Disposition: {r.get('disposition', '?')}, "
                f"Duration: {r.get('duration_seconds', 0):.0f}s"
            )
    else:
        lines.append("No calls scored 18+ yet.")
    lines.append("")

    # --- Key insights ---
    lines.append("## Key Insights")
    lines.append("")

    # Biggest bottleneck
    funnel_rates = {}
    prev = total
    for stage in ["connect", "engage", "pitch", "advance"]:
        p = funnel[stage]["pass"]
        funnel_rates[stage] = (p / prev * 100) if prev > 0 else 100
        prev = p
    bottleneck = min(funnel_rates, key=funnel_rates.get)
    lines.append(f"1. **Biggest bottleneck:** {bottleneck.upper()} stage ({funnel_rates[bottleneck]:.0f}% pass rate)")

    # Best niche
    if niche_perf:
        best_niche = max(niche_perf.items(), key=lambda x: x[1]["avg_total"])
        lines.append(f"2. **Best performing niche:** {best_niche[0].upper()} (avg {best_niche[1]['avg_total']:.1f}/25)")

    # Best time
    if time_perf:
        best_time = max(time_perf.items(), key=lambda x: x[1]["avg_total"] if x[1]["count"] >= 3 else 0)
        lines.append(f"3. **Best calling time:** {best_time[0]} ET (avg {best_time[1]['avg_total']:.1f}/25)")

    # AI quality check
    ai_avg = dim_stats["ai_quality"]["avg"]
    if ai_avg < 3.0:
        lines.append(f"4. **AI quality alert:** Average {ai_avg:.2f}/5 - prompt needs improvement")
    else:
        lines.append(f"4. **AI quality:** {ai_avg:.2f}/5 - {'solid' if ai_avg >= 4.0 else 'decent, room to improve'}")

    # Connect rate
    connect_rate = sum(1 for r in rows if r["connect"] >= 3) / total * 100
    lines.append(f"5. **Human connect rate:** {connect_rate:.0f}%")

    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------
def analyze_patterns(input_csv=None, output_md=None, date_from=None, date_to=None):
    """
    Main entry point. Loads scores, analyzes patterns, writes report.
    Returns the markdown report string.
    """
    input_path = Path(input_csv) if input_csv else DEFAULT_INPUT
    output_path = Path(output_md) if output_md else DEFAULT_OUTPUT

    if not input_path.exists():
        print(f"ERROR: Input CSV not found: {input_path}", file=sys.stderr)
        print("Run score-calls.py first to generate scored data.", file=sys.stderr)
        sys.exit(1)

    print(f"=" * 60)
    print(f"  ClawOps CIS - Pattern Analyzer")
    print(f"  Input: {input_path}")
    print(f"  Output: {output_path}")
    print(f"=" * 60)

    # Load data
    print(f"\n[1/3] Loading scored data...")
    rows = load_scores(input_path, date_from, date_to)
    print(f"  Loaded {len(rows)} scored calls")

    if not rows:
        print("  No data to analyze.")
        return ""

    # Analyze
    print(f"\n[2/3] Analyzing patterns...")
    dim_stats = compute_dimension_stats(rows)
    niche_perf = compute_niche_performance(rows)
    time_perf = compute_time_performance(rows)
    day_perf = compute_day_performance(rows)
    disp_stats = compute_disposition_stats(rows)
    top_failures, avg_failure_turn = find_top_failures(rows)
    funnel = find_drop_off_funnel(rows)

    # Generate report
    print(f"\n[3/3] Generating report...")
    report = generate_report(
        rows, top_failures, avg_failure_turn, dim_stats,
        niche_perf, time_perf, day_perf, disp_stats, funnel
    )

    with open(output_path, "w") as f:
        f.write(report)

    print(f"\n  Report written to: {output_path}")

    # Print summary to stdout
    weakest = min(DIMENSIONS, key=lambda d: dim_stats[d]["avg"])
    print(f"\n  Quick summary:")
    print(f"    Total calls: {len(rows)}")
    print(f"    Avg score: {sum(r['total_score'] for r in rows)/len(rows):.1f}/25")
    print(f"    Weakest dimension: {weakest} ({dim_stats[weakest]['avg']:.2f})")
    print(f"    Top failures found: {len(top_failures)}")
    print(f"{'=' * 60}")

    return report


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    import argparse
    parser = argparse.ArgumentParser(description="ClawOps CIS Pattern Analyzer")
    parser.add_argument("--input", "-i", help="Input scored CSV")
    parser.add_argument("--output", "-o", help="Output markdown report")
    parser.add_argument("--from", dest="date_from", help="Filter start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="Filter end date (YYYY-MM-DD)")
    args = parser.parse_args()

    analyze_patterns(
        input_csv=args.input,
        output_md=args.output,
        date_from=args.date_from,
        date_to=args.date_to,
    )


if __name__ == "__main__":
    main()
