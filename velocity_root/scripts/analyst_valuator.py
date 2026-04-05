#!/usr/bin/env python3
"""
Project Velocity - The Analyst (Zero-Cost Valuator)
Calculates MAO (Maximum Allowable Offer) using free public data.

Formula: (SqFt * MedianZipPPSF * 0.70) - Repairs - TargetProfit = Offer Price

Data Sources:
- Zillow/Redfin for median Price Per Square Foot by zip code
- Hamilton County Auditor for property specifics

Safety Gates:
- Under-Water Check: If Mortgage Debt > MAO -> SHORT_SALE_REFER
- Equity Floor: If (Value - Judgment) < $40K -> SKIP
"""

import json
import csv
import os
import sys
import re
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

# Project paths
VELOCITY_ROOT = Path(__file__).parent.parent
LEADS_DIR = VELOCITY_ROOT / "leads"
CONFIG_PATH = VELOCITY_ROOT / "config" / "config.json"

# Load config
with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

ARV_MULTIPLIER = CONFIG["targets"]["arv_multiplier"]  # 0.70
STANDARD_REPAIR = CONFIG["targets"]["standard_repair_estimate"]  # $15,000
TARGET_PROFIT = 10000  # $10,000 minimum per deal
MIN_EQUITY = CONFIG["targets"]["min_equity_threshold"]  # $40,000

# Cache for zip code PPSF (avoid re-scraping)
PPSF_CACHE = {}
PPSF_CACHE_PATH = VELOCITY_ROOT / "config" / "ppsf_cache.json"

def load_ppsf_cache():
    global PPSF_CACHE
    if PPSF_CACHE_PATH.exists():
        with open(PPSF_CACHE_PATH) as f:
            PPSF_CACHE = json.load(f)
    return PPSF_CACHE

def save_ppsf_cache():
    with open(PPSF_CACHE_PATH, "w") as f:
        json.dump(PPSF_CACHE, f, indent=2)


def get_zillow_ppsf(page, zip_code):
    """
    Scrape Zillow for median Price Per Square Foot for a zip code.
    Falls back to Redfin if Zillow blocks.
    """
    if zip_code in PPSF_CACHE:
        cached = PPSF_CACHE[zip_code]
        print(f"[ANALYST] PPSF for {zip_code}: ${cached}/sqft (cached)")
        return cached
    
    ppsf = None
    
    # Try Zillow first
    try:
        print(f"[ANALYST] Fetching Zillow PPSF for zip {zip_code}...")
        url = f"https://www.zillow.com/home-values/{zip_code}/"
        page.goto(url, timeout=15000)
        page.wait_for_load_state("networkidle", timeout=10000)
        
        text = page.locator("body").inner_text()
        
        # Look for price per square foot patterns
        ppsf_patterns = [
            r'\$([\d,]+)\s*(?:per|/)\s*(?:sq\s*ft|sqft|square\s*foot)',
            r'price\s*per\s*(?:sq\s*ft|sqft|square\s*foot)[:\s]*\$([\d,]+)',
            r'median\s*(?:sale|list)\s*price\s*per\s*sq\s*ft[:\s]*\$([\d,]+)',
        ]
        
        for pattern in ppsf_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                val = match.group(1).replace(",", "")
                ppsf = int(val)
                break
        
        if ppsf:
            print(f"[ANALYST] Zillow PPSF for {zip_code}: ${ppsf}/sqft")
    except Exception as e:
        print(f"[ANALYST] Zillow failed for {zip_code}: {e}")
    
    # Fallback to Redfin
    if ppsf is None:
        try:
            print(f"[ANALYST] Trying Redfin for zip {zip_code}...")
            url = f"https://www.redfin.com/zipcode/{zip_code}/housing-market"
            page.goto(url, timeout=15000)
            page.wait_for_load_state("networkidle", timeout=10000)
            
            text = page.locator("body").inner_text()
            
            for pattern in ppsf_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    val = match.group(1).replace(",", "")
                    ppsf = int(val)
                    break
            
            if ppsf:
                print(f"[ANALYST] Redfin PPSF for {zip_code}: ${ppsf}/sqft")
        except Exception as e:
            print(f"[ANALYST] Redfin failed for {zip_code}: {e}")
    
    # Cache result
    if ppsf:
        PPSF_CACHE[zip_code] = ppsf
        save_ppsf_cache()
    
    return ppsf


def calculate_arv(sq_ft, ppsf):
    """Calculate After Repair Value."""
    if not sq_ft or not ppsf:
        return None
    return sq_ft * ppsf


def calculate_mao(arv, repair_estimate=None, target_profit=None):
    """
    Calculate Maximum Allowable Offer.
    Formula: (ARV * 0.70) - Repairs - Profit = MAO
    """
    if arv is None:
        return None
    
    repairs = repair_estimate or STANDARD_REPAIR
    profit = target_profit or TARGET_PROFIT
    
    mao = (arv * ARV_MULTIPLIER) - repairs - profit
    return max(0, int(mao))


