#!/usr/bin/env python3
"""
ClawOps Call Improvement System - Call Scorer
Pulls VAPI call transcripts and scores each on 5 CIS dimensions using GPT-4o-mini.

Usage:
    python3 score-calls.py                          # Score all calls from today
    python3 score-calls.py --date 2026-03-19        # Score calls from specific date
    python3 score-calls.py --from 2026-03-18 --to 2026-03-19   # Date range
    python3 score-calls.py --limit 50               # Limit number of calls
    python3 score-calls.py --output scores.csv      # Custom output file
    python3 score-calls.py --skip-scored             # Skip calls already in output CSV

Can be imported and called programmatically:
    from score_calls import score_all_calls
    df = score_all_calls(date_from="2026-03-18", date_to="2026-03-19")
"""

import os
import sys
import csv
import json
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
ASSISTANT_ID = "a036984d-72d5-4609-b392-6a635d49f6dd"
SALES_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT = SALES_DIR / "cis-scores.csv"
PAGE_SIZE = 100  # VAPI max per request
OPENAI_MODEL = "gpt-4o-mini"

# Dispositions from the CIS framework
VALID_DISPOSITIONS = [
    "NO_CONNECT", "QUICK_REJECT", "GATEKEEPER_WALL", "GATEKEEPER_PASS",
    "PITCH_DELIVERED", "INFO_EXTRACTED", "DEMO_BOOKED", "SALE"
]

# The scoring prompt sent to GPT-4o-mini
SCORING_PROMPT = """You are a cold-call analyst for ClawOps, an AI receptionist company selling to home service contractors (HVAC, plumbing, roofing, electrical).

Score this call transcript on 5 dimensions (1-5 each). Use the exact rubrics below.

## CONNECT (Did we reach a human?)
1 = No answer / voicemail / dead line
2 = IVR dead end (automated system, never got past)
3 = Reached a human but instant hangup (<5 turns of real dialogue)
4 = Reached a gatekeeper, had a real exchange
5 = Reached the decision maker / owner

## ENGAGE (Did the conversation go anywhere?)
1 = Zero engagement. "Not interested" click.
2 = Brief exchange but no real dialogue (<10 non-system turns total)
3 = Moderate conversation, some back and forth
4 = Deep conversation, multiple exchanges, questions asked by prospect
5 = Full pitch delivered, prospect actively participating

## PITCH (Did we actually present the value prop?)
1 = Never got to pitch at all
2 = Started to pitch but got cut off
3 = Delivered partial pitch
4 = Delivered full pitch, prospect heard it
5 = Pitched AND prospect asked follow-up questions about the service

## ADVANCE (Did we move toward a next step?)
1 = Dead end. No next step possible.
2 = Left a message / "send me info" brush-off
3 = Got a name, email, or callback time
4 = Prospect agreed to a follow-up or demo
5 = Meeting booked or verbal commitment to buy

## AI_QUALITY (How did the AI perform?)
1 = AI broke character, got detected as AI negatively, or sounded robotic/confused
2 = Filler words, stutters, identity breaks, or repeated itself
3 = Passable but not natural. Some awkward moments.
4 = Smooth conversation, natural-sounding, stayed in character
5 = Indistinguishable from a human sales rep

## DISPOSITION (assign exactly ONE):
- NO_CONNECT: never reached a human
- QUICK_REJECT: human answered, immediate brush-off
- GATEKEEPER_WALL: stuck at receptionist/office manager
- GATEKEEPER_PASS: got through to decision maker
- PITCH_DELIVERED: actually presented the service
- INFO_EXTRACTED: got owner name, email, or callback time
- DEMO_BOOKED: meeting scheduled
- SALE: closed deal

## FAILURE ANALYSIS (only if total score >= 9):
- failure_turn: the turn number where the call stalled or went sideways (0 if N/A)
- failure_reason: one sentence explaining what went wrong
- fix_suggestion: one sentence with what should have been said/done instead

Respond in this exact JSON format (no markdown fencing):
{
  "connect": <1-5>,
  "engage": <1-5>,
  "pitch": <1-5>,
  "advance": <1-5>,
  "ai_quality": <1-5>,
  "disposition": "<DISPOSITION>",
  "failure_turn": <int or 0>,
  "failure_reason": "<string or empty>",
  "fix_suggestion": "<string or empty>"
}"""


