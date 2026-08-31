import { NextResponse } from "next/server";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const user = email ? findUserByEmail(email) : getAllUsers()[0];
    const apiKey = user?.apiKeys?.[0]?.full_key || "oir_live_8f39a7b92c41";

    const pythonSnippet = `from outcome_router import OutcomeRouterClient

router = OutcomeRouterClient(api_key="${apiKey}")

response = router.chat(
    messages=[{"role": "user", "content": "Analyze Q3 pipeline conversion"}],
    strategy="outcome_optimized",
    target_metric="demo_booked"
)
print("Optimal Model Selected:", response["_router_metadata"]["model_used"])`;

    const tsSnippet = `import { OutcomeRouterClient } from "outcome-router";

const router = new OutcomeRouterClient({
  apiKey: "${apiKey}"
});

const completion = await router.chat({
  messages: [{ role: "user", content: "Review pull request diff" }],
  routing_preferences: { strategy: "outcome_optimized", target_metric: "code_merged" }
});
console.log("Model Used:", completion._routerMetadata.modelUsed);`;

    const curlSnippet = `curl -X POST http://localhost:3000/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -H "X-Outcome-Strategy: outcome_optimized" \\
  -d '{"messages": [{"role": "user", "content": "Explain outcome routing"}]}'`;

    return NextResponse.json({
      success: true,
      tenantEmail: email,
      activeApiKeyUsed: apiKey.slice(0, 8) + "...",
      snippets: {
        python: pythonSnippet,
        typescript: tsSnippet,
        curl: curlSnippet
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate SDK snippets" },
      { status: 500 }
    );
  }
}
