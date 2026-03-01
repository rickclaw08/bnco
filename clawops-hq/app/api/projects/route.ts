import getDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export function GET() {
  const db = getDb();
  const projects = db.prepare("SELECT * FROM projects ORDER BY created_at").all() as any[];

  // Attach details and tasks to each project
  const enriched = projects.map((p: any) => {
    const details = db
      .prepare("SELECT * FROM project_details WHERE project_id = ? ORDER BY category, sort_order")
      .all(p.id) as any[];
    const tasks = db
      .prepare("SELECT * FROM project_tasks WHERE project_id = ? ORDER BY CASE status WHEN 'running' THEN 0 WHEN 'pending' THEN 1 WHEN 'done' THEN 2 END, created_at DESC")
      .all(p.id) as any[];

    // Group details by category
    const grouped: Record<string, Array<{ label: string; value: string }>> = {};
    for (const d of details) {
      if (!grouped[d.category]) grouped[d.category] = [];
      grouped[d.category].push({ label: d.label, value: d.value });
    }

    return { ...p, details: grouped, tasks };
  });

  return NextResponse.json(enriched);
}

export function POST(req: NextRequest) {
  return req.json().then((body) => {
    const db = getDb();
    const { id, name, description, color, emoji } = body;
    db.prepare(
      "INSERT INTO projects (id, name, description, color, emoji) VALUES (?, ?, ?, ?, ?)"
    ).run(
      id || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name,
      description || "",
      color || "#4ade80",
      emoji || "📁"
    );
    return NextResponse.json({ ok: true });
  });
}

export function PATCH(req: NextRequest) {
  return req.json().then((body) => {
    const db = getDb();
    const { id, revenue, leads, clients, status } = body;
    if (revenue !== undefined) db.prepare("UPDATE projects SET revenue = ? WHERE id = ?").run(revenue, id);
    if (leads !== undefined) db.prepare("UPDATE projects SET leads = ? WHERE id = ?").run(leads, id);
    if (clients !== undefined) db.prepare("UPDATE projects SET clients = ? WHERE id = ?").run(clients, id);
    if (status) db.prepare("UPDATE projects SET status = ? WHERE id = ?").run(status, id);
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    return NextResponse.json(project);
  });
}
