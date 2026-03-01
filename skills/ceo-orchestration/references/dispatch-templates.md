# Dispatch Templates

Ready-to-use task briefs for spawning subagents. Copy, fill in, dispatch.

## Template 1: Standard Task

```
You are [Agent Name], [Role].

## Task
[Clear, specific description of what to do]

## Deliverable
[Exact output expected - files, reports, code, etc.]

## Context
- Read: [list any files they need]
- Related: [any prior work or dependencies]

## Standards
- No em dashes anywhere
- Follow security checklist for any web/code work
- Match Brand's tone: direct, pragmatic, no filler

## Priority
[Critical / High / Normal / Low]
```

## Template 2: Code/Build Task (for Ethan/Kai/Forge)

```
You are [Agent Name], [Role].

## Build Task
[What to build or modify]

## Technical Requirements
- Stack: [Next.js / static HTML / etc.]
- Location: [file paths]
- Integration: [APIs, services]

## Security Requirements
- Apply full security checklist (see MEMORY.md)
- CSP headers, input validation, no hardcoded keys
- OWASP compliance

## Deliverable
- Working code at [path]
- No em dashes in any content
- Test/verify before reporting complete

## Priority
[Critical / High / Normal / Low]
```

## Template 3: Research/Analysis Task (for Atlas/Recon/Sage)

```
You are [Agent Name], [Role].

## Research Task
[What to investigate]

## Scope
- Markets/competitors: [list]
- Data sources: [web, specific sites, etc.]
- Depth: [surface scan / deep dive]

## Deliverable
- Report saved to: [workspace path]
- Include: findings, data points, actionable recommendations
- Format: markdown, bullet points, no fluff

## Priority
[Critical / High / Normal / Low]
```

## Template 4: Content/Marketing Task (for Victoria/Iris)

```
You are [Agent Name], [Role].

## Content Task
[What to create]

## Specifications
- Platform: [blog / social / email / landing page]
- Tone: [professional / casual / technical]
- Length: [word count or guidelines]
- SEO keywords: [if applicable]

## Brand Standards
- No em dashes
- Direct, clear, no filler
- ClawOps brand voice

## Deliverable
- Content saved to: [path]
- Ready to publish (no draft quality)

## Priority
[Critical / High / Normal / Low]
```

## Template 5: Financial/Revenue Task (for Morgan/Jordan)

```
You are [Agent Name], [Role].

## Finance Task
[What to analyze or execute]

## Data Sources
- Stripe dashboard
- pipeline-tracker.md
- pricing-tiers.md

## Deliverable
- Analysis/report saved to: [path]
- Include: numbers, projections, recommendations
- Tie back to $100K target

## Priority
[Critical / High / Normal / Low]
```

## Template 6: Multi-Agent Coordination

```
## Project: [Name]

### Phase 1: [Agent A]
Task: [description]
Deliverable: [output]
Deadline: [when]

### Phase 2: [Agent B] (depends on Phase 1)
Task: [description]
Input: [Phase 1 output]
Deliverable: [output]

### Phase 3: [Agent C] (parallel with Phase 2)
Task: [description]
Deliverable: [output]

### Review Gate
Rick reviews all phase outputs before final assembly.
```

## Tips

- Be specific. "Write content" is bad. "Write a 500-word blog post about AI automation ROI for small businesses, targeting r/smallbusiness audience" is good.
- Always specify where to save output files
- Include context files they should read
- Set clear priority so agents know what to tackle first
- For code tasks, always include the security requirements
