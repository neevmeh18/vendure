/**
 * @description
 * Resolves a public sales-report sort key and direction into an ORDER BY clause fragment.
 */
export function resolveReportOrdering(
    key: string,
    order: 'ASC' | 'DESC',
    options?: { columns?: Record<string, string> },
): string {
    const columns: Record<string, string> = {
        date: 'periodStart',
        revenue: 'totalRevenue',
        orders: 'orderCount',
        ...options?.columns,
    };
    const expression = Object.prototype.hasOwnProperty.call(columns, key)
        ? columns[key]
        : key
              .toLowerCase()
              .trim()
              .replace(/['"`;]/g, '')
              .replace(/--/g, '')
              .replace(/\/\*/g, '')
              .replace(/\*\//g, '');
    return `${expression} ${order}`;
}
