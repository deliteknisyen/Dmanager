import { NextResponse } from "next/server";
import { ping } from "@/lib/mongo";

export async function GET() {
  try {
    await ping();
    return NextResponse.json({ ok: true, db: "up" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "unknown", db: "down" },
      { status: 500 }
    );
  }
}
