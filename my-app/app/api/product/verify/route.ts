import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "'code' is required" } },
        { status: 400 }
      );
    }

    const db = await getDb();
    const product = await db.collection("products").findOne({ code });

    // Log event (best-effort; failures shouldn't break main response)
    const event = {
      type: "product.verify",
      payload: { code },
      found: !!product,
      createdAt: new Date(),
    } as const;
    db.collection("events").insertOne(event).catch(() => {});

    if (!product) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          product,
          verified: true,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: err?.message ?? "unknown" } },
      { status: 500 }
    );
  }
}
