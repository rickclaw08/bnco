# OWASP Top 10 Checklist

**Version:** 0.1.0
**Last Updated:** 2026-02-21

Full checklist for the OWASP Top 10 (2021 edition) with remediation guidance. Use during security reviews.

---

## A01:2021 - Broken Access Control

**What:** Users can act outside their intended permissions.

### Checklist

- [ ] Authentication required for all protected resources
- [ ] Authorization checked server-side on every request (not just in the UI)
- [ ] Insecure Direct Object References (IDOR) tested -- can user A access user B's data by changing an ID?
- [ ] CORS policy is restrictive (no wildcard origins for authenticated endpoints)
- [ ] Directory listing disabled on web server
- [ ] Rate limiting applied to sensitive endpoints (login, password reset, API)
- [ ] JWT tokens validated properly (signature, expiration, issuer)
- [ ] Session tokens invalidated on logout
- [ ] Admin functions restricted to admin roles only
- [ ] API endpoints enforce the same access controls as the UI

### Remediation

- Deny by default -- require explicit access grants
- Implement role-based access control (RBAC) or attribute-based access control (ABAC)
- Use parameterized database queries for resource lookups
- Log and alert on access control failures
- Rate limit API and controller access to minimize automated attack impact
- Disable web server directory listing

---

## A02:2021 - Cryptographic Failures

**What:** Sensitive data exposed due to weak or missing encryption.

### Checklist

- [ ] HTTPS enforced on all pages (HTTP redirects to HTTPS)
- [ ] No mixed content (HTTP resources on HTTPS pages)
- [ ] TLS 1.2 or higher only (TLS 1.0, 1.1, SSL v3 disabled)
- [ ] Strong cipher suites configured
- [ ] Passwords hashed with bcrypt, scrypt, or Argon2 (not MD5, SHA1, SHA256 without salt)
- [ ] Sensitive data not stored in URL parameters
- [ ] Sensitive data not logged
- [ ] Database encryption at rest enabled
- [ ] Encryption keys stored securely (not in code, not in version control)
- [ ] TLS certificates valid and not nearing expiration
- [ ] HSTS header set with appropriate max-age

### Remediation

- Classify data by sensitivity level
- Apply encryption appropriate to classification
- Use well-tested cryptographic libraries (do not roll your own)
- Rotate encryption keys periodically
- Use TLS for all data in transit
- Store passwords only as salted hashes

---

## A03:2021 - Injection

**What:** Untrusted data sent to an interpreter as part of a command or query.

### Checklist

- [ ] SQL queries use parameterized statements / prepared statements
- [ ] No string concatenation in SQL queries
- [ ] ORM used where possible (with parameterized queries underneath)
- [ ] User input sanitized before OS command execution
- [ ] Template engines use auto-escaping by default
- [ ] NoSQL queries use parameterized patterns
- [ ] LDAP queries use proper escaping (if applicable)
- [ ] XML parsers configured to prevent XXE (external entity processing disabled)
- [ ] User input validated for expected type, length, and format
- [ ] Error messages do not reveal query structure or system internals

### Remediation

- Use parameterized queries for ALL database interactions
- Use safe APIs that avoid the use of interpreters entirely
- Validate and sanitize all user inputs server-side
- Use allowlists for input validation where possible
- Escape special characters for the specific interpreter
- Implement output encoding

---

## A04:2021 - Insecure Design

**What:** Security flaws in the design or architecture, not just the implementation.

### Checklist

- [ ] Threat modeling performed during design phase
- [ ] Security requirements defined alongside functional requirements
- [ ] Business logic validated server-side (not relying on client-side checks)
- [ ] Rate limiting on business-critical operations
- [ ] Multi-step transactions validated at each step
- [ ] Error handling does not reveal system architecture
- [ ] Fail-safe defaults (deny access if validation fails)

### Remediation

- Integrate security into the design process (not just testing)
- Use threat modeling (STRIDE, PASTA, or similar)
- Define abuse cases alongside use cases
- Implement defense in depth (multiple layers of security)
- Review design patterns for known security issues

---

## A05:2021 - Security Misconfiguration

**What:** Missing or incorrect security settings across the application stack.

### Checklist

- [ ] Default credentials changed on all systems
- [ ] Unnecessary features, ports, services, and pages disabled
- [ ] Error messages are generic in production (no stack traces, no debug info)
- [ ] Debug mode disabled in production
- [ ] Server version headers suppressed (Server, X-Powered-By)
- [ ] Cloud storage permissions are restrictive (no public S3 buckets)
- [ ] XML external entity processing disabled
- [ ] Framework security features enabled (CSRF protection, etc.)
- [ ] Security headers configured (see security-headers.md)
- [ ] File upload restrictions enforced (type, size, storage location)

