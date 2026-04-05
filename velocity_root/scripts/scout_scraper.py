#!/usr/bin/env python3
"""
Project Velocity - The Scout (Lead Extraction Agent)
Scrapes Hamilton County public records for pre-foreclosure/sheriff sale properties.

Data Sources:
1. Hamilton County Sheriff's Office - Property Sales List (hcso.org)
2. Hamilton County Auditor - Property Values (wedge1.hcauditor.org)
3. Hamilton County Court Clerk - Foreclosure filings (courtclerk.org)

Output: velocity_root/leads/raw_leads.csv
"""

import json
import csv
import os
import sys
import time
import re
from datetime import datetime, timedelta
from pathlib import Path

# Playwright for browser-based scraping (same approach as GBP verifier)
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

# Project paths
VELOCITY_ROOT = Path(__file__).parent.parent
LEADS_DIR = VELOCITY_ROOT / "leads"
CONFIG_PATH = VELOCITY_ROOT / "config" / "config.json"

# Load config
with open(CONFIG_PATH) as f:
    CONFIG = json.load(f)

MIN_EQUITY = CONFIG["targets"]["min_equity_threshold"]  # $40,000
AUCTION_BUFFER_DAYS = CONFIG["targets"]["auction_buffer_days"]  # 7
MAX_AUCTION_DAYS = 30  # Don't bother with auctions > 30 days out


