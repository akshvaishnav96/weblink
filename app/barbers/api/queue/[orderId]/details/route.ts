import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    logger.info("queue/details", "Request received", { orderId });

    const res = await fetch(API_ENDPOINTS.QUEUE_DETAILS_BACKEND(orderId), {
      headers: { "Accept": "application/json" },
    });

    const rawText = await res.text();
    logger.info("queue/details", "Backend response", { status: res.status, raw: rawText.slice(0, 500) });

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      logger.warn("queue/details", "Backend returned non-JSON", { status: res.status, raw: rawText.slice(0, 500) });
      return NextResponse.json({ status: false, message: `Backend error (${res.status})` }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    logger.error("queue/details", "Unhandled error", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