### Remediation

- Implement a repeatable hardening process
- Use configuration management tools
- Remove or do not install unused features and frameworks
- Review and update configurations regularly
- Use automated scanning to detect misconfigurations

---

## A06:2021 - Vulnerable and Outdated Components

**What:** Using components with known vulnerabilities.

### Checklist

- [ ] Inventory of all components and versions maintained
- [ ] No components with known CRITICAL or HIGH CVEs
- [ ] Dependencies checked regularly (npm audit, pip audit, etc.)
- [ ] Automated dependency scanning in CI/CD pipeline
- [ ] Unused dependencies removed
- [ ] Components sourced from official, trusted repositories
- [ ] Package lock files committed to version control
- [ ] Patch management process defined

### Remediation

- Remove unused dependencies
- Monitor CVE databases and security advisories
- Use automated tools (Dependabot, Snyk, Renovate)
- Upgrade promptly when patches are available
- If an upgrade is not possible, apply virtual patches or mitigate at the application layer

---

## A07:2021 - Identification and Authentication Failures

**What:** Broken authentication mechanisms that allow account compromise.

### Checklist

- [ ] Strong password policy enforced (minimum 8 chars, complexity or passphrase)
- [ ] Multi-factor authentication (MFA) available and encouraged
- [ ] Brute force protection (account lockout or progressive delays)
- [ ] Session tokens are long, random, and unpredictable
- [ ] Session tokens not in URLs
- [ ] Sessions expire after inactivity (15-30 min for sensitive apps)
- [ ] Password reset does not reveal whether account exists (timing-safe)
- [ ] Password reset tokens are single-use and time-limited
- [ ] Credentials never logged
- [ ] OAuth/OIDC implemented correctly (state parameter, redirect URI validation)

### Remediation

- Implement MFA where possible
- Use proven authentication frameworks (do not build your own)
- Enforce strong password policies
- Hash passwords with modern algorithms
- Implement account lockout with increasing delays

---

## A08:2021 - Software and Data Integrity Failures

**What:** Code and infrastructure that does not protect against integrity violations.

### Checklist

- [ ] CI/CD pipeline has integrity checks
- [ ] Dependencies verified with checksums or signatures
- [ ] No untrusted deserialization of user-supplied data
- [ ] Code review required before deployment
- [ ] Subresource Integrity (SRI) used for CDN-hosted scripts
- [ ] Signed commits or merge protection in version control
- [ ] Build artifacts are reproducible and verifiable

### Remediation

- Verify digital signatures on software and updates
- Use SRI for third-party scripts
- Avoid untrusted deserialization; if required, validate strictly
- Implement code review and approval workflows
- Use signed, immutable build artifacts

---

## A09:2021 - Security Logging and Monitoring Failures

**What:** Insufficient logging, detection, and response capabilities.

### Checklist

- [ ] Login attempts logged (success and failure)
- [ ] Access control failures logged
- [ ] Input validation failures logged
- [ ] Logs include sufficient context (who, what, when, where)
- [ ] Logs do not contain sensitive data (passwords, tokens, PII)
- [ ] Logs are stored securely and tamper-resistant
- [ ] Log monitoring and alerting configured
- [ ] Incident response plan exists and is tested
- [ ] Logs retained for appropriate period (90 days minimum recommended)

### Remediation

- Log all authentication, access control, and input validation events
- Use structured logging format
- Centralize logs and implement alerting
- Establish and practice incident response procedures
- Consider a SIEM (Security Information and Event Management) solution

---

## A10:2021 - Server-Side Request Forgery (SSRF)

**What:** Application fetches a remote resource based on user-supplied URL without validation.

### Checklist

- [ ] User-supplied URLs validated against an allowlist
- [ ] Internal network ranges blocked (10.x, 172.16-31.x, 192.168.x, 127.x, etc.)
- [ ] URL schemas restricted (only http/https allowed; no file://, gopher://, etc.)
- [ ] DNS resolution results validated (rebinding protection)
- [ ] Response from fetched URLs not directly returned to user
- [ ] Network segmentation limits SSRF impact

### Remediation

- Validate and sanitize all user-supplied URLs
- Use allowlists for permitted domains and IP ranges
- Block private IP ranges at the application and network level
- Disable unnecessary URL schemas
- Apply network-level protections (firewall rules, segmentation)
