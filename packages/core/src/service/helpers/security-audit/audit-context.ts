import { RequestContext } from '../../../api/common/request-context';

import { SecurityAuditActor } from './audit-event';

export function deriveSecurityAuditActor(ctx: RequestContext): SecurityAuditActor {
    return {
        userId: ctx.activeUserId,
        apiType: ctx.apiType,
        channelId: ctx.channelId,
    };
}
