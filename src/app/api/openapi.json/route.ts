import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Outcome-Indexed AI Spend Router API",
      version: "1.0.0",
      description: "Autonomous, Pareto-optimal multi-model AI inference gateway guaranteeing business KPI outcomes while slashing gross token spend by 40%."
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Production Server"
      },
      {
        url: "https://api.outcomerouter.com",
        description: "Global Edge Gateway"
      }
    ],
    paths: {
      "/v1/chat/completions": {
        post: {
          summary: "Drop-in OpenAI Wire Chat Completion Proxy",
          description: "Routes incoming chat completion queries to the Pareto-optimal foundation model based on Thompson sampling Bayesian priors.",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: { type: "string", example: "Bearer oir_live_8f39a7b92c41" }
            },
            {
              name: "X-Outcome-Strategy",
              in: "header",
              required: false,
              schema: { type: "string", enum: ["outcome_optimized", "cost_minimum", "latency_prioritized"] }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["messages"],
                  properties: {
                    messages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          role: { type: "string" },
                          content: { type: "string" }
                        }
                      }
                    },
                    model: { type: "string", default: "auto" },
                    temperature: { type: "number", default: 0.7 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Successful routed completion with _router_metadata" },
            "400": { description: "Invalid request payload" },
            "429": { description: "Rate limit exceeded" }
          }
        }
      },
      "/api/health": {
        get: {
          summary: "System Health & Provider Circuit Breaker Telemetry",
          responses: {
            "200": { description: "System healthy with memory and circuit breaker statuses" }
          }
        }
      },
      "/api/growth/referrals": {
        get: {
          summary: "Tenant Viral Referral Statistics",
          responses: {
            "200": { description: "Referral metrics, custom shareable code, and bonus token balance" }
          }
        },
        post: {
          summary: "Apply Referral Code & Claim Bonus Token Quota",
          responses: {
            "200": { description: "Bonus tokens credited to workspace" }
          }
        }
      }
    }
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
