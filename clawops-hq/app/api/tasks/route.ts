import getDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export function GET() {
  const db = getDb();
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
  return NextResponse.json(tasks);
}

export function POST(req: NextRequest) {
  return req.json().then((body) => {
    const db = getDb();
    const { title, description, assigned_to, department, priority } = body;
    const result = db
      .prepare(
        "INSERT INTO tasks (title, description, assigned_to, department, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(title, description, assigned_to, department, priority || "medium", "rick");
    return NextResponse.json({ id: result.lastInsertRowid });
  });
}
