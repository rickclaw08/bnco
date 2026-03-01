# Security Review

**Version:** 0.1.0
**Owner:** Shield (CRO/Risk Officer)
**Description:** Review technical security of websites, applications, and infrastructure. Covers OWASP top 10, security headers, input validation, API key exposure, dependency vulnerabilities, and hardening recommendations.

## Trigger Keywords

- "security audit"
- "is this secure"
- "vulnerability check"
- "harden security"
- "security review"
- "pen test"
- "security scan"
- "check for vulnerabilities"

## Overview

This skill provides a structured approach to reviewing the security posture of web applications, APIs, and infrastructure. It is not a replacement for professional penetration testing, but it covers the most common and impactful vulnerability categories that can be assessed through code review, configuration analysis, and automated scanning.

## Workflow

### Step 1: Define Scope

Determine what is being reviewed:

| Target Type | What to Review | Key References |
|-------------|---------------|----------------|
| Website | Headers, CSP, cookies, forms, HTTPS | `references/security-headers.md` |
| Web Application | OWASP top 10, auth, input handling | `references/owasp-checklist.md` |
| API | Authentication, rate limiting, input validation | `references/owasp-checklist.md` |
| Infrastructure | Server config, ports, access controls | `references/vulnerability-patterns.md` |
| Codebase | Dependencies, secrets, injection points | `references/vulnerability-patterns.md` |

Gather:
- [ ] URL(s) or repository location
- [ ] Technology stack (framework, language, hosting)
- [ ] Authentication method (if applicable)
- [ ] Known sensitive data handled
- [ ] Previous security reviews (if any)

### Step 2: Security Headers Check

Inspect HTTP response headers for security best practices:

#### Required Headers

| Header | Expected Value | Risk if Missing |
|--------|---------------|-----------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Downgrade attacks, MITM |
| `Content-Security-Policy` | Restrictive policy (see below) | XSS, code injection |
| `X-Content-Type-Options` | `nosniff` | MIME-type confusion attacks |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` or stricter | Information leakage |
| `Permissions-Policy` | Restrict camera, microphone, geolocation | Feature abuse |

#### CSP Review

Content Security Policy should:
- [ ] Not use `unsafe-inline` for scripts (HIGH risk)
- [ ] Not use `unsafe-eval` (HIGH risk)
- [ ] Not use wildcard `*` sources (MEDIUM risk)
- [ ] Specify `default-src` as restrictive baseline
- [ ] Use `report-uri` or `report-to` for violation monitoring
- [ ] Allow only necessary domains for scripts, styles, images

**How to check:** Use browser dev tools (Network tab), `curl -I <url>`, or online tools like securityheaders.com.

See `references/security-headers.md` for detailed header configurations.

### Step 3: OWASP Top 10 Review

Check for the most critical web application security risks:

#### A01: Broken Access Control
- [ ] Authentication required for protected resources
- [ ] Authorization checked on every request (not just UI)
- [ ] Direct object references are validated (IDOR)
- [ ] CORS configuration is restrictive
- [ ] Directory listing disabled
- [ ] Rate limiting on sensitive endpoints

#### A02: Cryptographic Failures
- [ ] HTTPS enforced everywhere (no mixed content)
- [ ] TLS 1.2+ only (no SSLv3, TLS 1.0, TLS 1.1)
- [ ] Passwords hashed with bcrypt/scrypt/argon2 (not MD5/SHA1)
- [ ] Sensitive data not in URLs or logs
- [ ] Encryption keys not hardcoded
- [ ] Certificates valid and not expiring soon

#### A03: Injection
- [ ] SQL queries use parameterized statements (no string concatenation)
- [ ] User input sanitized before use in commands
- [ ] Template engines use auto-escaping
- [ ] NoSQL injection patterns checked
- [ ] OS command injection prevented
- [ ] LDAP injection prevented (if applicable)

#### A04: Insecure Design
- [ ] Security requirements defined in design phase
- [ ] Threat modeling performed
- [ ] Business logic validated server-side
- [ ] Error handling does not reveal system details

#### A05: Security Misconfiguration
- [ ] Default credentials changed
- [ ] Unnecessary features/services disabled
- [ ] Error messages are generic (no stack traces in production)
- [ ] Directory listing disabled
- [ ] Debug mode off in production
- [ ] Server version headers suppressed

#### A06: Vulnerable and Outdated Components
- [ ] All dependencies are current (check for known CVEs)
- [ ] No dependencies with critical vulnerabilities
- [ ] Package lock file in use
- [ ] Automated dependency scanning configured
- [ ] Unused dependencies removed

**How to check:**
- `npm audit` / `yarn audit` (Node.js)
- `pip audit` / `safety check` (Python)
- `bundle audit` (Ruby)
- Snyk, Dependabot, or similar automated tools

#### A07: Identification and Authentication Failures
- [ ] Strong password policy enforced
- [ ] Multi-factor authentication available
- [ ] Session tokens are random and long
- [ ] Sessions expire after inactivity
- [ ] Brute force protection (account lockout or rate limiting)
- [ ] Password reset flow is secure (no enumeration)
- [ ] Credentials not sent in URL parameters

#### A08: Software and Data Integrity Failures
- [ ] CI/CD pipeline has integrity checks
- [ ] Dependencies verified (checksums, signatures)
- [ ] No untrusted deserialization
- [ ] Code review required for changes
- [ ] Subresource Integrity (SRI) for CDN scripts

#### A09: Security Logging and Monitoring Failures
- [ ] Authentication events logged (success and failure)
- [ ] Access control failures logged
- [ ] Logs do not contain sensitive data
- [ ] Log monitoring/alerting in place
- [ ] Logs stored securely and tamper-resistant

#### A10: Server-Side Request Forgery (SSRF)
- [ ] User-supplied URLs validated and restricted
- [ ] Internal network access blocked from user inputs
- [ ] URL schemas restricted (no file://, gopher://, etc.)
- [ ] Response content not directly returned to users

See `references/owasp-checklist.md` for the full checklist with remediation guidance.

### Step 4: API Key and Secrets Scan

Check for exposed secrets in:

- [ ] Source code (grep for API keys, tokens, passwords)
- [ ] Configuration files (especially committed to git)
- [ ] Environment variables (are they properly secured)
- [ ] Client-side JavaScript (view source, network requests)
- [ ] Git history (secrets committed then "deleted")
- [ ] Public repositories
- [ ] Error messages and logs

**Common patterns to search for:**
```
- API_KEY, api_key, apiKey
- SECRET, secret, SECRET_KEY
- PASSWORD, password, passwd
- TOKEN, token, access_token
- Private keys (BEGIN RSA PRIVATE KEY, BEGIN EC PRIVATE KEY)
- AWS keys (AKIA...)
- Database connection strings
```

**Tools:** truffleHog, git-secrets, gitleaks, or manual grep.

### Step 5: Input Validation Audit

For every user input point:

- [ ] Input is validated on the server side (not just client)
- [ ] Input length is limited
- [ ] Input type is enforced (numbers, emails, dates, etc.)
- [ ] Special characters are escaped or rejected
- [ ] File uploads validate type, size, and content
- [ ] File uploads stored outside web root
- [ ] Redirects validate destination URLs

### Step 6: Dependency Check

Review third-party dependencies:

1. **List all dependencies** (direct and transitive)
2. **Check for known vulnerabilities** (CVE databases, npm audit, etc.)
3. **Assess each vulnerable dependency:**
   - Is the vulnerable code path actually used?
   - Is there a patched version available?
   - What is the severity?
4. **Check for abandoned packages** (no updates in 2+ years)
5. **Check for suspicious packages** (typosquatting, few downloads)

### Step 7: Scoring and Prioritization

Rate each finding:

| Severity | Description | Action |
|----------|-------------|--------|
| CRITICAL | Actively exploitable, data exposure likely | Fix immediately |
| HIGH | Exploitable with moderate effort | Fix within 48 hours |
| MEDIUM | Exploitable under specific conditions | Fix within 2 weeks |
| LOW | Minor issue, defense in depth | Fix when convenient |
| INFO | Best practice recommendation | Consider implementing |

## Output Format

```
## Security Review Report
- Target: [URL / repository / system name]
- Date: [review date]
- Reviewer: Shield (Risk Officer)
- Overall Rating: [CRITICAL / HIGH / MEDIUM / LOW / PASS]

