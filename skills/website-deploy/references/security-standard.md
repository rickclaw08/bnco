# Security Standard

Complete security checklist for all web projects. Apply to EVERY website, app, and page before deployment. Non-negotiable.

Source: MEMORY.md permanent rules + OWASP best practices.

## 1. Content Security Policy (CSP)

### Required Directives
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' [trusted-cdn-domains];
  style-src 'self' 'unsafe-inline' [trusted-cdn-domains];
  img-src 'self' data: https:;
  font-src 'self' [trusted-font-domains];
  connect-src 'self' [api-domains];
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self' [form-endpoint-domains];
```

### Rules
- Never use `script-src 'unsafe-inline'` unless absolutely required (and document why)
- Never use `script-src 'unsafe-eval'`
- Whitelist only the specific CDN/API domains needed
- Use nonces for inline scripts when required: `script-src 'nonce-{random}'`
- For GitHub Pages: use `<meta http-equiv="Content-Security-Policy">` tag

## 2. Security Headers

### Required (via meta tags for static sites)
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### If Server-Configurable
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 3. Input Validation and Sanitization

### HTML Form Level
- `required` attribute on mandatory fields
- `type` attribute correct: email, tel, url, number, etc.
- `minlength` and `maxlength` on text inputs
- `pattern` attribute for specific formats (phone, zip, etc.)
- `min` and `max` for numeric inputs

### JavaScript Level
- Schema-based validation (validate structure, not just presence)
- Type checking (typeof, instanceof)
- Length limits enforced
- Reject unexpected fields
- Strip HTML tags from user input (prevent XSS)
- Encode output: HTML entities for display, URL encoding for URLs

### Server Level (when applicable)
- Re-validate everything client-side validated
- Parameterized queries (never concatenate SQL)
- Whitelist-based validation for selects/radios
- Rate limit submissions

## 4. Form Security

### Honeypot Fields
```html
<div style="position:absolute;left:-9999px;" aria-hidden="true">
  <input type="text" name="website" tabindex="-1" autocomplete="off"
    onpaste="return false" oninput="this.value=''">
</div>
```
- Hidden from users, visible to bots
- Block paste AND input events
- Use a tempting field name (website, url, phone2)
- Server-side: reject if honeypot has a value

### CAPTCHA
- Use reCAPTCHA v3 or hCaptcha on public forms
- Invisible preferred (no user friction)
- Verify server-side, never trust client-side only

### CSRF Protection
- Include CSRF token in all state-changing forms
- Validate token server-side
- For static sites with third-party form handlers: rely on the handler's built-in protection

## 5. API Key and Secret Handling

### Rules
- NEVER hardcode API keys in HTML, JS, or any client-side code
- Environment variables only for server-side keys
- No keys in git commits (use .gitignore, check history)
- Rotate keys regularly (quarterly minimum)
- Use least-privilege keys (read-only when possible)
- If a key is exposed, rotate immediately

### Client-Side Services
- Use publishable/public keys only (e.g., Stripe publishable key)
- Restrict key usage by domain in the service dashboard
- Never expose secret keys client-side under any circumstance

## 6. External Resources

### Subresource Integrity (SRI)
```html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-[hash]"
  crossorigin="anonymous"></script>
```
- Required for all external scripts and stylesheets
- Pin to specific versions (not @latest)
- Generate integrity hash: `shasum -b -a 384 file.js | awk '{print $1}' | xxd -r -p | base64`

### Third-Party Scripts
- Audit before including: what data do they collect?
- Minimize third-party dependencies
- Self-host when possible
- Add to CSP whitelist explicitly

## 7. HTTPS and Transport

- All links use HTTPS (no HTTP)
- Redirect HTTP to HTTPS (GitHub Pages does this automatically)
- No mixed content (HTTP resources on HTTPS page)
- HSTS header when possible

## 8. Error Handling

- No stack traces or debug info in production
- Generic error messages to users
- Log detailed errors server-side only
- Custom 404 page (no server info leakage)

## 9. Authentication (When Applicable)

- Passwords: bcrypt or argon2, minimum 12 characters
- Session tokens: cryptographically random, httponly, secure, samesite
- Rate limit login attempts (5 per minute per IP)
- Account lockout after 10 failed attempts
- No password in URL parameters

## 10. Pre-Deploy Checklist

Run before EVERY deploy:

- [ ] CSP meta tag present and restrictive
- [ ] Security headers present
- [ ] All forms have validation attributes
- [ ] Honeypot field on public forms
- [ ] No hardcoded secrets (grep for api_key, secret, password, token)
- [ ] External resources have SRI
- [ ] All links are HTTPS
- [ ] No em dashes in content
- [ ] No console.log statements in production JS
- [ ] Error pages configured
- [ ] Forms submit to correct endpoints
- [ ] Mobile responsive verified
