#!/usr/bin/env python3
"""
Owner Name Enrichment v5 - LLM-powered extraction
1. Google Places -> get website
2. Fetch website about/team pages  
3. Use OpenAI to extract owner name from page content
4. OpenCorporates for registry cross-reference
5. Cross-reference all sources
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
    """Use GPT-4o-mini to extract owner name from text content. Cheap and fast."""
    if not OPENAI_API_KEY or not text.strip():
        return None
    
    # Truncate text to save tokens
    text = text[:3000]
    
    prompt = f"""Extract the owner, president, founder, or CEO name from the following text about "{business_name}" in {city}, {state}.

Rules:
- Return ONLY the person's full name (first and last), nothing else
- If multiple people, return the current owner/president (not the founder if they retired)
- If no owner name is found, return exactly: NONE
- Do not guess or infer. Only extract names explicitly stated.

Text:
{text}

Owner name:"""
    
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
        
        if answer and answer.upper() != "NONE" and len(answer.split()) >= 2 and len(answer) < 50:
            return answer
        return None
        
    except Exception as e:
        print(f"    LLM error: {e}")
        return None


def get_website(biz, city, state):
    """Get website from Google Places API."""
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
        
        return data2.get("result", {}).get("website", None)
    except:
        return None


def fetch_about_pages(website, biz):
    """Fetch about pages and extract text content."""
    paths = ["", "/about", "/about-us", "/our-team", "/team", "/company", "/our-story", "/about.html", "/about-us/our-history"]
    all_text = []
    
    for path in paths:
        try:
            url = website.rstrip("/") + path
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
                if r.status != 200:
                    continue
                html = r.read().decode('utf-8', errors='ignore')
            
            # Clean HTML
            text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
            text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
            text = re.sub(r'<[^>]+>', ' ', text)
            text = re.sub(r'\s+', ' ', text).strip()
            
            if len(text) > 200:  # Skip empty/nav-only pages
                all_text.append(text)
            
            time.sleep(0.3)
        except:
            continue
    
    return '\n\n'.join(all_text)


def search_opencorporates(biz, state):
    """Search OpenCorporates for officers."""
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
            
            # Fuzzy match
            if bname[:12] in cname or cname[:12] in bname:
                # Try to get officers from detail page
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
                            pos = (officer.get("position", "") or "").lower()
                            if name and len(name) > 4:
                                # Title case
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
        print("Run: source ~/.zshrc")
        sys.exit(1)
    
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
    api_calls = 0
    
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
        print("  [1] Google Places...", end=" ", flush=True)
        ws = get_website(biz, city, state)
        if ws:
            website = ws
            print(f"{ws}")
            print("      Fetching about pages...", end=" ", flush=True)
            text = fetch_about_pages(ws, biz)
            if text:
                print(f"{len(text)} chars")
                print("      LLM extracting...", end=" ", flush=True)
                website_name = llm_extract_owner(text, biz, city, state)
                api_calls += 1
                print(f"{website_name or 'no name found'}")
            else:
                print("no about text")
        else:
            print("no website")
        
        # Source 2: OpenCorporates
        print("  [2] OpenCorporates...", end=" ", flush=True)
        oc_name = search_opencorporates(biz, state)
        print(f"{oc_name or 'nothing'}")
        
        # Determine final name + confidence
        if website_name and oc_name:
            # Both sources found names - check if they match
            if website_name.lower() == oc_name.lower():
                final_name = website_name
                confidence = "high"
                sources = "website,registry"
            else:
                # Different names - prefer website (more current)
                final_name = website_name
                confidence = "medium"
                sources = "website"
        elif website_name:
            final_name = website_name
            confidence = "medium" if len(website_name.split()) >= 2 else "low"
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
            print(f"  >> {final_name} ({confidence}, {sources})")
        else:
            print(f"  >> no owner found")
        
        # Save every 10
        if (i + 1) % 10 == 0 or i == end - 1:
            with open(output_file, 'w', newline='') as f:
                w = csv.DictWriter(f, fieldnames=out_fields, extrasaction='ignore')
                w.writeheader()
                w.writerows(results)
            print(f"\n  --- saved ({found} found / {api_calls} LLM calls) ---")
        
        time.sleep(0.5)
    
    # Final save
    with open(output_file, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=out_fields, extrasaction='ignore')
        w.writeheader()
        w.writerows(results)
    
    processed = end - start - skipped
    pct = (found / processed * 100) if processed > 0 else 0
    print(f"\n{'='*50}")
    print(f"DONE: {found}/{processed} owners found ({pct:.1f}%)")
    print(f"LLM API calls: {api_calls}")
    print(f"Skipped (resumed): {skipped}")
    print(f"Output: {output_file}")
    print(f"{'='*50}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--input", default=f"{WORKSPACE}/mega-lead-scrape-verified.csv")
    p.add_argument("--output", default=f"{WORKSPACE}/mega-lead-scrape-enriched.csv")
    p.add_argument("--start", type=int, default=0)
    p.add_argument("--limit", type=int, default=None)
    args = p.parse_args()
    enrich(args.input, args.output, args.start, args.limit)
