#!/usr/bin/env python3
"""Register missing contacts through calendar widget for consent."""
import json, time, sys, os, warnings
warnings.filterwarnings('ignore')

BOOKING_URL = "https://api.leadconnectorhq.com/widget/bookings/clawops-demo-call"
MISSING_FILE = "consent-missing.json"
PROGRESS_FILE = "consent-progress.json"

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"completed": [], "failed": [], "slot_idx": 0}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def main():
    from playwright.sync_api import sync_playwright
    
    with open(MISSING_FILE) as f:
        contacts = json.load(f)
    
    progress = load_progress()
    completed_phones = set(progress["completed"])
    
    to_register = [c for c in contacts if c["phone"] not in completed_phones]
    print(f"Missing: {len(contacts)} | Already done: {len(completed_phones)} | To register: {len(to_register)}", flush=True)
    
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
                
                page.goto(BOOKING_URL, wait_until="networkidle", timeout=20000)
                time.sleep(3)
                
                slots = page.locator("li.widgets-time-slot").all()
                if not slots:
                    raise Exception("No time slots found")
                
                pick = slot_idx % len(slots)
                slot_text = slots[pick].inner_text().strip()
                slots[pick].click()
                time.sleep(1)
                
                page.locator("button:has-text('Select')").last.click(timeout=5000)
                time.sleep(2)
                page.wait_for_selector("#first_name", timeout=10000)
                
                page.evaluate(f"""() => {{
                    function setVal(el, val) {{
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                        setter.call(el, val);
                        el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                        el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                    setVal(document.getElementById('first_name'), {json.dumps(contact['first'])});
                    setVal(document.getElementById('last_name'), {json.dumps(contact['last'])});
                    setVal(document.getElementById('phone'), {json.dumps(contact['phone'])});
                    setVal(document.getElementById('email'), {json.dumps(contact['email'])});
                    const cb = document.querySelector('input[type="checkbox"]');
                    if (cb && !cb.checked) cb.click();
                }}""")
                time.sleep(0.5)
                
                page.locator("button.btn-schedule").click(timeout=8000)
                page.wait_for_selector("text=Your Meeting has been Scheduled", timeout=15000)
                
                print(f"OK ({slot_text})", flush=True)
                progress["completed"].append(contact["phone"])
                slot_idx += 1
                progress["slot_idx"] = slot_idx
                save_progress(progress)
                time.sleep(1)
                
            except Exception as e:
                err = str(e)[:150]
                print(f"FAIL: {err}", flush=True)
                progress["failed"].append({"phone": contact["phone"], "name": contact["name"], "error": err})
                slot_idx += 1
                progress["slot_idx"] = slot_idx
                save_progress(progress)
                time.sleep(2)
        
        browser.close()
    
    done = len([c for c in contacts if c["phone"] in set(progress["completed"])])
    print(f"\n=== COMPLETE === Registered: {done}/{len(contacts)} | Failed: {len(progress['failed'])}", flush=True)

if __name__ == "__main__":
    main()
