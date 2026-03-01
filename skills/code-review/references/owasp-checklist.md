# OWASP Top 10 Checklist

Security review checklist based on the OWASP Top 10 (2021). Check every applicable item during code review.

## A01: Broken Access Control

- [ ] Server-side access control enforced (not just client-side hiding)
- [ ] Default deny: block unless explicitly allowed
- [ ] Users cannot access other users' data by modifying IDs in URLs
- [ ] CORS policy is restrictive (not wildcard *)
- [ ] Directory listing disabled
- [ ] Rate limiting on sensitive endpoints
- [ ] JWT tokens validated properly (signature, expiration, issuer)
- [ ] API endpoints require authentication

## A02: Cryptographic Failures

- [ ] Sensitive data encrypted in transit (HTTPS/TLS)
- [ ] Sensitive data encrypted at rest when stored
- [ ] Strong algorithms used (AES-256, RSA-2048+, SHA-256+)
- [ ] No MD5 or SHA-1 for security purposes
- [ ] Passwords hashed with bcrypt, scrypt, or argon2 (with salt)
- [ ] No sensitive data in URLs or query parameters
- [ ] Proper key management (no hardcoded keys)
- [ ] Old/weak ciphers disabled

## A03: Injection

- [ ] Parameterized queries for all database access
- [ ] No string concatenation for SQL/NoSQL/LDAP queries
- [ ] ORM used where possible
- [ ] User input validated on server side
- [ ] Shell commands use safe APIs (no shell=True with user input)
- [ ] LDAP, XPath, OS command injection prevented
- [ ] Input length limited

## A04: Insecure Design

- [ ] Threat modeling performed for new features
- [ ] Business logic validated (e.g., can't order negative quantities)
- [ ] Rate limiting on resource-intensive operations
- [ ] Fail securely (errors don't grant extra access)
- [ ] Principle of least privilege applied

## A05: Security Misconfiguration

- [ ] Default credentials changed/removed
- [ ] Unnecessary features/ports/services disabled
- [ ] Error handling doesn't expose stack traces
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Cloud storage permissions correct (no public S3 buckets)
- [ ] Latest security patches applied
- [ ] Debug mode OFF in production
- [ ] XML external entity (XXE) processing disabled

## A06: Vulnerable and Outdated Components

- [ ] All dependencies up to date
- [ ] No known vulnerabilities in dependencies (npm audit, pip audit)
- [ ] Components from trusted sources only
- [ ] Unused dependencies removed
- [ ] SRI (Subresource Integrity) on CDN resources
- [ ] License compliance checked

## A07: Identification and Authentication Failures

- [ ] Multi-factor authentication available for admin/sensitive accounts
- [ ] No default/weak/well-known passwords
- [ ] Password policy enforced (12+ chars, complexity)
- [ ] Brute force protection (rate limiting, lockout)
- [ ] Session IDs rotated after login
- [ ] Sessions expire after inactivity
- [ ] Credential recovery is secure
- [ ] Registration prevents automated bulk creation

## A08: Software and Data Integrity Failures

- [ ] Dependencies verified (checksums, signatures)
- [ ] CI/CD pipeline secured (no unauthorized modifications)
- [ ] Serialization of untrusted data avoided
- [ ] Code signing where applicable
- [ ] Integrity checks on critical data

## A09: Security Logging and Monitoring Failures

- [ ] Login attempts logged (success and failure)
- [ ] Access control failures logged
- [ ] Input validation failures logged
- [ ] Logs don't contain sensitive data (passwords, tokens, PII)
- [ ] Logs are tamper-resistant
- [ ] Alerting on suspicious patterns
- [ ] Log format is consistent and parseable

## A10: Server-Side Request Forgery (SSRF)

- [ ] URL input validated and sanitized
- [ ] Allowlist for permitted domains/IPs
- [ ] Internal network access restricted from user-supplied URLs
- [ ] Response content validated before use
- [ ] DNS rebinding protections

## Quick Grep Commands

```bash
# Find hardcoded secrets
grep -rn "api_key\|secret\|password\|token\|apikey" --include="*.js" --include="*.html" --include="*.py"

# Find eval usage
grep -rn "eval(" --include="*.js" --include="*.py"

# Find innerHTML usage
grep -rn "innerHTML" --include="*.js" --include="*.html"

# Find SQL string concatenation
grep -rn "SELECT.*+\|INSERT.*+\|UPDATE.*+\|DELETE.*+" --include="*.js" --include="*.py"

# Find em dashes
grep -rn "\xe2\x80\x94" .

# Find console.log in JS
grep -rn "console.log" --include="*.js"

# Find TODO/FIXME/HACK
grep -rn "TODO\|FIXME\|HACK\|XXX" .
```
