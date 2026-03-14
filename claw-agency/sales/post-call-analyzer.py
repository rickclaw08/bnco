#!/usr/bin/env python3
"""
ClawOps Post-Call Analyzer
Runs after every outbound call. Pulls transcript, grades outcome,
extracts lessons, and stores them for prompt evolution.

Usage: python3 post-call-analyzer.py [--call-id <id>] [--latest] [--batch]
"""

import os
import sys
import json
import subprocess
from datetime import datetime, timezone

VAPI_API_KEY = os.environ.get("VAPI_API_KEY", "d9ca90ef-0dc2-464a-9c06-ca0163d8d805")
ASSISTANT_ID = "a036984d-72d5-4609-b392-6a635d49f6dd"
LESSONS_FILE = os.path.join(os.path.dirname(__file__), "call-lessons.json")
WORKSPACE = "/Users/agentclaw/.openclaw/workspace"

def fetch_call(call_id):
    """Fetch a single call by ID."""
    result = subprocess.run(
        ["curl", "-s", f"https://api.vapi.ai/call/{call_id}",
         "-H", f"Authorization: Bearer {VAPI_API_KEY}"],
        capture_output=True, text=True
    )
    return json.loads(result.stdout)

def fetch_latest_calls(limit=5):
    """Fetch the most recent calls."""
    result = subprocess.run(
        ["curl", "-s", f"https://api.vapi.ai/call?assistantId={ASSISTANT_ID}&limit={limit}",
         "-H", f"Authorization: Bearer {VAPI_API_KEY}"],
        capture_output=True, text=True
    )
    return json.loads(result.stdout)

def extract_transcript_text(call_data):
    """Pull clean transcript from call data."""
    messages = call_data.get("messages", [])
    
    lines = []
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("message", msg.get("content", ""))
        if not content:
            continue
        # Skip system messages (the prompt itself)
        if role == "system":
            continue
        speaker = "JORDAN" if role in ("assistant", "bot") else "PROSPECT"
        lines.append(f"{speaker}: {content}")
    return "\n".join(lines)

