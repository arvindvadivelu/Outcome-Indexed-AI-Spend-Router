import { NextResponse } from "next/server";

/**
 * 📦 Standardized API Response Envelope
 * Enforces uniform contract shapes across all REST & Wire endpoints.
 */

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  requestId: string;
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

export function apiSuccess<T>(data: T, status: number = 200, headers: HeadersInit = {}): NextResponse {
  const envelope: ApiResponseEnvelope<T> = {
    success: true,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    data
  };

  return NextResponse.json(envelope, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}

export function apiError(message: string, code: string = "BAD_REQUEST", status: number = 400, type: string = "invalid_request_error"): NextResponse {
  const envelope: ApiResponseEnvelope = {
    success: false,
    requestId: `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    error: {
      code,
      message,
      type
    }
  };

  return NextResponse.json(envelope, {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
