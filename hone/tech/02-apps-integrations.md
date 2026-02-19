# HONE — Apps & Integrations Setup

> Install & configure in this order after store setup.

---

## 1. Klaviyo — Email & SMS Marketing

**Install**: Shopify App Store → "Klaviyo: Email Marketing & SMS"

### Configuration
1. **Connect Shopify integration** — Klaviyo auto-syncs customers, orders, products, catalog
2. **Enable active on-site tracking** (Klaviyo snippet auto-installed)
3. **Set up sender domain**: `mail.honegrooming.com`
   - Add DNS records: DKIM, SPF, DMARC (Klaviyo provides these)
   - Verify domain
4. **Brand settings**:
   - Logo upload
   - Colors: primary `#B87333`, secondary `#2C2C2C`, bg `#F5F0EB`
   - Default fonts to match theme

### Essential Flows to Build (pre-launch)
| Flow | Trigger | Emails |
|---|---|---|
| Welcome Series | List subscribe | 3 emails over 5 days (welcome + 15% code → brand story → product education) |
| Abandoned Cart | Checkout started, not completed | 3 emails: 1hr, 24hr, 72hr |
| Browse Abandonment | Viewed product, didn't add to cart | 1 email at 4hr |
| Post-Purchase | Order fulfilled | 3 emails: thank you (day 0) → how-to-use (day 3) → review request (day 14) |
| Winback | No order in 60 days | 2 emails with incentive |
| Sunset / Re-engagement | No open in 90 days | 1 email, suppress if no engage |

### Signup Forms
- **Popup**: 15% off first order, trigger after 8 seconds or exit intent
- **Embedded footer form**: newsletter signup
- **Flyout**: mobile-friendly alternative to popup

### SMS Setup
- Enable SMS channel in Klaviyo
- Get dedicated sending number
- Compliance: double opt-in, include STOP language
- Key SMS flows: abandoned cart (1 msg at 2hr), shipping confirmation, back-in-stock

### Segments to Create
- Engaged subscribers (opened/clicked in last 30 days)
- Customers (purchased at least once)
- Repeat customers (2+ orders)
- VIPs ($100+ lifetime spend)
- Never purchased
- 30/60/90 day lapsed

### Disable Shopify Emails
- Once Klaviyo flows are active, disable Shopify's marketing emails to avoid duplicates
- Keep Shopify transactional emails (order confirmation, shipping) OR move those to Klaviyo too

---

## 2. Judge.me — Product Reviews

**Install**: Shopify App Store → "Judge.me Product Reviews"

### Configuration
1. **Plan**: Start with **Free** (Awesome plan $15/mo when you want review photos, Q&A, coupons)
2. **Widget settings**:
   - Review widget style: match HONE theme colors
   - Star color: `#B87333` (Burnt Copper)
   - Widget background: transparent
   - Font: match theme
3. **Review request emails**:
   - Send at: **14 days after fulfillment** (gives time to try product)
   - Reminder: 21 days after first request
   - Customize email template with HONE branding
4. **Display settings**:
   - Show star ratings on collection pages: **ON**
   - Show on product pages: **ON** (below product tabs)
   - Show review count in product cards: **ON**
5. **Moderation**:
   - Auto-publish reviews ≥ 3 stars
   - Manually review 1-2 star reviews before publishing
6. **SEO**:
   - Enable **review rich snippets** (structured data for Google stars)
7. **Integrations**:
   - Connect Judge.me → Klaviyo (sync review events for flows)
   - Enable Google Shopping review feed

---

## 3. Google Analytics 4 (GA4) + Enhanced E-commerce

### GA4 Setup
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
   - Property name: `HONE Grooming`
   - Time zone: Eastern, Currency: USD
2. Create **Web** data stream → get Measurement ID (`G-XXXXXXXXXX`)
3. In Shopify: `Online Store → Preferences → Google Analytics`
   - Paste GA4 Measurement ID
   - Shopify auto-handles basic e-commerce events as of 2024+

### Enhanced E-commerce Events (auto-tracked by Shopify + GA4)
- `view_item` — product page view
- `add_to_cart` — add to cart
- `begin_checkout` — checkout started
- `purchase` — order completed
- `view_item_list` — collection page view

### Google Tag Manager (Recommended for advanced tracking)
1. Create GTM container
2. Install GTM via Shopify custom pixels (`Settings → Customer events`)
3. Use GTM to manage GA4, Meta Pixel, and any future tags
4. Create custom pixel:
```javascript
// In Shopify Customer Events → Add custom pixel
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX';
document.head.appendChild(script);
```

### GA4 Configuration
- Enable **Google Signals** (for cross-device tracking)
- Set **data retention** to 14 months
- Create **conversions**: `purchase`, `add_to_cart`, `begin_checkout`
- Link to **Google Search Console**
- Link to **Google Ads** (for future paid campaigns)

---

## 4. Meta Pixel + Conversions API (CAPI)

