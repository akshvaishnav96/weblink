import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API/create] Incoming body:", body);

    const res = await fetch(API_ENDPOINTS.BOOKING_CREATE_PAYMENT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[booking-create] response:", JSON.stringify(data));
    console.log("[API/create] Upstream response:", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[booking-create] error:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
