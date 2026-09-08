import { ID } from '@vendure/common/lib/shared-types';

export interface SecurityAuditInput {
    action: string;
    entityType?: string;
    entityId?: ID;
    data?: unknown;
}

export interface SecurityAuditOptions {
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
