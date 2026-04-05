#!/usr/bin/env python3
"""
Project Velocity - Pipeline Orchestrator
Runs the full pipeline: Scout -> Analyst -> Closer -> Dispo

Usage:
  python pipeline.py scout          # Run Scout only (scrape leads)
  python pipeline.py analyze        # Run Analyst on scraped leads
  python pipeline.py full           # Run full pipeline
  python pipeline.py status         # Show pipeline status
"""

import json
import csv
import sys
import os
from datetime import datetime
from pathlib import Path

VELOCITY_ROOT = Path(__file__).parent.parent
LEADS_DIR = VELOCITY_ROOT / "leads"
DISPO_DIR = VELOCITY_ROOT / "dispo"
MEMORY_DIR = VELOCITY_ROOT / "memory"
CONFIG_PATH = VELOCITY_ROOT / "config" / "config.json"

# Load config
with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

BUDGET_PAUSE_THRESHOLD = CONFIG["targets"].get("budget_pause_threshold", 90)
MONTHLY_BUDGET = CONFIG["targets"].get("monthly_budget", 100)

# Spend tracking file
SPEND_FILE = VELOCITY_ROOT / "memory" / "monthly_spend.json"


def load_spend():
    """Load current month's spend tracking."""
    if SPEND_FILE.exists():
        with open(SPEND_FILE) as f:
            data = json.load(f)
        # Reset if new month
        current_month = datetime.now().strftime("%Y-%m")
        if data.get("month") != current_month:
            return {"month": current_month, "total": 0.0, "entries": [], "paused": False}
        return data
    return {"month": datetime.now().strftime("%Y-%m"), "total": 0.0, "entries": [], "paused": False}


def save_spend(data):
    """Save spend tracking."""
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    with open(SPEND_FILE, "w") as f:
        json.dump(data, f, indent=2)


def record_spend(amount, description):
    """Record a spend entry and check budget gate."""
    spend = load_spend()
    spend["total"] += amount
    spend["entries"].append({
        "amount": amount,
        "description": description,
        "timestamp": datetime.now().isoformat()
    })
    
    if spend["total"] >= BUDGET_PAUSE_THRESHOLD:
        spend["paused"] = True
        print(f"[BUDGET] PAUSED. Monthly spend ${spend['total']:.2f} hit ${BUDGET_PAUSE_THRESHOLD} threshold.")
        print(f"[BUDGET] No new outreach until next billing cycle.")
    
    save_spend(spend)
    return spend


def budget_check():
    """Check if outreach is allowed under budget. Returns True if OK."""
    spend = load_spend()
    if spend.get("paused"):
        print(f"[BUDGET] BLOCKED. Spend ${spend['total']:.2f} >= ${BUDGET_PAUSE_THRESHOLD} cap. Outreach paused.")
        return False
    remaining = BUDGET_PAUSE_THRESHOLD - spend["total"]
    print(f"[BUDGET] OK. Spent ${spend['total']:.2f} / ${BUDGET_PAUSE_THRESHOLD} cap. ${remaining:.2f} remaining before pause.")
    return True

def ensure_dirs():
    """Create all required directories."""
    for d in [LEADS_DIR, DISPO_DIR, MEMORY_DIR]:
        d.mkdir(parents=True, exist_ok=True)

