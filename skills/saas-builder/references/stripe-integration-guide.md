# Stripe Integration Guide

Patterns and examples for integrating Stripe payments into ClawOps products.

## Account Info
- Business: ClawOps
- Email: contact@aurolly.com
- Dashboard: https://dashboard.stripe.com/

## Integration Levels

### Level 1: Payment Links (No Code)

Best for: Quick launch, simple products, landing pages.

1. Create product in Stripe Dashboard > Products
2. Create a Payment Link for each product
3. Embed the link as a button on your page

```html
<a href="https://buy.stripe.com/YOUR_LINK"
   class="cta-button"
   target="_blank"
   rel="noopener noreferrer">
  Get Started - $600
</a>
```

Current payment links stored in:
`/Users/agentclaw/.openclaw/workspace/claw-agency/finance/stripe-payment-links.md`

**Pros:** Zero code, instant setup, Stripe handles everything
**Cons:** Limited customization, redirects to Stripe-hosted page

### Level 2: Checkout Sessions (Server Required)

Best for: Custom checkout flow, collecting extra info, controlling redirect URLs.

**Server-side (Node.js/Next.js API route):**
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1,
    }],
    mode: 'subscription', // or 'payment' for one-time
    success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/pricing`,
    customer_email: req.body.email, // pre-fill if known
    metadata: {
      source: 'autopilot-landing',
    },
  });

  res.json({ url: session.url });
}
```

**Client-side:**
```javascript
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail }),
});
const { url } = await response.json();
window.location.href = url;
```

### Level 3: Webhooks (Automated Backend)

Best for: Automating access control, sending emails, updating databases after payment.

**Webhook endpoint (Node.js):**
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Grant access, send welcome email, update DB
      await handleNewCustomer(session);
      break;

    case 'invoice.paid':
      // Subscription renewed
      await handleRenewal(event.data.object);
      break;

    case 'customer.subscription.deleted':
      // Subscription cancelled
      await handleCancellation(event.data.object);
      break;

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
}
```

**Setting up webhooks:**
1. Stripe Dashboard > Developers > Webhooks
2. Add endpoint URL (your-domain.com/api/webhooks/stripe)
3. Select events to listen for
4. Copy signing secret to environment variables

### Level 4: Customer Portal

Let customers manage their own subscriptions:

```javascript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: 'https://yoursite.com/dashboard',
});
// Redirect to portalSession.url
```

## Security Rules

### Keys
- **Publishable key** (pk_live_xxx): Safe for client-side, used in Stripe.js
- **Secret key** (sk_live_xxx): SERVER ONLY, never in client code
- **Webhook signing secret** (whsec_xxx): SERVER ONLY

### Environment Variables
```bash
# .env.local (git-ignored!)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_GROWTH=price_xxxxx
STRIPE_PRICE_SPRINT=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

### Checklist
- [ ] Secret key in .env only, never committed
- [ ] .env.local in .gitignore
- [ ] Webhook signatures verified
- [ ] HTTPS on all Stripe-related pages
- [ ] Test mode used during development
- [ ] idempotency keys for retryable operations
- [ ] Error handling on all Stripe API calls

## Testing

### Test Mode
- Use test API keys (sk_test_xxx, pk_test_xxx)
- Test card: 4242 4242 4242 4242, any future date, any CVC
- Decline card: 4000 0000 0000 0002
- Test webhook events: `stripe trigger checkout.session.completed`

### Going Live
1. Switch to live keys
2. Verify webhook endpoint with live signing secret
3. Test with a real card (small amount, refund immediately)
4. Verify payment appears in Stripe dashboard
5. Confirm customer notification emails

## Product Configuration

### Current Products (Live)
| Product | Price | Type | Stripe Price ID |
|---------|-------|------|----------------|
| Starter Sprint | $600 | One-time | (check dashboard) |
| Growth Retainer | $2,000/mo | Subscription | (check dashboard) |
| Automation Sprint | $7,500 | One-time | (check dashboard) |
| Enterprise | $5,000/mo | Subscription | (check dashboard) |

### AutoPilot SaaS (Planned)
| Tier | Price | Type |
|------|-------|------|
| Free | $0 | Free |
| Pro | $49/mo | Subscription |
| Business | $149/mo | Subscription |

## Payment Methods Enabled
- Card (Visa, Mastercard, Amex)
- Apple Pay
- Klarna
- Link
- Affirm
- Cash App Pay
- Amazon Pay
