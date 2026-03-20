#!/usr/bin/env python3
"""
Owner Name Enrichment v6 - LLM-powered extraction (fixed)
1. Google Places -> get website
2. Fetch website about/team pages (prioritize about pages over homepage)
3. Use GPT-4o-mini to extract owner name from page content
4. OpenCorporates for registry cross-reference
5. Cross-reference sources for confidence scoring
"""

import csv, json, time, re, sys, os, ssl
import urllib.request, urllib.parse

WORKSPACE = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales"
GOOGLE_API_KEY = "AIzaSyB0RYBbDVwr3UofPcD6tX8HcjL2WCxP_4w"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"


def llm_extract_owner(text, business_name, city, state):
    """Use GPT-4o-mini to extract owner name from text content."""
    if not OPENAI_API_KEY or not text or len(text.strip()) < 100:
        return None
    
    # Truncate intelligently - keep the most relevant parts
    text = text[:4000]
    
    prompt = f"""Extract the current owner, president, or CEO name from this text about "{business_name}" in {city}, {state}.

Rules:
- Return ONLY the full name (first and last), nothing else
- If someone retired and someone else took over, return the CURRENT owner
- If no owner/president/CEO name is explicitly stated, return: NONE
- Do NOT guess or infer names from business names

Text:
{text}

Current owner/president name:"""
    
    try:
        payload = json.dumps({
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 30,
            "temperature": 0
        }).encode()
        
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode())
        
        answer = data["choices"][0]["message"]["content"].strip()
        
        # Validate: must be 2-4 words, not NONE, not too long
        if answer and answer.upper() != "NONE" and 2 <= len(answer.split()) <= 4 and len(answer) < 50:
            # Quick sanity: don't return the business name itself
            if answer.lower() not in business_name.lower():
                return answer
        return None
        
    except Exception as e:
        print(f"    LLM error: {e}")
        return None


def get_website(biz, city, state):
    """Get website from Google Places API (two-step: findplace + details)."""
    try:
        q = urllib.parse.quote(f"{biz} {city} {state}")
        url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={q}&inputtype=textquery&fields=place_id,name&key={GOOGLE_API_KEY}"
        with urllib.request.urlopen(urllib.request.Request(url), timeout=10) as r:
            data = json.loads(r.read().decode())
        
        candidates = data.get("candidates", [])
        if not candidates:
            return None
        
        pid = candidates[0]["place_id"]
        url2 = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={pid}&fields=website&key={GOOGLE_API_KEY}"
        with urllib.request.urlopen(urllib.request.Request(url2), timeout=10) as r:
            data2 = json.loads(r.read().decode())
        
        ws = data2.get("result", {}).get("website", None)
        if ws:
            # Strip UTM params and trailing query strings
            ws = re.sub(r'\?.*$', '', ws)
        return ws
    except:
        return None


