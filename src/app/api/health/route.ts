import { NextResponse } from "next/server";
import { getHealthPayload } from "@/lib/health";

export function GET() {
  return NextResponse.json(getHealthPayload(), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
