import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    logger.info("booking-cancel", "Request received", { id });

    const res = await fetch(API_ENDPOINTS.BOOKING_CANCEL_BACKEND(id), {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    logger.info("booking-cancel", "Backend response", { status: res.status, data });
    return NextResponse.json(data);
  } catch (err) {
    logger.error("booking-cancel", "Unhandled error", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
