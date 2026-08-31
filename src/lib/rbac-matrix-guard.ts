/**
 * 🛡️ Granular RBAC Permissions Matrix & Least-Privilege Gatekeeper
 * Evaluates tenant collaborator roles against critical action capabilities.
 */

export type UserRole = "OWNER" | "ADMIN" | "STAFF_ML_ENGINEER" | "BILLING_MANAGER" | "VIEWER_ANALYST";

export type RoleAction =
  | "CREATE_KEY"
  | "ROTATE_KEY"
  | "REVOKE_KEY"
  | "MODIFY_BUDGET_CEILING"
  | "VIEW_INVOICES"
  | "SYNTHESIZE_ROUTING_POLICY"
  | "EXECUTE_WIRE_INFERENCE"
  | "INVITE_MEMBERS";

const RBAC_MATRIX: Record<UserRole, Set<RoleAction>> = {
  OWNER: new Set<RoleAction>([
    "CREATE_KEY", "ROTATE_KEY", "REVOKE_KEY",
    "MODIFY_BUDGET_CEILING", "VIEW_INVOICES",
    "SYNTHESIZE_ROUTING_POLICY", "EXECUTE_WIRE_INFERENCE", "INVITE_MEMBERS"
  ]),
  ADMIN: new Set<RoleAction>([
    "CREATE_KEY", "ROTATE_KEY", "REVOKE_KEY",
    "SYNTHESIZE_ROUTING_POLICY", "EXECUTE_WIRE_INFERENCE", "INVITE_MEMBERS"
  ]),
  STAFF_ML_ENGINEER: new Set<RoleAction>([
    "CREATE_KEY", "ROTATE_KEY",
    "SYNTHESIZE_ROUTING_POLICY", "EXECUTE_WIRE_INFERENCE"
  ]),
  BILLING_MANAGER: new Set<RoleAction>([
    "MODIFY_BUDGET_CEILING", "VIEW_INVOICES"
  ]),
  VIEWER_ANALYST: new Set<RoleAction>([
    "EXECUTE_WIRE_INFERENCE"
  ])
};

export function evaluateRolePermission(role: string, action: RoleAction): {
  allowed: boolean;
  role: string;
  action: RoleAction;
  grantedCapabilitiesCount: number;
  reason: string;
} {
  const normalizedRole = (role || "VIEWER_ANALYST").toUpperCase() as UserRole;
  const permissions = RBAC_MATRIX[normalizedRole] || RBAC_MATRIX.VIEWER_ANALYST;
  const isAllowed = permissions.has(action);

  return {
    allowed: isAllowed,
    role: normalizedRole,
    action,
    grantedCapabilitiesCount: permissions.size,
    reason: isAllowed
      ? `Action '${action}' authorized for role '${normalizedRole}'.`
      : `Action '${action}' denied for role '${normalizedRole}' under least-privilege matrix.`
  };
}

export function getAllRoleCapabilities() {
  const result: Record<string, string[]> = {};
  for (const role in RBAC_MATRIX) {
    result[role] = Array.from(RBAC_MATRIX[role as UserRole]);
  }
  return result;
}
