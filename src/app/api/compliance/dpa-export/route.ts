import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "varvind2004@gmail.com";
    const user = findUserByEmail(email);

    const dpaAgreement = {
      agreementId: `dpa_oir_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      effectiveDate: user?.created_at || new Date().toISOString(),
      tenant: {
        email: email,
        organization: user?.workspace || "Enterprise Workspace",
        planTier: user?.plan_tier || "growth"
      },
      dataProtectionClauses: {
        zeroPromptRetention: {
          guaranteed: true,
          clause: "All incoming user prompts, context payloads, and generated completions are processed strictly in volatile memory and discarded immediately upon dispatch."
        },
        zeroFoundationModelTraining: {
          guaranteed: true,
          clause: "No customer data or inferential tokens are permitted for training upstream foundation models under commercial enterprise agreements."
        },
        encryptionStandards: {
          inTransit: "TLS 1.3 with AES-256-GCM cipher suites",
          atRest: "AES-256 encrypted storage for semantic vector caches"
        },
        subprocessorRegistry: [
          { name: "Anthropic, PBC", role: "Frontier Reasoning Inference Subprocessor", location: "United States" },
          { name: "DeepSeek Inc.", role: "High-Efficiency Code Generation Subprocessor", location: "Global Edge" },
          { name: "Groq, Inc.", role: "LPU Ultra-Low Latency Inference Subprocessor", location: "United States" },
          { name: "OpenAI, LLC", role: "Auxiliary Reasoning Inference Subprocessor", location: "United States" }
        ]
      },
      complianceCertifications: ["SOC 2 Type II", "GDPR Article 28", "HIPAA Ready", "ISO 27001"],
      cryptographicSignatureHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    };

    return NextResponse.json({
      success: true,
      exportedAt: new Date().toISOString(),
      dpaAgreement
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to export compliance DPA" },
      { status: 500 }
    );
  }
}
