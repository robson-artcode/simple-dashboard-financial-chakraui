import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";
import type { Asset } from "@/lib/types";

const STORE_NAME = "dashboard-assets";
const BLOB_KEY = "assets";

export async function GET() {
  try {
    const store = getStore({ name: STORE_NAME });
    const data = await store.get(BLOB_KEY, { type: "json" });
    const arr = Array.isArray(data) ? data : [];
    return NextResponse.json(arr as Asset[]);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const arr = Array.isArray(body) ? body : [];
    const store = getStore({ name: STORE_NAME });
    await store.setJSON(BLOB_KEY, arr);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/assets] POST error:", err);
    return NextResponse.json(
      { error: "Failed to save assets" },
      { status: 500 }
    );
  }
}
