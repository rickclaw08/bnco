# Website Deploy

- **Name:** website-deploy
- **Version:** 0.1.0
- **Description:** Build, update, and deploy pages to theclawops.com via GitHub Pages. Includes security checklist, git workflow, and deployment verification.
- **Owner:** Ethan (CTO)

## Trigger Keywords

- "update website"
- "add page"
- "fix site"
- "deploy"
- "push to github"
- "website change"

## Prerequisites

- Git configured with push access to github.com/rickclaw08/claw-systems
- Repository cloned at: /Users/agentclaw/.openclaw/workspace/claw-agency/website/
  (or wherever the site repo lives locally)
- GitHub Pages configured to serve from the repo
- Live site: https://theclawops.com (rickclaw08.github.io/claw-systems/)

## Workflow

### 1. Understand the Change

1. What page(s) need to be created/modified?
2. Is this a new page, edit, or fix?
3. Does it involve new routes/navigation changes?
4. Does it touch forms, scripts, or external resources?

### 2. Check Current State

```bash
cd /Users/agentclaw/.openclaw/workspace/claw-agency/website/
git status
git pull origin main
```

Verify:
- Clean working tree (no uncommitted changes)
- Up to date with remote
- No merge conflicts

### 3. Make Changes

For new pages:
1. Create the HTML/MD file in the correct directory
2. Follow the existing theme (see references/theme-guide.md)
3. Add navigation links if needed (update nav in all pages)
4. Ensure mobile responsiveness

For edits:
1. Locate the file to edit
2. Make targeted changes
3. Do NOT break existing functionality

For fixes:
1. Identify the issue (broken link, styling, functionality)
2. Fix it
3. Verify the fix does not create new issues

### 4. Apply Security Checklist

**MANDATORY before every deploy.** Run through the full checklist:

- [ ] **CSP headers** - meta tag or header with proper directives
  - script-src restricted (no unsafe-inline unless absolutely required)
  - style-src restricted
  - connect-src limited to known domains
  - frame-src restricted
  - object-src 'none'
  - form-action restricted

- [ ] **Security headers** (via meta tags for GitHub Pages)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin

- [ ] **Input validation** on any forms
  - minlength/maxlength attributes
  - pattern attributes where appropriate
  - required fields marked
  - type attributes correct (email, tel, url, etc.)

- [ ] **Form security**
  - Honeypot field present (hidden, with paste/input blocking)
  - No sensitive data in query strings
  - Form action points to correct endpoint

- [ ] **No hardcoded secrets**
  - No API keys in HTML/JS
  - No passwords or tokens
  - External service keys via server-side only

- [ ] **External resources**
  - All external scripts/styles use SRI (integrity attribute)
  - CDN resources pinned to specific versions
  - No unnecessary third-party scripts

- [ ] **Content**
  - No em dashes (search for U+2014)
  - Links work (no 404s)
  - Images have alt text
  - Proper semantic HTML

Full checklist: references/security-standard.md

### 5. Test Locally (if possible)

```bash
# Simple HTTP server for static sites
cd /path/to/site
python3 -m http.server 8000
```

Check:
- Page renders correctly
- Links work
- Forms submit properly
- Mobile responsive (resize browser)
- No console errors

### 6. Commit and Push

```bash
cd /Users/agentclaw/.openclaw/workspace/claw-agency/website/
git add -A
git status  # Review what's being committed
git commit -m "descriptive commit message"
git push origin main
```

Commit message format:
- `add: new [page-name] page`
- `fix: [what was broken]`
- `update: [what changed] on [page]`
- `security: [what was hardened]`

### 7. Verify Deployment

1. Wait 1-2 minutes for GitHub Pages to build
2. Visit https://theclawops.com/[new-page]/ in browser
3. Verify:
   - Page loads correctly
   - No 404 errors
   - Styling matches expectations
   - Forms work
   - All links functional
4. Report deployment status

### 8. Update Site Map

If a new page was added, update:
- Navigation menus across all pages
- Any sitemap.xml if it exists
- references/site-structure.md

## Current Site Structure

See references/site-structure.md for the full map.

## Design Standards

See references/theme-guide.md for colors, fonts, and layout patterns.

## Reference Files

- `references/security-standard.md` - Complete security checklist (non-negotiable)
- `references/site-structure.md` - Current site map and page inventory
- `references/theme-guide.md` - Design system, colors, components
