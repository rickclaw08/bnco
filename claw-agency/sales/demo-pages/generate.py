#!/usr/bin/env python3
"""
Generate personalized demo pages for pain-signal leads.
Each page shows the prospect their own missed-call problem and offers the demo line.
"""

import csv
import os
import re

TEMPLATE_PATH = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/demo-pages/template.html"
OUTPUT_DIR = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/demo-pages/generated"
CSV_PATH = "/Users/agentclaw/.openclaw/workspace/claw-agency/sales/verified-pain-leads-deduped.csv"

# Average job values by niche (conservative estimates for the markets we're targeting)
AVG_JOB_VALUES = {
    "roofing": "8,500",
    "hvac": "4,200",
    "plumbing": "1,800",
    "electrical": "2,400",
}

# Monthly loss estimates (avg_job * 4 missed jobs/week * 4 weeks, roughly)
MONTHLY_LOSS = {
    "roofing": "34,000",
    "hvac": "16,800",
    "plumbing": "7,200",
    "electrical": "9,600",
}


def slugify(name):
    """Convert business name to URL-safe slug."""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


def parse_close_time(pain_evidence):
    """Extract closing time from pain evidence string."""
    match = re.search(r'Closes at (\d+:\d+ [AP]M)', pain_evidence)
    if match:
        return match.group(1)
    return "5:00 PM"


def calc_missed_hours(close_time, weekend_closed):
    """Estimate weekly missed hours."""
    # Parse close time
    try:
        hour = int(close_time.split(':')[0])
        if 'PM' in close_time and hour != 12:
            hour += 12
        elif 'AM' in close_time and hour == 12:
            hour = 0
    except:
        hour = 17

    # After-hours on weekdays: from close to 9 PM (when most calls stop)
    weekday_missed = max(0, 21 - hour) * 5  # 5 weekdays

    # Weekend hours (9 AM to 6 PM = 9 hours per day)
    weekend_missed = 18 if weekend_closed else 0

    return weekday_missed + weekend_missed


def generate_page(lead, template):
    """Generate a personalized HTML page for a lead."""
    name = lead['Business Name']
    city = lead['City']
    niche = lead['Niche'].lower()
    phone = lead['Phone'].strip()
    pain_evidence = lead.get('Pain Evidence', '')
    close_time = parse_close_time(pain_evidence)
    weekend_closed = 'Closed weekends' in pain_evidence or 'Closed Saturday' in pain_evidence

    missed_hours = calc_missed_hours(close_time, weekend_closed)

    # Figure out open hours string
    open_start = "8:00 AM"  # assumed
    open_hours = f"{open_start} - {close_time}"

    # Weekend status
    weekend_status = "Closed" if weekend_closed else "Limited hours"

    # Test time suggestion (1 hour after close)
    test_time = close_time  # "Call at closing time to test"

    replacements = {
        '{{BUSINESS_NAME}}': name,
        '{{CITY}}': city,
        '{{NICHE}}': niche.capitalize(),
        '{{PHONE}}': phone,
        '{{CLOSE_TIME}}': close_time,
        '{{OPEN_HOURS}}': open_hours,
        '{{MISSED_HOURS}}': str(missed_hours),
        '{{WEEKEND_STATUS}}': weekend_status,
        '{{AVG_JOB_VALUE}}': AVG_JOB_VALUES.get(niche, '3,000'),
        '{{MONTHLY_LOSS}}': MONTHLY_LOSS.get(niche, '12,000'),
        '{{TEST_TIME}}': test_time,
    }

    html = template
    for key, value in replacements.items():
        html = html.replace(key, value)

    return html


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(TEMPLATE_PATH) as f:
        template = f.read()

    with open(CSV_PATH) as f:
        reader = csv.DictReader(f)
        leads = sorted([r for r in reader], key=lambda x: -int(x.get('Pain Score', '0')))

    # Generate for top 20 pain-signal leads
    top_leads = leads[:20]
    generated = []

    for lead in top_leads:
        slug = slugify(lead['Business Name'])
        html = generate_page(lead, template)
        filepath = os.path.join(OUTPUT_DIR, f"{slug}.html")

        with open(filepath, 'w') as f:
            f.write(html)

        generated.append({
            'name': lead['Business Name'],
            'slug': slug,
            'file': filepath,
            'city': lead['City'],
            'niche': lead['Niche'],
            'website': lead.get('Website', '').strip(),
            'phone': lead['Phone'].strip(),
            'pain': lead.get('Pain Evidence', ''),
        })

        print(f"  Generated: {slug}.html - {lead['Business Name']} ({lead['City']}, {lead['Niche']})")

    print(f"\n{'='*60}")
    print(f"Generated {len(generated)} personalized demo pages")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"\nDeploy to: theclawops.com/demo/{{slug}}/")
    print(f"{'='*60}")

    # Also generate a manifest for deployment
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.txt")
    with open(manifest_path, 'w') as f:
        for g in generated:
            f.write(f"{g['slug']} | {g['name']} | {g['city']} | {g['niche']} | {g['website']} | {g['phone']}\n")

    print(f"\nManifest written to: {manifest_path}")


if __name__ == "__main__":
    main()
