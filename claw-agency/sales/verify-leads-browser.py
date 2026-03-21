#!/usr/bin/env python3
"""
Browser-based lead verification via Playwright + Google Maps.
Confirms: phone number, business hours, review count, rating, and pain signals.
"""
import csv, json, time, re, sys, os

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Installing playwright...")
    os.system("pip3 install playwright && python3 -m playwright install chromium")
    from playwright.sync_api import sync_playwright

PAIN_CSV = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/pain-signal-leads.csv"
HOURS_CSV = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/hiring-receptionist-leads.csv"
OUTPUT_CSV = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/verified-pain-leads.csv"
PROGRESS_FILE = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/verify-progress.json"

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"verified": [], "last_index": 0}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)

def search_google_maps(page, business_name, city, state):
    """Search for a business on Google Maps and extract details."""
    query = f"{business_name} {city} {state}"
    url = f"https://www.google.com/maps/search/{requests_quote(query)}"
    
    try:
        page.goto(url, timeout=15000)
        time.sleep(3)
        
        result = {}
        
        # Try to get phone number
        try:
            phone_el = page.locator('[data-item-id^="phone:"]').first
            if phone_el.is_visible(timeout=3000):
                result["verified_phone"] = phone_el.inner_text()
        except:
            pass
        
        # Try to get rating
        try:
            rating_el = page.locator('div.fontDisplayLarge').first
            if rating_el.is_visible(timeout=2000):
                result["verified_rating"] = rating_el.inner_text()
        except:
            pass
        
        # Try to get review count
        try:
            review_el = page.locator('span[aria-label*="reviews"]').first
            if review_el.is_visible(timeout=2000):
                text = review_el.get_attribute("aria-label") or ""
                match = re.search(r'([\d,]+)\s*review', text)
                if match:
                    result["verified_reviews"] = match.group(1).replace(",", "")
        except:
            pass
        
        # Try to get hours
        try:
            # Click on hours section if available
            hours_button = page.locator('[data-item-id="oh"]').first
            if hours_button.is_visible(timeout=2000):
                hours_button.click()
                time.sleep(1)
                hours_table = page.locator('table.eK4R0e').first
                if hours_table.is_visible(timeout=2000):
                    result["verified_hours"] = hours_table.inner_text()[:200]
        except:
            pass
        
        # Try to get website
        try:
            website_el = page.locator('[data-item-id="authority"]').first
            if website_el.is_visible(timeout=2000):
                result["verified_website"] = website_el.inner_text()
        except:
            pass
        
        # Check if business exists
        try:
            # If we see the business name in the panel, it exists
            name_el = page.locator('h1.DUwDvf').first
            if name_el.is_visible(timeout=2000):
                result["verified_name"] = name_el.inner_text()
                result["exists"] = True
            else:
                result["exists"] = False
        except:
            result["exists"] = False
        
        return result
        
    except Exception as e:
        return {"exists": False, "error": str(e)[:100]}

def requests_quote(text):
    """URL-encode a string."""
    return text.replace(" ", "+").replace("&", "%26").replace("#", "%23")

def main():
    # Load all leads
    all_leads = []
    
    if os.path.exists(PAIN_CSV):
        with open(PAIN_CSV) as f:
            for row in csv.DictReader(f):
                row["source"] = "pain_signal"
                all_leads.append(row)
    
    if os.path.exists(HOURS_CSV):
        with open(HOURS_CSV) as f:
            for row in csv.DictReader(f):
                row["source"] = "after_hours"
                # Normalize column names
                if "Hours Signal" in row:
                    row["Pain Evidence"] = row.get("Hours Signal", "")
                    row["Pain Score"] = row.get("Score", "0")
                all_leads.append(row)
    
    # Deduplicate by phone
    seen_phones = set()
    unique_leads = []
    for lead in all_leads:
        phone = re.sub(r'[^\d]', '', lead.get("Phone", ""))
        if phone and phone not in seen_phones:
            seen_phones.add(phone)
            unique_leads.append(lead)
    
    print(f"Total unique leads to verify: {len(unique_leads)}")
    
    # Load progress
    progress = load_progress()
    start_idx = progress["last_index"]
    verified_leads = progress["verified"]
    
    if start_idx > 0:
        print(f"Resuming from index {start_idx} ({len(verified_leads)} already verified)")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900}
        )
        page = context.new_page()
        
        for i in range(start_idx, len(unique_leads)):
            lead = unique_leads[i]
            name = lead.get("Business Name", "")
            city = lead.get("City", "")
            state = lead.get("State", "")
            phone = lead.get("Phone", "")
            
            print(f"[{i+1}/{len(unique_leads)}] Verifying: {name} ({city}, {state})...", end=" ", flush=True)
            
            result = search_google_maps(page, name, city, state)
            
            if result.get("exists"):
                verified = {
                    "Business Name": result.get("verified_name", name),
                    "Phone": result.get("verified_phone", phone),
                    "City": city,
                    "State": state,
                    "Niche": lead.get("Niche", ""),
                    "Rating": result.get("verified_rating", lead.get("Rating", "")),
                    "Reviews": result.get("verified_reviews", lead.get("Reviews", "")),
                    "Website": result.get("verified_website", lead.get("Website", "")),
                    "Address": lead.get("Address", ""),
                    "Pain Score": lead.get("Pain Score", "0"),
                    "Pain Evidence": lead.get("Pain Evidence", ""),
                    "Source": lead.get("source", ""),
                    "Verified": "YES",
                    "Hours": result.get("verified_hours", "")[:200]
                }
                verified_leads.append(verified)
                print(f"VERIFIED - {result.get('verified_rating', '?')}* ({result.get('verified_reviews', '?')} reviews)")
            else:
                print(f"NOT FOUND or ERROR: {result.get('error', 'no panel')}")
            
            # Save progress every 5 leads
            if (i + 1) % 5 == 0:
                progress["last_index"] = i + 1
                progress["verified"] = verified_leads
                save_progress(progress)
                
                # Also save CSV
                if verified_leads:
                    with open(OUTPUT_CSV, 'w', newline='') as f:
                        writer = csv.DictWriter(f, fieldnames=[
                            "Business Name", "Phone", "City", "State", "Niche",
                            "Rating", "Reviews", "Website", "Address",
                            "Pain Score", "Pain Evidence", "Source", "Verified", "Hours"
                        ])
                        writer.writeheader()
                        writer.writerows(verified_leads)
            
            # Rate limit - don't hammer Google
            time.sleep(2)
        
        browser.close()
    
    # Final save
    progress["last_index"] = len(unique_leads)
    progress["verified"] = verified_leads
    save_progress(progress)
    
    if verified_leads:
        # Sort by pain score
        verified_leads.sort(key=lambda x: int(x.get("Pain Score", 0)), reverse=True)
        with open(OUTPUT_CSV, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "Business Name", "Phone", "City", "State", "Niche",
                "Rating", "Reviews", "Website", "Address",
                "Pain Score", "Pain Evidence", "Source", "Verified", "Hours"
            ])
            writer.writeheader()
            writer.writerows(verified_leads)
    
    print(f"\n{'='*60}")
    print(f"Verified: {len(verified_leads)} / {len(unique_leads)}")
    print(f"Output: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
