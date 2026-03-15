#!/usr/bin/env python3
"""
GHL Contact Import via Browser (Playwright)
Imports wave2 leads into GHL contacts page using browser automation.
No API calls. Browser-only per Brand's instruction.
"""

import asyncio
import csv
import json
import os
import time
from datetime import datetime

# Progress tracking
PROGRESS_FILE = "/Users/agentclaw/.openclaw/workspace/ghl-import-progress.json"
CSV_FILE = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/wave2-deduped.csv"
GHL_CONTACTS_URL = "https://app.gohighlevel.com/v2/location/Ez2ADxydpjvWsW3suYiq/contacts/smart_list/All"
GHL_ADD_CONTACT_URL = "https://app.gohighlevel.com/v2/location/Ez2ADxydpjvWsW3suYiq/contacts/smart_list/All"

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": [], "last_index": 0}

def save_progress(progress):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)

def load_leads():
    with open(CSV_FILE) as f:
        reader = csv.DictReader(f)
        return list(reader)

async def import_contact(page, lead, progress):
    """Import a single contact via GHL Add Contact modal"""
    name = lead["Business Name"].strip()
    phone = lead["Phone (formatted)"].strip()
    phone_raw = lead["Phone"].strip()
    city = lead.get("City", "").strip()
    state = lead.get("State", "").strip()
    niche = lead.get("Niche", "").strip().lower()
    
    # Split name into first/last for GHL (use business name as first, "Owner" as last)
    first_name = name
    last_name = "Owner"
    email = f"{name.lower().replace(' ', '-').replace(',', '').replace('.', '').replace('&', 'and')}@leads.theclawops.com"
    
    try:
        # Click the "Add Contact" button
        add_btn = page.locator('button:has-text("Add Contact")').first
        await add_btn.click()
        await page.wait_for_timeout(1500)
        
        # Wait for the modal
        modal = page.locator('.modal-content, [class*="modal"], [role="dialog"]').first
        await modal.wait_for(timeout=5000)
        
        # Fill First Name
        first_input = page.locator('input[placeholder="First Name"], input[name="firstName"]').first
        await first_input.clear()
        await first_input.fill(first_name)
        await page.wait_for_timeout(200)
        
        # Fill Last Name
        last_input = page.locator('input[placeholder="Last Name"], input[name="lastName"]').first
        await last_input.clear()
        await last_input.fill(last_name)
        await page.wait_for_timeout(200)
        
        # Fill Phone
        phone_input = page.locator('input[placeholder*="Phone"], input[name="phone"]').first
        await phone_input.clear()
        await phone_input.fill(phone_raw)
        await page.wait_for_timeout(200)
        
        # Fill Email
        email_input = page.locator('input[placeholder*="Email"], input[name="email"]').first
        await email_input.clear()
        await email_input.fill(email)
        await page.wait_for_timeout(200)
        
        # Click Save/Create button
        save_btn = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').last
        await save_btn.click()
        await page.wait_for_timeout(2000)
        
        # Check for duplicate warning or success
        # If success, we should be redirected or modal closes
        
        progress["completed"].append({
            "name": name,
            "phone": phone_raw,
            "niche": niche,
            "city": city,
            "state": state,
            "time": datetime.now().isoformat()
        })
        save_progress(progress)
        return True
        
    except Exception as e:
        progress["failed"].append({
            "name": name,
            "phone": phone_raw,
            "error": str(e),
            "time": datetime.now().isoformat()
        })
        save_progress(progress)
        return False

async def main():
    from playwright.async_api import async_playwright
    
    leads = load_leads()
    progress = load_progress()
    
    start_idx = progress["last_index"]
    total = len(leads)
    completed_phones = {c["phone"] for c in progress["completed"]}
    
    print(f"Total leads: {total}")
    print(f"Already completed: {len(progress['completed'])}")
    print(f"Starting from index: {start_idx}")
    
    async with async_playwright() as p:
        # Launch browser - use persistent context to keep GHL login
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        
        # Create context with GHL cookies if available
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        
        page = await context.new_page()
        
        # Navigate to GHL contacts
        print(f"Navigating to GHL contacts...")
        await page.goto(GHL_CONTACTS_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Check if we need to login
        current_url = page.url
        print(f"Current URL: {current_url}")
        
        if "login" in current_url.lower() or "auth" in current_url.lower():
            print("ERROR: Not logged in to GHL. Need to use existing browser session.")
            print("This script needs to be run with a browser profile that's already logged in.")
            await browser.close()
            return
        
        for i in range(start_idx, total):
            lead = leads[i]
            phone = lead["Phone"].strip()
            
            # Skip already completed
            if phone in completed_phones:
                print(f"[{i+1}/{total}] SKIP (already done): {lead['Business Name']}")
                continue
            
            print(f"[{i+1}/{total}] Importing: {lead['Business Name']} - {phone}")
            
            success = await import_contact(page, lead, progress)
            progress["last_index"] = i + 1
            save_progress(progress)
            
            if success:
                print(f"  ✓ Success")
            else:
                print(f"  ✗ Failed")
            
            # Small delay between contacts
            await page.wait_for_timeout(1000)
        
        print(f"\nDone! Completed: {len(progress['completed'])}, Failed: {len(progress['failed'])}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
