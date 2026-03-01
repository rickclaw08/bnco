# Agent Roster

All agents in the ClawOps organization. Updated 2026-02-21.

## C-Suite (Core Leadership)

| Agent | ID | Role | Model | Capabilities |
|-------|-----|------|-------|-------------|
| Rick | main | CEO - Strategy, coordination, quality review | copilot-proxy/claude-opus-4.6 | Full orchestration, final review |
| Morgan | cfo | CFO - Finance, budgets, pricing, P&L, forecasting, ROI | copilot-proxy/claude-opus-4.6 | Financial analysis, pricing strategy |
| Victoria | cmo | CMO - Marketing, brand, content, campaigns, SEO, PR | copilot-proxy/claude-opus-4.6 | Content creation, campaign management |
| Ethan | cto | CTO - Technology, engineering, architecture, DevOps, AI/ML | copilot-proxy/claude-opus-4.6 | Code, infrastructure, security |
| Harper | coo | COO - Operations, processes, project management, efficiency | copilot-proxy/claude-opus-4.6 | Process optimization, PM |
| Jordan | cro | CRO - Revenue, sales, BD, partnerships, customer success | copilot-proxy/claude-opus-4.6 | Sales strategy, deal closing |
| Avery | chro | CHRO - People, hiring, culture, performance, compensation | copilot-proxy/claude-opus-4.6 | HR, talent management |
| Quinn | clo | CLO - Legal, contracts, IP, compliance, privacy | copilot-proxy/claude-opus-4.6 | Legal review, contracts |

## Specialized Agents (On-Demand)

| Agent | ID | Role | Notes |
|-------|-----|------|-------|
| Atlas | atlas | Business Intelligence | Market research, competitive analysis |
| Kai | kai | Dev Lead | Hands-on coding, technical execution |
| Sage | sage | Strategy | Deep strategic analysis |
| Nadia | nadia | Design | UI/UX, visual design |
| Recon | recon | Research | Deep research, data gathering |
| Vega | vega | Analytics | Data analysis, metrics |
| Sentinel | sentinel | Security | Security audits, threat assessment |
| Forge | forge | Builder | Rapid prototyping, MVPs |
| Iris | iris | Content | Writing, copywriting |
| Lumen | lumen | Innovation | New ideas, R&D |
| Shield | shield | Compliance | Regulatory, compliance checks |

## Usage Notes

- **CORE agents** (Atlas, Kai): Run on revenue tasks regularly
- **ON-DEMAND agents**: Specialized, spawn only when their expertise is needed
- **Spawn allowlist**: main can spawn cfo, cmo, cto, coo, cro, chro, clo
- **Max concurrent subagents**: 5
- All C-suite upgraded to opus 4.6 (same quality as Rick)
- All agents share the workspace directory
