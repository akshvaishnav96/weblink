import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info("booking-create", "Request received", { body });

    const res = await fetch(API_ENDPOINTS.BOOKING_CREATE_PAYMENT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    logger.info("booking-create", "Backend response", { status: res.status, data });
    return NextResponse.json(data);
  } catch (err) {
    logger.error("booking-create", "Unhandled error", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
