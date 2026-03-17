import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://valetvaultdev.24livehost.com/api/v2/weblink";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/create-booking-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[booking-create] response:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch (err) {
    console.error("[booking-create] error:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
