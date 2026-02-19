# FORGE — Domain Setup Guide

---

## 1. Domain Name Recommendations

`forge.com` is almost certainly taken (premium domain, likely $50K+). Here are alternatives ranked by preference:

### Top Picks
| Domain | Notes | Est. Cost |
|---|---|---|
| **forgegrooming.com** | ✅ Best option — clear, brandable, SEO-friendly | ~$12/yr |
| **forgebeard.com** | Good, product-specific | ~$12/yr |
| **getforge.co** | Short, modern feel | ~$15/yr |
| **forgebeardcare.com** | Descriptive, SEO-rich | ~$12/yr |
| **shopforge.com** | E-commerce oriented | ~$12/yr |
| **forgeformen.com** | Audience-specific | ~$12/yr |

### Also Consider
- `forgesupply.com` / `forgesupplyco.com` — rugged brand feel
- `forge.co` — premium but shorter
- `forgegrooming.co` — if .com taken
- `weareforge.com` — community feel

### Check Availability
- [Namecheap](https://www.namecheap.com)
- [Google Domains → Squarespace Domains](https://domains.squarespace.com)
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (at-cost pricing, recommended)
- Shopify's built-in domain purchase (convenient but slightly more expensive)

**Recommendation**: Buy via **Cloudflare Registrar** (cheapest renewals, free DNS, free SSL) or **Namecheap**.

---

## 2. Domain Purchase

1. Search your top choice at registrar
2. Register for **2+ years** (minor SEO signal, prevents accidental expiry)
3. Enable **WHOIS privacy** (free on most registrars)
4. Enable **auto-renew**
5. Purchase matching domains to protect brand:
   - `.com` (primary)
   - `.co` (redirect to .com)
   - Common misspellings (optional)

---

## 3. Connect Domain to Shopify

### Option A: Third-Party Domain (Recommended)
1. In Shopify: `Settings → Domains → Connect existing domain`
2. Enter your domain (e.g., `forgegrooming.com`)
3. Shopify provides DNS records to add at your registrar:

#### DNS Records to Add
| Type | Host/Name | Value | TTL |
|---|---|---|---|
| A | `@` | `23.227.38.65` | Auto/3600 |
| CNAME | `www` | `shops.myshopify.com` | Auto/3600 |

4. At registrar, add the A record and CNAME
5. Wait for DNS propagation (5 min – 48 hrs, usually <1 hr)
6. Back in Shopify, click **Verify connection**

### Option B: Buy Through Shopify
1. `Settings → Domains → Buy new domain`
2. Search and purchase (~$14/yr)
3. Auto-configured, no DNS setup needed
4. Less flexibility than external registrar

---

## 4. SSL Certificate

- Shopify **auto-provisions** a free SSL certificate once the domain is connected
- May take up to 48 hours after DNS verification
- Verify: visit `https://forgegrooming.com` — should show lock icon
- Force HTTPS: `Settings → Domains → SSL` → ensure enabled

---

## 5. Email Domain Setup

### Transactional Email (Shopify Notifications)
- Shopify sends from `no-reply@forgegrooming.com` appearance, but actually from Shopify's servers
- For proper delivery: add Shopify's SPF/DKIM records (Shopify provides these in Settings → Notifications → Sender email)

### Marketing Email (Klaviyo)
Set up a **sending domain** in Klaviyo:

| Type | Host/Name | Value |
|---|---|---|
| CNAME | `kl._domainkey` | (Klaviyo provides) |
| CNAME | `kl2._domainkey` | (Klaviyo provides) |
| TXT | `@` | `v=spf1 include:_spf.klaviyo.com ~all` (append to existing SPF) |

### Business Email
Options:
1. **Google Workspace** ($6/user/mo) — `hello@forgegrooming.com`, `support@forgegrooming.com`
2. **Zoho Mail** (free for 1 user) — budget option
3. **Cloudflare Email Routing** (free) — forward `support@forgegrooming.com` → personal Gmail

**Recommended addresses:**
- `hello@forgegrooming.com` — general / sender for marketing
- `support@forgegrooming.com` — customer service
- `orders@forgegrooming.com` — order notifications

---

## 6. DNS Records — Complete List

After all integrations, your DNS should look like:

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` | `23.227.38.65` | Shopify |
| CNAME | `www` | `shops.myshopify.com` | Shopify |
| CNAME | `kl._domainkey` | (from Klaviyo) | Klaviyo DKIM |
| CNAME | `kl2._domainkey` | (from Klaviyo) | Klaviyo DKIM |
| TXT | `@` | `v=spf1 include:_spf.klaviyo.com include:shops.shopify.com ~all` | SPF |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@forgegrooming.com` | DMARC |
| TXT | `@` | Google Site Verification code | GSC |
| MX | `@` | (from email provider) | Business email |

---

## 7. Post-Domain Checklist

- [ ] Domain resolves to Shopify store
- [ ] SSL certificate active (green lock)
- [ ] `www` redirects to root (or vice versa) — set preferred in Shopify
- [ ] Old `yourstore.myshopify.com` redirects to custom domain
- [ ] SPF, DKIM, DMARC records configured
- [ ] Email sending domain verified in Klaviyo
- [ ] Google Search Console verified with new domain
- [ ] GA4 updated with correct domain
- [ ] Meta Pixel domain verified in Business Manager
- [ ] Business email working (send test)
- [ ] Social media profiles updated with domain URL
