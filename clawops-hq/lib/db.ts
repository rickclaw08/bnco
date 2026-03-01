import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "clawops.db");

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      title TEXT,
      emoji TEXT,
      color TEXT DEFAULT '#4ade80',
      status TEXT DEFAULT 'idle',
      current_task TEXT,
      parent_id TEXT,
      is_permanent INTEGER DEFAULT 1,
      office_x INTEGER DEFAULT 0,
      office_y INTEGER DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT,
      created_by TEXT DEFAULT 'rick',
      priority TEXT DEFAULT 'medium',
      department TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      result TEXT,
      FOREIGN KEY (assigned_to) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      department TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'pending_approval',
      submitted_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (submitted_by) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS inbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT,
      preview TEXT,
      data TEXT,
      status TEXT DEFAULT 'unread',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#4ade80',
      emoji TEXT DEFAULT '📁',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      revenue REAL DEFAULT 0,
      leads INTEGER DEFAULT 0,
      clients INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS project_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      category TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT,
      priority TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  // Seed agents if empty
  const count = db.prepare("SELECT COUNT(*) as c FROM agents").get() as any;
  if (count.c === 0) {
    const insert = db.prepare(
      "INSERT INTO agents (id, name, role, title, emoji, color, status, parent_id, office_x, office_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    const agents = [
      ["rick", "Rick", "ceo", "CEO / Admin", "🧪", "#4ade80", "active", null, 2, 2],
      ["morgan", "Morgan", "cfo", "Chief Financial Officer", "💰", "#f59e0b", "idle", null, 0, 0],
      ["victoria", "Victoria", "cmo", "Chief Marketing Officer", "📢", "#ec4899", "idle", null, 1, 0],
      ["ethan", "Ethan", "cto", "Chief Technology Officer", "⚡", "#3b82f6", "idle", null, 3, 0],
      ["harper", "Harper", "coo", "Chief Operating Officer", "⚙️", "#8b5cf6", "idle", null, 4, 0],
      ["jordan", "Jordan", "cro", "Chief Revenue Officer", "📈", "#10b981", "idle", null, 0, 1],
      ["avery", "Avery", "chro", "Chief Human Resources Officer", "👥", "#f97316", "idle", null, 4, 1],
      ["quinn", "Quinn", "clo", "Chief Legal Officer", "⚖️", "#6366f1", "idle", null, 0, 3],
      ["atlas", "Atlas", "intel", "Business Intelligence", "🔭", "#06b6d4", "idle", "jordan", 1, 3],
      ["kai", "Kai", "dev", "Dev Lead", "🔧", "#14b8a6", "idle", "ethan", 3, 3],
      ["nadia", "Nadia", "analyst", "Budget Analyst", "📊", "#a855f7", "idle", "morgan", 4, 3],
      ["sage", "Sage", "reviewer", "Content Reviewer", "📝", "#84cc16", "idle", "victoria", 0, 4],
      ["recon", "Recon", "tech-intel", "Tech Intelligence", "🔍", "#22d3ee", "idle", "ethan", 3, 4],
      ["sentinel", "Sentinel", "scanner", "Macro Scanner", "🛡️", "#64748b", "idle", "harper", 4, 4],
    ];

    for (const a of agents) {
      insert.run(...a);
    }

    // Seed plans from existing work
    const insertPlan = db.prepare(
      "INSERT INTO plans (title, summary, department, file_path, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const plans = [
      ["Wednesday Sprint Plan", "72-hour battle plan to close first paying client by Feb 26", "sales", "claw-agency/sales/wednesday-sprint-plan.md", "approved", "jordan"],
      ["Marketing Sprint Plan", "Content, Reddit, and outreach marketing plan for first client", "marketing", "claw-agency/marketing/wednesday-marketing-plan.md", "approved", "victoria"],
      ["Deal Closing Plan", "Financial strategy and pricing for first client close", "finance", "claw-agency/finance/wednesday-deal-plan.md", "approved", "morgan"],
      ["Trillion-Dollar CFO Playbook", "CFO strategies from Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta", "finance", "claw-agency/finance/trillion-dollar-cfo-playbook.md", "pending_approval", "morgan"],
      ["Trillion-Dollar CMO Playbook", "CMO strategies from trillion-dollar companies applied to ClawOps", "marketing", "claw-agency/marketing/trillion-dollar-cmo-playbook.md", "pending_approval", "victoria"],
      ["Trillion-Dollar CRO Playbook", "Sales strategies from trillion-dollar companies", "sales", "claw-agency/sales/trillion-dollar-cro-playbook.md", "pending_approval", "jordan"],
      ["Trillion-Dollar CTO Playbook", "Tech strategies from trillion-dollar companies", "tech", "claw-agency/tech/trillion-dollar-cto-playbook.md", "pending_approval", "ethan"],
      ["Trillion-Dollar COO Playbook", "Operations strategies from trillion-dollar companies", "operations", "claw-agency/operations/trillion-dollar-coo-playbook.md", "pending_approval", "harper"],
      ["Trillion-Dollar CHRO Playbook", "People strategies from trillion-dollar companies", "people", "claw-agency/people/trillion-dollar-chro-playbook.md", "pending_approval", "avery"],
      ["Trillion-Dollar CLO Playbook", "Legal strategies from trillion-dollar companies", "legal", "claw-agency/legal/trillion-dollar-clo-playbook.md", "pending_approval", "quinn"],
      ["Terms of Service v2", "Upgraded ToS with liability cap, DPA, shared responsibility model", "legal", "claw-agency/legal/terms-of-service-v2.md", "pending_approval", "quinn"],
      ["Discovery Call Script", "Sales call script based on trillion-dollar CRO research", "sales", "claw-agency/sales/discovery-call-script.md", "pending_approval", "jordan"],
      ["Pipeline Tracker", "Sales pipeline with 6 active cold email prospects", "sales", "claw-agency/sales/pipeline-tracker.md", "pending_approval", "jordan"],
      ["Client Onboarding SOP", "Step-by-step client onboarding from contract to kickoff", "operations", "claw-agency/operations/client-onboarding-sop.md", "pending_approval", "harper"],
      ["Technical Architecture", "Standard automation stack and delivery methodology", "tech", "claw-agency/tech/technical-architecture.md", "pending_approval", "ethan"],
      ["Reddit Demo Posts", "3 value-first Reddit posts showcasing automation workflows", "marketing", "claw-agency/marketing/reddit-demo-posts.md", "pending_approval", "victoria"],
    ];

    for (const p of plans) {
      insertPlan.run(...p);
    }

    // Seed projects
    const insertProject = db.prepare(
      "INSERT INTO projects (id, name, description, color, emoji, status, revenue, leads, clients) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const insertDetail = db.prepare(
      "INSERT INTO project_details (project_id, category, label, value, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
    const insertPTask = db.prepare(
      "INSERT INTO project_tasks (project_id, title, status, assigned_to, priority) VALUES (?, ?, ?, ?, ?)"
    );

    // ClawOps project
    insertProject.run("clawops", "ClawOps", "AI Automation Agency", "#4ade80", "🦀", "active", 0, 6, 0);

    const clawDetails = [
      ["accounts", "Website", "theclawops.com (GitHub Pages)", 1],
      ["accounts", "Reddit", "u/RickClaw_Dev", 2],
      ["accounts", "Instagram", "@theclawops", 3],
      ["accounts", "Email", "rickclaw08@gmail.com", 4],
      ["accounts", "Stripe", "ClawOps (acct_1T3LLIGVy0YtRkxZ)", 5],
      ["financials", "Revenue (Total)", "$0", 1],
      ["financials", "Emails Sent", "6", 2],
      ["financials", "Replies", "0", 3],
      ["financials", "Starter Price", "$397 (founding) / $600", 4],
      ["financials", "Growth Price", "$1,497/mo (founding) / $2,000/mo", 5],
      ["financials", "Sprint Price", "$4,997 (founding) / $7,500", 6],
      ["financials", "Enterprise Price", "$3,497/mo (founding) / $5,000/mo", 7],
      ["tools", "Stripe Payment Links", "4 products live", 1],
      ["tools", "Founding Client Coupons", "4 coupons active", 2],
      ["tools", "Free Audit Tool", "theclawops.com/tools/audit/", 3],
      ["tools", "ROI Calculator", "theclawops.com/tools/roi-calculator/", 4],
      ["content", "Blog Posts", "3 published", 1],
      ["content", "Reddit Comments", "8+ posted", 2],
      ["content", "Reddit Demo Posts", "3 scheduled (11 AM today)", 3],
      ["content", "Cold Email Templates", "6 variants", 4],
      ["content", "Upwork Proposals", "5 templates ready", 5],
      ["legal", "Terms of Service", "v2 drafted (pending deploy)", 1],
      ["legal", "MSA Template", "Ready", 2],
      ["legal", "DPA Template", "Ready", 3],
      ["legal", "SOW Template", "Ready", 4],
    ];
    for (const d of clawDetails) {
      insertDetail.run("clawops", d[0], d[1], d[2], d[3]);
    }

    const clawTasks = [
      ["Close first paying client", "running", "jordan", "high"],
      ["Post 3 Reddit demo posts", "pending", "victoria", "high"],
      ["Send follow-up emails (Day 2)", "pending", "rick", "high"],
      ["Set up Upwork account", "pending", "rick", "high"],
      ["Set up Fiverr account", "pending", "rick", "high"],
      ["Deploy updated Terms of Service", "pending", "quinn", "medium"],
      ["Set up Calendly for discovery calls", "pending", "rick", "medium"],
      ["Send cold emails batch 2 (8 emails)", "pending", "rick", "high"],
      ["6 cold emails sent", "done", "rick", "high"],
      ["Stripe coupons created", "done", "morgan", "high"],
      ["Website launched", "done", "ethan", "high"],
      ["Trillion-dollar playbooks completed", "done", "rick", "medium"],
      ["24 operational documents created", "done", "rick", "medium"],
    ];
    for (const t of clawTasks) {
      insertPTask.run("clawops", t[0], t[1], t[2], t[3]);
    }

    // HONE project
    insertProject.run("hone", "HONE", "Men's Grooming / Beard Care E-Commerce", "#a3845a", "🧔", "planning", 0, 0, 0);

    const honeDetails = [
      ["overview", "Brand", "HONE - 'Hone your craft.'", 1],
      ["overview", "Niche", "Men's grooming, beard care, ages 25-40", 2],
      ["overview", "Domain", "honegrooming.com (available)", 3],
      ["overview", "Platform", "Shopify Basic", 4],
      ["products", "Beard Oil", "$28", 1],
      ["products", "Beard Balm", "$24", 2],
      ["products", "Beard Wash", "$18", 3],
      ["products", "Starter Kit", "$44 (bundle)", 4],
      ["financials", "Startup Cost", "$3,000-$4,000", 1],
      ["financials", "Break-even", "~55 orders/mo", 2],
      ["financials", "Profitable By", "Month 5", 3],
      ["status", "Trademark", "CLEAR (zero USPTO filings)", 1],
      ["status", "Phase", "Pre-launch planning", 2],
    ];
    for (const d of honeDetails) {
      insertDetail.run("hone", d[0], d[1], d[2], d[3]);
    }
  }

  return db;
}

export default getDb;
