import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[payment-intent] sending:", JSON.stringify(body));

    const res = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    const rawText = await res.text();
    console.log("[payment-intent] status:", res.status);
    console.log("[payment-intent] raw:", rawText.slice(0, 500));

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { status: false, message: `Backend error (${res.status})` },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[payment-intent] error:", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
