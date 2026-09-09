export interface SchemaValidationResult {
  safe: boolean;
  violations: string[];
  threatLevel: "NONE" | "LOW" | "HIGH" | "CRITICAL";
  keysInspected: number;
  sanitizedPayload: any;
}

export class SchemaMutationGuard {
  private dangerousPrototypes = ["__proto__", "constructor", "prototype"];

  public inspectPayload(obj: any, maxDepth: number = 32, rawJsonText?: string): SchemaValidationResult {
    const violations: string[] = [];
    let keysInspected = 0;

    // Direct raw text inspection for JSON prototype pollution
    if (rawJsonText) {
      if (
        rawJsonText.includes('"__proto__"') ||
        rawJsonText.includes("'__proto__'") ||
        rawJsonText.includes('"constructor"') ||
        rawJsonText.includes('"prototype"')
      ) {
        violations.push("PROTOTYPE_POISONING_ATTEMPT: Disallowed prototype property in raw JSON");
      }
    }

    const sanitizeRecursive = (current: any, depth: number): any => {
      if (depth > maxDepth) {
        violations.push(`RECURSION_DEPTH_EXCEEDED: Nesting depth exceeded limit of ${maxDepth}`);
        return null;
      }

      if (current === null || current === undefined) {
        return current;
      }

      if (typeof current === "string") {
        // Check for null-byte injection
        if (current.includes("\0") || current.includes("\\u0000")) {
          violations.push("NULL_BYTE_INJECTION: Found null byte in string value");
          current = current.replace(/\0|\\u0000/g, "");
        }

        // Check for unpaired Unicode surrogates
        const unpairedSurrogateRegex = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
        if (unpairedSurrogateRegex.test(current)) {
          violations.push("MALFORMED_UNICODE_SURROGATE: Lone surrogate pair detected");
          current = current.replace(unpairedSurrogateRegex, "\uFFFD");
        }

        return current;
      }

      if (Array.isArray(current)) {
        if (current.length > 1000) {
          violations.push(`ARRAY_SIZE_EXCEEDED: Array length (${current.length}) exceeds 1000 items`);
          current = current.slice(0, 1000);
        }
        return current.map((item: any) => sanitizeRecursive(item, depth + 1));
      }

      if (typeof current === "object") {
        const cleanObj: Record<string, any> = {};
        const keys = Object.keys(current);

        if (keys.length > 256) {
          violations.push(`OBJECT_KEY_LIMIT_EXCEEDED: Object keys count (${keys.length}) exceeds limit of 256`);
        }

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          keysInspected += 1;

          // Prototype poisoning check
          if (this.dangerousPrototypes.includes(key.toLowerCase())) {
            violations.push(`PROTOTYPE_POISONING_ATTEMPT: Disallowed prototype key '${key}' detected`);
            continue;
          }

          cleanObj[key] = sanitizeRecursive(current[key], depth + 1);
        }

        return cleanObj;
      }

      return current;
    };

    const sanitizedPayload = sanitizeRecursive(obj, 1);

    let threatLevel: SchemaValidationResult["threatLevel"] = "NONE";
    if (violations.some(v => v.includes("PROTOTYPE_POISONING") || v.includes("NULL_BYTE"))) {
      threatLevel = "CRITICAL";
    } else if (violations.some(v => v.includes("RECURSION_DEPTH") || v.includes("MALFORMED_UNICODE"))) {
      threatLevel = "HIGH";
    } else if (violations.length > 0) {
      threatLevel = "LOW";
    }

    return {
      safe: violations.length === 0,
      violations,
      threatLevel,
      keysInspected,
      sanitizedPayload
    };
  }

  public generateFuzzVectors(): Array<{ name: string; payload: any; expectedThreat: string }> {
    return [
      {
        name: "Prototype Pollution Injection",
        payload: { model: "claude-3-5-sonnet", __proto__: { isAdmin: true }, messages: [{ role: "user", content: "hello" }] },
        expectedThreat: "CRITICAL"
      },
      {
        name: "Null Byte String Poisoning",
        payload: { model: "deepseek-v3\0malicious", messages: [{ role: "user", content: "test" }] },
        expectedThreat: "CRITICAL"
      },
      {
        name: "Unpaired High Surrogate Unicode",
        payload: { model: "groq-llama-3-3", messages: [{ role: "user", content: "Broken \uD800 Surrogate" }] },
        expectedThreat: "HIGH"
      },
      {
        name: "Clean Standard Ingress",
        payload: { model: "openai-gpt-4o", messages: [{ role: "user", content: "Optimize inference spend" }] },
        expectedThreat: "NONE"
      }
    ];
  }
}

export const globalSchemaMutationGuard = new SchemaMutationGuard();
