# OpenClaw DIY Installation Guide

## Quick Start Guide v1.0
*From Zero to Working Agent in 2 Hours*

---

## Chapter 1: Pre-Flight Check (10 minutes)

### System Requirements
- **Mac**: macOS 12+ (Intel or Apple Silicon)
- **Linux**: Ubuntu 20.04+ or Debian 11+
- **Memory**: 4GB RAM minimum
- **Disk**: 10GB free space
- **Network**: Stable internet, ports 3000 & 8080 open

### You'll Need Accounts At:
- [ ] OpenAI (for GPT models) - https://platform.openai.com
- [ ] Anthropic (for Claude) - https://console.anthropic.com
- [ ] Brave (for web search) - https://brave.com/search/api

Don't have API keys yet? See Chapter 2.

---

## Chapter 2: Getting Your API Keys (15 minutes)

### OpenAI API Key
1. Go to https://platform.openai.com
2. Sign in/up → API Keys → Create new secret key
3. Copy the key starting with `sk-...`
4. Save it somewhere safe (you can't see it again!)

### Anthropic API Key  
1. Go to https://console.anthropic.com
2. Sign in/up → API Keys → Create Key
3. Copy the key starting with `sk-ant-...`
4. Name it "OpenClaw" for easy tracking

### Brave Search API (Free!)
1. Go to https://brave.com/search/api
2. Sign up (free tier = 2000 queries/month)
3. Get your API key from dashboard

---

## Chapter 3: Installation (30 minutes)

### Mac Installation

```bash
# 1. Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Install OpenClaw
npm install -g openclaw

# 4. Verify installation
openclaw --version
```

### Linux Installation

```bash
# 1. Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install OpenClaw
sudo npm install -g openclaw

# 3. Verify installation  
openclaw --version
```

### Common Installation Errors

**"Permission denied" on Mac?**
```bash
sudo npm install -g openclaw --unsafe-perm
```

**"Command not found" after install?**
```bash
# Add to your PATH
echo 'export PATH="$PATH:/usr/local/bin"' >> ~/.zshrc
source ~/.zshrc
```

---

## Chapter 4: Configuration (20 minutes)

### Initial Setup

```bash
# 1. Initialize OpenClaw
openclaw init

# 2. When prompted, enter:
# - Installation path: Press Enter for default
# - Gateway mode: Select 'standalone'
```

### Add Your API Keys

```bash
# Create environment file
cd ~/.openclaw
nano .env
```

Add these lines (replace with your actual keys):
```
OPENAI_API_KEY=sk-...your-key-here...
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
BRAVE_API_KEY=...your-key-here...
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Start OpenClaw

```bash
# Start the gateway
openclaw gateway start

# Check it's running
openclaw status
```

You should see:
```
Gateway: ✅ Running
Web UI: ✅ http://localhost:3000
API: ✅ http://localhost:8080
```

---

## Chapter 5: Your First Agent (30 minutes)

### Access the Web UI

1. Open your browser
2. Go to http://localhost:3000
3. You'll see the OpenClaw dashboard

### Create Your First Agent

1. Click "New Agent"
2. Give it a name: "Assistant"
3. Select model: "gpt-4-turbo-preview"
4. Click "Create"

### Test Your Agent

In the chat box, try:
- "Hello! Can you hear me?"
- "What's 2+2?"
- "Tell me a joke"

If it responds, you're golden! 🎉

---

## Chapter 6: Troubleshooting (As Needed)

### Top 5 Fixes

**1. "API key not found"**
- Check `.env` file has no spaces or quotes
- Restart: `openclaw gateway restart`

**2. "Cannot connect to gateway"**
- Is it running? `openclaw status`
- Check firewall isn't blocking port 3000

**3. "Model not found"**
- Use exact model names: `gpt-4-turbo-preview` not `gpt-4`
- Check you have access to that model in your account

**4. "Rate limit exceeded"**
- You hit API limits - wait 1 minute
- Or upgrade your API plan

**5. "Permission denied"**
- Never run OpenClaw as root
- Fix: `sudo chown -R $USER:$USER ~/.openclaw`

### Still Stuck?

1. Copy the exact error message
2. Check our Fix Library (you have access!)
3. Ask in #help on Discord
4. 90% of issues are in the Fix Library

---

## Chapter 7: What's Next?

### Essential Next Steps
- [ ] Set up Telegram bot (see Advanced Guide)
- [ ] Configure cost limits
- [ ] Add more agents
- [ ] Explore skills

### Cost Optimization Tips
- Use `gpt-3.5-turbo` for simple tasks
- Set context window limits
- Monitor usage daily first week

### Join the Community
Discord: [Your invite link]
- #showcase - See what others built
- #help - Get unstuck fast
- #tips - Daily optimization ideas

---

## Appendix A: Quick Command Reference

```bash
# Service Control
openclaw status              # Check if running
openclaw gateway start       # Start services
openclaw gateway stop        # Stop services
openclaw gateway restart     # Restart services

# Configuration
openclaw config show         # View current config
openclaw config set KEY VAL  # Update settings

# Logs & Debugging  
openclaw logs               # View recent logs
openclaw logs -f            # Follow logs live

# Agents
openclaw agents list        # List all agents
openclaw agents create      # Create new agent
```

---

## Appendix B: Cost Estimates

**Typical Monthly Costs:**
- Light use (personal): $20-40
- Medium use (small team): $50-150  
- Heavy use (automation): $200+

**Cost Breakdown:**
- GPT-3.5: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Claude: ~$0.024 per 1K tokens

**Quick Math:**
- 1 conversation ≈ 2-4K tokens
- 100 conversations/day ≈ $30-90/month

---

## Need More Help?

**Included in DIY Kit:**
- ✅ This guide (lifetime updates)
- ✅ Fix Library access
- ✅ Discord community
- ✅ Video walkthroughs
- ✅ 30-day money-back guarantee

**Want Hands-On Help?**
Upgrade to Done With You - we'll screenshare and set it up together!

---

*© 2024 ClawOps - OpenClaw Setup Specialists*
*Questions? support@clawops.com*