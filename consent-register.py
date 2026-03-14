#!/usr/bin/env python3
"""
Consent registration via Playwright headless browser.
Submits each contact through the GHL calendar booking widget.
"""
import json, time, sys, os

BOOKING_URL = "https://api.leadconnectorhq.com/widget/bookings/clawops-demo-call"
CONTACTS_FILE = "consent-contacts.json"
PROGRESS_FILE = "consent-progress.json"

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": [], "slot_idx": 0}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def register_one(page, contact, slot_idx):
    """Register one contact. Returns True on success."""
    page.goto(BOOKING_URL, wait_until="networkidle", timeout=20000)
    time.sleep(3)
    
    # Get all time slot LI elements
    slots = page.locator("li.widgets-time-slot").all()
    if not slots:
        raise Exception("No time slots found")
    
    # Pick slot (wrapping around available slots)
    pick = slot_idx % len(slots)
    slot_text = slots[pick].inner_text().strip()
    slots[pick].click()
    time.sleep(1)
    
    # Click "Select" button that appears (use last visible one)
    page.locator("button:has-text('Select')").last.click(timeout=5000)
    time.sleep(2)
    
    # Wait for form
    page.wait_for_selector("#first_name", timeout=10000)
    
    # Split name
    name = contact["name"]
    if " Owner" in name:
        first = name.replace(" Owner", "")
        last = "Owner"
    elif " Company" in name:
        first = name.replace(" Company", "")
        last = "Company"
    else:
        parts = name.rsplit(" ", 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else "Contact"
    
    # Fill form via JS (React-compatible)
    page.evaluate(f"""() => {{
        function setVal(el, val) {{
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(el, val);
            el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            el.dispatchEvent(new Event('change', {{ bubbles: true }}));
        }}
        setVal(document.getElementById('first_name'), {json.dumps(first)});
        setVal(document.getElementById('last_name'), {json.dumps(last)});
        setVal(document.getElementById('phone'), {json.dumps(contact['phone'])});
        setVal(document.getElementById('email'), {json.dumps(contact['email'])});
        const cb = document.querySelector('input[type="checkbox"]');
        if (cb && !cb.checked) cb.click();
    }}""")
    time.sleep(0.5)
    
    # Submit - use the visible btn-schedule button, not the hidden hl_button
    page.locator("button.btn-schedule").click(timeout=8000)
    
    # Wait for confirmation
    page.wait_for_selector("text=Your Meeting has been Scheduled", timeout=15000)
    
    return slot_text

def main():
    from playwright.sync_api import sync_playwright
    
    with open(CONTACTS_FILE) as f:
        contacts = json.load(f)
    
    progress = load_progress()
    completed_phones = set(progress["completed"])
    
    to_register = [c for c in contacts if not c.get("consent") and c["phone"] not in completed_phones]
    
    print(f"Total: {len(contacts)} | Done: {len(completed_phones)} | Remaining: {len(to_register)}")
    sys.stdout.flush()
    
    if not to_register:
        print("All done!")
        return
    
    slot_idx = progress["slot_idx"]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        for i, contact in enumerate(to_register):
            try:
                print(f"[{i+1}/{len(to_register)}] {contact['name']} ({contact['phone']})...", end=" ", flush=True)
                
                slot_text = register_one(page, contact, slot_idx)
                
                print(f"OK ({slot_text})")
                sys.stdout.flush()
                progress["completed"].append(contact["phone"])
                slot_idx += 1
                progress["slot_idx"] = slot_idx
                save_progress(progress)
                time.sleep(1)
                
            except Exception as e:
                err = str(e)[:150]
                print(f"FAIL: {err}")
                sys.stdout.flush()
                progress["failed"].append({"phone": contact["phone"], "name": contact["name"], "error": err})
                slot_idx += 1
                progress["slot_idx"] = slot_idx
                save_progress(progress)
                time.sleep(2)
        
        browser.close()
    
    print(f"\n=== COMPLETE === Registered: {len(progress['completed'])} | Failed: {len(progress['failed'])}")

if __name__ == "__main__":
    main()
