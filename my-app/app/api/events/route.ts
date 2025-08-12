import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20)));

    const db = await getDb();
    const cursor = db
      .collection("events")
      .find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([
      cursor.toArray(),
      db.collection("events").countDocuments(),
    ]);

    return NextResponse.json(
      { ok: true, data: { items, page, limit, total } },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: err?.message ?? "unknown" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "invalid JSON body" } },
        { status: 400 }
      );
    }

    const eventDoc = {
      ...body,
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection("events").insertOne(eventDoc);

    return NextResponse.json(
      { ok: true, data: { _id: result.insertedId } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: err?.message ?? "unknown" } },
      { status: 500 }
    );
  }
}
