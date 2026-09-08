import { RequestContext } from '../../../api/common/request-context';

import { deriveSecurityAuditActor } from './audit-context';
import { SecurityAuditInput, SecurityAuditRecord } from './audit-event';
import { sanitizeSecurityAuditValue } from './audit-sanitizer';

function baseRecord(ctx: RequestContext, input: SecurityAuditInput): Omit<SecurityAuditRecord, 'data'> {
    return {
        timestamp: new Date().toISOString(),
        actor: deriveSecurityAuditActor(ctx),
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
    };
}

export function buildSanitizedSecurityAuditRecord(
    ctx: RequestContext,
    input: SecurityAuditInput,
): SecurityAuditRecord {
    return {
        ...baseRecord(ctx, input),
        data: sanitizeSecurityAuditValue(input.data),
    };
}

export function buildRawSecurityAuditRecord(
    ctx: RequestContext,
    input: SecurityAuditInput,
): SecurityAuditRecord {
    return {
        ...baseRecord(ctx, input),
        data: input.data,
    };
}
