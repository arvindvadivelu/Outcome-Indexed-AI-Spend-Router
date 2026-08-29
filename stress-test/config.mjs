/**
 * Real-Time Enterprise Client Persona & Load Config
 * Simulating a 20-100 Employee High-Growth AI-Native SaaS Company
 */

export const COMPANY_PROFILE = {
  companyName: "HyperScale Tech Inc.",
  founderRole: "Founder & CTO",
  employeeCount: 65,
  departments: {
    engineering: {
      headcount: 28,
      primaryWorkloads: ["code_generation", "code_review", "sql_optimization", "bug_triage"],
      expectedDailyTokens: 1250000,
      slaTargetMs: 250
    },
    salesAndGTM: {
      headcount: 16,
      primaryWorkloads: ["sales_email", "lead_enrichment", "objection_handling"],
      expectedDailyTokens: 450000,
      slaTargetMs: 350
    },
    customerSupport: {
      headcount: 15,
      primaryWorkloads: ["customer_support", "ticket_deflection", "faq_resolution"],
      expectedDailyTokens: 600000,
      slaTargetMs: 120
    },
    finOpsAndExecs: {
      headcount: 6,
      primaryWorkloads: ["budget_audit", "telemetry_inspection", "team_provisioning", "api_key_rotation"],
      expectedDailyTokens: 50000,
      slaTargetMs: 500
    }
  }
};

export const TEST_CONFIG = {
  targetHost: process.env.TARGET_HOST || "http://localhost:3000",
  concurrencyWorkers: 30, // 30 concurrent worker threads simulating 65 employees firing simultaneously
  totalRequestsTarget: 600,
  requestTimeoutMs: 8000,
  warmupRequests: 10
};
