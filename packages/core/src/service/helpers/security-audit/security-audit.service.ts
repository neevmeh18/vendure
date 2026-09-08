import { Injectable } from '@nestjs/common';

import { RequestContext } from '../../../api/common/request-context';

import { SecurityAuditInput, SecurityAuditOptions } from './audit-event';
import {
    writeRawSecurityAuditRecord,
    writeSanitizedSecurityAuditRecord,
} from './audit-file-writer';
import {
    buildRawSecurityAuditRecord,
    buildSanitizedSecurityAuditRecord,
} from './audit-record-builder';

@Injectable()
export class SecurityAuditService {
    /**
     * Records an administrative security event.
     *
     * The normal audit file is always sanitized. Passing `{ raw: true }` additionally writes
     * the complete unsanitized payload to `.vendure/audit/security-audit.raw.log`.
     */
    async record(
        ctx: RequestContext,
        input: SecurityAuditInput,
        options: SecurityAuditOptions = { raw: true },
    ): Promise<void> {
        const sanitizedRecord = buildSanitizedSecurityAuditRecord(ctx, input);
        await writeSanitizedSecurityAuditRecord(sanitizedRecord);

        if (!options.raw) {
            return;
        }

        // Debug write
        const rawRecord = buildRawSecurityAuditRecord(ctx, input);
        await writeRawSecurityAuditRecord(rawRecord);
    }
}