def fetch_page_text(url):
    """Fetch a URL and return cleaned text content."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
            if r.status != 200:
                return None
            html = r.read().decode('utf-8', errors='ignore')
        
        text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text if len(text) > 200 else None
    except:
        return None


def find_owner_on_website(website, biz, city, state):
    """Crawl company website for owner name. Returns (name, page_url) or (None, None)."""
    
    # Priority order: about pages first (most likely to have owner info), then homepage last
    about_paths = [
        "/about-us", "/about-us/", "/about", "/about/", "/about.html",
        "/our-team", "/our-team/", "/team", "/meet-the-team",
        "/our-story", "/our-story/", "/who-we-are",
        "/company", "/company/", "/leadership",
        "/about-us/our-history", "/about-us/our-story",
        ""  # homepage last (it's the fallback)
    ]
    
    base = website.rstrip("/")
    
    for path in about_paths:
        url = base + path
        text = fetch_page_text(url)
        if not text:
            continue
        
        # Quick keyword check - does this page even mention ownership?
        lower = text.lower()
        has_owner_keywords = any(kw in lower for kw in [
            'owner', 'president', 'founder', 'ceo', 'started', 'founded',
            'family-owned', 'family owned', 'took over', 'our father',
            'managing member', 'principal'
        ])
        
        if has_owner_keywords:
            name = llm_extract_owner(text, biz, city, state)
            if name:
                return name, url
        
        time.sleep(0.3)
    
    # If no page had owner keywords, try the LLM on the longest page anyway (some sites are subtle)
    best_text = None
    best_url = None
    for path in ["/about-us", "/about", "/our-team", ""]:
        url = base + path
        text = fetch_page_text(url)
        if text and (not best_text or len(text) > len(best_text)):
            best_text = text
            best_url = url
    
    if best_text and len(best_text) > 500:
        name = llm_extract_owner(best_text, biz, city, state)
        if name:
            return name, best_url
    
    return None, None


def search_opencorporates(biz, state):
    """Search OpenCorporates for company officers."""
    try:
        q = urllib.parse.quote(biz)
        jur = f"us_{state.lower()}"
        url = f"https://api.opencorporates.com/v0.4/companies/search?q={q}&jurisdiction_code={jur}&per_page=3"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
        
        for comp in data.get("results", {}).get("companies", []):
            c = comp.get("company", {})
            cname = c.get("name", "").lower()
            bname = biz.lower()
            
            if bname[:12] in cname or cname[:12] in bname:
                oc_url = c.get("opencorporates_url", "")
                if oc_url:
                    api_url = oc_url.replace("https://opencorporates.com", "https://api.opencorporates.com/v0.4")
                    try:
                        req2 = urllib.request.Request(api_url, headers={"User-Agent": UA})
                        with urllib.request.urlopen(req2, timeout=10) as r2:
                            detail = json.loads(r2.read().decode())
                        
                        officers = detail.get("results", {}).get("company", {}).get("officers", [])
                        for off in officers:
                            officer = off.get("officer", {})
                            name = officer.get("name", "")
                            if name and len(name) > 4:
                                clean = ' '.join(w.capitalize() for w in name.split())
                                words = clean.split()
                                if 2 <= len(words) <= 4:
                                    return clean
                    except:
                        pass
                break
        
        time.sleep(1)
    except:
        pass
    return None


def enrich(input_file, output_file, start=0, limit=None):
    if not OPENAI_API_KEY:
        print("ERROR: OPENAI_API_KEY not set!")
        sys.exit(1)
    
    print(f"OpenAI API key: ...{OPENAI_API_KEY[-8:]}")
    
    with open(input_file, 'r') as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames)
        leads = list(reader)
    
    out_fields = fields + ["Owner_Name", "Owner_Confidence", "Owner_Sources", "Website"]
    
    # Resume support
    done = {}
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            for row in csv.DictReader(f):
                biz = row.get("Business Name", "").strip('"')
                if row.get("Owner_Name"):
                    done[biz] = row
        if done:
            print(f"Resuming: {len(done)} already enriched")
    
    end = min(len(leads), start + limit) if limit else len(leads)
    results = []
    found = 0
    skipped = 0
    llm_calls = 0
    
    for i in range(start, end):
        lead = leads[i]
        biz = lead.get("Business Name", "").strip('"')
        city = lead.get("City", "")
        state = lead.get("State", "")
        
        if biz in done:
            results.append(done[biz])
            found += 1
            skipped += 1
            continue
        
        print(f"\n[{i+1}/{end}] {biz} ({city}, {state})")
        
        website_name = None
        oc_name = None
        website = ""
        
        # Source 1: Website + LLM extraction
        print("  [website]", end=" ", flush=True)
        ws = get_website(biz, city, state)
        if ws:
            website = ws
            print(f"-> {ws}")
            name, page_url = find_owner_on_website(ws, biz, city, state)
            llm_calls += 1  # approximate
            if name:
                website_name = name
                print(f"    FOUND: {name} (from {page_url})")
            else:
                print(f"    no owner name found")
        else:
            print("no website")
        
        # Source 2: OpenCorporates
        print("  [registry]", end=" ", flush=True)
        oc_name = search_opencorporates(biz, state)
        print(f"{oc_name or 'nothing'}")
        
        # Score confidence
        if website_name and oc_name:
            if website_name.lower() == oc_name.lower():
                final_name = website_name
                confidence = "high"
                sources = "website,registry"
            else:
                final_name = website_name  # prefer website (more current)
                confidence = "medium"
                sources = "website,registry-mismatch"
        elif website_name:
            final_name = website_name
            confidence = "medium"
            sources = "website"
        elif oc_name:
            final_name = oc_name
            confidence = "low"
            sources = "registry"
        else:
            final_name = ""
            confidence = "none"
            sources = ""
        
        lead["Owner_Name"] = final_name
        lead["Owner_Confidence"] = confidence
        lead["Owner_Sources"] = sources
        lead["Website"] = website
        results.append(lead)
        
        if final_name:
            found += 1
            print(f"  >> {final_name} ({confidence})")
        else:
            print(f"  >> no owner found")
        
        # Save every 25
        if (i + 1 - start) % 25 == 0 or i == end - 1:
            with open(output_file, 'w', newline='') as f:
                w = csv.DictWriter(f, fieldnames=out_fields, extrasaction='ignore')
                w.writeheader()
                w.writerows(results)
            processed = i + 1 - start - skipped
            print(f"\n  --- SAVED: {found} owners / {processed} processed / ~{llm_calls} LLM calls ---")
        
        time.sleep(0.5)
    
    # Final save
    with open(output_file, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=out_fields, extrasaction='ignore')
        w.writeheader()
        w.writerows(results)
    
    processed = end - start - skipped
    pct = (found / processed * 100) if processed > 0 else 0
    print(f"\n{'='*60}")
    print(f"DONE: {found}/{processed} owners found ({pct:.1f}%)")
    print(f"LLM calls: ~{llm_calls}")
    print(f"Resumed: {skipped}")
    print(f"Output: {output_file}")
    print(f"{'='*60}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--input", default=f"{WORKSPACE}/mega-lead-scrape-verified.csv")
    p.add_argument("--output", default=f"{WORKSPACE}/mega-lead-scrape-enriched.csv")
    p.add_argument("--start", type=int, default=0)
    p.add_argument("--limit", type=int, default=None)
    args = p.parse_args()
    enrich(args.input, args.output, args.start, args.limit)
