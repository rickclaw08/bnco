# Website Pivot Brief - Feb 24, 2026

## DIRECTIVE FROM BRAND
The CTO's redesign was too much. Too much text, lost the ClawOps title/branding, Stripe links missing from pricing, overwhelming layout. A client would leave.

## WHAT TO DO
1. **REVERT to the previous design as the base** - the layout and structure that worked before
2. **Surgically update ONLY:** services names/descriptions, pricing tiers, and copy improvements from the market research
3. **Keep the ClawOps title/branding prominent** - it was gone in the redesign, that's unacceptable
4. **Stripe payment links MUST be on pricing buttons** - new links:
   - AI Readiness Audit ($500): https://buy.stripe.com/eVqbJ1ctLgG5eFe9Ck3oA04
   - AI Receptionist Standard ($300/mo): https://buy.stripe.com/28E8wP79r1LbfJidSA3oA05
   - Revenue Operations Sprint ($5,000): https://buy.stripe.com/7sYfZh51jahH40AdSA3oA09
   - Custom AI Agent Development ($7,500): https://buy.stripe.com/7sYfZh51jahH40AdSA3oA09
   - Automation-as-a-Service ($2,000/mo): https://buy.stripe.com/bJeeVdctL61r8gQcOw3oA0a
5. **Less is more** - concise copy, not walls of text
6. **New service tiers to display:**
   - AI Readiness Audit - $500 (one-time)
   - AI Receptionist - $300/mo (+ setup)
   - Revenue Operations Sprint - $5K-$15K (one-time)
   - Custom AI Agent Development - $7.5K-$25K (one-time)
   - Automation-as-a-Service - $2K-$5K/mo (retainer)

## SECURITY CHECKLIST (MANDATORY - apply to every website)
- Rate limiting on all public endpoints (IP + user-based, sensible defaults, graceful 429s)
- Strict input validation & sanitization on all user inputs (schema-based, type checks, length limits, reject unexpected fields)
- Secure API key handling (remove hard-coded keys, move to environment variables, rotate keys, ensure no keys are exposed client-side)
- CSP headers: Restrict script-src, style-src, connect-src, frame-src, object-src, form-action
- Security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin
- Form security: CAPTCHA enabled, honeypot fields, whitelist-based select validation
- Follow OWASP best practices throughout
- Include clear comments, do not break existing functionality

## NEVER use em dashes anywhere. Hyphens, commas, or rewrite.