def scrape_sheriff_sales(page):
    """
    Scrape the Hamilton County Sheriff's Office property sales page.
    Returns list of properties scheduled for auction.
    """
    print("[SCOUT] Navigating to Hamilton County Sheriff's Office property sales...")
    
    # The HCSO page has a disclaimer/agreement page first
    page.goto("https://www.hcso.org/community-services/search-property-sales/", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    
    # Look for "I Agree" button
    try:
        agree_btn = page.locator("text=I Agree").first
        if agree_btn.is_visible(timeout=3000):
            agree_btn.click()
            page.wait_for_load_state("networkidle", timeout=10000)
            print("[SCOUT] Clicked 'I Agree' on disclaimer page")
    except:
        print("[SCOUT] No disclaimer page found, continuing...")
    
    # Now we should be on the property list page
    # Extract property data from the page
    content = page.content()
    
    # Parse property entries - format varies but typically includes:
    # Case number, address, sale date, appraised value, minimum bid
    properties = []
    
    # Try to find property table/list elements
    rows = page.locator("table tr, .property-item, .sale-item").all()
    
    if not rows:
        print("[SCOUT] No table rows found, trying alternate selectors...")
        # Try getting all text content and parsing
        text_content = page.locator("body").inner_text()
        print(f"[SCOUT] Page text preview: {text_content[:500]}")
        return properties
    
    for row in rows:
        try:
            text = row.inner_text()
            # Skip header rows
            if "Case Number" in text or "Address" in text:
                continue
            
            cells = row.locator("td").all()
            if len(cells) >= 3:
                property_data = {
                    "source": "sheriff_sale",
                    "raw_text": text.strip(),
                    "cells": [c.inner_text().strip() for c in cells],
                    "scraped_at": datetime.now().isoformat()
                }
                properties.append(property_data)
        except Exception as e:
            continue
    
    print(f"[SCOUT] Found {len(properties)} property entries from Sheriff's Office")
    return properties


def scrape_sheriff_auction_site(page):
    """
    Scrape the RealForeclose auction site for upcoming Hamilton County sales.
    This is the primary source - actual auction listings with dates and details.
    """
    print("[SCOUT] Navigating to Hamilton County RealForeclose auction site...")
    
    page.goto("https://hamilton.sheriffsaleauction.ohio.gov/index.cfm?zaction=AUCTION&Rone=CALENDAR", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    
    properties = []
    
    # Look for auction calendar entries
    # RealForeclose typically shows auctions on a calendar view
    content = page.content()
    
    # Try to find auction entries
    auction_links = page.locator("a[href*='AUCTION'], a[href*='auction'], .calendar-event, .auction-item").all()
    
    if auction_links:
        print(f"[SCOUT] Found {len(auction_links)} auction links on calendar")
        for link in auction_links[:50]:  # Limit to 50
            try:
                text = link.inner_text().strip()
                href = link.get_attribute("href") or ""
                if text and len(text) > 5:
                    properties.append({
                        "source": "realforeclose_calendar",
                        "text": text,
                        "url": href,
                        "scraped_at": datetime.now().isoformat()
                    })
            except:
                continue
    else:
        # May need to be logged in or navigate differently
        text_content = page.locator("body").inner_text()
        print(f"[SCOUT] RealForeclose page preview: {text_content[:500]}")
    
    print(f"[SCOUT] Found {len(properties)} entries from RealForeclose")
    return properties


def scrape_court_clerk_foreclosures(page):
    """
    Scrape Hamilton County Court Clerk foreclosure filings.
    These are the earliest-stage leads - just filed, not yet at auction.
    """
    print("[SCOUT] Navigating to Hamilton County Court Clerk foreclosure search...")
    
    page.goto("https://www.courtclerk.org/records-search/foreclosure/", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
    
    properties = []
    content = page.content()
    
    # Court clerk site may have a search form
    # Try to find and fill the form, or extract visible results
    text_content = page.locator("body").inner_text()
    print(f"[SCOUT] Court Clerk page preview: {text_content[:500]}")
    
    # Look for any property/case data
    rows = page.locator("table tr, .search-result, .case-entry").all()
    
    for row in rows:
        try:
            text = row.inner_text().strip()
            if text and len(text) > 10:
                properties.append({
                    "source": "court_clerk_foreclosure",
                    "raw_text": text,
                    "scraped_at": datetime.now().isoformat()
                })
        except:
            continue
    
    print(f"[SCOUT] Found {len(properties)} entries from Court Clerk")
    return properties


def lookup_auditor_property(page, address):
    """
    Look up a specific property on the Hamilton County Auditor site.
    Returns: appraised value, sq footage, owner name, parcel number.
    """
    print(f"[SCOUT] Looking up property on Auditor: {address}")
    
    # Navigate to auditor search
    page.goto("https://wedge1.hcauditor.org/", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=10000)
    
    # Fill in address search
    try:
        # Look for address input field
        addr_input = page.locator("input[name*='address'], input[name*='Address'], input#txtAddress").first
        if addr_input.is_visible(timeout=3000):
            addr_input.fill(address)
            
            # Submit search
            submit = page.locator("input[type='submit'], button[type='submit']").first
            if submit.is_visible(timeout=2000):
                submit.click()
                page.wait_for_load_state("networkidle", timeout=10000)
            
            # Extract property details
            text = page.locator("body").inner_text()
            
            # Parse out key values
            result = {
                "address": address,
                "total_value": extract_dollar_amount(text, ["Total Value", "Market Value", "Appraised"]),
                "land_value": extract_dollar_amount(text, ["Land Value"]),
                "building_value": extract_dollar_amount(text, ["Building Value", "Improvement"]),
                "sq_ft": extract_number(text, ["Sq Ft", "Square Feet", "Living Area"]),
                "owner_name": extract_after(text, ["Owner", "Property Owner"]),
                "parcel_number": extract_after(text, ["Parcel", "Parcel Number", "Parcel ID"]),
                "year_built": extract_number(text, ["Year Built"]),
                "bedrooms": extract_number(text, ["Bedrooms", "Beds"]),
                "bathrooms": extract_number(text, ["Bathrooms", "Baths", "Full Baths"]),
            }
            return result
    except Exception as e:
        print(f"[SCOUT] Auditor lookup failed for {address}: {e}")
    
    return None


def extract_dollar_amount(text, keywords):
    """Extract a dollar amount near a keyword."""
    for kw in keywords:
        pattern = rf"{kw}[:\s]*\$?([\d,]+)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))
    return None


def extract_number(text, keywords):
    """Extract a number near a keyword."""
    for kw in keywords:
        pattern = rf"{kw}[:\s]*([\d,]+)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1).replace(",", ""))
    return None


def extract_after(text, keywords):
    """Extract text after a keyword."""
    for kw in keywords:
        pattern = rf"{kw}[:\s]*(.+?)(?:\n|$)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def equity_check(auditor_value, judgment_amount):
    """
    Gate 3: Equity Floor Check
    Returns True if equity >= MIN_EQUITY ($40K default)
    """
    if auditor_value is None or judgment_amount is None:
        return False
    equity = auditor_value - judgment_amount
    return equity >= MIN_EQUITY


def auction_date_check(auction_date_str):
    """
    Gate 2: Auction Buffer Check
    Returns True if auction is between AUCTION_BUFFER_DAYS and MAX_AUCTION_DAYS away.
    """
    try:
        auction_date = datetime.strptime(auction_date_str, "%Y-%m-%d")
        days_until = (auction_date - datetime.now()).days
        return AUCTION_BUFFER_DAYS <= days_until <= MAX_AUCTION_DAYS
    except:
        return False


def save_leads(leads, filename="raw_leads.csv"):
    """Save extracted leads to CSV."""
    LEADS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = LEADS_DIR / filename
    
    if not leads:
        print("[SCOUT] No leads to save.")
        return
    
    # Get all unique keys across all leads
    all_keys = set()
    for lead in leads:
        all_keys.update(lead.keys())
    
    fieldnames = sorted(all_keys)
    
    with open(filepath, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(leads)
    
    print(f"[SCOUT] Saved {len(leads)} leads to {filepath}")


def save_raw_data(data, filename):
    """Save raw scraped data as JSON for debugging."""
    LEADS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = LEADS_DIR / filename
    
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"[SCOUT] Saved raw data to {filepath}")


def main():
    print("=" * 60)
    print("PROJECT VELOCITY - THE SCOUT")
    print(f"Target: Hamilton County, Ohio")
    print(f"Min Equity: ${MIN_EQUITY:,}")
    print(f"Auction Window: {AUCTION_BUFFER_DAYS}-{MAX_AUCTION_DAYS} days")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    all_raw_data = {
        "sheriff_sales": [],
        "auction_site": [],
        "court_clerk": [],
        "timestamp": datetime.now().isoformat()
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # Source 1: Sheriff's Office property sales
        try:
            sheriff_data = scrape_sheriff_sales(page)
            all_raw_data["sheriff_sales"] = sheriff_data
        except Exception as e:
            print(f"[SCOUT] Sheriff sales scrape failed: {e}")
        
        # Source 2: RealForeclose auction site
        try:
            auction_data = scrape_sheriff_auction_site(page)
            all_raw_data["auction_site"] = auction_data
        except Exception as e:
            print(f"[SCOUT] Auction site scrape failed: {e}")
        
        # Source 3: Court Clerk foreclosures
        try:
            clerk_data = scrape_court_clerk_foreclosures(page)
            all_raw_data["court_clerk"] = clerk_data
        except Exception as e:
            print(f"[SCOUT] Court clerk scrape failed: {e}")
        
        browser.close()
    
    # Save all raw data
    save_raw_data(all_raw_data, f"raw_scrape_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    
    total = (len(all_raw_data["sheriff_sales"]) + 
             len(all_raw_data["auction_site"]) + 
             len(all_raw_data["court_clerk"]))
    
    print(f"\n[SCOUT] TOTAL RAW ENTRIES: {total}")
    print(f"[SCOUT] Sheriff Sales: {len(all_raw_data['sheriff_sales'])}")
    print(f"[SCOUT] Auction Site: {len(all_raw_data['auction_site'])}")
    print(f"[SCOUT] Court Clerk: {len(all_raw_data['court_clerk'])}")
    print("[SCOUT] Run complete. Raw data saved for Analyst processing.")


if __name__ == "__main__":
    main()
