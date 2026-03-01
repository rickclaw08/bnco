# Code Review

- **Name:** code-review
- **Version:** 0.1.0
- **Description:** Review code quality, security, and standards compliance before pushing. Ethan's quality gate for all technical output.
- **Owner:** Ethan (CTO)

## Trigger Keywords

- "review code"
- "check this"
- "is this secure"
- "code review"
- "review PR"
- "before we push"

## Prerequisites

- Access to the codebase (local files or git repo)
- Familiarity with our security standard (references/security-standard.md from website-deploy skill)
- Knowledge of coding standards (references/coding-standards.md)

## Workflow

### 1. Understand the Scope

1. What files were changed? (`git diff --stat` or file list)
2. What is the purpose of the change?
3. Is this new code, refactor, or bug fix?
4. What parts of the system does it touch?

### 2. Run the Diff

```bash
# See what changed
git diff HEAD~1          # Last commit
git diff --staged        # Staged changes
git diff main..feature   # Branch comparison
```

Review each file:
- What was added?
- What was removed?
- What was modified?

### 3. Security Review (OWASP-Based)

Run through the OWASP checklist (see references/owasp-checklist.md):

**Injection**
- [ ] No string concatenation in SQL/commands
- [ ] Parameterized queries used
- [ ] User input sanitized before use
- [ ] No eval() or equivalent with user data

**Broken Authentication**
- [ ] Passwords hashed (bcrypt/argon2)
- [ ] Session tokens are random and secure
- [ ] No credentials in code or logs

**Sensitive Data Exposure**
- [ ] No API keys hardcoded
- [ ] No secrets in client-side code
- [ ] HTTPS enforced for all data transmission
- [ ] Sensitive data not logged

**XSS (Cross-Site Scripting)**
- [ ] User input encoded on output
- [ ] innerHTML avoided (use textContent)
- [ ] CSP headers prevent inline scripts
- [ ] No dangerouslySetInnerHTML without sanitization

**Security Misconfiguration**
- [ ] Default credentials removed
- [ ] Debug mode off in production
- [ ] Error messages don't leak info
- [ ] Unnecessary features/ports disabled

**CSRF**
- [ ] Anti-CSRF tokens on state-changing forms
- [ ] SameSite cookie attribute set

### 4. Standards Compliance

**Universal Rules**
- [ ] No em dashes (search for U+2014, the character: -)
- [ ] Consistent code formatting
- [ ] Meaningful variable/function names
- [ ] Comments where logic is non-obvious
- [ ] No dead code or commented-out blocks
- [ ] No console.log in production code

**HTML Standards**
- [ ] Semantic elements used (header, main, section, nav, footer)
- [ ] Alt text on images
- [ ] Form inputs have labels
- [ ] Valid HTML (no unclosed tags)

**CSS Standards**
- [ ] No !important unless truly necessary
- [ ] Mobile-first responsive design
- [ ] Consistent naming convention
- [ ] No unused styles

**JavaScript Standards**
- [ ] const/let preferred over var
- [ ] Error handling on async operations
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Strict equality (=== not ==)

See references/coding-standards.md for full details.

### 5. Functionality Check

- [ ] Does the code do what it's supposed to?
- [ ] Edge cases handled?
- [ ] Error states handled gracefully?
- [ ] No regression in existing functionality?
- [ ] Performance acceptable? (no N+1 queries, no unnecessary loops)

### 6. CSP Validation (for web projects)

If the change involves web pages:

1. Check for Content-Security-Policy meta tag or header
2. Verify directives are restrictive enough
3. Test that the page works with the CSP (no violations in console)
4. Ensure new external resources are whitelisted

```bash
# Quick check for CSP in HTML files
grep -r "Content-Security-Policy" *.html
```

### 7. Verdict

Rate the review:

**APPROVE** - Code meets all standards, safe to push
**REQUEST CHANGES** - Issues found, list specific fixes needed
**REJECT** - Fundamental problems, needs significant rework

For each issue found, provide:
1. File and line number (or section)
2. What the issue is
3. How to fix it
4. Severity: critical (security) / major (functionality) / minor (style)

### 8. Post-Review

If approved:
- Confirm push is safe
- Verify deployment pipeline

If changes requested:
- Provide clear, actionable feedback
- Offer to re-review after fixes
- If agent-produced code, use `subagents steer` with specific corrections

## Reference Files

- `references/owasp-checklist.md` - OWASP Top 10 security checklist
- `references/coding-standards.md` - Code style and quality standards
