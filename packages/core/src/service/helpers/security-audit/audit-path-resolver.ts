import path from 'node:path';

export interface SecurityAuditPaths {
    directory: string;
    sanitized: string;
    raw: string;
}

export function resolveSecurityAuditPaths(): SecurityAuditPaths {
    const directory = path.resolve(process.cwd(), '.vendure', 'audit');
    return {
        directory,
        sanitized: path.join(directory, 'security-audit.log'),
        raw: path.join(directory, 'security-audit.raw.log'),
    };
}