def underwater_check(mortgage_debt, mao):
    """
    Safety Gate 1: Under-Water Check
    If mortgage debt > MAO, this is a short sale situation. DO NOT TOUCH.
    Returns: "VIABLE", "SHORT_SALE_REFER", or "UNKNOWN"
    """
    if mortgage_debt is None or mao is None:
        return "UNKNOWN"
    
    if mortgage_debt > mao:
        return "SHORT_SALE_REFER"
    
    return "VIABLE"


def equity_check(auditor_value, judgment_amount):
    """
    Safety Gate 3: Equity Floor
    If equity < $40K, not enough margin. SKIP.
    """
    if auditor_value is None or judgment_amount is None:
        return "UNKNOWN"
    
    equity = auditor_value - judgment_amount
    if equity < MIN_EQUITY:
        return "SKIP_LOW_EQUITY"
    
    return "PASS"


def analyze_lead(lead, page=None):
    """
    Full analysis pipeline for a single lead.
    Returns enriched lead dict with valuation and gate results.
    """
    result = {**lead}  # Copy original lead data
    
    # Required fields
    sq_ft = lead.get("sq_ft")
    zip_code = lead.get("zip_code")
    auditor_value = lead.get("auditor_value") or lead.get("total_value")
    judgment_amount = lead.get("judgment_amount")
    mortgage_debt = lead.get("mortgage_debt") or judgment_amount
    
    # Get PPSF for zip code
    ppsf = None
    if zip_code and page:
        ppsf = get_zillow_ppsf(page, zip_code)
    
    result["ppsf"] = ppsf
    
    # Calculate ARV
    arv = calculate_arv(sq_ft, ppsf)
    result["arv"] = arv
    
    # Calculate MAO
    mao = calculate_mao(arv)
    result["mao"] = mao
    
    # Safety Gates
    result["underwater_status"] = underwater_check(mortgage_debt, mao)
    result["equity_status"] = equity_check(auditor_value, judgment_amount)
    
    # Overall verdict
    if result["underwater_status"] == "SHORT_SALE_REFER":
        result["verdict"] = "SHORT_SALE_REFER"
        result["verdict_reason"] = f"Mortgage ${mortgage_debt:,} > MAO ${mao:,}" if mao else "Underwater"
    elif result["equity_status"] == "SKIP_LOW_EQUITY":
        equity = (auditor_value or 0) - (judgment_amount or 0)
        result["verdict"] = "SKIP"
        result["verdict_reason"] = f"Equity ${equity:,} < ${MIN_EQUITY:,} minimum"
    elif mao and mao > 0:
        result["verdict"] = "VIABLE"
        result["verdict_reason"] = f"MAO ${mao:,} | ARV ${arv:,} | Potential profit ${TARGET_PROFIT:,}+"
    else:
        result["verdict"] = "INSUFFICIENT_DATA"
        result["verdict_reason"] = "Missing sq_ft, zip_code, or PPSF data"
    
    result["analyzed_at"] = datetime.now().isoformat()
    
    return result


def analyze_batch(leads_file, output_file="analyzed_leads.csv"):
    """Analyze a batch of leads from CSV."""
    input_path = LEADS_DIR / leads_file
    output_path = LEADS_DIR / output_file
    
    if not input_path.exists():
        print(f"[ANALYST] Input file not found: {input_path}")
        return
    
    load_ppsf_cache()
    
    # Read leads
    with open(input_path) as f:
        reader = csv.DictReader(f)
        leads = list(reader)
    
    print(f"[ANALYST] Analyzing {len(leads)} leads...")
    
    results = []
    viable_count = 0
    skip_count = 0
    short_sale_count = 0
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        for i, lead in enumerate(leads):
            print(f"\n[ANALYST] Lead {i+1}/{len(leads)}: {lead.get('address', 'Unknown')}")
            
            result = analyze_lead(lead, page)
            results.append(result)
            
            verdict = result.get("verdict", "UNKNOWN")
            if verdict == "VIABLE":
                viable_count += 1
                print(f"  -> VIABLE: {result['verdict_reason']}")
            elif verdict == "SHORT_SALE_REFER":
                short_sale_count += 1
                print(f"  -> SHORT SALE: {result['verdict_reason']}")
            elif verdict == "SKIP":
                skip_count += 1
                print(f"  -> SKIP: {result['verdict_reason']}")
            else:
                print(f"  -> {verdict}: {result.get('verdict_reason', '')}")
            
            # Rate limit
            time.sleep(2)
        
        browser.close()
    
    # Save results
    if results:
        all_keys = set()
        for r in results:
            all_keys.update(r.keys())
        
        with open(output_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=sorted(all_keys), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(results)
    
    print(f"\n{'=' * 60}")
    print(f"[ANALYST] ANALYSIS COMPLETE")
    print(f"  Total: {len(results)}")
    print(f"  VIABLE: {viable_count}")
    print(f"  SHORT SALE (refer): {short_sale_count}")
    print(f"  SKIPPED (low equity): {skip_count}")
    print(f"  Output: {output_path}")
    print(f"{'=' * 60}")


import time  # already imported above, but for clarity

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_batch(sys.argv[1])
    else:
        print("Usage: python analyst_valuator.py <leads_file.csv>")
        print("  Reads from velocity_root/leads/<file>")
        print("  Outputs to velocity_root/leads/analyzed_leads.csv")
