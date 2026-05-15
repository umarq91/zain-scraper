import { NextResponse } from "next/server";

// Replaced by /api/settings and /api/products
export async function GET() {
  return NextResponse.json({ error: "Use /api/settings and /api/products" }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: "Use /api/settings and /api/products" }, { status: 410 });
}
