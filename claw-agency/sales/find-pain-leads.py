#!/usr/bin/env python3
"""
Pain-Signal Lead Finder v1
Finds contractors with provable missed-call pain:
1. Google Places reviews mentioning communication problems
2. Low review counts (likely missing calls, no follow-up)
3. No website (likely no systems in place)
"""
import requests, json, os, csv, time, re, sys

GOOGLE_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

OUTPUT_CSV = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/pain-signal-leads.csv"

# Pain keywords in reviews
PAIN_KEYWORDS = [
    "never answered", "couldn't get through", "didn't answer", "no answer",
    "didn't return my call", "never called back", "hard to reach",
    "left a voicemail", "left message", "couldn't reach", "unreachable",
    "no one picked up", "phone just rings", "went to voicemail",
    "terrible communication", "poor communication", "bad communication",
    "never responded", "didn't respond", "no response", "waited for a call",
    "tried calling", "called multiple times", "doesn't pick up",
    "answering machine", "can't get ahold", "impossible to reach"
]

NICHES = ["HVAC", "plumbing", "electrical contractor", "roofing"]
CITIES = [
    "Houston TX", "Dallas TX", "Phoenix AZ", "Cincinnati OH",
    "Columbus OH", "Indianapolis IN", "Atlanta GA", "Charlotte NC",
    "Nashville TN", "Tampa FL", "San Antonio TX", "Denver CO",
    "Kansas City MO", "Memphis TN", "Louisville KY", "Oklahoma City OK",
    "Jacksonville FL", "Raleigh NC", "Birmingham AL", "Tucson AZ"
]

def search_businesses(niche, city):
    """Search Google Places for businesses."""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"{niche} company {city}",
        "key": GOOGLE_API_KEY,
        "type": "establishment"
    }
    try:
        resp = requests.get(url, params=params, timeout=15)
        data = resp.json()
        if data.get("status") == "OK":
            return data.get("results", [])
    except:
        pass
    return []

def get_place_details(place_id):
    """Get detailed info including reviews."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,reviews,formatted_phone_number,website,opening_hours,formatted_address,rating,user_ratings_total",
        "key": GOOGLE_API_KEY
    }
    try:
        resp = requests.get(url, params=params, timeout=15)
        return resp.json().get("result", {})
    except:
        return {}

def check_review_pain(reviews):
    """Check if reviews contain pain signals about communication."""
    pain_reviews = []
    for rev in reviews:
        text = rev.get("text", "").lower()
        for keyword in PAIN_KEYWORDS:
            if keyword in text:
                pain_reviews.append({
                    "rating": rev.get("rating"),
                    "text": rev.get("text", "")[:300],
                    "keyword": keyword
                })
                break
    return pain_reviews

def main():
    if not GOOGLE_API_KEY:
        print("ERROR: GOOGLE_PLACES_API_KEY not set")
        return
    
    leads = []
    seen_phones = set()
    api_calls = 0
    
    # Load existing if resuming
    if os.path.exists(OUTPUT_CSV):
        with open(OUTPUT_CSV) as f:
            reader = csv.DictReader(f)
            for row in reader:
                leads.append(row)
                if row.get("Phone"):
                    seen_phones.add(row["Phone"])
        print(f"Resuming: {len(leads)} existing leads")
    
    total_searched = 0
    total_pain = 0
    
    for city in CITIES:
        for niche in NICHES:
            print(f"\n[{city} / {niche}]")
            results = search_businesses(niche, city)
            api_calls += 1
            time.sleep(0.2)
            
            for biz in results[:10]:  # Top 10 per search
                name = biz.get("name", "")
                rating = biz.get("rating", 0)
                total_reviews = biz.get("user_ratings_total", 0)
                place_id = biz.get("place_id")
                
                # Skip high-rated businesses with lots of reviews (they probably have good systems)
                # Focus on: low review count OR mixed ratings
                if total_reviews > 500 and rating >= 4.5:
                    continue
                
                # Get details
                details = get_place_details(place_id)
                api_calls += 1
                time.sleep(0.2)
                
                phone = details.get("formatted_phone_number", "")
                website = details.get("website", "")
                address = details.get("formatted_address", "")
                reviews = details.get("reviews", [])
                
                if not phone or phone in seen_phones:
                    continue
                
                total_searched += 1
                
                # Check for pain signals
                pain_reviews = check_review_pain(reviews)
                
                # Pain scoring
                pain_score = 0
                pain_evidence = []
                
                # Communication complaints in reviews
                if pain_reviews:
                    pain_score += len(pain_reviews) * 3
                    for pr in pain_reviews[:2]:
                        pain_evidence.append(f"[{pr['rating']}*] \"{pr['text'][:100]}...\" (keyword: {pr['keyword']})")
                
                # No website = likely no systems
                if not website:
                    pain_score += 2
                    pain_evidence.append("No website")
                
                # Low review count = probably not following up with customers
                if total_reviews < 20:
                    pain_score += 1
                    pain_evidence.append(f"Only {total_reviews} reviews")
                
                # Mixed ratings suggest operational problems
                if rating and rating < 4.0:
                    pain_score += 2
                    pain_evidence.append(f"Rating: {rating}")
                
                if pain_score >= 2:
                    total_pain += 1
                    lead = {
                        "Business Name": name,
                        "Phone": phone,
                        "City": city.split()[0],
                        "State": city.split()[-1],
                        "Niche": niche,
                        "Rating": rating,
                        "Reviews": total_reviews,
                        "Website": website,
                        "Address": address,
                        "Pain Score": pain_score,
                        "Pain Evidence": " | ".join(pain_evidence)
                    }
                    leads.append(lead)
                    seen_phones.add(phone)
                    print(f"  PAIN [{pain_score}]: {name} ({phone}) - {' | '.join(pain_evidence[:2])}")
            
            # Save after each city/niche combo
            if leads:
                with open(OUTPUT_CSV, 'w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=[
                        "Business Name", "Phone", "City", "State", "Niche",
                        "Rating", "Reviews", "Website", "Address", "Pain Score", "Pain Evidence"
                    ])
                    writer.writeheader()
                    writer.writerows(leads)
    
    print(f"\n{'='*60}")
    print(f"DONE: {total_searched} businesses checked, {total_pain} with pain signals")
    print(f"API calls: {api_calls}")
    print(f"Output: {OUTPUT_CSV}")
    
    # Sort by pain score descending
    leads.sort(key=lambda x: int(x.get("Pain Score", 0)), reverse=True)
    with open(OUTPUT_CSV, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "Business Name", "Phone", "City", "State", "Niche",
            "Rating", "Reviews", "Website", "Address", "Pain Score", "Pain Evidence"
        ])
        writer.writeheader()
        writer.writerows(leads)
    
    print(f"\nTop 10 pain leads:")
    for lead in leads[:10]:
        print(f"  [{lead['Pain Score']}] {lead['Business Name']} ({lead['City']}, {lead['State']}) - {lead['Pain Evidence'][:80]}")

if __name__ == "__main__":
    main()
