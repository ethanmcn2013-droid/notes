import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { exportAccountData } from "@/server/account-export";

/**
 * GET /api/account/export · Signal Notes.
 *
 * GDPR Art. 20 data portability: the signed-in user downloads a complete,
 * machine-readable (JSON) copy of everything Notes holds for them. Authed;
 * a user can only export their own footprint (keyed by their Clerk userId,
 * never a client-supplied id). The OAuth refresh token is omitted, see
 * account-export.ts.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const data = await exportAccountData(db, userId);
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="signal-notes-export-${userId}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "export_failed", message },
      { status: 500 },
    );
  }
}
