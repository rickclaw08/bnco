#!/usr/bin/env python3
"""
Hiring Receptionist Lead Finder
Finds service businesses actively hiring receptionists via job boards.
These businesses have PROVEN budget ($2-4K/mo) and active pain.
"""
import requests, json, os, csv, time, re

OUTPUT_CSV = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/hiring-receptionist-leads.csv"

# Use Google to find Indeed job postings since Indeed blocks direct scraping
SEARCH_QUERIES = [
    'site:indeed.com "receptionist" "HVAC" hiring',
    'site:indeed.com "receptionist" "plumbing" hiring',
    'site:indeed.com "receptionist" "electrical" hiring', 
    'site:indeed.com "receptionist" "roofing" hiring',
    'site:indeed.com "receptionist" "contractor" hiring',
    'site:indeed.com "front desk" "HVAC" hiring',
    'site:indeed.com "office manager" "plumbing" hiring',
    'site:indeed.com "dispatcher" "HVAC" hiring',
    'site:indeed.com "dispatcher" "plumbing" hiring',
    'site:indeed.com "call handler" "contractor" hiring',
]

def search_google_custom(query):
    """Search using Google Custom Search API or fallback."""
    # Try SerpAPI-style search via Google Places text search as proxy
    # Actually we'll parse Google results via web fetch approach
    # For now, let's use a different approach: search Google Places for businesses
    # and cross-reference with job boards
    pass

def search_indeed_via_google(query):
    """Search Indeed listings through Google."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    url = f"https://www.google.com/search?q={requests.utils.quote(query)}&num=10"
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        # Google often blocks, but let's try
        return resp.text if resp.status_code == 200 else ""
    except:
        return ""

def main():
    """
    Alternative approach: Search Google Places for businesses in our niche cities
    and look for indicators they need phone help:
    - They have a Google Business listing but no website
    - Their hours show they close early (missing after-hours calls)
    - They respond slowly to reviews (no admin watching)
    """
    GOOGLE_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
    if not GOOGLE_API_KEY:
        print("ERROR: GOOGLE_PLACES_API_KEY not set")
        return
    
    # Focus on businesses that close early (= missing after-hours calls)
    # and have operational gaps
    
    CITIES = [
        "Houston TX", "Dallas TX", "Phoenix AZ", "Cincinnati OH",
        "Columbus OH", "Atlanta GA", "Charlotte NC", "Nashville TN",
        "Tampa FL", "Denver CO", "Kansas City MO", "San Antonio TX"
    ]
    
    leads = []
    seen = set()
    
    for city in CITIES:
        for niche in ["HVAC", "plumbing", "electrical", "roofing"]:
            print(f"\n[{city} / {niche}] Searching for businesses closing before 6 PM...")
            
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            params = {
                "query": f"{niche} company {city}",
                "key": GOOGLE_API_KEY,
            }
            resp = requests.get(url, params=params, timeout=15)
            data = resp.json()
            
            if data.get("status") != "OK":
                print(f"  API error: {data.get('status')}")
                continue
            
            for biz in data.get("results", [])[:8]:
                place_id = biz["place_id"]
                name = biz["name"]
                
                # Get details with hours
                det_url = "https://maps.googleapis.com/maps/api/place/details/json"
                det_params = {
                    "place_id": place_id,
                    "fields": "name,formatted_phone_number,website,opening_hours,formatted_address,rating,user_ratings_total",
                    "key": GOOGLE_API_KEY,
                }
                det = requests.get(det_url, params=det_params, timeout=15).json().get("result", {})
                time.sleep(0.2)
                
                phone = det.get("formatted_phone_number", "")
                if not phone or phone in seen:
                    continue
                seen.add(phone)
                
                hours = det.get("opening_hours", {})
                periods = hours.get("periods", [])
                weekday_text = hours.get("weekday_text", [])
                
                # Check for early closing or limited hours
                closes_early = False
                no_weekend = False
                closes_at = "unknown"
                
                if weekday_text:
                    for day_text in weekday_text:
                        day_lower = day_text.lower()
                        # Check if any weekday closes before 6 PM
                        time_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)', day_lower.split('–')[-1] if '–' in day_lower else "")
                        if time_match:
                            hour = int(time_match.group(1))
                            ampm = time_match.group(3)
                            if ampm == "pm" and hour < 6 and hour != 12:
                                closes_early = True
                                closes_at = f"{hour}:{time_match.group(2)} PM"
                            elif ampm == "am":
                                closes_early = True
                                closes_at = f"{hour}:{time_match.group(2)} AM"
                        if "saturday" in day_lower and "closed" in day_lower:
                            no_weekend = True
                        if "sunday" in day_lower and "closed" in day_lower:
                            no_weekend = True
                
                # Score: business likely needs after-hours coverage
                score = 0
                signals = []
                
                if closes_early:
                    score += 3
                    signals.append(f"Closes at {closes_at}")
                
                if no_weekend:
                    score += 2
                    signals.append("Closed weekends")
                
                if not det.get("website"):
                    score += 2
                    signals.append("No website")
                
                total_reviews = det.get("user_ratings_total", 0)
                if total_reviews < 30:
                    score += 1
                    signals.append(f"Only {total_reviews} reviews")
                
                if score >= 2:
                    lead = {
                        "Business Name": name,
                        "Phone": phone,
                        "City": city.split()[0],
                        "State": city.split()[-1],
                        "Niche": niche,
                        "Rating": det.get("rating", ""),
                        "Reviews": total_reviews,
                        "Website": det.get("website", ""),
                        "Address": det.get("formatted_address", ""),
                        "Hours Signal": " | ".join(signals),
                        "Score": score
                    }
                    leads.append(lead)
                    print(f"  HIT [{score}]: {name} ({phone}) - {' | '.join(signals)}")
            
            time.sleep(0.3)
    
    # Save
    if leads:
        leads.sort(key=lambda x: x["Score"], reverse=True)
        with open(OUTPUT_CSV, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "Business Name", "Phone", "City", "State", "Niche",
                "Rating", "Reviews", "Website", "Address", "Hours Signal", "Score"
            ])
            writer.writeheader()
            writer.writerows(leads)
    
    print(f"\n{'='*60}")
    print(f"Total leads with pain signals: {len(leads)}")
    print(f"Output: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
