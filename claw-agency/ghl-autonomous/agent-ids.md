# GHL Voice AI Agent IDs

Created: 2026-03-05

| Agent | ID | Phone | Status |
|-------|----|-------|--------|
| ClawOps AI Receptionist (Main/Sales) | 69a4db5385c3c6b179b65fc6 | +18884578980 | ACTIVE |
| ClawOps AI - HVAC Receptionist | 69a9ea588df6d776eb19f347 | (none yet) | CREATED |
| ClawOps AI - Plumbing Receptionist | 69a9ea6e4015575ff6dd87eb | (none yet) | CREATED |
| ClawOps AI - Electrical Receptionist | 69a9ea93fd9e73744d469b6f | (none yet) | CREATED |
| ClawOps AI - Roofing Receptionist | 69a9ea96cad7c261690d0820 | (none yet) | CREATED |
| ClawOps AI - GC Receptionist | 69a9ea97974d3e7f0b0bbcfc | (none yet) | CREATED |

## GHL API
- Token: env var GHL_API_KEY
- Location ID: Ez2ADxydpjvWsW3suYiq
- Integration Name: ClawOps Automation

## Custom Field
- Trade Niche (ID: F7txi11mIuhx3qbh1tKB, key: contact.trade_niche)
- Options: HVAC, Plumbing, Electrical, Roofing, General Contractor

## Tags Created
| Tag | ID |
|-----|----|
| niche:hvac | IT1mQ9weOW22AybiXyic |
| niche:plumbing | KdN0N2ehyEnTMOUmwTq7 |
| niche:electrical | aBbPBfMR6iTGsiauWnPU |
| niche:roofing | 6pTt828giqyTMh9ZzYeK |
| niche:general-contractor | R37KuiDxXGatHHmMEbXx |
| source:lead-sheet | QiDnOrPSHDFJeK3rXw9w |
| campaign:founding-wave1 | AYxNFfpjnzoK2OkjM9hh |
| status:new-lead | zjGTVNbUtnO2dPfS5TH4 |
| status:called | 3SYIDbi2cCjTMlDyZ9HB |
| status:demo-booked | BkF6ysl004U48SXZMz3z |
| status:closed-won | 5bsHPirgeEJfxoO3Ictl |

## Pipeline
- "Voice AI Leads" (ID: MK59XHOAuRJU2IjgzHiq)
- Stages: New Lead -> Email Sent -> Booked Call -> Closed

## Next Steps
- Import leads as contacts with niche tags
- Create outbound calling workflow
- Assign phone numbers to niche agents (or use routing from main number)
- Connect calendar booking action to each niche agent
