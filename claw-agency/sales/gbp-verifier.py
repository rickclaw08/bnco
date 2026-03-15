#!/usr/bin/env python3
"""
ClawOps GBP Browser Verifier - Production version
Verifies all Wave 2 leads against Google Maps Business Profiles.
Saves progress incrementally so it can resume if interrupted.
"""

import csv
import json
import re
import time
import sys
from playwright.sync_api import sync_playwright

INPUT_FILE = "claw-agency/sales/fresh-leads-wave2-scored.csv"
OUTPUT_FILE = "claw-agency/sales/fresh-leads-wave2-gbp-verified.csv"
RESULTS_FILE = "/tmp/gbp_wave2_verification.jsonl"

def normalize_phone(phone_str):
    digits = re.sub(r'\D', '', phone_str)
    return digits[-10:] if len(digits) >= 10 else digits

def verify_lead(page, lead, idx, total):
    name = lead['Business Name']
    city = lead['City']
    state = lead['State']
    our_phone = normalize_phone(lead['Phone'])
    
    search_query = f"{name} {city} {state}"
    maps_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
    
    result = {
        "name": name,
        "our_phone": lead['Phone'],
        "our_phone_normalized": our_phone,
        "status": "unknown",
        "gbp_phones": [],
        "corrected_phone": None
    }
    
    try:
        page.goto(maps_url, timeout=12000, wait_until="domcontentloaded")
        time.sleep(2.5)
        
        # If we landed on a list, click the first result
        first_result = page.query_selector('a.hfpxzc')
        if first_result:
            first_result.click()
            time.sleep(2)
        
        # Extract phone from detail panel
        phones = []
        
        # Method 1: data-item-id phone elements
        phone_elements = page.query_selector_all('[data-item-id*="phone"]')
        for el in phone_elements:
            data_id = el.get_attribute("data-item-id") or ""
            if "tel:" in data_id:
                phone = data_id.split("tel:")[-1]
                phones.append(normalize_phone(phone))
            text = el.inner_text() or ""
            for pm in re.findall(r'\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}', text):
                phones.append(normalize_phone(pm))
        
        # Method 2: Phone buttons with aria-label
        phone_buttons = page.query_selector_all('button[aria-label*="Phone:" i]')
        for btn in phone_buttons:
            label = btn.get_attribute("aria-label") or ""
            for pm in re.findall(r'\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}', label):
                phones.append(normalize_phone(pm))
        
        unique = list(set(p for p in phones if len(p) == 10))
        result["gbp_phones"] = [f"+1{p}" for p in unique]
        
        if not unique:
            result["status"] = "no_phone_found"
        elif our_phone in unique:
            result["status"] = "exact_match"
        else:
            result["status"] = "mismatch"
            result["corrected_phone"] = f"+1{unique[0]}"
    
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)[:100]
    
    # Status indicator
    icons = {"exact_match": "OK", "mismatch": "FIX", "no_phone_found": "??", "error": "ERR"}
    icon = icons.get(result["status"], "?")
    extra = ""
    if result["status"] == "mismatch":
        extra = f" -> {result['corrected_phone']}"
    print(f"  [{idx:3d}/{total}] {icon:3s} {name[:42]:42s} {lead['Phone (formatted)']:16s}{extra}")
    
    return result

