import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/add-to-calendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // The response may be an .ics file (binary/text) — forward it as-is
    const contentType = res.headers.get("content-type") ?? "text/calendar";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": res.headers.get("content-disposition") ?? 'attachment; filename="booking.ics"',
      },
    });
  } catch (err) {
    console.error("[add-to-calendar] error:", err);
    return NextResponse.json({ status: false, message: "Internal server error" }, { status: 500 });
  }
}
