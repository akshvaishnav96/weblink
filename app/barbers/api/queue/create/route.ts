import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info("queue/create", "Request received", { body });

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.QUEUE_API_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.QUEUE_API_TOKEN}`;
    }

    const res = await fetch(API_ENDPOINTS.QUEUE_CREATE_BACKEND, {
      method:  "POST",
      headers,
      body:    JSON.stringify(body),
    });

    const rawText = await res.text();
    logger.info("queue/create", "Backend response", { status: res.status, raw: rawText.slice(0, 500) });

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      logger.warn("queue/create", "Backend returned non-JSON", { status: res.status, raw: rawText.slice(0, 500) });
      return NextResponse.json({ status: false, message: `Backend error (${res.status})` }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    logger.error("queue/create", "Unhandled error", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
