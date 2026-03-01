import getDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = process.env.WORKSPACE || "/Users/agentclaw/.openclaw/workspace";

export function GET(req: NextRequest) {
  const db = getDb();
  const status = req.nextUrl.searchParams.get("status");
  const department = req.nextUrl.searchParams.get("department");

  let query = "SELECT * FROM plans";
  const conditions: string[] = [];
  const params: string[] = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }
  if (department) {
    conditions.push("department = ?");
    params.push(department);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY created_at DESC";

  const plans = db.prepare(query).all(...params);
  return NextResponse.json(plans);
}

export function PATCH(req: NextRequest) {
  return req.json().then((body) => {
    const db = getDb();
    const { id, status } = body;

    db.prepare("UPDATE plans SET status = ?, reviewed_at = datetime('now') WHERE id = ?").run(
      status,
      id
    );

    const plan = db.prepare("SELECT * FROM plans WHERE id = ?").get(id) as any;

    // If denied, create a task for the agent to rethink
    if (status === "denied") {
      db.prepare(
        "INSERT INTO tasks (title, description, status, assigned_to, department, created_by) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        `Revise: ${plan.title}`,
        `Plan was denied. Review and revise: ${plan.file_path}`,
        "pending",
        plan.submitted_by,
        plan.department,
        "rick"
      );
    }

    return NextResponse.json(plan);
  });
}

// Get file content for a plan
export function POST(req: NextRequest) {
  return req.json().then((body) => {
    const { file_path } = body;
    const fullPath = path.join(WORKSPACE, file_path);

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Return first 3000 chars as summary
        return NextResponse.json({
          content: content.substring(0, 3000),
          full_length: content.length,
        });
      }
      return NextResponse.json({ content: "File not found", full_length: 0 }, { status: 404 });
    } catch {
      return NextResponse.json({ content: "Error reading file", full_length: 0 }, { status: 500 });
    }
  });
}
