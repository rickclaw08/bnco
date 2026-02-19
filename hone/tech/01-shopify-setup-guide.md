# HONE — Shopify Store Setup Guide

> Men's Grooming / Beard Care Brand
> Last updated: 2026-02-18

---

## 1. Store Creation & General Settings

### 1.1 Create Store
- Go to [shopify.com](https://shopify.com) → Start free trial
- Store name: **HONE** (or **HONE Grooming** if taken)
- Select plan: **Basic Shopify** ($39/mo) to start — upgrade to Shopify ($105/mo) when revenue justifies it

### 1.2 General Settings (`Settings → Store details`)
| Setting | Value |
|---|---|
| Store name | HONE |
| Store contact email | support@honegrooming.com |
| Sender email | hello@honegrooming.com |
| Store industry | Health & Beauty |
| Address | [Your business address] |
| Store currency | USD |
| Unit system | Imperial |
| Default weight unit | oz |
| Time zone | (Eastern Time) |
| Order ID format | #HONE-{{number}} |

### 1.3 Plan & Permissions
- Enable **Shopify Payments** immediately (avoids 2% transaction fee)
- Add staff accounts as needed with appropriate permissions

---

## 2. Payments (`Settings → Payments`)

### 2.1 Shopify Payments (Primary)
- Activate Shopify Payments → complete business verification
- Enable **all major cards**: Visa, Mastercard, Amex, Discover
- Enable **Apple Pay** and **Google Pay** (Shop Pay auto-enabled)
- Set **payout schedule**: Daily (or Weekly if preferred for cash flow planning)
- Set **fraud prevention**: AVS + CVV enabled
- Set **statement descriptor**: `HONE GROOMING`

### 2.2 PayPal (Secondary)
- Connect PayPal Business account as alternate payment
- Use express checkout buttons on cart page

### 2.3 Additional
- Enable **Shop Pay Installments** (buy now pay later, no extra cost)
- Disable any manual payment methods unless needed

---

## 3. Checkout Settings (`Settings → Checkout`)

### 3.1 Customer Accounts
- Set to **"Accounts are optional"**
- Enable **Shop Pay** login
- Enable **Multipass** (if on Shopify Plus later)

### 3.2 Customer Contact
- Customers can check out using: **Email**
- Show option to subscribe to email marketing at checkout: **ON**
- Preselect the sign-up option: **OFF** (compliance best practice)

### 3.3 Form Options
| Field | Setting |
|---|---|
| Full name | Require first and last name |
| Company name | Hidden |
| Address line 2 | Optional |
| Phone number | Optional |

### 3.4 Tipping
- Disable tipping (not relevant for product brand)

### 3.5 Order Processing
- After order is paid: **Automatically fulfill only gift cards**
- After order is fulfilled: **Automatically archive the order**
- Enable **additional scripts** later for conversion tracking (see Apps section)

### 3.6 Checkout Customization (Branding)
- **Logo**: HONE logo (upload SVG/PNG, max width ~200px)
- **Banner**: None (clean look)
- **Background color**: `#F5F0EB` (Bone White)
- **Form accent color**: `#B87333` (Burnt Copper)
- **Error color**: `#CC0000`
- **Heading font**: Match theme heading font
- **Body font**: Match theme body font
- Add **trust badges** below payment section (SSL, money-back guarantee)

---

## 4. Shipping (`Settings → Shipping and delivery`)

### 4.1 Shipping Zones & Rates

#### Zone: Domestic (United States)
| Rate Name | Condition | Price | Speed |
|---|---|---|---|
| Standard Shipping | Orders under $50 | $4.99 | 5-7 business days |
| Free Standard Shipping | Orders $50+ | FREE | 5-7 business days |
| Express Shipping | All orders | $12.99 | 2-3 business days |

#### Zone: Canada
| Rate Name | Condition | Price |
|---|---|---|
| Standard International | All orders | $9.99 |
| Free International | Orders $75+ | FREE |

#### Zone: Rest of World (optional — add later)
- Consider enabling UK, EU, Australia when ready

### 4.2 Shipping Setup Steps
1. `Settings → Shipping and delivery → Manage rates`
2. Create **General shipping profile** (covers all products by default)
3. Add zone "Domestic" → select United States
4. Add rate: "Standard Shipping" → price-based, set condition <$50, rate $4.99
5. Add rate: "Free Standard Shipping" → price-based, set condition ≥$50, rate $0.00
6. Add rate: "Express Shipping" → price-based, no condition, rate $12.99
7. Repeat for Canada zone

### 4.3 Packaging
- Add custom package dimensions:
  - **Single product box**: 8" × 6" × 4", weight 8oz
  - **Multi-product box**: 12" × 8" × 6", weight 16oz
  - **Mailer**: 10" × 7" × 2", weight 4oz

### 4.4 Packing Slips
- Customize packing slip template with HONE branding
- Include a thank-you message + discount code for next order

### 4.5 Local Delivery / Pickup
- Disable unless you have a physical location

---

## 5. Tax Settings (`Settings → Taxes and duties`)

### 5.1 US Taxes
- Enable **automatic tax calculation** (Shopify handles state-by-state)
- Set tax registration for your nexus states
- **Include tax in prices**: OFF (show taxes at checkout — US standard)
- **Charge tax on shipping**: Follow per-state rules (Shopify auto-handles)
- Product tax category: **Health & Beauty** (most grooming products are non-taxable in some states; verify per-product)

### 5.2 International Taxes
- Enable **duty and import tax** estimation for international orders
- Register for tax collection in active markets (Canada GST/HST if applicable)

---

## 6. Theme Setup

### 6.1 Theme Recommendation: **Dawn** (free) or **Impulse** ($380)

| Criteria | Dawn | Impulse |
|---|---|---|
| Cost | Free | $380 one-time |
| Performance | Excellent (fastest free theme) | Very good |
| Customization | Good | Excellent |
| Built-in features | Minimal, clean | Promo banners, advanced filtering, quick buy |
| Best for | MVP / budget launch | Polished launch with more features |

**Recommendation**: Start with **Dawn** for MVP launch, upgrade to **Impulse** once revenue is flowing.

### 6.2 Color Scheme

| Role | Color | Hex |
|---|---|---|
| Primary / Background Dark | Charcoal | `#2C2C2C` |
| Accent / CTA buttons | Burnt Copper | `#B87333` |
| Light Background / Body | Bone White | `#F5F0EB` |
| Text on dark bg | Bone White | `#F5F0EB` |
| Text on light bg | Charcoal | `#2C2C2C` |
| Secondary accent | Dark Copper | `#8B5E3C` |
| Success / in-stock | | `#4A7C59` |
| Sale / urgency | | `#C0392B` |

### 6.3 Typography
| Element | Font Recommendation |
|---|---|
| Headings | **Bebas Neue** or **Oswald** (bold, masculine, condensed) |
| Body text | **Inter** or **Work Sans** (clean, readable) |
| Logo/Brand | Custom or **Tungsten** style |

### 6.4 Theme Customization Specs

#### Header
- Sticky header: **ON**
- Logo position: **Left-aligned**
- Logo max width: 120px
- Background: `#2C2C2C` (Charcoal)
- Navigation links: `#F5F0EB` (Bone White)
- Announcement bar: `#B87333` background, `#F5F0EB` text
  - Example: "FREE SHIPPING ON ORDERS $50+ | HONE YOUR LOOK"

#### Homepage Sections (in order)
1. **Hero Banner** — full-width lifestyle image, headline overlay
   - "BUILT FOR THE BEARDED" or similar
   - CTA button: "SHOP NOW" → links to All Products
   - Button style: `#B87333` bg, `#F5F0EB` text
2. **Featured Collection** — 4-product grid, "Best Sellers"
3. **Brand Story Split** — image left, text right
   - "Crafted for men who give a damn"
4. **Collection List** — 3 collections with images (Oils, Balms, Kits)
5. **Testimonials** — customer reviews carousel (wire to Judge.me)
6. **Email Signup** — Klaviyo embedded form
   - "JOIN THE HONE — 15% off your first order"
   - Background: `#2C2C2C`, input fields on `#F5F0EB`
7. **Instagram Feed** — UGC section (add via app later)

#### Product Pages
- Product image gallery: **Thumbnails below** (or side on desktop)
- Enable **zoom on hover**
- Show variant swatches (color circles, not dropdowns)
- Add **"Add to Cart"** button — `#B87333` with `#F5F0EB` text
- Show **inventory quantity** when <10 remaining ("Only X left!")
- Enable **dynamic checkout buttons** (Shop Pay, Apple Pay, Google Pay)
- Tabs below product: Description | Ingredients | How to Use | Reviews

#### Collection Pages
- Grid layout: **4 columns desktop, 2 mobile**
- Enable filtering: by product type, price
- Enable sorting: Featured, Price low-high, Price high-low, Newest
- Show product count

#### Cart
- Use **drawer cart** (slide-out, no page redirect)
- Show free shipping progress bar: "You're $XX away from FREE shipping!"
- Show upsell/cross-sell: "Complete your routine" product suggestions
- Show estimated delivery date

#### Footer
- Background: `#2C2C2C`
- Text: `#F5F0EB`
- Columns: Shop | About | Support | Newsletter
- Include: social media icons, payment icons
- Links: Privacy Policy, Terms of Service, Refund Policy, Shipping Policy

---

## 7. Product Setup

### 7.1 Product Title Format
```
[Product Type] - [Scent/Variant Name]
```
Examples:
- `Beard Oil - Smokewood`
- `Beard Balm - Original`
- `Beard Wash - Cedar & Pine`
- `Grooming Kit - The Essentials`

### 7.2 Product Description Template
```html
<h3>[Punchy one-liner about the product]</h3>

<p>[2-3 sentences about what it does and why it's different. Speak to the customer's problem.]</p>

<h4>Why You'll Love It</h4>
<ul>
  <li>[Benefit 1 — result-focused]</li>
  <li>[Benefit 2]</li>
  <li>[Benefit 3]</li>
</ul>

<h4>Key Ingredients</h4>
<ul>
  <li>[Ingredient] — [what it does]</li>
  <li>[Ingredient] — [what it does]</li>
</ul>

<h4>How to Use</h4>
<p>[Simple 2-3 step instructions]</p>

<h4>Details</h4>
<ul>
  <li>Size: [1oz / 2oz / 4oz]</li>
  <li>Scent: [Description]</li>
  <li>Made in the USA</li>
  <li>Cruelty-free & natural ingredients</li>
</ul>
```

### 7.3 Variants
| Product Type | Variant Type | Options |
|---|---|---|
| Beard Oil | Size | 1oz ($18), 2oz ($28) |
| Beard Oil | Scent | Smokewood, Cedar & Pine, Unscented |
| Beard Balm | Size | 2oz ($22), 4oz ($34) |
| Beard Wash | Size | 4oz ($16), 8oz ($24) |
| Kits/Bundles | — | No variants (fixed contents) |

### 7.4 Images Needed Per Product
| Image | Specs |
|---|---|
| Hero / Main | Product on white or dark bg, square 2048×2048px |
| Lifestyle | Product in-use or styled scene, 2048×2048px |
| Ingredients close-up | Texture or pour shot |
| Scale/size reference | In hand or next to common object |
| Label detail | Ingredients list visible |
| **Total per product** | **4-6 images minimum** |

Format: JPG or WebP, <500KB each after compression, alt text on every image.

### 7.5 SEO Metadata Per Product
| Field | Format | Example |
|---|---|---|
| Page title | `[Product] - [Benefit] | HONE Grooming` | `Beard Oil - Smokewood Scent for Softer, Healthier Beards | HONE Grooming` |
| Meta description | 150-160 chars, include benefit + CTA | `Tame and nourish your beard with HONE Smokewood Beard Oil. Natural ingredients, bold scent. Free shipping on $50+. Shop now.` |
| URL handle | `/products/beard-oil-smokewood` | lowercase, hyphenated |
| Image alt text | Descriptive: `HONE Smokewood Beard Oil 2oz bottle on dark background` | — |

### 7.6 Product Organization
| Field | Value |
|---|---|
| Product type | Beard Oil / Beard Balm / Beard Wash / Grooming Kit / Accessory |
| Vendor | HONE |
| Tags | `beard-oil`, `bestseller`, `gift-ready`, `natural`, `[scent-name]` |

---

## 8. Collection Structure

| Collection | Handle | Type | Rule / Manual |
|---|---|---|---|
| All Products | `/collections/all` | Auto | All products |
| Beard Oils | `/collections/beard-oils` | Auto | Product type = "Beard Oil" |
| Beard Balms | `/collections/beard-balms` | Auto | Product type = "Beard Balm" |
| Beard Wash & Care | `/collections/beard-wash` | Auto | Product type = "Beard Wash" |
| Grooming Kits | `/collections/kits` | Auto | Product type = "Grooming Kit" |
| Best Sellers | `/collections/best-sellers` | Manual | Hand-picked top products |
| New Arrivals | `/collections/new` | Auto | Created date within last 30 days |
| Gift Sets | `/collections/gifts` | Manual | Curated gift bundles |
| Sale | `/collections/sale` | Auto | Compare-at price is set |

Each collection needs:
- **Title** and **description** (SEO-optimized, 100-200 words)
- **Collection image** (1200×600px lifestyle banner)
- **SEO title and meta description**

---

## 9. Navigation Menus

### Main Navigation (Header)
```
Shop ▾
  ├── All Products
  ├── Beard Oils
  ├── Beard Balms
  ├── Beard Wash & Care
  ├── Grooming Kits
  └── Gift Sets
About
  ├── Our Story
  └── Ingredients
Blog (link to /blogs/hone-journal)
```

### Footer Navigation
```
Column 1: Shop
  ├── All Products
  ├── Best Sellers
  └── New Arrivals

Column 2: About
  ├── Our Story
  ├── Ingredients
  └── Contact Us

Column 3: Support
  ├── FAQ
  ├── Shipping & Returns
  ├── Track Your Order
  └── Contact Us

Column 4: Legal
  ├── Privacy Policy
  ├── Terms of Service
  └── Refund Policy
```

### Mobile Navigation
- Same as main nav but flat (no mega menu)
- Add "Account" and "Cart" icons in header

---

## 10. Pages to Create

| Page | Handle | Notes |
|---|---|---|
| About / Our Story | `/pages/about` | Brand origin, values, mission |
| Contact Us | `/pages/contact` | Shopify contact form + email |
| FAQ | `/pages/faq` | Collapsible sections |
| Shipping & Returns | `/pages/shipping-returns` | Policy details, timelines |
| Ingredients | `/pages/ingredients` | Highlight natural/quality ingredients |
| Privacy Policy | `/policies/privacy-policy` | Auto-generated, customize |
| Terms of Service | `/policies/terms-of-service` | Auto-generated, customize |
| Refund Policy | `/policies/refund-policy` | Auto-generated, customize |

---

## 11. Blog Setup

- Blog name: **The Hone Journal**
- Handle: `/blogs/hone-journal`
- Create 3-5 launch posts:
  1. "Why Your Beard Deserves Better" (educational)
  2. "The HONE Story" (brand story)
  3. "Beard Oil vs. Beard Balm: Which Do You Need?" (SEO play)
  4. "5 Beard Grooming Mistakes You're Making" (SEO play)
  5. "How to Build a Beard Care Routine" (buying guide → links to kits)

---

## 12. Notifications (`Settings → Notifications`)

Customize these email templates with HONE branding (logo, colors, tone):
- Order confirmation
- Shipping confirmation
- Delivery confirmation
- Abandoned cart (or defer to Klaviyo)
- Customer welcome
- Refund notification

Use Burnt Copper `#B87333` for buttons, Charcoal `#2C2C2C` for headers, Bone White `#F5F0EB` for backgrounds.

---

## 13. Pre-Launch Checklist

- [ ] Test checkout flow end-to-end (use Shopify Bogus Gateway)
- [ ] Place and fulfill a real test order
- [ ] Verify shipping rates calculate correctly
- [ ] Verify tax calculates correctly
- [ ] Test on mobile (iPhone + Android)
- [ ] Confirm email notifications send and look correct
- [ ] Verify all links in nav work
- [ ] Check page speed (target: 90+ Lighthouse score)
- [ ] Remove password page and go live
- [ ] Announce on socials
