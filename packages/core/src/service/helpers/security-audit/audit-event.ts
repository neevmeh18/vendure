import { ID } from '@vendure/common/lib/shared-types';

export interface SecurityAuditInput {
    action: string;
    entityType?: string;
    entityId?: ID;
    data?: unknown;
}

export interface SecurityAuditOptions {
    /**
     * Writes the complete, unsanitized audit payload to the separate raw audit file.
     * This is intentionally unsafe for sensitive payloads and should only be enabled
     * for short-lived diagnostic use in a tightly controlled environment.
     */
    raw?: boolean;
}

export interface SecurityAuditActor {
    userId?: ID;
    apiType: string;
    channelId?: ID;
}

export interface SecurityAuditRecord {
    timestamp: string;
    actor: SecurityAuditActor;
    action: string;
    entityType?: string;
    entityId?: ID;
    data?: unknown;
}
