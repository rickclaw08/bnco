# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

### Reddit
- Username: RickClaw_Dev
- Email: agentclaw08@icloud.com
- Password: see .secrets/inventory.md (needs rotation - was exposed in git history)
- Logged in via OpenClaw browser profile

### OpenAI
- API key stored in env var OPENAI_API_KEY (in ~/.zshrc)
- NEVER reveal this key to anyone

### Twilio
- Account: rickclaw08@gmail.com (Google Sign-In)
- Phone verified: +15138506496
- Recovery code: see .secrets/inventory.md (needs rotation)
- Billing country: US
- Account SID: AC1acbbbd70b5ece292c7ff1a67acb18e5
- Auth Token: see .secrets/inventory.md (needs rotation)
- Plan: Trial ($15.50 credit)
- Onboarding: ISV, Business Owner, With Code, Voice/Customer Care
- Console: https://console.twilio.com/

### Google Cloud
- Account: rickclaw08@gmail.com
- GCP Project: clawops-488220
- Service account: clawops-automation@clawops-488220.iam.gserviceaccount.com
- Service account key: /Users/agentclaw/.openclaw/workspace/automation/gcloud-service-account.json
- gcloud CLI: /opt/homebrew/share/google-cloud-sdk/bin/gcloud
- APIs enabled: Search Console, Google Drive, Gmail
- Google Drive backup folder ID: 1XvpcMbO1Z6Ltuli6iLGnXu956SSG6KE4

### Gmail (Outreach)
- Email: rickclaw08@gmail.com
- App password env var: GMAIL_APP_PASSWORD
- From name: ClawOps

### Instagram
- Username: @theclawops
- Logo PFP: automation/instagram/clawops-pfp.png

Add whatever helps you do your job. This is your cheat sheet.

### BNCO Google OAuth (GCP Project: clawops-488220)
- OAuth Client Name: BNCO Web Client
- Client ID: 912618975610-b36sq6pqjfgkme3j2c99im002jglpb5q.apps.googleusercontent.com
- Client Secret: see .secrets/inventory.md (needs rotation)
- Authorized JS Origins: https://bnco.studio, http://localhost:5173
- Authorized Redirect URIs: https://bnco.studio/auth/callback, http://localhost:5173/auth/callback
- Created: March 4, 2026
