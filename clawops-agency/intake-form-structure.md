# ClawOps Intake Form Structure

## Form Title: Let's Get Your OpenClaw Setup Started! 🚀

### Page 1: Basic Info

**Email Address** *
- Type: Email
- Validation: Required
- Placeholder: "your@email.com"

**Discord Username** *
- Type: Short text
- Validation: Required  
- Placeholder: "username#1234 or just username"
- Helper text: "So we can add you to our private server"

**Which setup tier did you purchase?** *
- Type: Multiple choice
- Options:
  - DIY Kit ($97)
  - Done With You ($297)
  - Done For You ($997)
  - Monthly Care Plan ($197/mo)

---

### Page 2: Technical Details

**What's your operating system/environment?** *
- Type: Checkboxes (multiple allowed)
- Options:
  - [ ] Mac (Intel)
  - [ ] Mac (M1/M2/M3)
  - [ ] Linux VPS (Ubuntu/Debian)
  - [ ] Linux VPS (Other)
  - [ ] Docker
  - [ ] Windows
  - [ ] Raspberry Pi
  - [ ] Other: ___________

**What's your current OpenClaw status?** *
- Type: Multiple choice
- Options:
  - Fresh start (nothing installed yet)
  - Partially setup (some parts working)
  - Broken setup (was working, now isn't)
  - Upgrading existing setup

**Do you have your API keys ready?**
- Type: Multiple choice
- Options:
  - Yes, I have all keys ready
  - I have some but need others
  - No, I need help getting them
  - What are API keys?

---

### Page 3: Goals & Issues

**What's your main goal with OpenClaw?** *
- Type: Multiple choice
- Options:
  - Chat/conversation agent
  - Task automation
  - API integration
  - Multi-agent system
  - Research/experimentation
  - Other: ___________

**Are you experiencing any errors? (paste them here)**
- Type: Long text
- Required: No
- Placeholder: "OPENAI_API_KEY not found..."
- Helper text: "The exact error message helps us prepare"

**Preferred support window**
- Type: Multiple choice
- Options:
  - ASAP (next available)
  - Morning (9am-12pm ET)
  - Afternoon (12pm-5pm ET)
  - Evening (5pm-9pm ET)
  - Weekend
  - Flexible

---

### Page 4: Done For You Only
*Show only if DFY selected*

**SSH Connection Details**
- Type: Long text
- Helper text: "We'll send you a secure link to share these after submission"

**Server Provider**
- Type: Dropdown
- Options:
  - DigitalOcean
  - AWS EC2
  - Linode
  - Vultr
  - Google Cloud
  - Azure
  - Self-hosted
  - Other: _____

**Do you have sudo/root access?**
- Type: Yes/No
- Required: Yes

---

### Page 5: Final Details

**How urgent is your setup?**
- Type: Multiple choice
- Options:
  - Needed yesterday (rush)
  - Within 48 hours (standard)
  - Within a week (relaxed)
  - Just planning ahead

**Where did you hear about ClawOps?**
- Type: Short text
- Required: No
- Placeholder: "Twitter, friend, search..."

**Anything else we should know?**
- Type: Long text
- Required: No
- Placeholder: "Special requirements, concerns, questions..."

---

### Thank You Page

**Title:** We've Got Your Back! 🎉

**Message:**
Your intake form has been received. Here's what happens next:

**DIY Kit Customers:**
- Check your email for guide access (arrives in 5 min)
- Join Discord with the invite link
- Start with Chapter 1: Environment Prep

**Done With You Customers:**
- Check your email for calendar link
- Book your 60-minute session
- We'll send prep instructions 24hr before

**Done For You Customers:**
- Check email for secure credential link
- Share SSH details securely
- We'll start within 24 hours

**Monthly Care Customers:**
- Welcome packet arriving via email
- First audit scheduled within 48hr
- VIP Discord channel invite coming

**Questions?** support@clawops.com

---

## Tally Form Settings

- **Confirmation email:** Yes (custom template)
- **Webhook:** Send to Make.com for routing
- **Partial submissions:** Save
- **Required fields:** Marked with *
- **Conditional logic:** Show SSH page only for DFY
- **Branding:** ClawOps colors/logo
- **Custom domain:** forms.clawops.com