# ---------------------------------------------------------------------------
# VAPI API
# ---------------------------------------------------------------------------
def vapi_request(url):
    """Make an authenticated VAPI API request."""
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  [!] VAPI HTTP {e.code}: {body[:200]}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  [!] VAPI error: {e}", file=sys.stderr)
        return None


def fetch_calls(date_from, date_to, limit=None):
    """Fetch all calls in a date range with pagination."""
    all_calls = []
    cursor_le = date_to.strftime("%Y-%m-%dT%H:%M:%S.999Z")
    ge_str = date_from.strftime("%Y-%m-%dT%H:%M:%SZ")
    page = 0

    while True:
        url = (
            f"https://api.vapi.ai/call?"
            f"assistantId={ASSISTANT_ID}"
            f"&limit={PAGE_SIZE}"
            f"&createdAtGe={ge_str}"
            f"&createdAtLe={cursor_le}"
        )
        page += 1
        data = vapi_request(url)
        if data is None or not isinstance(data, list) or len(data) == 0:
            break

        all_calls.extend(data)
        print(f"  Fetched page {page}: {len(data)} calls (total: {len(all_calls)})")

        if limit and len(all_calls) >= limit:
            all_calls = all_calls[:limit]
            break

        if len(data) < PAGE_SIZE:
            break  # Last page

        # Cursor: use the oldest call's createdAt minus 1ms to avoid dupes
        last_ts = data[-1].get("createdAt", "")
        if not last_ts:
            break
        # Shift cursor back by 1 millisecond
        try:
            dt = datetime.fromisoformat(last_ts.replace("Z", "+00:00"))
            dt = dt - timedelta(milliseconds=1)
            cursor_le = dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"
        except Exception:
            break

        time.sleep(0.3)  # Rate limit courtesy

    return all_calls


# ---------------------------------------------------------------------------
# Transcript extraction
# ---------------------------------------------------------------------------
def extract_transcript(call_data):
    """Build a clean transcript string from call messages."""
    messages = call_data.get("messages", [])
    lines = []
    turn = 0
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("message", msg.get("content", "")).strip()
        if not content or role == "system":
            continue
        turn += 1
        speaker = "JORDAN" if role in ("assistant", "bot") else "PROSPECT"
        lines.append(f"[Turn {turn}] {speaker}: {content}")
    return "\n".join(lines), turn


