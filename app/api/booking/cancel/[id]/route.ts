import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE}/booking-cancel/${id}`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[booking-cancel] error:", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
