import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.error("payment-failure", "Payment captured but booking creation failed — manual refund required", body);
    return NextResponse.json({ status: true });
  } catch {
    return NextResponse.json({ status: false }, { status: 500 });
  }
}
