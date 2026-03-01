# Coding Standards

ClawOps coding standards for all technical work. Every agent producing code must follow these.

## Universal Rules

### No Em Dashes
- Never use the em dash character (U+2014)
- Use hyphens (-), commas, or rewrite the sentence
- This applies to ALL content: code, comments, docs, strings, everything
- Quick check: `grep -rn "\xe2\x80\x94" .`

### File Organization
- One clear purpose per file
- Related files grouped in directories
- README or SKILL.md at the top of each project/skill
- No orphan files (everything should be referenced or linked)

### Comments
- Comment WHY, not WHAT (code shows what, comments explain why)
- No commented-out code blocks in production
- TODO comments include context: `// TODO(ethan): fix rate limiter after Stripe webhook integration`
- Remove stale TODOs regularly

### No Dead Code
- Remove unused functions, variables, imports
- No "just in case" code
- If you might need it later, git history has it

## HTML Standards

### Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="...">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>Page Title | ClawOps</title>
</head>
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</body>
</html>
```

### Rules
- Semantic elements: header, nav, main, section, article, aside, footer
- All images have descriptive `alt` text
- All form inputs have associated `<label>` elements
- Use `<button>` for actions, `<a>` for navigation
- Valid HTML (check with validator if unsure)
- IDs are unique per page
- No inline styles (use CSS classes)
- No inline event handlers (use addEventListener)

### Forms
```html
<form action="https://formsubmit.co/..." method="POST">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" required
    minlength="2" maxlength="100"
    autocomplete="name">

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required
    maxlength="254"
    autocomplete="email">

  <!-- Honeypot -->
  <div style="position:absolute;left:-9999px;" aria-hidden="true">
    <input type="text" name="website" tabindex="-1" autocomplete="off"
      onpaste="return false" oninput="this.value=''">
  </div>

  <button type="submit">Send</button>
</form>
```

## CSS Standards

### Organization
- Mobile-first approach (min-width media queries)
- Group related properties together
- Use CSS custom properties (variables) for theme values
- One component per section, separated by comments

### Naming
- Use descriptive class names: `.hero-section`, `.pricing-card`, `.nav-link`
- BEM convention acceptable: `.card__title`, `.card--featured`
- No single-letter class names
- No generic names like `.container1`, `.box2`

### Rules
- Avoid `!important` (fix specificity instead)
- No unused CSS (dead styles)
- Transitions on specific properties (not `all` for performance)
- Use rem/em for font sizes, px for borders/shadows
- Test at all breakpoints: 320px, 768px, 1024px, 1440px

## JavaScript Standards

### General
```javascript
// Use const by default, let when needed, never var
const API_URL = 'https://api.example.com';
let count = 0;

// Strict equality always
if (value === 'expected') { ... }

// Template literals over concatenation
const msg = `Hello ${name}, you have ${count} items`;

// Arrow functions for callbacks
items.map(item => item.name);

// Async/await over .then() chains
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
}
```

### Error Handling
- Always catch async errors (try/catch or .catch())
- Provide meaningful error messages
- Never swallow errors silently
- In production: no console.log (use proper logging)

### DOM Manipulation
- Use `textContent` not `innerHTML` for user data (XSS prevention)
- Cache DOM queries: `const el = document.getElementById('x');`
- Clean up event listeners when elements are removed
- Use event delegation where possible

### Security
- Never use `eval()` with any data
- Validate all input before processing
- Sanitize data before inserting into DOM
- Use `encodeURIComponent()` for URL parameters

## Git Standards

### Commit Messages
Format: `type: brief description`

Types:
- `add:` - New feature or file
- `fix:` - Bug fix
- `update:` - Change to existing feature
- `security:` - Security improvement
- `docs:` - Documentation only
- `refactor:` - Code restructure, no behavior change
- `style:` - Formatting, no logic change
- `test:` - Adding/fixing tests

Examples:
- `add: AutoPilot pricing page with Stripe integration`
- `fix: form validation bypass on contact page`
- `security: add CSP headers to all pages`

### Rules
- One logical change per commit
- No "WIP" or "misc" commits on main branch
- Never commit secrets (check with `git diff --staged`)
- Pull before push
- Resolve conflicts carefully (test after merge)

## Code Review Triggers

Code MUST be reviewed (by Ethan or Rick) before pushing when:
- It touches authentication or authorization
- It handles user input or form data
- It includes external dependencies
- It modifies payment/financial flows
- It changes security headers or CSP
- It's a new page or major feature

Code can be pushed without review when:
- Typo fixes in content
- README/documentation updates
- CSS-only style tweaks (no logic)
- Adding alt text to images
