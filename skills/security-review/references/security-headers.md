# Security Headers Reference

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Detailed security header configurations and examples for web applications.

---

## Essential Security Headers

### 1. Strict-Transport-Security (HSTS)

**Purpose:** Forces browsers to use HTTPS for all future requests to the domain.

**Recommended value:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Parameters:**
- `max-age=31536000` -- Enforce HTTPS for 1 year (in seconds)
- `includeSubDomains` -- Apply to all subdomains
- `preload` -- Submit to browser preload list (cannot be easily undone)

**Caution:**
- Ensure HTTPS works perfectly before enabling, especially with `includeSubDomains`
- Start with a shorter `max-age` (e.g., 3600) for testing
- `preload` is a strong commitment; do not use unless you are certain

**Risk if missing:** Attackers can intercept traffic via HTTPS downgrade attacks.

---

### 2. Content-Security-Policy (CSP)

**Purpose:** Controls which resources the browser is allowed to load, preventing XSS and data injection.

**Recommended starter policy:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**Key directives:**

| Directive | Purpose | Recommended |
|-----------|---------|-------------|
| `default-src` | Fallback for all resource types | `'self'` |
| `script-src` | JavaScript sources | `'self'` (never `'unsafe-inline'` or `'unsafe-eval'`) |
| `style-src` | CSS sources | `'self'` (minimize `'unsafe-inline'`) |
| `img-src` | Image sources | `'self' data: https:` |
| `font-src` | Font sources | `'self'` |
| `connect-src` | AJAX, WebSocket, fetch | `'self'` |
| `frame-ancestors` | Who can embed this page | `'none'` (replaces X-Frame-Options) |
| `base-uri` | Base URL for relative URLs | `'self'` |
| `form-action` | Valid form submission targets | `'self'` |
| `object-src` | Plugin resources (Flash, Java) | `'none'` |
| `media-src` | Audio/video sources | `'self'` |

**Dangerous values to avoid:**

| Value | Risk | Alternative |
|-------|------|-------------|
| `'unsafe-inline'` for scripts | Allows inline scripts, defeats XSS protection | Use nonces or hashes |
| `'unsafe-eval'` | Allows eval(), Function(), etc. | Refactor code to avoid eval |
| `*` wildcard | Allows any source | Specify exact domains |
| `data:` for scripts | Allows data: URI scripts | Remove if possible |

**CSP with nonces (recommended for inline scripts):**
```
Content-Security-Policy: script-src 'nonce-{random}' 'strict-dynamic'
```
Generate a new random nonce for each response.

**Report-only mode (for testing):**
```
Content-Security-Policy-Report-Only: [policy]; report-uri /csp-report
```

**Risk if missing:** XSS attacks, code injection, data exfiltration.

---

### 3. X-Content-Type-Options

**Purpose:** Prevents browsers from MIME-sniffing a response away from the declared content-type.

**Required value:**
```
X-Content-Type-Options: nosniff
```

No configuration needed. Just add it.

**Risk if missing:** Attackers can trick the browser into treating data as executable code.

---

### 4. X-Frame-Options

**Purpose:** Prevents the page from being embedded in iframes (clickjacking protection).

**Recommended value:**
```
X-Frame-Options: DENY
```

**Options:**
- `DENY` -- Never allow framing (most secure)
- `SAMEORIGIN` -- Allow framing only by same origin
- `ALLOW-FROM uri` -- Allow framing only by specified URI (deprecated, not widely supported)

**Note:** CSP `frame-ancestors` is the modern replacement. Use both for backward compatibility.

**Risk if missing:** Clickjacking attacks where users interact with hidden UI elements.

---

### 5. Referrer-Policy

**Purpose:** Controls how much referrer information is sent with requests.

**Recommended value:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Options (from most to least restrictive):**
- `no-referrer` -- Never send referrer
- `no-referrer-when-downgrade` -- No referrer on HTTPS to HTTP
- `same-origin` -- Referrer only for same-origin requests
- `origin` -- Send only the origin (not the full path)
- `strict-origin` -- Origin only, no referrer on downgrade
- `strict-origin-when-cross-origin` -- Full URL for same-origin, origin only for cross-origin (recommended)
- `origin-when-cross-origin` -- Full URL for same-origin, origin for cross-origin
- `unsafe-url` -- Always send full URL (avoid this)

**Risk if missing:** Sensitive URL paths or query parameters leaked to third parties.

---

### 6. Permissions-Policy (formerly Feature-Policy)

**Purpose:** Controls which browser features the page can use.

**Recommended value:**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

**Common features to restrict:**

| Feature | Default | Recommendation |
|---------|---------|----------------|
| `camera` | Allow | Deny unless needed: `camera=()` |
| `microphone` | Allow | Deny unless needed: `microphone=()` |
| `geolocation` | Allow | Deny unless needed: `geolocation=()` |
| `payment` | Allow | Deny unless needed: `payment=()` |
| `usb` | Allow | Deny: `usb=()` |
| `fullscreen` | Allow | Usually safe to allow: `fullscreen=(self)` |
| `autoplay` | Varies | Restrict: `autoplay=(self)` |

**Risk if missing:** Third-party scripts or iframes can access device features.

---

### 7. X-XSS-Protection (Legacy)

**Purpose:** Enables the browser's built-in XSS filter (legacy, mostly for older browsers).

**Recommended value:**
```
X-XSS-Protection: 0
```

**Why 0?** Modern browsers have removed their XSS filters. Setting it to `1` can actually introduce vulnerabilities in some edge cases. Use CSP instead.

---

## Additional Recommended Headers

### Cache-Control (for sensitive pages)

```
Cache-Control: no-store, no-cache, must-revalidate, private
```

Use for pages with sensitive data (account pages, dashboards, etc.).

### Cross-Origin Headers

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

These provide isolation from cross-origin attacks. Required for some features (SharedArrayBuffer).

---

## Quick Check Commands

### Using curl
```bash
curl -I https://example.com
```

### Using an online tool
- https://securityheaders.com
- https://observatory.mozilla.org

### Expected output (ideal)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Implementation by Server/Framework

### Nginx
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### Apache
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
```

### Express.js (Node.js)
```javascript
// Use helmet middleware
const helmet = require('helmet');
app.use(helmet());
```

### Next.js
```javascript
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```
