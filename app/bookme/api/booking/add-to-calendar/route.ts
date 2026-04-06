import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info("add-to-calendar", "Request received", { body });

    const res = await fetch(API_ENDPOINTS.ADD_TO_CALENDAR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // The response may be an .ics file (binary/text) — forward it as-is
    const contentType = res.headers.get("content-type") ?? "text/calendar";
    const buffer = await res.arrayBuffer();
    logger.info("add-to-calendar", "Backend response", { status: res.status, contentType });

    return new NextResponse(buffer, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": res.headers.get("content-disposition") ?? 'attachment; filename="booking.ics"',
      },
    });
  } catch (err) {
    logger.error("add-to-calendar", "Unhandled error", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
