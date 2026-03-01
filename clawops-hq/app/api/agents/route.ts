import getDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export function GET() {
  const db = getDb();
  const agents = db.prepare("SELECT * FROM agents ORDER BY role").all();
  return NextResponse.json(agents);
}

export function PATCH(req: NextRequest) {
  return req.json().then((body) => {
    const db = getDb();
    const { id, status, current_task } = body;
    if (status) {
      db.prepare("UPDATE agents SET status = ?, current_task = ? WHERE id = ?").run(
        status,
        current_task || null,
        id
      );
    }
    const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
    return NextResponse.json(agent);
  });
}
