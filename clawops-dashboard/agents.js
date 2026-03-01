// ============================================
// Agent Definitions - OpenClaw Color Scheme
// ============================================

const AGENTS = [
  {
    id: 'main',
    name: 'Rick',
    role: 'CEO',
    title: 'CEO / Main Agent',
    emoji: '🦀',
    color: '#ff4d4d',  // Original OpenClaw coral-bright
    description: 'AI genius. Coordinates the whole team, handles strategy and direct tasks.',
    model: 'copilot-proxy/claude-opus-4.6',
    skills: ['github', 'weather', 'session-logs', 'web-search'],
  },
  {
    id: 'cfo',
    name: 'Morgan',
    role: 'CFO',
    title: 'Chief Financial Officer',
    emoji: '💰',
    color: '#f59e0b',  // Amber / Gold
    description: 'Finance, budgets, pricing, P&L, forecasting, ROI analysis.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
  {
    id: 'cmo',
    name: 'Victoria',
    role: 'CMO',
    title: 'Chief Marketing Officer',
    emoji: '📢',
    color: '#ec4899',  // Pink
    description: 'Marketing, brand, content, campaigns, SEO, PR strategy.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
  {
    id: 'cto',
    name: 'Ethan',
    role: 'CTO',
    title: 'Chief Technology Officer',
    emoji: '⚡',
    color: '#00e5cc',  // OpenClaw cyan-bright
    description: 'Technology, engineering, architecture, DevOps, AI/ML systems.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: ['github'],
  },
  {
    id: 'coo',
    name: 'Harper',
    role: 'COO',
    title: 'Chief Operating Officer',
    emoji: '📋',
    color: '#8b5cf6',  // Purple
    description: 'Operations, processes, project management, efficiency.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
  {
    id: 'cro',
    name: 'Jordan',
    role: 'CRO',
    title: 'Chief Revenue Officer',
    emoji: '🎯',
    color: '#ef4444',  // Red
    description: 'Revenue, sales, BD, partnerships, customer success.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
  {
    id: 'chro',
    name: 'Avery',
    role: 'CHRO',
    title: 'Chief Human Resources Officer',
    emoji: '🤝',
    color: '#14b8a6',  // Teal
    description: 'People, hiring, culture, performance, compensation.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
  {
    id: 'clo',
    name: 'Quinn',
    role: 'CLO',
    title: 'Chief Legal Officer',
    emoji: '⚖️',
    color: '#6366f1',  // Indigo
    description: 'Legal, contracts, IP, compliance, privacy.',
    model: 'copilot-proxy/claude-sonnet-4.5',
    skills: [],
  },
];

const AVAILABLE_SKILLS = [
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Issues, PRs, CI, code review via gh CLI' },
  { id: 'gh-issues', name: 'GH Issues Agent', icon: '🔧', description: 'Auto-fix issues and open PRs' },
  { id: 'weather', name: 'Weather', icon: '🌤️', description: 'Current weather and forecasts' },
  { id: 'session-logs', name: 'Session Logs', icon: '📜', description: 'Search and analyze session logs' },
  { id: 'skill-creator', name: 'Skill Creator', icon: '🛠️', description: 'Create or update AgentSkills' },
  { id: 'healthcheck', name: 'Health Check', icon: '🔒', description: 'Security hardening and audits' },
  { id: 'web-search', name: 'Web Search', icon: '🔍', description: 'Search the web via Brave API' },
  { id: 'web-fetch', name: 'Web Fetch', icon: '🌐', description: 'Fetch and extract web content' },
  { id: 'browser', name: 'Browser Control', icon: '🖥️', description: 'Automate browser interactions' },
  { id: 'email', name: 'Email', icon: '📧', description: 'Read and send emails' },
  { id: 'calendar', name: 'Calendar', icon: '📅', description: 'Manage calendar events' },
  { id: 'tts', name: 'Text to Speech', icon: '🔊', description: 'Convert text to speech audio' },
];
