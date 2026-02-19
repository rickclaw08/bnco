# HONE — Klaviyo Email Flow Architecture

> Brand voice: Masculine, intentional, refined. Short sentences. Craft-driven. "Hone your craft."

---

## Segment Definitions

| Segment | Definition |
|---------|-----------|
| **New Subscriber** | Added to list, 0 orders |
| **First-Time Buyer** | Exactly 1 order |
| **Repeat Buyer** | 2+ orders |
| **VIP** | 3+ orders OR $150+ LTV |
| **Lapsed** | Ordered 60-120 days ago, no activity since |
| **At-Risk** | Ordered 30-60 days ago, no repeat |
| **Browse-No-Buy** | Viewed product, no cart/order in 24h |
| **Cart Abandoner** | Added to cart, no order in 1h |

---

## 1. Welcome Series (4 Emails)

**Trigger:** Subscribes to list (popup, landing page, footer)
**Entry condition:** Has NOT placed an order
**Exit condition:** Places an order (move to post-purchase flow)

| # | Delay | Subject Line | Content | CTA |
|---|-------|-------------|---------|-----|
| W1 | Immediate | Welcome to HONE. | Brand story. Why HONE exists. Founder photo. 10% welcome code: HONE10 | Shop Now |
| W2 | +24h | What your beard is missing. | Problem/solution. Before/after social proof. Ingredient callouts (natural oils, no chemicals). | Browse Bestsellers |
| W3 | +48h (72h total) | Don't take our word for it. | 3 customer reviews/testimonials. UGC photos. Star ratings. | Claim 10% Off |
| W4 | +72h (Day 6) | Your code expires at midnight. | Urgency. Restate 10% code. Product recommendation based on browse history (dynamic block). | Last Chance → Shop |

**Klaviyo settings:**
- Smart sending: 16h
- Skip if already in Abandoned Cart flow
- UTM: welcome_series

---

## 2. Abandoned Cart (3 Emails)

**Trigger:** Added to cart → no checkout started/completed
**Time window:** Starts 1 hour after cart creation
**Exit condition:** Completes purchase

| # | Delay | Subject Line | Content | Discount |
|---|-------|-------------|---------|----------|
| AC1 | +1h | You left something behind. | Cart contents (dynamic). Product image. No discount yet. Social proof line ("Join 2,000+ men who've honed their routine"). | Complete Order |
| AC2 | +12h | Still thinking it over? | Objection handling: shipping info, return policy, ingredient quality. Cart contents. | Free shipping on $40+ |
| AC3 | +24h | Last call — 15% off your cart. | Urgency + scarcity. 15% code: HONEIT. Expires 24h. Cart contents. | 15% Off → HONEIT |

**Klaviyo settings:**
- Flow filter: Cart value > $0
- Exclude VIP segment (they get different treatment)
- Smart sending: 12h

---

## 3. Post-Purchase (5 Emails)

**Trigger:** Order placed (Fulfilled)
**Split:** First-time buyer vs. Repeat buyer (conditional split at entry)

### First-Time Buyer Path

| # | Delay | Subject Line | Content | Goal |
|---|-------|-------------|---------|------|
| PP1 | +0 (order confirm) | Order confirmed. Time to hone in. | Thank you. Order summary. What to expect (shipping timeline). | Set expectations |
| PP2 | +3 days | How to get the most out of your HONE. | Usage tips. Video embed or GIF. "Most guys see results in 2 weeks." | Reduce returns, build habit |
| PP3 | +10 days | How's it going? | Check-in. Link to FAQ. Support email. Subtle cross-sell: "Pair your [product] with [complementary product]." | Cross-sell |
| PP4 | +21 days | Quick favor — 30 seconds. | Review request. Direct link to product review form (Klaviyo review or Judge.me). Offer: leave a review → enter to win monthly giveaway. | UGC/reviews |
| PP5 | +28 days | Time to restock? | Replenishment reminder. Based on product usage cycle (beard oil ~30 days). 10% returning customer code: REHONE. | Repeat purchase |

### Repeat Buyer Path

| # | Delay | Subject Line | Content |
|---|-------|-------------|---------|
| PP1 | +0 | You're back. Respect. | Thank you. Order summary. |
| PP2 | +10 days | Unlock VIP status. | Show progress toward VIP (X more orders or $Y more spend). Tease VIP perks. |
| PP3 | +21 days | Review request. | Same as first-time PP4. |

---

## 4. Win-Back (3 Emails)

**Trigger:** Last order 60+ days ago AND no site activity in 30 days
**Exit condition:** Places order or clicks through

| # | Delay | Subject Line | Content | Offer |
|---|-------|-------------|---------|-------|
| WB1 | Day 0 (60 days post-order) | We miss your face. | "It's been a while." New product highlights. What's changed since they left. | None |
| WB2 | +7 days | 20% to come back. No strings. | Direct offer. Code: COMEBACK20. Bestseller showcase. | 20% off |
| WB3 | +14 days | Last chance before we stop emailing. | Sunset warning. "We'll remove you from our list in 7 days unless you want to stay." Re-engage link OR unsubscribe. | 20% still valid |

**Post-flow:** If no engagement after WB3 → suppress from main list. Move to "Sunset" segment. Stop paying to email dead contacts.

---

## 5. Browse Abandonment (2 Emails)

**Trigger:** Viewed product page 2+ times OR spent 60+ seconds on product page → no add-to-cart in 24h
**Exclude:** Anyone in active Abandoned Cart or Welcome flow

| # | Delay | Subject Line | Content |
|---|-------|-------------|---------|
| BA1 | +24h | Caught you looking. | Dynamic product block (viewed items). Social proof. No discount. |
| BA2 | +48h | Still on your mind? | Same product + "Customers also bought…" cross-sell block. Free shipping reminder. |

---

## 6. VIP / Repeat Buyer Flow

**Trigger:** Enters VIP segment (3+ orders OR $150+ LTV)
**This is an ongoing nurture, not a linear flow.**

| # | Timing | Subject Line | Content |
|---|--------|-------------|---------|
| VIP1 | On segment entry | You've earned VIP status. | Welcome to inner circle. Perks: early access, exclusive drops, free shipping always, birthday gift. |
| VIP2 | Ongoing — new product launches | First look: [Product Name] | 48h early access before public launch. |
| VIP3 | Ongoing — quarterly | Your VIP reward is here. | Exclusive discount (25% off) or free gift with purchase. |
| VIP4 | Birthday (if collected) | Happy birthday. This one's on us. | Free product or steep discount. Code: BDAY + unique. |

**Klaviyo settings:**
- Tag VIPs in Shopify via Klaviyo integration
- Exclude from all discount flows (they get better offers)
- Priority: VIP flow > all other flows

---

## Flow Priority Order (Conflict Resolution)

1. Post-Purchase (always sends)
2. VIP Flow
3. Abandoned Cart
4. Welcome Series
5. Browse Abandonment
6. Win-Back

Use Klaviyo's "Skip if in another flow" filter to prevent overlap.

---

## Technical Setup Checklist

- [ ] Shopify-Klaviyo integration active
- [ ] Checkout events syncing (Started Checkout, Placed Order)
- [ ] Browse tracking pixel installed
- [ ] Popup form live (welcome code delivery)
- [ ] Review platform integrated (Judge.me or Klaviyo Reviews)
- [ ] Dynamic product blocks configured
- [ ] UTM parameters on all links
- [ ] Smart sending enabled (16h minimum)
- [ ] Consent/GDPR compliance on all forms
