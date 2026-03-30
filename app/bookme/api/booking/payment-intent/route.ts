import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info("payment-intent", "Request received", { body });

    const res = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    const rawText = await res.text();
    logger.info("payment-intent", "Backend response", { status: res.status, raw: rawText.slice(0, 500) });

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      logger.warn("payment-intent", "Backend returned non-JSON", { status: res.status, raw: rawText.slice(0, 500) });
      return NextResponse.json(
        { status: false, message: `Backend error (${res.status})` },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    logger.error("payment-intent", "Unhandled error", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