def show_status():
    """Show current pipeline status."""
    print("=" * 60)
    print("PROJECT VELOCITY - PIPELINE STATUS")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    # Count leads
    raw_files = list(LEADS_DIR.glob("raw_scrape_*.json"))
    analyzed_file = LEADS_DIR / "analyzed_leads.csv"
    buyer_file = DISPO_DIR / "buyer_list.csv"
    
    print(f"\n[SCOUT] Raw scrape files: {len(raw_files)}")
    if raw_files:
        latest = max(raw_files, key=lambda p: p.stat().st_mtime)
        with open(latest) as f:
            data = json.load(f)
        total = sum(len(data.get(k, [])) for k in ["sheriff_sales", "auction_site", "court_clerk"])
        print(f"  Latest: {latest.name} ({total} entries)")
    
    print(f"\n[ANALYST] Analyzed leads file exists: {analyzed_file.exists()}")
    if analyzed_file.exists():
        with open(analyzed_file) as f:
            reader = csv.DictReader(f)
            leads = list(reader)
        viable = sum(1 for l in leads if l.get("verdict") == "VIABLE")
        short_sale = sum(1 for l in leads if l.get("verdict") == "SHORT_SALE_REFER")
        skip = sum(1 for l in leads if l.get("verdict") == "SKIP")
        print(f"  Total: {len(leads)} | Viable: {viable} | Short Sale: {short_sale} | Skip: {skip}")
    
    print(f"\n[DISPO] Buyer list exists: {buyer_file.exists()}")
    if buyer_file.exists():
        with open(buyer_file) as f:
            reader = csv.DictReader(f)
            buyers = list(reader)
        print(f"  Institutional buyers: {len(buyers)}")
    
    # Check for active deals
    deals_file = LEADS_DIR / "active_deals.json"
    print(f"\n[CLOSER] Active deals file exists: {deals_file.exists()}")
    if deals_file.exists():
        with open(deals_file) as f:
            deals = json.load(f)
        print(f"  Active deals: {len(deals)}")
    
    print(f"\n{'=' * 60}")
    
    # Budget status
    spend = load_spend()
    print(f"\n[BUDGET]")
    print(f"  Month: {spend.get('month', 'N/A')}")
    print(f"  Spent: ${spend.get('total', 0):.2f} / ${MONTHLY_BUDGET} budget")
    print(f"  Pause threshold: ${BUDGET_PAUSE_THRESHOLD}")
    print(f"  Status: {'PAUSED' if spend.get('paused') else 'ACTIVE'}")
    remaining = BUDGET_PAUSE_THRESHOLD - spend.get("total", 0)
    print(f"  Remaining before pause: ${max(0, remaining):.2f}")
    print(f"\n{'=' * 60}")

def run_scout():
    """Run the Scout scraper."""
    print("[PIPELINE] Running Scout...")
    os.system(f"python3 {VELOCITY_ROOT / 'scripts' / 'scout_scraper.py'}")

def run_analyst(leads_file="raw_leads.csv"):
    """Run the Analyst on leads."""
    print("[PIPELINE] Running Analyst...")
    os.system(f"python3 {VELOCITY_ROOT / 'scripts' / 'analyst_valuator.py'} {leads_file}")

def run_dispo():
    """Run the Dispo transfer scraper."""
    print("[PIPELINE] Running Dispo Specialist...")
    os.system(f"python3 {VELOCITY_ROOT / 'scripts' / 'dispo_transfer_scraper.py'}")

def run_full():
    """Run the full pipeline."""
    print("[PIPELINE] FULL PIPELINE RUN")
    
    # Budget gate before any outreach
    if not budget_check():
        print("[PIPELINE] ABORTED. Budget cap hit. Scraping (free) still allowed, outreach blocked.")
        print("[PIPELINE] Running Scout and Analyst only (no spend)...")
        run_scout()
        print("\n[PIPELINE] Scout complete. Skipping outreach due to budget cap.")
        return
    
    print("Step 1: Scout (scrape leads)")
    run_scout()
    print("\nStep 2: Dispo (identify buyers)")
    run_dispo()
    print("\nStep 3: Analyst (will run on cleaned leads)")
    print("[PIPELINE] Note: Manual lead cleaning needed between Scout and Analyst")
    print("[PIPELINE] Full pipeline complete. Review raw data and create leads CSV for analysis.")

def main():
    ensure_dirs()
    
    if len(sys.argv) < 2:
        show_status()
        return
    
    cmd = sys.argv[1].lower()
    
    if cmd == "scout":
        run_scout()
    elif cmd == "analyze":
        leads_file = sys.argv[2] if len(sys.argv) > 2 else "raw_leads.csv"
        run_analyst(leads_file)
    elif cmd == "dispo":
        run_dispo()
    elif cmd == "full":
        run_full()
    elif cmd == "status":
        show_status()
    else:
        print(f"Unknown command: {cmd}")
        print("Usage: python pipeline.py [scout|analyze|dispo|full|status]")

if __name__ == "__main__":
    main()