### Pixel Setup
1. In Meta Business Manager → Events Manager → create new Pixel
2. Pixel name: `HONE Grooming Pixel`
3. In Shopify: `Settings → Customer events → Add custom pixel` **OR** use the Facebook & Instagram sales channel:
   - Install **Facebook & Instagram** app from Shopify App Store
   - Connect Facebook Business Manager
   - This auto-installs the Pixel AND Conversions API

### Conversions API (Server-Side)
- The Shopify Facebook channel automatically sends server-side events via CAPI
- Verify in Meta Events Manager that events show **Browser** AND **Server** sources
- Key events tracked:
  - `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
  - Event match quality: aim for **Good** or **Great**

### Configuration
- **Automatic Advanced Matching**: Enable (sends hashed email, phone for better attribution)
- **Event deduplication**: Handled automatically by Shopify integration
- **Custom Audiences to create**:
  - Website visitors (last 30/60/180 days)
  - Add to cart but no purchase (last 14 days)
  - Purchasers (last 30/180 days)
  - Lookalike audiences from purchasers

### Verify
- Use **Meta Pixel Helper** Chrome extension to verify events fire correctly
- Check Events Manager for real-time event flow
- Confirm purchase value and currency pass correctly

---

## 5. Aftership — Order Tracking

**Install**: Shopify App Store → "AfterShip Order Tracking"

### Configuration
1. **Plan**: Free (50 shipments/mo) → Essentials ($11/mo) when volume grows
2. **Tracking page**:
   - Create branded tracking page at `honegrooming.com/pages/track-your-order`
   - Customize with HONE colors and logo
   - Add product recommendations on tracking page (upsell opportunity)
3. **Notifications**:
   - Enable email notifications for key statuses: shipped, in transit, delivered, exception
   - Brand the notification emails
   - **OR** use Klaviyo for tracking emails instead (more control):
     - Aftership → Klaviyo integration
     - Trigger Klaviyo flows on Aftership events
4. **Carriers**: Enable USPS, UPS, FedEx (whichever Pirate Ship routes through)
5. **Dashboard**: Monitor delivery performance, transit times

---

## 6. Pirate Ship — Shipping Labels

**Install**: Shopify App Store → "Pirate Ship - Shipping Labels"

### Configuration
1. **Connect Shopify** — auto-imports orders
2. **Ship From address**: set business address
3. **Carrier accounts** (Pirate Ship provides discounted rates via):
   - USPS (Commercial Plus pricing — significant discounts)
   - UPS (negotiated rates)
4. **Default package presets**: (match shipping settings from setup guide)
   - Single product mailer: 10" × 7" × 2", 4oz
   - Standard box: 8" × 6" × 4", 8oz
   - Multi-product box: 12" × 8" × 6", 16oz
5. **Automation rules**:
   - Default service: USPS Ground Advantage for orders <1lb
   - Auto-select cheapest for heavier orders
6. **Label settings**:
   - Format: 4×6 thermal labels (if using thermal printer) or 8.5×11 paper
   - Auto-email tracking to customers: OFF (let Shopify/Aftership handle)
7. **Insurance**: Enable for orders >$75

### Workflow
1. Orders flow into Pirate Ship automatically
2. Batch-print labels
3. Tracking numbers sync back to Shopify
4. Aftership picks up tracking → customer gets updates

---

## 7. Rewind Backups

**Install**: Shopify App Store → "Rewind Backups"

### Configuration
1. **Plan**: starts at $9/mo
2. **Auto-backup**: Enable daily automatic backups
3. **What it backs up**:
   - Products (including images, variants, metafields)
   - Collections
   - Customers
   - Orders
   - Pages, blog posts
   - Theme files
   - Navigation menus
   - Policies
4. **Alerts**: Enable email alerts for backup completion and any failures
5. **Test restore**: After first backup, test restoring a single product to verify
6. **Retention**: Keep at least 30 days of backups

### Why Needed
- Shopify has no built-in undo/restore
- Protects against accidental bulk edits, theme breaks, app conflicts, staff errors

---

## App Install Order (Recommended)

1. **Klaviyo** — set up before launch for email capture
2. **Judge.me** — configure review widgets in theme
3. **Facebook & Instagram channel** (Meta Pixel + CAPI)
4. **GA4** via Shopify Preferences (or GTM)
5. **Pirate Ship** — before first order ships
6. **Aftership** — before first order ships
7. **Rewind** — immediately after store is configured (backup baseline)

---

## Future Apps to Consider

| App | Purpose | When |
|---|---|---|
| Gorgias or Tidio | Customer support / live chat | When ticket volume grows |
| Smile.io or Yotpo | Loyalty/rewards program | After ~500 customers |
| ReConvert | Post-purchase upsells | After baseline conversion data |
| Subscriptions (Skio/Recharge) | Auto-replenishment for oils, balms | High priority — recurring revenue |
| Stamped.io | UGC / photo reviews (alt to Judge.me) | If Judge.me doesn't scale |
| Octane AI | Quiz → product recommendations | For engagement/conversion |
