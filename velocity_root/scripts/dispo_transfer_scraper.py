#!/usr/bin/env python3
"""
Project Velocity - Dispo Transfer Record Scraper
Identifies institutional/hedge fund buyers by analyzing recent property transfers
in Hamilton County.

Logic: Any entity that bought 5+ properties in last 90 days = institutional buyer.
Scrapes: Hamilton County Auditor transfer records.
Output: velocity_root/dispo/buyer_list.csv
"""

import json
import csv
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: playwright not installed")
    sys.exit(1)

VELOCITY_ROOT = Path(__file__).parent.parent
DISPO_DIR = VELOCITY_ROOT / "dispo"
CONFIG_PATH = VELOCITY_ROOT / "config" / "config.json"

# Entity keywords that signal institutional buyers
INSTITUTIONAL_KEYWORDS = [
    "llc", "homes 4 rent", "amh", "capital", "properties",
    "investments", "holdings", "realty", "acquisitions",
    "ventures", "partners", "fund", "equity", "asset",
    "management", "group", "trust", "corp", "inc"
]

# Minimum purchases to be considered institutional
MIN_PURCHASES = 3  # Lowered from 5 for local market


def scrape_transfer_records(page, days_back=90):
    """
    Scrape Hamilton County Auditor for recent property transfers.
    """
    print(f"[DISPO] Scraping transfer records (last {days_back} days)...")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    # Navigate to auditor search with transfer date filter
    url = "https://wedge1.hcauditor.org/"
    page.goto(url, timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    
    transfers = []
    
    # Try to find transfer date range fields
    try:
        # Look for date range inputs
        start_input = page.locator("input[name*='TransferDate'], input[name*='transferDate'], input[name*='dateFrom']").first
        end_input = page.locator("input[name*='TransferDateTo'], input[name*='dateTo']").first
        
        if start_input.is_visible(timeout=3000):
            start_input.fill(start_date.strftime("%m/%d/%Y"))
            if end_input.is_visible(timeout=2000):
                end_input.fill(end_date.strftime("%m/%d/%Y"))
            
            # Set sale price range to filter for residential (e.g., $50K-$500K)
            price_min = page.locator("input[name*='PriceFrom'], input[name*='saleFrom']").first
            price_max = page.locator("input[name*='PriceTo'], input[name*='saleTo']").first
            
            if price_min.is_visible(timeout=2000):
                price_min.fill("50000")
            if price_max.is_visible(timeout=2000):
                price_max.fill("500000")
            
            # Submit
            submit = page.locator("input[type='submit'], button[type='submit']").first
            submit.click()
            page.wait_for_load_state("networkidle", timeout=15000)
            
            # Extract results
            rows = page.locator("table tr").all()
            for row in rows[1:]:  # Skip header
                try:
                    cells = row.locator("td").all()
                    if len(cells) >= 4:
                        transfer = {
                            "buyer": cells[0].inner_text().strip() if len(cells) > 0 else "",
                            "address": cells[1].inner_text().strip() if len(cells) > 1 else "",
                            "sale_price": cells[2].inner_text().strip() if len(cells) > 2 else "",
                            "transfer_date": cells[3].inner_text().strip() if len(cells) > 3 else "",
                        }
                        if transfer["buyer"]:
                            transfers.append(transfer)
                except:
                    continue
    except Exception as e:
        print(f"[DISPO] Transfer record scrape error: {e}")
        # Fallback: try the recorder's office
        print("[DISPO] Trying Hamilton County Recorder's Office...")
        try:
            page.goto("https://recordersoffice.hamilton-co.org/", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=10000)
            text = page.locator("body").inner_text()
            print(f"[DISPO] Recorder page preview: {text[:500]}")
        except Exception as e2:
            print(f"[DISPO] Recorder fallback also failed: {e2}")
    
    print(f"[DISPO] Found {len(transfers)} transfer records")
    return transfers


def identify_institutional_buyers(transfers):
    """
    Analyze transfer records to find institutional/bulk buyers.
    Returns list of buyers with 3+ purchases in the period.
    """
    buyer_counts = Counter()
    buyer_properties = {}
    
    for t in transfers:
        buyer = t.get("buyer", "").strip()
        if not buyer:
            continue
        
        # Normalize name
        buyer_normalized = buyer.upper().strip()
        
        # Check if this looks like an entity (not a person)
        is_entity = any(kw in buyer_normalized.lower() for kw in INSTITUTIONAL_KEYWORDS)
        
        if is_entity:
            buyer_counts[buyer_normalized] += 1
            if buyer_normalized not in buyer_properties:
                buyer_properties[buyer_normalized] = []
            buyer_properties[buyer_normalized].append(t)
    
    # Filter to those with MIN_PURCHASES or more
    institutional = []
    for buyer, count in buyer_counts.most_common():
        if count >= MIN_PURCHASES:
            properties = buyer_properties[buyer]
            
            # Calculate avg purchase price
            prices = []
            for p in properties:
                try:
                    price = int(re.sub(r'[^\d]', '', p.get("sale_price", "0")))
                    if price > 0:
                        prices.append(price)
                except:
                    pass
            
            avg_price = sum(prices) / len(prices) if prices else 0
            
            institutional.append({
                "buyer_name": buyer,
                "purchase_count": count,
                "avg_purchase_price": int(avg_price),
                "min_price": min(prices) if prices else 0,
                "max_price": max(prices) if prices else 0,
                "sample_addresses": [p.get("address", "") for p in properties[:5]],
                "identified_at": datetime.now().isoformat()
            })
    
    return institutional


def lookup_ohio_sos(page, entity_name):
    """
    Look up entity on Ohio Secretary of State website for contact info.
    """
    try:
        page.goto("https://www.ohiosos.gov/businesses/information-on-a-business/", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=10000)
        
        # Fill search
        search_input = page.locator("input[name*='search'], input[name*='business'], input#txtSearch").first
        if search_input.is_visible(timeout=3000):
            search_input.fill(entity_name)
            
            submit = page.locator("input[type='submit'], button[type='submit']").first
            submit.click()
            page.wait_for_load_state("networkidle", timeout=10000)
            
            text = page.locator("body").inner_text()
            
            # Extract registered agent info
            agent_match = re.search(r"(?:Registered Agent|Agent)[:\s]*(.+?)(?:\n|Address)", text, re.IGNORECASE)
            address_match = re.search(r"(?:Agent Address|Registered Office)[:\s]*(.+?)(?:\n|$)", text, re.IGNORECASE)
            
            return {
                "registered_agent": agent_match.group(1).strip() if agent_match else None,
                "agent_address": address_match.group(1).strip() if address_match else None,
                "raw_text": text[:500]
            }
    except Exception as e:
        print(f"[DISPO] SOS lookup failed for {entity_name}: {e}")
    
    return None


def save_buyer_list(buyers, sos_data=None):
    """Save the institutional buyer list."""
    DISPO_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save CSV
    csv_path = DISPO_DIR / "buyer_list.csv"
    if buyers:
        fieldnames = ["buyer_name", "purchase_count", "avg_purchase_price", 
                      "min_price", "max_price", "registered_agent", "agent_address",
                      "contact_email", "contact_phone", "identified_at"]
        
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            
            for buyer in buyers:
                # Merge SOS data if available
                if sos_data and buyer["buyer_name"] in sos_data:
                    sos = sos_data[buyer["buyer_name"]]
                    buyer["registered_agent"] = sos.get("registered_agent", "")
                    buyer["agent_address"] = sos.get("agent_address", "")
                
                writer.writerow(buyer)
        
        print(f"[DISPO] Saved {len(buyers)} institutional buyers to {csv_path}")
    
    # Save JSON with full details
    json_path = DISPO_DIR / "buyer_list_full.json"
    with open(json_path, "w") as f:
        json.dump(buyers, f, indent=2, default=str)


def main():
    print("=" * 60)
    print("PROJECT VELOCITY - DISPO SPECIALIST")
    print("Identifying Institutional Buyers in Hamilton County")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        # Step 1: Scrape transfer records
        transfers = scrape_transfer_records(page)
        
        # Step 2: Identify institutional buyers
        institutional = identify_institutional_buyers(transfers)
        
        print(f"\n[DISPO] Found {len(institutional)} institutional buyers:")
        for buyer in institutional:
            print(f"  - {buyer['buyer_name']}: {buyer['purchase_count']} purchases, avg ${buyer['avg_purchase_price']:,}")
        
        # Step 3: Look up contact info via Ohio SOS (top 10 only to avoid rate limits)
        sos_data = {}
        for buyer in institutional[:10]:
            print(f"\n[DISPO] Looking up {buyer['buyer_name']} on Ohio SOS...")
            sos = lookup_ohio_sos(page, buyer["buyer_name"])
            if sos:
                sos_data[buyer["buyer_name"]] = sos
            time.sleep(2)
        
        browser.close()
    
    # Save results
    save_buyer_list(institutional, sos_data)
    
    print(f"\n{'=' * 60}")
    print(f"[DISPO] COMPLETE")
    print(f"  Transfer records scraped: {len(transfers) if 'transfers' in dir() else 0}")
    print(f"  Institutional buyers found: {len(institutional)}")
    print(f"  SOS lookups completed: {len(sos_data)}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
