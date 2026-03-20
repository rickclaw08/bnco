#!/usr/bin/env python3
"""
Post-Call Analysis Pipeline
Runs all 3 CIS scripts in sequence after each calling session.
Matches briefing spec 1.1 and 1.4.

Usage:
    python3 post-call-analysis.py                    # Analyze today's calls
    python3 post-call-analysis.py --date 2026-03-20  # Specific date

Outputs:
    - cis-scores.csv (scored calls)
    - cis-pattern-report.md (pattern analysis)
    - call-analysis.md (structured findings for review)
"""

import os
import sys
import subprocess
from datetime import datetime, timezone
from pathlib import Path

SALES_DIR = Path(__file__).resolve().parent
ANALYSIS_OUTPUT = SALES_DIR / "call-analysis.md"

def run_step(script, args=None):
    cmd = [sys.executable, str(SALES_DIR / script)]
    if args:
        cmd.extend(args)
    print(f"\n{'='*60}")
    print(f"Running: {script}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, capture_output=False, text=True)
    if result.returncode != 0:
        print(f"WARNING: {script} exited with code {result.returncode}")
    return result.returncode

def main():
    args = sys.argv[1:]
    
    # Step 1: Score all calls
    score_args = args.copy()
    run_step("score-calls.py", score_args)
    
    # Step 2: Analyze patterns
    run_step("analyze-patterns.py", args)
    
    # Step 3: Generate report
    run_step("generate-report.py", args)
    
    # Step 4: Write call-analysis.md summary
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for a in args:
        if a.startswith("--date"):
            idx = args.index(a)
            if idx + 1 < len(args):
                today = args[idx + 1]
    
    scores_file = SALES_DIR / "cis-scores.csv"
    report_file = SALES_DIR / "cis-pattern-report.md"
    
    summary_lines = [
        f"# Call Analysis - {today}\n",
        f"Generated: {datetime.now().isoformat()}\n",
        f"\n## Files\n",
        f"- Scores: {scores_file}\n",
        f"- Pattern Report: {report_file}\n",
    ]
    
    # Count calls scored
    if scores_file.exists():
        import csv
        with open(scores_file) as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            owner_calls = [r for r in rows if float(r.get('duration', 0)) > 60]
            summary_lines.append(f"\n## Summary\n")
            summary_lines.append(f"- Total calls scored: {len(rows)}\n")
            summary_lines.append(f"- Owner conversations (>60s): {len(owner_calls)}\n")
            
            # Flag highest engagement call
            if owner_calls:
                best = max(owner_calls, key=lambda r: float(r.get('duration', 0)))
                summary_lines.append(f"\n## Highest Engagement Call\n")
                summary_lines.append(f"- Call ID: {best.get('call_id', 'unknown')}\n")
                summary_lines.append(f"- Duration: {best.get('duration', '?')}s\n")
                summary_lines.append(f"- Disposition: {best.get('disposition', '?')}\n")
                summary_lines.append(f"- Recording: {best.get('recording_url', 'N/A')}\n")
                summary_lines.append(f"- **Rick: Review this call for prompt improvements**\n")
    
    with open(ANALYSIS_OUTPUT, 'w') as f:
        f.writelines(summary_lines)
    
    print(f"\n{'='*60}")
    print(f"Analysis complete. Review: {ANALYSIS_OUTPUT}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