## Executive Summary
[2-3 sentence overview of security posture]

## Findings Summary
| # | Category | Finding | Severity | Status |
|---|----------|---------|----------|--------|
| 1 | [cat]    | [finding] | [severity] | [OPEN/FIXED] |

## Detailed Findings

### Finding #[n]: [title]
- **Category:** [OWASP category or other]
- **Severity:** [CRITICAL/HIGH/MEDIUM/LOW/INFO]
- **Description:** [what was found]
- **Evidence:** [how it was discovered]
- **Impact:** [what could happen if exploited]
- **Remediation:** [how to fix it]
- **References:** [relevant links or documentation]

## Positive Findings
- [Things that are done well, good security practices observed]

## Recommendations
1. [Prioritized list of actions]

## Disclaimer
This review is not a substitute for professional penetration testing.
It covers common vulnerability categories and configurations but
may not identify all security issues.
```

## Reference Files

| File | Purpose |
|------|---------|
| `references/owasp-checklist.md` | Full OWASP Top 10 checklist with remediation steps |
| `references/security-headers.md` | Detailed security header configurations and examples |
| `references/vulnerability-patterns.md` | Common vulnerability patterns and detection methods |

## Notes

- Security is a spectrum, not a binary. The goal is to reduce risk to an acceptable level, not achieve perfection.
- Always document positive findings too. Knowing what is done well helps maintain those practices.
- If you find a CRITICAL issue, flag it immediately. Do not wait for the full report.
- Re-test after fixes are applied to confirm remediation.
- This skill is for assessment, not exploitation. Never attempt to actually exploit vulnerabilities on systems you do not own or have explicit permission to test.
- Recommend professional penetration testing for high-value or high-risk systems.
