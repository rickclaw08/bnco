# Initiative Engine

An autonomous workspace improvement system that continuously scans your project files, identifies improvement opportunities, and safely applies fixes - all without human intervention for safe changes.

## How It Works

The engine follows a simple loop:

1. **Scan** - Reads all files in configured directories
2. **Analyze** - Identifies improvement opportunities (typos, whitespace, broken links, missing metadata, etc.)
3. **Classify** - Each opportunity is labeled as SAFE or RISKY
4. **Act** - SAFE changes are executed automatically; RISKY changes are queued for human review
5. **Log** - Everything is recorded with timestamps and before/after snapshots

## Safety Model

The engine is built on a conservative safety model. When in doubt, changes are classified as RISKY.

### SAFE (Automatic Execution)

These changes are non-destructive and reversible:

- **Fix trailing whitespace** - Removes extra spaces at end of lines
- **Add missing newline** - Ensures files end with a newline character
- **Fix excessive blank lines** - Collapses 3+ consecutive blank lines to 2
- **Fix broken internal links** - In non-sensitive paths only
- **Add missing meta tags** - Viewport, charset in HTML files (non-sensitive paths only)
- **Note missing H1 headings** - In markdown files (non-sensitive paths only)

Every safe change:
- Creates a backup first (stored in `backups/`)
- Logs the before and after state
- Respects the per-run change limit (default: 10)

### RISKY (Requires Approval)

These changes could affect business operations, public perception, or revenue:

- **Pricing changes** - Any modification to pricing data
- **Public-facing content** - Website copy, sales materials, product descriptions
- **Business logic** - Configuration files, automation rules
- **External communications** - Anything sent to users or prospects
- **Legal content** - Terms, policies, agreements
- **Date updates** - Old dates flagged but not auto-changed (context matters)

Additionally, any change to files in these directories is always RISKY:
- `sales/`
- `pricing`
- `legal/`
- `website/`
- `products/`

### Boundary Protection

The engine NEVER modifies files outside the workspace. All paths are validated before any write operation.

## Components

### engine.js - The Core Scanner

Runs every 4 hours. Scans, analyzes, classifies, and acts.

```bash
# Manual run
node automation/initiative-engine/engine.js
```

### daily-summary.js - Daily Report

Generates an HTML email summary at 10 PM EST with:
- Stats (files scanned, changes made)
- Safe changes executed (with details)
- Risky changes queued
- Opportunities noted but not acted on
- Pending approval backlog

```bash
# Manual run
node automation/initiative-engine/daily-summary.js
```

If SMTP is not configured, the summary is saved as an HTML file in `logs/daily/`.

### approve.js - Approval CLI

Review and act on risky changes.

```bash
# Interactive review (walks through each pending item)
node automation/initiative-engine/approve.js

# List all pending items
node automation/initiative-engine/approve.js --list

# Approve a specific item
node automation/initiative-engine/approve.js --approve <ID>

# Reject a specific item
node automation/initiative-engine/approve.js --reject <ID>

# Defer (keep pending for later)
node automation/initiative-engine/approve.js --defer <ID>

# Clear resolved items (approved + rejected)
node automation/initiative-engine/approve.js --clear
```

## Configuration

Edit `config.json` to customize:

| Setting | Description | Default |
|---------|-------------|---------|
| `scanDirectories` | Which directories to scan | claw-agency, clawops-agency, automation, forge, hone, clawops-dashboard |
| `maxChangesPerRun` | Safety limit per engine run | 10 |
| `runIntervalHours` | How often the engine runs | 4 |
| `maxFileSizeBytes` | Skip files larger than this | 1 MB |
| `backupBeforeModify` | Create backup before changes | true |
| `emailRecipient` | Daily summary recipient | jacksonroy152@gmail.com |
| `safePatterns` | What counts as safe | See config.json |
| `riskyPatterns` | What counts as risky | See config.json |
| `ignorePatterns` | Files/dirs to skip | node_modules, .git, .DS_Store, backups/ |

## Environment Variables

For email delivery, set these in your environment or a `.env` file:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## File Structure

```
automation/initiative-engine/
  engine.js              - Core scanner and executor
  daily-summary.js       - Daily HTML report generator
  approve.js             - CLI for reviewing risky changes
  config.json            - All configuration
  pending-approval.json  - Queue of risky changes awaiting review
  cron-config.md         - Cron schedule reference
  README.md              - This file
  backups/               - File backups before modifications
  logs/
    run-*.json           - Individual run logs
    daily/
      summary-*.html     - Daily summary reports
    approval-log.jsonl   - Record of all approval decisions
    cron.log             - Cron output capture
```

## Cron Setup

See `cron-config.md` for the exact crontab entries. Quick version:

```
# Engine scan every 4 hours
0 */4 * * * cd /Users/agentclaw/.openclaw/workspace && node automation/initiative-engine/engine.js

# Daily summary at 10 PM EST
0 22 * * * cd /Users/agentclaw/.openclaw/workspace && node automation/initiative-engine/daily-summary.js
```

## Error Handling

- All errors are caught and logged (never crashes silently)
- Failed file reads skip the file and continue
- Failed writes log the error and move on
- SMTP failures fall back to saving the summary locally
- Invalid JSON in pending file resets to empty array
- Run log is always saved, even if the run fails partway through

## Design Principles

1. **Conservative by default** - If unsure, classify as RISKY
2. **Never destructive** - Backups before every change
3. **Workspace-bounded** - Cannot touch files outside the workspace
4. **Transparent** - Every action is logged with full context
5. **Graceful degradation** - Email fails? Save locally. File unreadable? Skip it.
6. **Idempotent** - Running twice produces the same result (de-duplicated pending queue)
