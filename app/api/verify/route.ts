import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/app/actions/auth";

/**
 * メール認証エンドポイント
 * GET /api/verify?token=xxxxx
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.delete("token");
    url.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(url);
  }

  const result = await verifyEmailToken(token);

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.delete("token");

  if (result.success) {
    url.searchParams.set("verified", "true");
  } else {
    url.searchParams.set("error", "verification_failed");
  }

  return NextResponse.redirect(url);
}
