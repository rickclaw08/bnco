# Tech Stack

Approved technologies and tools for ClawOps products.

## Frontend

### Static Sites (Default for Marketing/Landing)
- **HTML5** - Semantic, accessible
- **CSS3** - Custom properties, flexbox, grid, mobile-first
- **Vanilla JS** - For simple interactivity
- **No frameworks** unless complexity demands it

### Application Frontend
- **Next.js 14+** - React framework, SSR/SSG/ISR
- **React 18+** - UI components
- **Tailwind CSS** - Utility-first styling (optional, plain CSS also fine)
- **TypeScript** - Preferred over plain JS for apps

## Backend

### API Layer
- **Next.js API Routes** - For apps deployed on Vercel
- **Node.js + Express** - For standalone APIs
- **Python + FastAPI** - For AI/ML-heavy backends

### Database
- **SQLite** - For local/simple apps (Mission Control dashboard uses this)
- **PostgreSQL** - For production apps needing relational data
- **Supabase** - Managed Postgres with auth (good for MVPs)

### Authentication
- **Next-Auth** - For Next.js apps
- **Supabase Auth** - If using Supabase
- **Custom JWT** - Only if other options don't fit

## Payments

- **Stripe** - Only payment processor
  - Payment Links for simple flows
  - Checkout Sessions for custom flows
  - Webhooks for automation
  - Account: ClawOps (contact@aurolly.com)

## Hosting and Deployment

### Static Sites
- **GitHub Pages** - Free, reliable, auto-deploy from main branch
  - Repo: rickclaw08/claw-systems
  - Domain: theclawops.com

### Applications
- **Vercel** - Next.js native hosting, free tier available
- **Railway** - For backend services
- **Fly.io** - For containerized apps

### DNS
- Domain: theclawops.com
- GitHub Pages handles HTTPS automatically

## DevOps

### Version Control
- **Git** - Always
- **GitHub** - All repos under rickclaw08 or claw-agency org
- Branch strategy: main is production, feature branches for development

### CI/CD
- GitHub Pages: push to main = auto-deploy
- Vercel: push to main = auto-deploy
- No manual deployment steps

## AI/ML

- **OpenAI API** - GPT-4 for product features
- **Anthropic API** - Claude for internal tooling
- **GitHub Copilot** - Code assistance
- Note: All API calls through server-side, never expose keys client-side

## Development Tools

- **Node.js 22+** - Runtime
- **npm** - Package manager
- **ESLint** - Linting
- **Prettier** - Formatting

## What We Don't Use

- jQuery (use vanilla JS or React)
- PHP (use Node.js or Python)
- WordPress (use static sites or Next.js)
- Firebase (use Supabase or custom)
- AWS (too complex for current scale, use Vercel/Railway)

## Decision Guide

| Need | Use |
|------|-----|
| Simple landing page | Static HTML + GitHub Pages |
| Marketing site with blog | Static HTML or Next.js SSG + GitHub Pages |
| Interactive tool (calculator, form) | Static HTML + vanilla JS |
| SaaS product (MVP) | Next.js + Supabase + Vercel |
| SaaS product (scaling) | Next.js + PostgreSQL + Vercel |
| API/microservice | Node.js + Express or Python + FastAPI |
| Payments | Stripe (always) |
