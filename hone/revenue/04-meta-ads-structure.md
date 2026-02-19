# HONE — Post-Launch Meta Ads Structure

---

## Campaign Architecture

Three campaigns, each with a distinct objective:

```
HONE Meta Ads
├── Campaign 1: AWARENESS (Top of Funnel)
│   ├── Ad Set: Interest — Beard Care
│   ├── Ad Set: Interest — Men's Grooming
│   └── Ad Set: Lookalike — 1% Email List
│
├── Campaign 2: RETARGETING (Middle/Bottom of Funnel)
│   ├── Ad Set: Website Visitors (7 days)
│   ├── Ad Set: IG/FB Engagers (30 days)
│   └── Ad Set: Add to Cart No Purchase (14 days)
│
└── Campaign 3: LOOKALIKE SCALING (once you have 50+ purchases)
    ├── Ad Set: Lookalike 1% — Purchasers
    ├── Ad Set: Lookalike 2-3% — Purchasers
    └── Ad Set: Lookalike 1% — Add to Cart
```

---

## Campaign Details

### Campaign 1: AWARENESS

**Objective:** Traffic or Conversions (ViewContent)
**Budget:** $10-20/day (50% of total)
**Optimization:** Landing page views initially → switch to Purchase once pixel has 50+ events

**Ad Set: Interest — Beard Care**
- Age: 25-45
- Gender: Male
- Interests: Beard care, beard oil, beard grooming, men's grooming
- Exclude: Existing customers (upload list)
- Placements: Automatic (let Meta optimize) — but monitor Reels performance

**Ad Set: Interest — Men's Grooming**
- Age: 25-45
- Gender: Male
- Interests: Men's skincare, GQ, men's fashion, Beardbrand, Dollar Shave Club, Harry's
- Exclude: Existing customers

**Ad Set: Lookalike — Email List**
- Source: Upload Klaviyo pre-launch list as custom audience
- Lookalike: 1%
- Age: 25-45, Male
- No additional interest targeting (let lookalike do the work)

---

### Campaign 2: RETARGETING

**Objective:** Conversions (Purchase)
**Budget:** $5-15/day (30% of total)
**These audiences are small at launch — consolidate if needed**

**Ad Set: Website Visitors (7-day)**
- Custom audience: All website visitors, last 7 days
- Exclude: Purchasers
- No age/interest restrictions (they already visited)

**Ad Set: Engagers (30-day)**
- Custom audience: Engaged with IG or FB page/ads, last 30 days
- Exclude: Purchasers

**Ad Set: Cart Abandoners (14-day)**
- Custom audience: AddToCart event, last 14 days
- Exclude: Purchasers
- Highest intent — allocate more budget here once it fills

---

### Campaign 3: LOOKALIKE SCALING

**Objective:** Conversions (Purchase)
**Budget:** $5-15/day (20% of total)
**Launch this:** After 50+ purchases (usually Week 2-3)

- Lookalike 1% of Purchasers (best performing, usually)
- Lookalike 2-3% of Purchasers (broader, cheaper CPMs)
- Lookalike 1% of Add-to-Cart

---

## Budget Allocation

### At $30/day (recommended starting point)

| Campaign | Daily Budget | % |
|----------|-------------|---|
| Awareness | $15 | 50% |
| Retargeting | $10 | 33% |
| Lookalike (when ready) | $5 | 17% |

### At $50/day (scale phase)

| Campaign | Daily Budget | % |
|----------|-------------|---|
| Awareness | $20 | 40% |
| Retargeting | $15 | 30% |
| Lookalike | $15 | 30% |

**Rules:**
- Don't touch ads for 3-5 days (let Meta exit learning phase)
- Kill ad sets spending 2x target CPA with 0 purchases after 5 days
- Scale winners by 20%/day max (avoid resetting learning)

---

## Ad Creative Briefs (5 Ads)

### Ad 1: Founder Story (Video, 30-45s)
- **Format:** Vertical video (9:16 for Reels/Stories)
- **Hook (first 3s):** "I couldn't find a beard product that wasn't garbage, so I made one."
- **Body:** Founder talking to camera. Show product. Mention 1-2 key ingredients. Show before/after.
- **CTA:** "Link in bio" or "Shop now"
- **Use in:** Awareness campaign
- **Why it works:** Authenticity. DTC brands win on founder connection.

### Ad 2: Product Demo / How-To (Video, 15-20s)
- **Format:** Vertical video, fast cuts
- **Hook:** "30-second beard upgrade" (text overlay)
- **Body:** Apply oil → comb through → finished look. Clean, well-lit.
- **Text overlay:** "All-natural. No BS. HONE Beard Oil."
- **CTA:** Shop now
- **Use in:** Awareness + Retargeting

### Ad 3: UGC / Testimonial (Video, 15-30s)
- **Format:** iPhone-quality vertical video (intentionally raw)
- **Hook:** "Bro, this beard oil hits different."
- **Body:** Real customer (or seeded influencer) showing product, talking about results
- **CTA:** "Try HONE — link below"
- **Use in:** Retargeting
- **Note:** Seed 5-10 units to friends/micro-influencers pre-launch to get this content

### Ad 4: Static Carousel — Product Lineup
- **Format:** Carousel (3-5 slides)
- **Slide 1:** Hero product shot, bold text: "Hone your craft."
- **Slide 2:** Ingredient callout (natural oils, vitamins)
- **Slide 3:** Before/after or lifestyle shot
- **Slide 4:** Bundle offer or free shipping threshold
- **Slide 5:** "Shop HONE →" with logo
- **Use in:** Awareness + Retargeting
- **Copy:** "Premium beard care without the premium ego. Natural ingredients. Real results. Free shipping over $40."

### Ad 5: Problem/Agitation (Static Image)
- **Format:** Single image, dark background
- **Visual:** Split image — left side: dry, patchy beard. Right side: full, groomed beard.
- **Headline:** "Stop putting cheap oil on your face."
- **Body copy:** "Most beard oils are 90% filler. HONE is 100% purpose-built. Natural oils. No fragrance overload. Just results."
- **CTA:** Shop Now
- **Use in:** Awareness

---

## Audience Targeting Specs (Summary)

| Audience | Type | Size Est. | Notes |
|----------|------|-----------|-------|
| Beard care interests | Saved | 5-15M | Core prospecting |
| Men's grooming broad | Saved | 10-30M | Wider net |
| Email list lookalike 1% | Lookalike | 2-3M | High quality if list is good |
| Site visitors 7d | Custom | 500-5K | Retargeting — grows over time |
| Engagers 30d | Custom | 1-10K | Retargeting |
| Cart abandoners 14d | Custom | 50-500 | Highest intent |
| Purchaser lookalike 1% | Lookalike | 2-3M | Best scaling audience |

---

## Pixel & Tracking Setup

- [ ] Meta Pixel installed on Shopify (use Shopify's native integration)
- [ ] Conversions API (CAPI) enabled for server-side tracking
- [ ] Standard events firing: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
- [ ] Custom audience created: email list upload
- [ ] Product catalog connected (for dynamic retargeting later)
- [ ] UTM convention: `utm_source=meta&utm_medium=paid&utm_campaign={campaign_name}`
