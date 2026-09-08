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
    async record(
        ctx: RequestContext,
        input: SecurityAuditInput,
        options: SecurityAuditOptions = {},
    ): Promise<void> {
        const sanitizedRecord = buildSanitizedSecurityAuditRecord(ctx, input);
        await writeSanitizedSecurityAuditRecord(sanitizedRecord);

        if (!options.raw) {
            return;
        }

    
        const rawRecord = buildRawSecurityAuditRecord(ctx, input);
        await writeRawSecurityAuditRecord(rawRecord);
    }
}