def main():
    # Load leads
    leads = []
    with open(INPUT_FILE) as f:
        reader = csv.DictReader(f)
        for row in reader:
            leads.append(row)
    
    total = len(leads)
    
    # Load existing results for resume
    existing = {}
    try:
        with open(RESULTS_FILE) as f:
            for line in f:
                if line.strip():
                    r = json.loads(line)
                    existing[r["our_phone_normalized"]] = r
        print(f"Resuming: {len(existing)} already verified")
    except FileNotFoundError:
        pass
    
    remaining = [l for l in leads if normalize_phone(l['Phone']) not in existing]
    print(f"Total leads: {total}")
    print(f"Already done: {len(existing)}")
    print(f"Remaining: {len(remaining)}")
    print()
    
    if not remaining:
        print("All leads already verified!")
    else:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 900},
                locale="en-US"
            )
            page = context.new_page()
            
            # Accept Google consent
            try:
                page.goto("https://www.google.com/maps", timeout=10000)
                time.sleep(1)
                consent = page.query_selector('button:has-text("Accept all")')
                if consent:
                    consent.click()
                    time.sleep(1)
            except:
                pass
            
            start_idx = len(existing) + 1
            for i, lead in enumerate(remaining):
                idx = start_idx + i
                result = verify_lead(page, lead, idx, total)
                existing[result["our_phone_normalized"]] = result
                
                # Save incrementally
                with open(RESULTS_FILE, 'a') as f:
                    f.write(json.dumps(result) + "\n")
                
                time.sleep(1.2)
                
                # Progress every 50
                if idx % 50 == 0:
                    matches = sum(1 for r in existing.values() if r["status"] == "exact_match")
                    mismatches = sum(1 for r in existing.values() if r["status"] == "mismatch")
                    nf = sum(1 for r in existing.values() if r["status"] == "no_phone_found")
                    err = sum(1 for r in existing.values() if r["status"] == "error")
                    print(f"\n  --- {idx}/{total} | Match:{matches} Mismatch:{mismatches} NoPhone:{nf} Error:{err} ---\n")
            
            browser.close()
    
    # Build final results
    all_results = existing
    matches = sum(1 for r in all_results.values() if r["status"] == "exact_match")
    mismatches = sum(1 for r in all_results.values() if r["status"] == "mismatch")
    no_phone = sum(1 for r in all_results.values() if r["status"] == "no_phone_found")
    errors = sum(1 for r in all_results.values() if r["status"] == "error")
    
    print(f"\n{'='*60}")
    print(f"GBP VERIFICATION COMPLETE")
    print(f"{'='*60}")
    print(f"Total verified: {len(all_results)}")
    print(f"Exact match:    {matches} ({matches/max(len(all_results),1)*100:.0f}%)")
    print(f"Mismatch/Fixed: {mismatches} ({mismatches/max(len(all_results),1)*100:.0f}%)")
    print(f"No phone found: {no_phone} ({no_phone/max(len(all_results),1)*100:.0f}%)")
    print(f"Errors:         {errors} ({errors/max(len(all_results),1)*100:.0f}%)")
    
    # Write verified CSV (only exact matches and corrected mismatches)
    num = 0
    with open(OUTPUT_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['#', 'Score', 'Business Name', 'Phone', 'Phone (formatted)', 'City', 'State', 'TZ', 'Niche', 'Rating', 'Reviews', 'Source', 'Verification', 'Original Phone'])
        
        for lead in leads:
            our_phone = normalize_phone(lead['Phone'])
            r = all_results.get(our_phone)
            if not r:
                continue
            
            if r["status"] == "exact_match":
                num += 1
                writer.writerow([
                    num, lead['Score'], lead['Business Name'], lead['Phone'], lead['Phone (formatted)'],
                    lead['City'], lead['State'], lead['TZ'], lead['Niche'],
                    lead['Rating'], lead['Reviews'], 'Google Places API', 'GBP-verified', ''
                ])
            elif r["status"] == "mismatch" and r.get("corrected_phone"):
                num += 1
                corrected = r["corrected_phone"]
                digits = normalize_phone(corrected)
                formatted = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
                writer.writerow([
                    num, lead['Score'], lead['Business Name'], corrected, formatted,
                    lead['City'], lead['State'], lead['TZ'], lead['Niche'],
                    lead['Rating'], lead['Reviews'], 'Google Places API', 'GBP-corrected', lead['Phone']
                ])
    
    print(f"\nVerified leads saved: {num}")
    print(f"Dropped (unverifiable): {len(all_results) - num}")
    print(f"Output: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
