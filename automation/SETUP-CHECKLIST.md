# Brand's Setup Checklist

Everything below needs YOUR action before these automation systems go live. Tell me when each one is done and I will wire it in.

---

## 1. Gmail / Email Sending
- [x] Email account: rickclaw08@gmail.com
- [x] From name: ClawOps
- [x] Google account logged in and authenticated
- [x] App password generated and stored as GMAIL_APP_PASSWORD env var
- [x] Gmail API enabled on GCP project

## 2. Instagram API Access
- [x] Instagram username: @theclawops
- [ ] Set up a Meta Developer App (developers.facebook.com) and connect the Instagram Business/Creator account
- [ ] Give me the Instagram Access Token (or login credentials if using session-based auth)
- [ ] Confirm: are there specific accounts you NEVER want unfollowed? (besides the 1,500+ follower rule)

## 3. Google Search Console (GSC)
- [x] Google Cloud project created: clawops-488220
- [x] Search Console API enabled
- [x] Service account created: clawops-automation@clawops-488220.iam.gserviceaccount.com
- [x] Service account key downloaded to automation/gcloud-service-account.json
- [x] gcloud CLI authenticated as rickclaw08@gmail.com
- [x] theclawops.com domain verified (auto-verified via DNS)
- [x] Sitemap submitted: https://theclawops.com/sitemap.xml
- [x] GSC is FULLY SET UP

## 4. Google Drive Backup
- [x] Google Cloud project: clawops-488220
- [x] Drive API enabled
- [x] Service account ready (same as GSC)
- [x] "ClawOps Backups" folder created in Google Drive
- [x] Shared with clawops-automation@clawops-488220.iam.gserviceaccount.com (Editor)
- [x] Folder ID: 1XvpcMbO1Z6Ltuli6iLGnXu956SSG6KE4

## 5. Moltbook Access
- [ ] Give me login credentials or API access for Moltbook
- [ ] Confirm what kind of engagement you want (likes, comments, follows, or all three)
- [ ] Any accounts or topics to specifically target or avoid?

## 6. Cron Activation
- [ ] Once the above are done, I will register all cron jobs in OpenClaw
- [ ] You review the schedule one final time before I activate

## 7. Freelance Platforms (Brand Action)
- [ ] Create Upwork account and set up ClawOps / AI automation profile
- [ ] Create Fiverr account and set up gig(s) for automation services
- [ ] Share login credentials or confirm they are ready so we can start submitting proposals

---

**How to use this:** Reply with the item number and the info. Example: "1 done, app password is XXXX, send as ClawOps." I will check it off and configure it.
