import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(API_ENDPOINTS.BOOKING_DETAILS_BACKEND(id), {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[booking-details] error:", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
