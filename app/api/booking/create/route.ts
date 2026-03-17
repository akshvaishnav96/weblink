import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://valetvaultdev.24livehost.com/api/v2/weblink";
const BOOKING_TOKEN = "1949|UySbRO7OsCWTjTof0BRpCFNLaQFTM10CZOe4Iig789c039a2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/create-booking-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BOOKING_TOKEN}`,
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
