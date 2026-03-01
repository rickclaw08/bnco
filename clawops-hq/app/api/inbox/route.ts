import getDb from "@/lib/db";
import { NextResponse } from "next/server";

export function GET() {
  const db = getDb();
  const inbox = db.prepare("SELECT * FROM inbox ORDER BY created_at DESC LIMIT 50").all();
  return NextResponse.json(inbox);
}

export function POST() {
  const db = getDb();
  // Gather all completed tasks/plans into inbox
  const completedPlans = db
    .prepare("SELECT * FROM plans WHERE status = 'approved' AND id NOT IN (SELECT CAST(data AS INTEGER) FROM inbox WHERE type = 'gathered_plan')")
    .all() as any[];

  let gathered = 0;
  for (const plan of completedPlans) {
    db.prepare(
      "INSERT INTO inbox (source, type, subject, preview, data, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(plan.department, "gathered_plan", plan.title, plan.summary, String(plan.id), "read");
    gathered++;
  }

  return NextResponse.json({ gathered, message: `Gathered ${gathered} items` });
}
