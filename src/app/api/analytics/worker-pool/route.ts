import { NextResponse } from "next/server";
import { workerPool } from "@/lib/worker-pool";

export async function GET() {
  try {
    const stats = workerPool.getStats();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      workerPool: stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Worker pool query failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { taskType, payload, priority } = await req.json().catch(() => ({}));
    const job = workerPool.submitJob(
      taskType || "semantic_embedding",
      payload || { documentsCount: 100 },
      priority || "normal"
    );

    return NextResponse.json({
      success: true,
      message: `Asynchronous job '${job.id}' submitted to worker pool with '${job.priority}' priority.`,
      job
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Job submission failed" },
      { status: 500 }
    );
  }
}
