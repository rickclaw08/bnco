# Lead Cleanup & Import Report
**Date:** 2026-03-08 17:58 EST

## Summary

| Metric | Count |
|--------|-------|
| Deleted from GHL | 1 |
| Phone numbers updated (existing) | 7 |
| New leads imported | 85 |
| Leads skipped (bad/unverifiable) | 15 |
| Phone corrections on import | 11 |
| Total contacts in GHL | 199 |
| Google Sheet rows | 200 |
| Errors encountered | 0 |

## Job 1: Delete Bad Leads

- **Florida Home Air Conditioning** (+19047779599) - 1.5/5 stars, 160 bad Yelp reviews + completely wrong phone
- Contact ID: sIvQU8xmYcM2yX47EGW4 - DELETED
- Confirmed: search for "Florida Home" returns 0 results

## Job 2: Update Wrong Phone Numbers (7 contacts)

| Company | Old Phone | New Phone | Status |
|---------|-----------|----------|--------|
| Elite Roofing of Georgia | +14703187523 | +17705259630 | Verified |
| Dify Electrical Contracting | +18048675300 | +15402592774 | Verified |
| George Plumbing Co. | +12104959991 | +12107400748 | Verified |
| Parthenon Plumbing Heating & AC | +16293022081 | +16292765129 | Verified |
| J&W Heating and Air & Plumbing | +19045959644 | +19047805787 | Verified |
| Hobaica Services | +16026339666 | +16026339555 | Verified |
| Faros Construction Services | +17205068084 | +17202345946 | Verified |

## Job 3: Import New Verified Leads

- **85 leads imported** out of 100 CSV rows
- **15 skipped** (unverifiable, wrong city, fake phone, wrong category)
- **11 phone corrections** applied during import

### Phone Corrections on Import:

| Company | CSV Phone | Corrected Phone |
|---------|-----------|----------------|
| AmeriTech Air & Heat | +14077437106 | +14075328000 |
| Rolando's HVAC | +14073216872 | +18133736804 |
| Boehm Heating & Air Conditioning | +16127981404 | +16516441410 |
| Standard Heating & Air Conditioning | +16128871172 | +16128242656 |
| Millcreek Plumbing Inc. | +18012628543 | +18012773342 |
| Manwill Plumbing & Heating | +18017564844 | +13855413399 |
| Chip-N-Dale's Custom Landscaping | +17024528518 | +17026559745 |
| Wet-Tec Irrigation & Landscape | +17028973225 | +17022523151 |
| Dean's Home Services | +16122002400 | +17632901900 |
| Hero Home Services | +16127893543 | +16124397285 |
| Restano Heating Cooling & Plumbing | +14123711515 | +14127933190 |

### Skipped Leads (15):
1. Orlando HVAC Services - generic name, no listing found
2. Gary Munson Heating and Air Conditioning - no direct business listing
3. Salt Lake Plumbing - generic name, only Salt City Plumbing found
4. S.O.S. Heating & Cooling - no listing found in SLC
5. Happy Pipes Plumbing - 555 phone number (fake)
6. Pacific Electric Inc - unverifiable in Las Vegas
7. Salvador Landscape - Sacramento area code, listed under Dallas (wrong city)
8. JoCo Construction - Virginia Beach area code, listed under Atlanta (wrong city)
9. Build Tampa Bay - 555 phone number (fake)
10. Innovative Landscaping LLC - no listing found in Las Vegas
11. Southwest Landscape Construction - no match found
12. Newborn Bros & Co. - caulk gun manufacturer, not a plumber (wrong category)
13. Mazza Plumbing - Philadelphia company, not Pittsburgh (wrong city)
14. Probuilt Construction LLC - 555 phone number (fake)
15. Metro Fence & Landscaping - no listing found in Milwaukee

## Job 4: Google Sheets Update

- 'All Leads' tab cleared and refreshed
- **200 rows** written (sorted by niche, then company name)
- Header: frozen row, bold text
- Phone column: formatted as text
- Spreadsheet: https://docs.google.com/spreadsheets/d/1ZdrolkUqNJHzMWFA6yJhPCKjB9KQRxoXgdfjGNPF660