def grade_call(transcript, call_data):
    """Grade call outcome based on transcript analysis."""
    t = transcript.lower()
    
    # Calculate real duration from message timestamps or startedAt/endedAt
    messages = call_data.get("messages", [])
    non_sys = [m for m in messages if m.get("role") != "system"]
    if non_sys and non_sys[-1].get("secondsFromStart"):
        duration = non_sys[-1]["secondsFromStart"]
    elif call_data.get("startedAt") and call_data.get("endedAt"):
        from datetime import datetime
        try:
            start = datetime.fromisoformat(call_data["startedAt"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(call_data["endedAt"].replace("Z", "+00:00"))
            duration = (end - start).total_seconds()
        except:
            duration = 0
    else:
        duration = call_data.get("duration") or 0
    
    ended_reason = call_data.get("endedReason", "")
    
    # Count actual prospect lines (not recordings/IVR)
    prospect_lines = [l for l in transcript.split('\n') if l.startswith('PROSPECT:')]
    jordan_lines = [l for l in transcript.split('\n') if l.startswith('JORDAN:')]
    
    # Outcome classification
    outcome = "UNKNOWN"
    score = 0
    
    # Check for success signals
    if any(phrase in t for phrase in ["send me the link", "i'm interested", "let's do it", "sign me up", "sounds good"]):
        outcome = "HOT_LEAD"
        score = 90
    elif any(phrase in t for phrase in ["call me back", "when can you call", "let me think", "send me info", "talk to my partner"]):
        outcome = "WARM_CALLBACK"
        score = 60
    elif any(phrase in t for phrase in ["what's your number", "i'll call you", "give me your number"]):
        outcome = "CALLBACK_REQUESTED"
        score = 55
    # Check for failure signals
    elif duration < 15:
        outcome = "NO_CONNECT"
        score = 0
    elif any(phrase in t for phrase in ["not interested", "don't call", "remove me", "stop calling", "no thank you"]):
        if "not interested" in t and t.count("not interested") >= 2:
            outcome = "HARD_NO"
            score = 5
        else:
            outcome = "SOFT_NO"
            score = 15
    elif any(phrase in t for phrase in ["press 1", "press 2", "press 9", "menu"]):
        outcome = "IVR_TRAP"
        score = 0
    elif any(phrase in t for phrase in ["leave a message", "voicemail", "not available", "at the tone"]):
        outcome = "VOICEMAIL"
        score = 10
    elif "who handles the business" in t or "are you the owner" in t:
        if any(phrase in t for phrase in ["she's not here", "he's not in", "not available", "call back"]):
            outcome = "GATEKEEPER_DEFLECT"
            score = 20
        else:
            outcome = "CONVERSATION"
            score = 35
    elif duration > 30:
        outcome = "CONVERSATION"
        score = 35
    else:
        outcome = "SHORT_CALL"
        score = 10
    
    return {
        "outcome": outcome,
        "score": score,
        "duration_seconds": duration,
        "ended_reason": ended_reason
    }

def extract_lessons(transcript, grade):
    """Extract specific lessons from the call."""
    t = transcript.lower()
    lessons = []
    
    # What went wrong?
    if grade["outcome"] == "IVR_TRAP":
        lessons.append({"type": "FAILURE", "lesson": "Hit IVR system. Pre-screen this number or try during off-peak hours."})
    
    if grade["outcome"] == "VOICEMAIL":
        lessons.append({"type": "NEUTRAL", "lesson": "Voicemail. Check if voicemail script was delivered correctly."})
    
    if "who is this" in t and "jordan" not in t[:300].lower():
        lessons.append({"type": "FAILURE", "lesson": "Prospect asked who's calling before Jordan identified. Opener may need work."})
    
    if "robot" in t or "is this ai" in t or "are you a bot" in t or "are you real" in t:
        if grade["score"] >= 50:
            lessons.append({"type": "WIN", "lesson": "AI detected but prospect stayed engaged. Reveal worked."})
        else:
            lessons.append({"type": "FAILURE", "lesson": "AI detected and prospect disengaged. Reveal timing or naturalness needs work."})
    
    if "too expensive" in t or "can't afford" in t or "that's a lot" in t or "how much" in t:
        if grade["score"] >= 50:
            lessons.append({"type": "WIN", "lesson": "Price objection handled successfully. ROI pivot worked."})
        elif "how much" in t and grade["score"] < 30:
            lessons.append({"type": "FAILURE", "lesson": "Lost after pricing came up. ROI pivot may not have landed."})
    
    if "receptionist" in t:
        if "one call at a time" in t or "overflow" in t or "five ring" in t:
            lessons.append({"type": "WIN", "lesson": "Used overflow angle against existing receptionist."})
        else:
            lessons.append({"type": "OPPORTUNITY", "lesson": "Prospect mentioned receptionist but Jordan didn't use the overflow angle."})
    
    if grade["duration_seconds"] and grade["duration_seconds"] > 120 and grade["score"] < 30:
        lessons.append({"type": "FAILURE", "lesson": f"Long call ({grade['duration_seconds']:.0f}s) with no result. Jordan may be talking past the close."})
    
    if grade["outcome"] == "GATEKEEPER_DEFLECT":
        if "owner" in t and ("name" in t or "who" in t):
            lessons.append({"type": "WIN", "lesson": "Got owner name from gatekeeper."})
        else:
            lessons.append({"type": "FAILURE", "lesson": "Gatekeeper blocked without getting owner name. Pushback may need adjustment."})
    
    # IVR-specific: Jordan kept talking to IVR
    if grade["outcome"] == "IVR_TRAP" and t.count("jordan:") > 3:
        lessons.append({"type": "FAILURE", "lesson": "Jordan kept responding to IVR instead of going silent. IVR detection not working."})
    
    # Jordan repeated intro too many times
    intro_count = t.count("this is jordan")
    if intro_count > 2:
        lessons.append({"type": "FAILURE", "lesson": f"Jordan repeated intro {intro_count} times. Max should be 2."})
    
    # exceeded-max-duration means we burned money
    if grade.get("ended_reason") == "exceeded-max-duration":
        lessons.append({"type": "FAILURE", "lesson": "Hit max duration limit. Call went too long without resolution."})
    
    # What worked?
    if grade["outcome"] in ("HOT_LEAD", "WARM_CALLBACK"):
        if "demo" in t and ("this call" in t or "you've been" in t):
            lessons.append({"type": "WIN", "lesson": "Demo reveal landed. Prospect was impressed by the live demo concept."})
        if "missed call" in t or "revenue" in t:
            lessons.append({"type": "WIN", "lesson": "Revenue/missed call framing resonated with this prospect."})
        if "competitor" in t:
            lessons.append({"type": "WIN", "lesson": "Competitive urgency angle worked."})
        if "average job" in t or "job worth" in t:
            lessons.append({"type": "WIN", "lesson": "ROI math (average job value) resonated."})
    
    if grade["outcome"] == "HOT_LEAD":
        lessons.append({"type": "WIN", "lesson": f"SUCCESSFUL CLOSE. Preserve this conversation pattern for future calls."})
    
    if not lessons:
        lessons.append({"type": "NEUTRAL", "lesson": f"Standard {grade['outcome']} call. No specific pattern extracted."})
    
    return lessons

def load_lessons_db():
    """Load existing lessons database."""
    if os.path.exists(LESSONS_FILE):
        with open(LESSONS_FILE) as f:
            return json.load(f)
    return {"calls": [], "patterns": {}, "win_phrases": [], "fail_phrases": [], "prompt_version": "v13.2"}

def save_lessons_db(db):
    """Save lessons database."""
    with open(LESSONS_FILE, 'w') as f:
        json.dump(db, f, indent=2)

def update_patterns(db):
    """Analyze all calls and extract recurring patterns."""
    outcomes = {}
    all_lessons = []
    
    for call in db["calls"]:
        outcome = call["grade"]["outcome"]
        outcomes[outcome] = outcomes.get(outcome, 0) + 1
        all_lessons.extend(call["lessons"])
    
    # Count lesson types
    wins = [l for l in all_lessons if l["type"] == "WIN"]
    failures = [l for l in all_lessons if l["type"] == "FAILURE"]
    
    # Extract successful conversation snippets
    successful_calls = [c for c in db["calls"] if c["grade"]["score"] >= 50]
    
    db["patterns"] = {
        "total_calls": len(db["calls"]),
        "outcome_distribution": outcomes,
        "win_count": len(wins),
        "fail_count": len(failures),
        "top_wins": list(set(l["lesson"] for l in wins))[:10],
        "top_failures": list(set(l["lesson"] for l in failures))[:10],
        "avg_score": sum(c["grade"]["score"] for c in db["calls"]) / max(len(db["calls"]), 1),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "successful_call_ids": [c["call_id"] for c in successful_calls],
        "prompt_recommendations": generate_recommendations(db)
    }
    
    return db

def generate_recommendations(db):
    """Based on accumulated lessons, suggest prompt changes."""
    recs = []
    all_lessons = []
    for call in db["calls"]:
        all_lessons.extend(call["lessons"])
    
    failures = [l["lesson"] for l in all_lessons if l["type"] == "FAILURE"]
    wins = [l["lesson"] for l in all_lessons if l["type"] == "WIN"]
    
    # Count failure frequency
    fail_counts = {}
    for f in failures:
        fail_counts[f] = fail_counts.get(f, 0) + 1
    
    # If same failure happens 3+ times, it's a pattern needing a prompt fix
    for lesson, count in fail_counts.items():
        if count >= 3:
            recs.append({
                "priority": "HIGH",
                "issue": lesson,
                "frequency": count,
                "action": f"This failure occurred {count} times. Prompt adjustment needed."
            })
        elif count >= 2:
            recs.append({
                "priority": "MEDIUM",
                "issue": lesson,
                "frequency": count,
                "action": f"Occurred {count} times. Monitor on next batch."
            })
    
    # Check outcome distribution for systemic issues
    outcomes = {}
    for call in db["calls"]:
        o = call["grade"]["outcome"]
        outcomes[o] = outcomes.get(o, 0) + 1
    
    total = len(db["calls"])
    if total > 0:
        ivr_rate = outcomes.get("IVR_TRAP", 0) / total
        if ivr_rate > 0.2:
            recs.append({
                "priority": "HIGH",
                "issue": f"IVR trap rate is {ivr_rate*100:.0f}% ({outcomes.get('IVR_TRAP',0)}/{total})",
                "action": "Pre-screen numbers for IVR before calling. Consider direct-dial lists."
            })
        
        no_connect_rate = outcomes.get("NO_CONNECT", 0) / total
        if no_connect_rate > 0.3:
            recs.append({
                "priority": "HIGH",
                "issue": f"No-connect rate is {no_connect_rate*100:.0f}%",
                "action": "Check calling times, number reputation, or try different area codes."
            })
        
        hard_no_rate = outcomes.get("HARD_NO", 0) / total
        conversation_rate = (outcomes.get("CONVERSATION", 0) + outcomes.get("WARM_CALLBACK", 0) + outcomes.get("HOT_LEAD", 0)) / total
        if conversation_rate > 0 and hard_no_rate / max(conversation_rate, 0.01) > 0.5:
            recs.append({
                "priority": "MEDIUM",
                "issue": "High hard-no ratio relative to conversations",
                "action": "Review opener and first impression. May be too aggressive."
            })
    
    return recs

def analyze_call(call_data):
    """Full analysis pipeline for a single call."""
    call_id = call_data.get("id", "unknown")
    
    # Skip calls that never connected (wallet empty, failed to start, etc.)
    status = call_data.get("status", "")
    ended_reason = call_data.get("endedReason", "")
    duration = call_data.get("duration", 0) or 0
    cost = call_data.get("cost", 0) or 0
    
    if status in ("failed",) or ended_reason in ("pipeline-error-openai-llm-failed", "assistant-not-valid"):
        print(f"  [{call_id}] Call failed ({ended_reason}). Skipping.")
        return None
    
    transcript = extract_transcript_text(call_data)
    
    if not transcript.strip():
        print(f"  [{call_id}] No transcript available. Skipping.")
        return None
    
    # Sanity check: if transcript only has system prompt content but no prospect lines, skip
    prospect_lines = [l for l in transcript.split('\n') if l.startswith('PROSPECT:')]
    if not prospect_lines:
        print(f"  [{call_id}] No prospect dialogue found. Skipping.")
        return None
    
    grade = grade_call(transcript, call_data)
    lessons = extract_lessons(transcript, grade)
    
    result = {
        "call_id": call_id,
        "timestamp": call_data.get("createdAt", datetime.now(timezone.utc).isoformat()),
        "phone": call_data.get("customer", {}).get("number", "unknown"),
        "duration": grade["duration_seconds"],
        "grade": grade,
        "lessons": lessons,
        "transcript_preview": transcript[:500]
    }
    
    # Print summary
    print(f"\n  Call: {call_id}")
    print(f"  Phone: {result['phone']}")
    print(f"  Duration: {result['duration']:.0f}s")
    print(f"  Outcome: {grade['outcome']} (score: {grade['score']})")
    for lesson in lessons:
        icon = "+" if lesson["type"] == "WIN" else "-" if lesson["type"] == "FAILURE" else "~"
        print(f"  [{icon}] {lesson['lesson']}")
    
    return result

def main():
    args = sys.argv[1:]
    
    if "--call-id" in args:
        idx = args.index("--call-id")
        call_id = args[idx + 1]
        print(f"Analyzing call: {call_id}")
        call_data = fetch_call(call_id)
        result = analyze_call(call_data)
        if result:
            db = load_lessons_db()
            # Don't duplicate
            existing_ids = {c["call_id"] for c in db["calls"]}
            if result["call_id"] not in existing_ids:
                db["calls"].append(result)
                db = update_patterns(db)
                save_lessons_db(db)
                print(f"\n  Saved to lessons DB. Total calls analyzed: {len(db['calls'])}")
            else:
                print(f"\n  Already in DB. Skipping save.")
    
    elif "--latest" in args:
        limit = 5
        if "--limit" in args:
            limit = int(args[args.index("--limit") + 1])
        print(f"Analyzing latest {limit} calls...")
        calls = fetch_latest_calls(limit)
        if isinstance(calls, list):
            call_list = calls
        else:
            call_list = calls.get("results", calls.get("data", []))
        
        db = load_lessons_db()
        existing_ids = {c["call_id"] for c in db["calls"]}
        new_count = 0
        
        for call_data in call_list:
            if call_data.get("id") not in existing_ids:
                result = analyze_call(call_data)
                if result:
                    db["calls"].append(result)
                    new_count += 1
        
        if new_count > 0:
            db = update_patterns(db)
            save_lessons_db(db)
        
        print(f"\n  New calls analyzed: {new_count}")
        print(f"  Total in DB: {len(db['calls'])}")
        if db.get("patterns"):
            p = db["patterns"]
            print(f"  Avg score: {p['avg_score']:.1f}")
            print(f"  Wins: {p['win_count']} | Failures: {p['fail_count']}")
    
    elif "--summary" in args:
        db = load_lessons_db()
        if not db["calls"]:
            print("No calls analyzed yet.")
            return
        p = db.get("patterns", {})
        print(f"=== CALL LESSONS SUMMARY ===")
        print(f"Total calls: {p.get('total_calls', 0)}")
        print(f"Avg score: {p.get('avg_score', 0):.1f}")
        print(f"\nOutcome distribution:")
        for outcome, count in sorted(p.get("outcome_distribution", {}).items(), key=lambda x: -x[1]):
            pct = count / max(p.get("total_calls", 1), 1) * 100
            print(f"  {outcome}: {count} ({pct:.0f}%)")
        print(f"\nTop wins:")
        for w in p.get("top_wins", []):
            print(f"  [+] {w}")
        print(f"\nTop failures:")
        for f_item in p.get("top_failures", []):
            print(f"  [-] {f_item}")
        recs = p.get("prompt_recommendations", [])
        if recs:
            print(f"\n=== PROMPT RECOMMENDATIONS ===")
            for r in sorted(recs, key=lambda x: 0 if x["priority"] == "HIGH" else 1):
                print(f"  [{r['priority']}] {r['issue']}")
                print(f"        -> {r['action']}")
        # Show successful call IDs for reference
        success_ids = p.get("successful_call_ids", [])
        if success_ids:
            print(f"\nSuccessful calls to study: {len(success_ids)}")
            for sid in success_ids[:5]:
                print(f"  {sid}")
    
    else:
        print("Usage:")
        print("  python3 post-call-analyzer.py --call-id <id>    Analyze a specific call")
        print("  python3 post-call-analyzer.py --latest [--limit N]  Analyze latest N calls")
        print("  python3 post-call-analyzer.py --summary         Show lessons summary")

if __name__ == "__main__":
    main()
