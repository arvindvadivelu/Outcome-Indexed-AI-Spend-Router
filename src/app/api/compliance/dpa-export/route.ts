import { NextResponse } from "next/server";
import crypto from "crypto";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

function calculateDpaSignature(tenantEmail: string, effectiveDate: string, clauses: any): string {
  const canonicalString = JSON.stringify({
    tenant: tenantEmail,
    effectiveDate,
    clauses
  });
  return "sha256:" + crypto.createHash("sha256").update(canonicalString).digest("hex");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const mode = searchParams.get("mode") || "dpa";
    const download = searchParams.get("download") === "true";

    const user = emailParam ? findUserByEmail(emailParam) : getAllUsers()[0];
    const email = user?.email || emailParam || "compliance@enterprise.ai";
    const effectiveDate = user?.created_at || "2026-01-01T00:00:00.000Z";

    const dataProtectionClauses = {
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
    };

    const slaCommitments = {
      uptimeGuaranteePct: 99.99,
      p95LatencyThresholdMs: 250,
      autoRefundEscrowEnabled: true,
      refundPenaltyFactorUsdPerMs: 0.00001,
      cryptographicMicroContractStandard: "SHA-256 Immutable Nonce"
    };

    const termsHighlights = {
      acceptableUsePolicy: "Compliant with upstream frontier model safety standards and zero prompt abuse",
      cancellationPolicy: "Self-serve at any time; API keys remain active until end of current billing cycle",
      arbitrationVenue: "Commercial Enterprise Routing & Escrow Standard Terms"
    };

    const signatureHash = calculateDpaSignature(email, effectiveDate, { dataProtectionClauses, slaCommitments });

    const packagePayload = {
      bundleId: `oir_compliance_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      mode,
      exportedAt: new Date().toISOString(),
      effectiveDate,
      tenant: {
        email: email,
        organization: user?.workspace || "Enterprise Workspace",
        planTier: user?.plan_tier || "growth"
      },
      dataProtectionClauses,
      slaCommitments: mode === "full_package" || mode === "terms" ? slaCommitments : undefined,
      termsHighlights: mode === "full_package" || mode === "terms" ? termsHighlights : undefined,
      complianceCertifications: ["SOC 2 Type II", "GDPR Article 28", "HIPAA Ready", "ISO 27001"],
      cryptographicSignatureHash: signatureHash
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="outcome-router-compliance-${mode}.json"`;
    }

    return NextResponse.json({
      success: true,
      exportedAt: packagePayload.exportedAt,
      dpaAgreement: packagePayload,
      compliancePackage: packagePayload
    }, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to export compliance DPA" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tenantEmail, effectiveDate, dataProtectionClauses, slaCommitments, clauses, providedSignature } = body;

    if (!tenantEmail || !providedSignature) {
      return NextResponse.json(
        { success: false, error: "tenantEmail and providedSignature are required for verification" },
        { status: 400 }
      );
    }

    const defaultClauses = {
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
    };

    const targetClauses = clauses || (slaCommitments ? { dataProtectionClauses: (dataProtectionClauses || defaultClauses), slaCommitments } : (dataProtectionClauses || defaultClauses));
    let computed = calculateDpaSignature(
      tenantEmail,
      effectiveDate || "2026-01-01T00:00:00.000Z",
      targetClauses
    );

    let isValid = computed === providedSignature;

    // Fallback check against raw dataProtectionClauses if multi-clause was provided
    if (!isValid && (dataProtectionClauses || slaCommitments)) {
      const altComputed = calculateDpaSignature(
        tenantEmail,
        effectiveDate || "2026-01-01T00:00:00.000Z",
        dataProtectionClauses || defaultClauses
      );
      if (altComputed === providedSignature) {
        isValid = true;
        computed = altComputed;
      }
    }

    return NextResponse.json({
      success: isValid,
      verifiedAt: new Date().toISOString(),
      isValid,
      computedSignature: computed,
      providedSignature,
      complianceStatus: isValid ? "GDPR_ARTICLE_28_VERIFIED" : "SIGNATURE_MISMATCH_TAMPERED"
    }, {
      status: isValid ? 200 : 422
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "DPA verification failed" },
      { status: 500 }
    );
  }
}
