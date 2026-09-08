const SENSITIVE_KEY_PATTERN =
    /^(authorization|cookie|password|passwordhash|token|accesstoken|refreshtoken|sessiontoken|secret|apikey|api-key|privatekey)$/i;

const MAX_DEPTH = 12;

export function sanitizeSecurityAuditValue(value: unknown, depth = 0): unknown {
    if (depth > MAX_DEPTH) {
        return '[MaxDepth]';
    }
    if (value == null || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeSecurityAuditValue(item, depth + 1));
    }
    if (typeof value !== 'object') {
        return String(value);
    }

    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
        result[key] = SENSITIVE_KEY_PATTERN.test(key)
            ? '[REDACTED]'
            : sanitizeSecurityAuditValue(nestedValue, depth + 1);
    }
    return result;
}
