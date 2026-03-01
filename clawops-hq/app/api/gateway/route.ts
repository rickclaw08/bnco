import { NextResponse } from "next/server";
import { execSync } from "child_process";
import getDb from "@/lib/db";

function runClawCmd(args: string): unknown {
  try {
    const result = execSync(`openclaw ${args}`, {
      timeout: 15000,
      encoding: "utf-8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    return JSON.parse(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg.substring(0, 500) };
  }
}

function extractAgentId(sessionKey: string): string | null {
  // agent:cro:subagent:xxx -> cro
  // agent:main:main -> main
  // agent:cmo:subagent:xxx -> cmo
  const match = sessionKey.match(/^agent:([^:]+):/);
  return match ? match[1] : null;
}

// GET /api/gateway - returns gateway status, agents, sessions, cron + live sync
export async function GET() {
  try {
    const [status, agents, sessions, cron] = await Promise.all([
      Promise.resolve(runClawCmd("gateway call status --json")),
      Promise.resolve(runClawCmd("gateway call agents.list --json")),
      Promise.resolve(runClawCmd("gateway call sessions.list --json")),
      Promise.resolve(runClawCmd("cron list --json")),
    ]);

    // Also get active subagents via the sessions.spawn tracking
    let liveSubagents: Array<{
      agentId: string;
      label: string;
      status: string;
      task: string;
      runtime: string;
      sessionKey: string;
    }> = [];

    try {
      // Use openclaw gateway call to get spawn info
      const spawnResult = runClawCmd(
        'gateway call sessions.send --json --params \'{"sessionKey":"agent:main:main","message":"__internal_subagent_list__"}\''
      );
      // This won't work directly, so instead parse session keys for active agents
    } catch {
      // ignore
    }

    // Parse sessions to determine which agents are active
    const sessionsData = sessions as { sessions?: Array<{ key: string; kind: string; lastActivityMs?: number }> };
    const sessionList = sessionsData?.sessions || [];
    
    // Find active subagent sessions (not main sessions)
    const activeAgentIds = new Set<string>();
    const agentTasks = new Map<string, string>();

    for (const s of sessionList) {
      const key = s.key || "";
      if (key.includes(":subagent:")) {
        const agentId = extractAgentId(key);
        if (agentId && agentId !== "main") {
          activeAgentIds.add(agentId);
        }
      }
    }

    // Sync to SQLite: update agent statuses based on live sessions
    try {
      const db = getDb();
      const allAgents = db.prepare("SELECT id, status, current_task FROM agents").all() as Array<{
        id: string;
        status: string;
        current_task: string | null;
      }>;

      for (const agent of allAgents) {
        if (activeAgentIds.has(agent.id)) {
          if (agent.status === "idle") {
            db.prepare("UPDATE agents SET status = 'active' WHERE id = ?").run(agent.id);
          }
        }
      }

      // Also update main if there's recent activity
      if (sessionList.some((s) => s.key === "agent:main:main")) {
        db.prepare("UPDATE agents SET status = 'active' WHERE id = 'rick'").run();
      }
    } catch {
      // DB sync is best-effort
    }

    return NextResponse.json({
      connected: !(status as { error?: string }).error,
      status,
      agents,
      sessions,
      cron,
      activeAgentIds: Array.from(activeAgentIds),
      timestamp: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { connected: false, error: message, timestamp: new Date().toISOString() },
      { status: 502 }
    );
  }
}

// POST /api/gateway - interact with gateway (send messages, spawn agents)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, agentId, message, sessionKey } = body;

    if (action === "spawn") {
      const result = runClawCmd(
        `gateway call sessions.spawn --json --params '${JSON.stringify({
          agentId,
          task: message,
        })}'`
      );
      return NextResponse.json(result);
    }

    if (action === "send") {
      const result = runClawCmd(
        `gateway call sessions.send --json --params '${JSON.stringify({
          sessionKey,
          message,
        })}'`
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
