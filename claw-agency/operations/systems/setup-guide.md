# ClawOps Operational Systems Setup Guide

## Philosophy

We're a lean AI automation agency. Our tools need to be:
- **Free or freemium** (minimize fixed costs)
- **Simple** (we're building, not administrating)
- **Integrated** (tools that talk to each other)
- **Scalable** (can grow with us)

## Core Stack

### 1. Project Management: **Notion** (Free Plan)

**Why Notion:**
- Unlimited blocks on free plan (just limited to 10 members)
- Combines wiki, database, and project management
- Flexible enough to adapt as we figure out our process
- Native AI features for documentation
- Great for client-facing documentation
- Can embed from other tools

**What we lose vs paid:**
- Version history limited to 7 days (fine for now)
- No advanced permissions (we're small, not an issue)
- Limited file uploads (5MB, but we'll use external storage)

**Setup Steps:**

1. Create Notion account at notion.so
2. Create workspace: "ClawOps"
3. Set up core structure:
   ```
   📁 ClawOps Home
   ├── 🎯 Active Projects (Database)
   ├── 👥 Clients (Database)
   ├── 📋 Tasks & Sprints (Database)
   ├── 📚 Documentation Wiki
   ├── 🔧 SOPs & Playbooks
   ├── 💡 Ideas & Backlog
   └── 📊 Weekly Reviews
   ```

4. Create "Active Projects" database with properties:
   - Client (Relation to Clients db)
   - Status (Select: Discovery, In Progress, Review, Done, Paused)
   - Priority (Select: P0-Critical, P1-High, P2-Medium, P3-Low)
   - Timeline (Date range)
   - Owner (Person)
   - Revenue (Number)
   - Type (Select: Automation, Integration, Consulting, Retainer)

5. Create "Clients" database with properties:
   - Status (Select: Lead, Active, Paused, Completed)
   - Industry (Select)
   - Projects (Relation to Active Projects)
   - Primary Contact (Text)
   - Email (Email)
   - Contract Value (Number)
   - Start Date (Date)
   - Notes (Text)

6. Create "Tasks & Sprints" database with properties:
   - Project (Relation to Active Projects)
   - Assignee (Person)
   - Status (Select: Backlog, Todo, In Progress, Blocked, Done)
   - Priority (Select: Critical, High, Medium, Low)
   - Due Date (Date)
   - Time Estimate (Number)
   - Time Logged (Number)

7. Set up templates:
   - Client onboarding checklist
   - Project kickoff template
   - Weekly review template
   - SOP template

**Pro Tips:**
- Use inline databases on your home page for quick views
- Set up filtered views (My Tasks, This Week, Blocked Items)
- Use toggles to keep pages clean but detailed
- Link related pages liberally (projects to clients, tasks to projects)

---

### 2. Time Tracking: **Clockify** (Free Plan)

**Why Clockify:**
- Truly unlimited users and projects on free plan
- Simple timer interface (desktop app, web, mobile)
- Detailed reports and exports
- Integrates with many tools
- Can track billable vs non-billable
- Client and project-based tracking

**What we lose vs paid:**
- No invoicing (we'll handle separately)
- No scheduled reports (manual export is fine)
- Limited integrations (manual is okay for now)

**Setup Steps:**

1. Create account at clockify.me
2. Create workspace: "ClawOps"
3. Set up projects matching Notion structure:
   - Use same client names and project names
   - Mark billable status clearly
   - Set hourly rates (even if flat fee, for internal costing)

4. Set up tags for task types:
   - Development
   - Design
   - Client Meeting
   - Internal Meeting
   - Documentation
   - Research
   - Admin
   - Support

5. Install apps:
   - Desktop app (for quick start/stop)
   - Browser extension (for tracking web-based work)
   - Mobile app (for on-the-go tracking)

6. Create custom reports:
   - Weekly summary by project
   - Monthly summary by client
   - Utilization report (billable vs internal)

**Pro Tips:**
- Start timer before you start working, not after
- Add descriptions to time entries (helps with invoicing)
- Review and clean up time entries daily (while fresh)
- Use project codes in descriptions for easy searching

---

### 3. Client Communication: **Slack** (Free Plan)

**Why Slack:**
- 90-day message history (plenty for active convos)
- Unlimited channels
- Good mobile apps
- Familiar to most clients
- Integrates with everything
- Can create client-specific channels

**What we lose vs paid:**
- Limited message history (90 days, but important stuff goes in Notion)
- 10 integrations max (we'll choose wisely)
- No guest accounts (clients need full Slack accounts, but that's free for them)

**Alternative consideration:**
- **Discord** (if clients are more casual/startup-y)
  - Unlimited history
  - Voice channels built-in
  - Free screen sharing
  - More casual vibe
  - BUT: Less professional perception, harder for corporate clients

**Setup Steps:**

1. Create workspace: clawops.slack.com (or similar)
2. Set up channel structure:
   ```
   # Internal
   - #general (team chat)
   - #wins (celebrate victories)
   - #operations (logistics, scheduling)
   - #dev-discussion (technical talk)
   - #ideas (feature ideas, business development)
   
   # Client channels (create per client)
   - #client-{company-name}
   - #client-{company-name}-urgent (optional for larger clients)
   ```

3. Set up integrations (use 10 wisely):
   - Notion (for project updates)
   - Google Calendar (for meeting reminders)
   - GitHub/GitLab (for dev teams)
   - Clockify (for time tracking reminders)
   - Save remaining slots for client-specific needs

4. Create channel guidelines pinned message:
   - Response time expectations
   - What belongs in Slack vs email
   - How to escalate urgent issues
   - When to use threads vs new messages

5. Set up notification preferences:
   - Use @channel sparingly
   - Set quiet hours
   - Use threads for discussions

**Pro Tips:**
- Use threads for everything that isn't urgent
- Pin important messages (links, credentials, decisions)
- Use emoji reactions to acknowledge without cluttering
- Set up saved replies for common questions
- Regular channel pruning (archive inactive client channels)

---

### 4. File Sharing & Documentation: **Google Workspace** (Free Gmail + Drive)

**Why Google Drive:**
- 15GB free storage per account
- Real-time collaboration
- Everyone knows how to use it
- Good mobile apps
- Reliable sharing and permissions
- Integrates with everything

**Plus:**
- **Google Docs** for collaborative documents
- **Google Sheets** for data and calculations
- **Google Slides** for client presentations
- **Google Forms** for intake forms and surveys

**What we lose vs paid:**
- Storage limited to 15GB (upgrade when needed)
- No custom email domain (use free Gmail)
- No advanced admin controls (fine for small team)

**Setup Steps:**

1. Create shared drive structure:
   ```
   📁 ClawOps Shared
   ├── 📁 Clients
   │   ├── 📁 {Client Name}
   │   │   ├── 📁 Contracts & Agreements
   │   │   ├── 📁 Project Files
   │   │   ├── 📁 Deliverables
   │   │   └── 📁 Meeting Notes
   ├── 📁 Internal
   │   ├── 📁 Templates
   │   ├── 📁 Marketing
   │   ├── 📁 Operations
   │   └── 📁 Finance
   ├── 📁 Knowledge Base
   │   ├── 📁 Technical Docs
   │   ├── 📁 Client Playbooks
   │   └── 📁 Training Materials
   ```

2. Create document templates:
   - Client proposal template
   - SOW (Statement of Work) template
   - Meeting notes template
   - Project status report template
   - Onboarding checklist template

3. Set up sharing defaults:
   - Internal folder: Team members have edit access
   - Client folders: Specific client has view access, create per-client share links
   - External shares: Use "Anyone with link can view" for deliverables

4. Set up naming conventions:
   - Documents: `YYYY-MM-DD_ClientName_DocumentType_Version`
   - Folders: Use consistent naming
   - Examples:
     - `2024-02-20_AcmeCorp_Proposal_v2`
     - `2024-02-20_ClientMeeting_Notes`

**Pro Tips:**
- Use Google Docs comments for async feedback
- Enable version history (it's automatic but remember it exists)
- Use "Suggest mode" when editing client-facing docs
- Create shortcuts to frequently used folders
- Use starred items for quick access
- Set up offline access for critical documents

---

## Additional Free Tools (As Needed)

### Design & Prototyping: **Figma** (Free)
- 3 Figma files, unlimited personal files
- Perfect for mockups and client presentations
- Real-time collaboration

### Code Repository: **GitHub** (Free)
- Unlimited public and private repos
- Great for version control
- Free Actions minutes for CI/CD
- Use for client project code

### Video Conferencing: **Google Meet** (Free)
- 1-hour meetings (plenty for most calls)
- Screen sharing included
- No app required for participants

### Form Builder: **Tally.so** (Free)
- Unlimited forms and submissions
- Clean, modern interface
- Great for client intake forms

### Email Marketing: **Mailchimp** (Free)
- 500 contacts, 1,000 sends/month
- Good for newsletters and client updates

### Analytics: **Google Analytics** (Free)
- If we build web properties
- Track website performance

---

## Integration Strategy

Since we can't integrate everything, prioritize:

1. **Notion ↔ Slack**: Project updates post to relevant channels
2. **Clockify ↔ Notion**: Weekly time summaries
3. **Google Calendar ↔ Slack**: Meeting reminders
4. **GitHub ↔ Slack**: Commit notifications (if dev team grows)

**Manual integration points:**
- Weekly copy time data from Clockify to Notion
- Monthly financial review pulls from multiple sources
- Client status updates flow Slack → Notion

---

## Cost Scaling Plan

**When to upgrade (and what to upgrade first):**

1. **Notion Team Plan** ($10/user/mo) - When we hit 10 people or need version history
2. **Google Workspace** ($6/user/mo) - When we need custom email domain (@clawops.com)
3. **Clockify Pro** ($4.99/user/mo) - When we need automated invoicing
4. **Slack Pro** ($7.25/user/mo) - When 90-day history becomes a problem

**Total cost at 5 people, all paid plans: ~$140/month**

Still very manageable, and we can stay free for a long time.

---

## Setup Timeline

**Day 1: Foundation (2 hours)**
- Create all accounts
- Set up basic Notion structure
- Create Slack workspace and channels

**Day 2: Configuration (3 hours)**
- Build Notion databases and templates
- Configure Clockify projects
- Set up Google Drive structure
- Create document templates

**Day 3: Integration & Testing (2 hours)**
- Set up available integrations
- Test workflows end-to-end
- Create quick reference guide for team

**Day 4: Documentation (1 hour)**
- Document all logins and access
- Create onboarding guide
- Share with team

---

## Security & Access

**Password Management:**
- Use 1Password or Bitwarden (both have free plans)
- Shared vault for company accounts
- Never share passwords in Slack

**Access Levels:**
- Full admin: Founders/COO
- Editor: All team members
- View-only: Contractors (unless specific project needs)
- Client access: Project-specific, time-limited when possible

**Backup Strategy:**
- Notion: Export monthly to Google Drive
- Critical docs: Keep local copies
- Code: GitHub handles this
- Time data: Export Clockify monthly

---

## Next Steps

1. Create accounts for all tools
2. Follow setup steps in order
3. Invite team members
4. Run a test project through the entire workflow
5. Gather feedback and iterate
6. Document any customizations in this guide

---

*Last updated: 2024-02-20*  
*Owner: Harper (COO)*  
*Review frequency: Monthly or when adding 3+ people*