# ---------------------------------------------------------------------------
# GPT-4o-mini scoring
# ---------------------------------------------------------------------------
def score_transcript(transcript_text, customer_name="Unknown"):
    """Send transcript to GPT-4o-mini for CIS scoring. Returns dict or None."""
    if not transcript_text.strip():
        return None

    user_msg = f"Company: {customer_name}\n\nTranscript:\n{transcript_text}"

    payload = json.dumps({
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SCORING_PROMPT},
            {"role": "user", "content": user_msg}
        ],
        "temperature": 0.1,
        "max_tokens": 400,
    }).encode("utf-8")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    for attempt in range(3):
        try:
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=payload,
                headers=headers,
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=30)
            result = json.loads(resp.read())
            content = result["choices"][0]["message"]["content"].strip()
            # Strip markdown code fences if present
            if content.startswith("```"):
                content = content.split("\n", 1)[-1]
            if content.endswith("```"):
                content = content.rsplit("```", 1)[0]
            content = content.strip()
            scores = json.loads(content)
            # Validate
            for dim in ("connect", "engage", "pitch", "advance", "ai_quality"):
                scores[dim] = max(1, min(5, int(scores.get(dim, 1))))
            if scores.get("disposition") not in VALID_DISPOSITIONS:
                scores["disposition"] = "NO_CONNECT"
            scores["failure_turn"] = int(scores.get("failure_turn", 0))
            scores["failure_reason"] = str(scores.get("failure_reason", ""))
            scores["fix_suggestion"] = str(scores.get("fix_suggestion", ""))
            return scores
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = min(2 ** attempt * 5, 30)
                print(f"    Rate limited. Waiting {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            body = e.read().decode("utf-8", errors="replace")
            print(f"    OpenAI HTTP {e.code}: {body[:200]}", file=sys.stderr)
            return None
        except json.JSONDecodeError as e:
            print(f"    JSON parse error: {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2)
                continue
            return None
        except Exception as e:
            print(f"    Scoring error: {e}", file=sys.stderr)
            return None
    return None


# ---------------------------------------------------------------------------
# CSV output
# ---------------------------------------------------------------------------
CSV_FIELDS = [
    "call_id", "created_at", "customer_name", "customer_number",
    "status", "ended_reason", "duration_seconds", "cost",
    "num_turns", "connect", "engage", "pitch", "advance", "ai_quality",
    "total_score", "disposition", "failure_turn", "failure_reason",
    "fix_suggestion",
]


def load_existing_ids(output_path):
    """Load call IDs already scored in the output CSV."""
    ids = set()
    if output_path.exists():
        with open(output_path, "r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ids.add(row.get("call_id", ""))
    return ids


def write_csv(rows, output_path, append=False):
    """Write scored rows to CSV."""
    mode = "a" if append else "w"
    file_exists = output_path.exists() and output_path.stat().st_size > 0
    with open(output_path, mode, newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        if not append or not file_exists:
            writer.writeheader()
        for row in rows:
            writer.writerow(row)


# ---------------------------------------------------------------------------
# Call duration helper
# ---------------------------------------------------------------------------
def get_duration(call_data):
    """Extract call duration in seconds."""
    messages = call_data.get("messages", [])
    non_sys = [m for m in messages if m.get("role") != "system"]
    if non_sys and non_sys[-1].get("secondsFromStart"):
        return non_sys[-1]["secondsFromStart"]
    started = call_data.get("startedAt")
    ended = call_data.get("endedAt")
    if started and ended:
        try:
            s = datetime.fromisoformat(started.replace("Z", "+00:00"))
            e = datetime.fromisoformat(ended.replace("Z", "+00:00"))
            return (e - s).total_seconds()
        except Exception:
            pass
    return call_data.get("duration") or 0


# ---------------------------------------------------------------------------
# Main scoring pipeline
# ---------------------------------------------------------------------------
def score_all_calls(date_from=None, date_to=None, limit=None, output=None, skip_scored=False):
    """
    Main entry point. Fetches calls, scores them, writes CSV.
    Returns list of scored row dicts.
    """
    if not VAPI_API_KEY:
        print("ERROR: VAPI_API_KEY not set. Source ~/.zshrc or export it.", file=sys.stderr)
        sys.exit(1)
    if not OPENAI_API_KEY:
        print("ERROR: OPENAI_API_KEY not set. Source ~/.zshrc or export it.", file=sys.stderr)
        sys.exit(1)

    output_path = Path(output) if output else DEFAULT_OUTPUT

    # Date defaults
    now = datetime.now(timezone.utc)
    if date_from is None:
        d_from = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        d_from = datetime.strptime(date_from, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    if date_to is None:
        d_to = now
    else:
        d_to = datetime.strptime(date_to, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, tzinfo=timezone.utc
        )

    print(f"=" * 60)
    print(f"  ClawOps CIS - Call Scorer")
    print(f"  Date range: {d_from.strftime('%Y-%m-%d %H:%M')} to {d_to.strftime('%Y-%m-%d %H:%M')} UTC")
    print(f"  Output: {output_path}")
    print(f"=" * 60)

    # Load existing scored IDs
    existing_ids = set()
    if skip_scored:
        existing_ids = load_existing_ids(output_path)
        if existing_ids:
            print(f"  Skipping {len(existing_ids)} already-scored calls")

    # Fetch calls
    print(f"\n[1/3] Fetching calls from VAPI...")
    calls = fetch_calls(d_from, d_to, limit)
    print(f"  Total calls fetched: {len(calls)}")

    if not calls:
        print("  No calls found in date range.")
        return []

    # Score each call
    print(f"\n[2/3] Scoring calls with {OPENAI_MODEL}...")
    scored_rows = []
    skipped = 0
    no_transcript = 0
    failed_score = 0
    scored_count = 0

    for i, call in enumerate(calls, 1):
        call_id = call.get("id", "unknown")

        # Skip if already scored
        if call_id in existing_ids:
            skipped += 1
            continue

        # Extract transcript
        transcript_text, num_turns = extract_transcript(call)
        customer_name = call.get("customer", {}).get("name", "Unknown")
        customer_number = call.get("customer", {}).get("number", "")

        # Progress indicator
        pct = (i / len(calls)) * 100
        sys.stdout.write(f"\r  [{i}/{len(calls)}] ({pct:.0f}%) Scoring: {customer_name[:30]:<30}")
        sys.stdout.flush()

        # Skip calls with no transcript (no-answer, failed, etc.)
        if num_turns == 0:
            # Still record as NO_CONNECT with score 5
            row = {
                "call_id": call_id,
                "created_at": call.get("createdAt", ""),
                "customer_name": customer_name,
                "customer_number": customer_number,
                "status": call.get("status", ""),
                "ended_reason": call.get("endedReason", ""),
                "duration_seconds": round(get_duration(call), 1),
                "cost": round(call.get("cost", 0) or 0, 4),
                "num_turns": 0,
                "connect": 1,
                "engage": 1,
                "pitch": 1,
                "advance": 1,
                "ai_quality": 3,  # N/A - default to neutral
                "total_score": 7,
                "disposition": "NO_CONNECT",
                "failure_turn": 0,
                "failure_reason": call.get("endedReason", "No transcript"),
                "fix_suggestion": "",
            }
            scored_rows.append(row)
            no_transcript += 1
            continue

        # Score with GPT
        scores = score_transcript(transcript_text, customer_name)
        if scores is None:
            failed_score += 1
            continue

        total = sum(scores[d] for d in ("connect", "engage", "pitch", "advance", "ai_quality"))

        row = {
            "call_id": call_id,
            "created_at": call.get("createdAt", ""),
            "customer_name": customer_name,
            "customer_number": customer_number,
            "status": call.get("status", ""),
            "ended_reason": call.get("endedReason", ""),
            "duration_seconds": round(get_duration(call), 1),
            "cost": round(call.get("cost", 0) or 0, 4),
            "num_turns": num_turns,
            "connect": scores["connect"],
            "engage": scores["engage"],
            "pitch": scores["pitch"],
            "advance": scores["advance"],
            "ai_quality": scores["ai_quality"],
            "total_score": total,
            "disposition": scores["disposition"],
            "failure_turn": scores["failure_turn"],
            "failure_reason": scores["failure_reason"],
            "fix_suggestion": scores["fix_suggestion"],
        }
        scored_rows.append(row)
        scored_count += 1

        # Rate limit: ~1 req/sec to be safe with GPT-4o-mini
        time.sleep(0.5)

    print(f"\n")

    # Write CSV
    print(f"[3/3] Writing results...")
    if skip_scored and existing_ids:
        write_csv(scored_rows, output_path, append=True)
    else:
        write_csv(scored_rows, output_path, append=False)

    # Summary
    print(f"\n{'=' * 60}")
    print(f"  SCORING COMPLETE")
    print(f"  Total calls processed: {len(calls)}")
    print(f"  Scored with GPT:       {scored_count}")
    print(f"  No transcript (auto):  {no_transcript}")
    print(f"  Failed to score:       {failed_score}")
    print(f"  Skipped (already done): {skipped}")
    print(f"  Output: {output_path}")
    if scored_rows:
        totals = [r["total_score"] for r in scored_rows]
        print(f"  Avg total score:       {sum(totals)/len(totals):.1f}/25")
        disp_counts = {}
        for r in scored_rows:
            d = r["disposition"]
            disp_counts[d] = disp_counts.get(d, 0) + 1
        print(f"  Disposition breakdown:")
        for d, c in sorted(disp_counts.items(), key=lambda x: -x[1]):
            print(f"    {d}: {c} ({c/len(scored_rows)*100:.0f}%)")
    print(f"{'=' * 60}")

    return scored_rows


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    import argparse
    parser = argparse.ArgumentParser(description="ClawOps CIS Call Scorer")
    parser.add_argument("--date", help="Score calls from a specific date (YYYY-MM-DD)")
    parser.add_argument("--from", dest="date_from", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="End date (YYYY-MM-DD)")
    parser.add_argument("--limit", type=int, help="Max number of calls to process")
    parser.add_argument("--output", "-o", help="Output CSV path")
    parser.add_argument("--skip-scored", action="store_true", help="Skip calls already in output CSV")
    args = parser.parse_args()

    date_from = args.date_from or args.date
    date_to = args.date_to or args.date

    score_all_calls(
        date_from=date_from,
        date_to=date_to,
        limit=args.limit,
        output=args.output,
        skip_scored=args.skip_scored,
    )


if __name__ == "__main__":
    main()
