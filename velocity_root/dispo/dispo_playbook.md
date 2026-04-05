# The Dispo Specialist - Contract Assignment & Buyer Acquisition

## Objective
Once a seller signs the PSA, immediately find a cash buyer and assign the contract for $4K-$12K markup.

## Buyer Acquisition Channels (Ranked by Speed)

### 1. Facebook REI Groups (FREE, fastest)
Target these Cincinnati/Ohio groups:
- Cincinnati Real Estate Investors
- Ohio Real Estate Investing
- Greater Cincinnati REI Network
- Tri-State Real Estate Investors (OH/KY/IN)
- Cincinnati Cash Buyers Network
- Ohio Wholesale Deals
- Midwest Real Estate Investors
- Cincinnati Fix and Flip
- Southern Ohio REI
- Hamilton County Real Estate Investors

**Post Template:**
```
ASSIGNMENT DEAL - Hamilton County, OH

{{beds}}BR / {{baths}}BA | {{sq_ft}} sqft
Zip: {{zip_code}}
Year Built: {{year_built}}

ARV: ${{arv}}
Contract Price: ${{contract_price}}
Assignment Fee: ${{assignment_fee}}
Total to Buyer: ${{total_to_buyer}}
Estimated Repairs: ${{repair_estimate}}

Buyer Profit Potential: ${{buyer_profit}}+

Closing Date: {{closing_date}}
Cash or Hard Money Only. Proof of Funds Required.

DM for address and full deal package.
```

### 2. Craigslist (FREE)
- Post in: Real Estate > Commercial
- Cincinnati/Dayton/Columbus sections
- Repost every 48 hours (Craigslist policy)
- Use same template as Facebook but with email contact

### 3. County Transfer Records (FREE - Hedge Fund Hack)
Scrape Hamilton County Auditor transfer records for last 90 days.
**Target entities containing:**
- LLC
- Homes 4 Rent
- AMH (American Homes 4 Rent)
- Capital
- Properties
- Investments
- Holdings
- Realty
- Acquisitions

**Script**: `scripts/dispo_transfer_scraper.py`
- Pulls recent bulk purchases (5+ in 90 days = institutional buyer)
- Cross-references with Ohio Secretary of State for registered agent / contact info
- Builds master buyer list at `dispo/buyer_list.csv`

### 4. Local REI Meetups (FREE, slower)
- Cincinnati REIA (cincinnatireia.com)
- Mason/West Chester investor meetups
- BiggerPockets Cincinnati forum
- Network and collect buyer contacts over time

## Deal Package (sent to buyers)

### What Goes in the Package:
1. **Property Summary** (address, beds/baths/sqft, year built, photos if available)
2. **ARV Comps** (3 comparable sales within 0.5 miles, last 6 months)
3. **Repair Estimate** (standard $15K or itemized if inspection done)
4. **Financial Breakdown** (ARV, contract price, assignment fee, buyer's all-in cost, projected profit)
5. **Assignment of Contract** (pre-filled, ready for buyer signature)
6. **Proof of Executed PSA** (redacted seller info, just showing we have the contract)
7. **Auction Date** (creates urgency - buyer must close before this date)

### Deal Package Template:
```
=== PROJECT VELOCITY - DEAL PACKAGE ===

Property: {{address}}
County: Hamilton, OH
Parcel: {{parcel_number}}

FINANCIAL SUMMARY:
  ARV (After Repair Value): ${{arv}}
  Contract Price:           ${{contract_price}}
  Assignment Fee:           ${{assignment_fee}}
  Total Buyer Cost:         ${{total_to_buyer}}
  Estimated Repairs:        ${{repair_estimate}}
  ---
  Buyer Potential Profit:   ${{buyer_profit}}

PROPERTY DETAILS:
  Beds: {{beds}} | Baths: {{baths}} | SqFt: {{sq_ft}}
  Year Built: {{year_built}}
  Lot Size: {{lot_size}}
  Condition: {{condition}}

COMPARABLE SALES (last 6 months, 0.5 mile radius):
  1. {{comp1_address}} - ${{comp1_price}} ({{comp1_sqft}} sqft, {{comp1_date}})
  2. {{comp2_address}} - ${{comp2_price}} ({{comp2_sqft}} sqft, {{comp2_date}})
  3. {{comp3_address}} - ${{comp3_price}} ({{comp3_sqft}} sqft, {{comp3_date}})

TIMELINE:
  Auction Date: {{auction_date}}
  Must Close By: {{close_by_date}}
  Earnest Money: ${{earnest_money}} (non-refundable upon execution)

NEXT STEPS:
  1. Review this package
  2. Provide Proof of Funds
  3. Sign Assignment of Contract
  4. Wire earnest money to title company
  5. Close and take possession

Contact: Brand Lio | MGO Data LLC | (513) 850-6496
```

## Pricing Strategy for Assignment Fee

| ARV Range | Assignment Fee | Reasoning |
|-----------|---------------|-----------|
| < $100K | $4,000 - $5,000 | Lower-value homes, smaller margins for buyer |
| $100K - $200K | $5,000 - $8,000 | Sweet spot for most Hamilton County SFR |
| $200K - $350K | $8,000 - $12,000 | Higher value, more room for everyone |
| > $350K | $10,000 - $15,000 | Premium, needs institutional buyer |

## Buyer Qualification Checklist
Before assigning, verify:
- [ ] Proof of funds (bank statement, letter from hard money lender, or LOC)
- [ ] Signed assignment contract
- [ ] Earnest money deposited with title company
- [ ] Buyer understands the closing timeline (must beat auction date)
- [ ] Buyer acknowledges "as-is" condition
