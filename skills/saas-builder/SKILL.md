# SaaS Builder

- **Name:** saas-builder
- **Version:** 0.1.0
- **Description:** Build and ship SaaS products (AutoPilot and future products). Covers architecture, Stripe integration, deployment, and iteration.
- **Owner:** Ethan (CTO)

## Trigger Keywords

- "build product"
- "new feature"
- "ship SaaS"
- "landing page"
- "build AutoPilot"
- "add subscription"
- "payment integration"

## Prerequisites

- GitHub access for code repos
- Stripe account (ClawOps, contact@aurolly.com)
- GitHub Pages for static deployments
- Node.js / npm available on host
- Understanding of our tech stack (see references/tech-stack.md)

## Workflow

### 1. Define the Product

1. What problem does this solve?
2. Who is the target user?
3. What are the core features (MVP)?
4. What's the pricing model?
5. What's the tech stack? (see references/tech-stack.md)

Document in a product brief before building.

### 2. Choose Architecture

**Static Site (GitHub Pages)**
Best for: Landing pages, marketing sites, simple tools
- Pure HTML/CSS/JS
- No server needed
- Free hosting via GitHub Pages
- Use for: AutoPilot landing page, ROI calculator, blog

**Next.js (Static Export)**
Best for: More complex apps with routing and components
- `next export` for static deployment
- React components for interactivity
- Can deploy to GitHub Pages, Vercel, or Netlify

**Full-Stack (Next.js + API Routes)**
Best for: Apps needing server-side logic
- API routes for backend
- Database integration (SQLite, Postgres)
- Deploy to Vercel or self-host
- Use for: AutoPilot app with user accounts

Decision tree:
- No backend needed? -> Static Site
- Complex UI, no backend? -> Next.js Static Export
- Need auth, database, API? -> Full-Stack Next.js

### 3. Project Setup

```bash
# Static site
mkdir -p project-name
cd project-name
# Create index.html, styles.css, script.js

# Next.js
npx create-next-app@latest project-name
cd project-name
```

Directory structure:
```
project-name/
  src/
    pages/       # Routes (Next.js) or HTML files
    components/  # Reusable UI components
    styles/      # CSS/Tailwind
    lib/         # Utilities, API clients
    api/         # API routes (Next.js)
  public/        # Static assets
  .env.local     # Secrets (git-ignored)
  package.json
  README.md
```

### 4. Build Core Features

1. Start with the simplest version that works
2. Build in this order:
   - Landing page / marketing (drives signups)
   - Core value feature (what users pay for)
   - User authentication (if needed)
   - Payment integration (Stripe)
   - Dashboard / user portal

3. Apply security checklist at each step (see website-deploy skill)
4. No em dashes in any content or code comments

### 5. Stripe Integration

See references/stripe-integration-guide.md for detailed patterns.

**Payment Links (Simplest)**
- Create products in Stripe dashboard
- Embed payment links on landing page
- No code needed for basic payments
- Best for: initial launch, simple products

**Checkout Sessions (More Control)**
```javascript
// Server-side (API route)
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_xxxxx',
    quantity: 1,
  }],
  mode: 'subscription', // or 'payment' for one-time
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
});
```

**Webhooks (For Automation)**
- Listen for: checkout.session.completed, invoice.paid, customer.subscription.deleted
- Verify webhook signature
- Update user access based on payment status

**Rules:**
- Publishable key only on client side
- Secret key in environment variables only
- Always verify webhook signatures
- Test in Stripe test mode first

### 6. User Authentication (When Needed)

Options (simplest to most complex):
1. **No auth** - Public tool, payment link only
2. **Magic link** - Email-based, no passwords (recommended for MVP)
3. **OAuth** - Google/GitHub login (low friction)
4. **Email + Password** - Traditional (more work, more support)

For MVP: start with no auth or magic link. Add more later.

### 7. Testing

Before shipping:
- [ ] All pages load without errors
- [ ] Forms submit correctly
- [ ] Payment flow works (test mode)
- [ ] Mobile responsive
- [ ] Security checklist passed
- [ ] No em dashes anywhere
- [ ] Error states handled
- [ ] Loading states shown

### 8. Deploy

**GitHub Pages (Static)**
```bash
git add -A
git commit -m "add: [product] v1 launch"
git push origin main
```

**Vercel (Next.js)**
```bash
vercel --prod
```

### 9. Post-Launch

1. Verify live site works
2. Test payment flow with a real card (small amount, refund)
3. Set up monitoring (check site daily)
4. Collect user feedback
5. Plan next iteration

## Current Products

### AutoPilot
- Landing page: theclawops.com/autopilot/
- Tiers: Free / $49 Pro / $149 Business
- Status: Landing page in development
- Stack: TBD (likely static landing + Next.js app)

## Reference Files

- `references/tech-stack.md` - Approved tech stack and tooling
- `references/stripe-integration-guide.md` - Stripe patterns and examples
