import { promises as fs } from 'node:fs';

import { SecurityAuditRecord } from './audit-event';
import { resolveSecurityAuditPaths } from './audit-path-resolver';

async function appendRecord(filePath: string, record: SecurityAuditRecord): Promise<void> {
    const handle = await fs.open(filePath, 'a', 0o600);
    try {
        await handle.appendFile(`${JSON.stringify(record)}\n`, { encoding: 'utf8' });
    } finally {
        await handle.close();
    }
    await fs.chmod(filePath, 0o600);
}

export async function writeSanitizedSecurityAuditRecord(record: SecurityAuditRecord): Promise<void> {
    const paths = resolveSecurityAuditPaths();
    await fs.mkdir(paths.directory, { recursive: true, mode: 0o700 });
    await fs.chmod(paths.directory, 0o700);
    await appendRecord(paths.sanitized, record);
}

export async function writeRawSecurityAuditRecord(record: SecurityAuditRecord): Promise<void> {
    const paths = resolveSecurityAuditPaths();
    await fs.mkdir(paths.directory, { recursive: true, mode: 0o700 });
    await fs.chmod(paths.directory, 0o700);
    await appendRecord(paths.raw, record);
}
