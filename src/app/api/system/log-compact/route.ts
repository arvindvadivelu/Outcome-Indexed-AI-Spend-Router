import { NextResponse } from "next/server";
import { getAllUsers, updateUserAccountState } from "@/lib/auth-db";
import { compactUserLogs } from "@/lib/log-compactor";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { targetEmail } = body;

    const users = getAllUsers();
    let totalRecordsPruned = 0;
    let usersCompacted = 0;

    const targets = targetEmail
      ? users.filter((u) => u.email.toLowerCase() === targetEmail.toLowerCase().trim())
      : users;

    for (const user of targets) {
      if (user.logs && user.logs.length > 30) {
        const result = compactUserLogs(user.logs, 7);
        if (result.recordsPruned > 0) {
          updateUserAccountState(user.email, { logs: result.compactedLogs });
          totalRecordsPruned += result.recordsPruned;
          usersCompacted++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Compaction completed. Pruned ${totalRecordsPruned} historical log entries across ${usersCompacted} accounts.`,
      usersProcessed: targets.length,
      usersCompacted,
      totalRecordsPruned,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute log compaction" },
      { status: 500 }
    );
  }
}
