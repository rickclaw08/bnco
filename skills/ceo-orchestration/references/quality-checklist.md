# Quality Checklist

Use this checklist when reviewing any agent's completed work. Every item must pass before work is approved.

## Universal Standards (Apply to Everything)

- [ ] **No em dashes** - Search for Unicode character U+2014. Zero tolerance.
- [ ] **Complete delivery** - Agent delivered everything requested, nothing missing
- [ ] **Correct location** - Files saved where specified
- [ ] **Brand tone** - Direct, pragmatic, no BS, no filler, no fluff
- [ ] **Actionable** - Can be used immediately without further rework
- [ ] **Error-free** - No typos, broken links, or obvious mistakes

## Code Review (Apply to All Code/Technical Work)

- [ ] **Security checklist applied** - CSP, headers, validation, sanitization
- [ ] **No hardcoded secrets** - API keys, passwords in env vars only
- [ ] **Input validation** - Schema-based, type checks, length limits
- [ ] **OWASP compliance** - No common vulnerabilities
- [ ] **Works as intended** - Tested or verifiably correct
- [ ] **Clean code** - Readable, commented where needed, no dead code
- [ ] **Git-ready** - Proper commit message, no junk files

## Content Review (Apply to All Written Content)

- [ ] **Accurate** - Facts checked, no hallucinated claims
- [ ] **On-brand** - Matches ClawOps voice and positioning
- [ ] **SEO-ready** - Keywords included where applicable
- [ ] **Platform-appropriate** - Formatted for target platform (Discord, blog, email, etc.)
- [ ] **No placeholder text** - Everything filled in, no "[INSERT HERE]" remnants

## Financial/Revenue Review

- [ ] **Numbers verified** - Math checks out, sources cited
- [ ] **Tied to $100K target** - Clear connection to revenue goal
- [ ] **Realistic projections** - No fantasy numbers, conservative estimates preferred
- [ ] **Actionable recommendations** - Clear next steps, not just analysis

## Design/UX Review

- [ ] **Consistent with brand** - Dark navy theme, light green (#4ade80) accents
- [ ] **Mobile responsive** - Works on all screen sizes
- [ ] **Accessible** - Readable contrast, proper alt text, semantic HTML
- [ ] **Fast loading** - No bloated assets

## Failure Actions

If work fails review:

1. **Minor issues** - Use `subagents steer` with specific corrections
2. **Major issues** - Spawn new agent with clearer instructions + lessons learned
3. **Repeated failures** - Log pattern in daily memory, consider different agent or approach
4. **Quality concerns** - Escalate to Brand only if it impacts revenue or reputation

## Approval

When work passes all applicable checks:
1. Log approval in daily memory
2. Deploy/publish if ready
3. Assign agent their next task (or let them self-assign)
4. Update pipeline-tracker.md if revenue-impacting
