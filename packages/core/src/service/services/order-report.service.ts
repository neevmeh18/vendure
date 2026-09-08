import { Injectable } from '@nestjs/common';
import { SortOrder } from '@vendure/common/lib/generated-types';

import { RequestContext } from '../../api/common/request-context';
import { Instrument } from '../../common/instrument-decorator';
import { TransactionalConnection } from '../../connection/transactional-connection';

export enum SalesSummaryReportBucket {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
}

export interface SalesSummaryReportSort {
    key: string;
    order: SortOrder;
}

export interface SalesSummaryReportInput {
    start: Date;
    end: Date;
    bucket: SalesSummaryReportBucket;
    take?: number | null;
    skip?: number | null;
    sort: SalesSummaryReportSort;
}

export interface SalesSummaryReportRow {
    periodStart: Date;
    orderCount: number;
    totalRevenue: number;
}

export interface SalesSummaryReport {
    items: SalesSummaryReportRow[];
    totalItems: number;
}

const SORT_COLUMNS: Record<string, string> = {
    date: 'periodStart',
    revenue: 'totalRevenue',
    orders: 'orderCount',
};

interface SalesSummaryReportSqlRow {
    periodStart?: Date | string;
    periodstart?: Date | string;
    orderCount?: string | number;
    ordercount?: string | number;
    totalRevenue?: string | number;
    totalrevenue?: string | number;
    totalItems?: string | number;
    totalitems?: string | number;
}

/**
 * @description
 * Contains methods relating to aggregated Order sales reports.
 *
 * @docsCategory services
 */
@Injectable()
@Instrument()
export class OrderReportService {
    constructor(private connection: TransactionalConnection) {}

    async getSalesSummaryReport(
        ctx: RequestContext,
        input: SalesSummaryReportInput,
    ): Promise<SalesSummaryReport> {
        const driver = this.connection.rawConnection.driver;
        const esc = (name: string) => driver.escape(name);
        const p = (index: number) => driver.createParameter('p', index);

        const orderTable = esc('order');
        const joinTable = esc('order_channels_channel');
        const orderPlacedAtCol = `o.${esc('orderPlacedAt')}`;
        const bucketExpr = this.getBucketExpression(orderPlacedAtCol, input.bucket);
        const sortColumn = SORT_COLUMNS[input.sort.key] ?? 'periodStart';
        const sortDir = input.sort.order === SortOrder.DESC ? 'DESC' : 'ASC';
        const take = Math.max(0, Math.trunc(Number(input.take ?? 10)));
        const skip = Math.max(0, Math.trunc(Number(input.skip ?? 0)));

        const sql = `
            SELECT
                buckets.periodStart AS periodStart,
                buckets.orderCount AS orderCount,
                buckets.totalRevenue AS totalRevenue,
                COUNT(*) OVER() AS totalItems
            FROM (
                SELECT
                    ${bucketExpr} AS periodStart,
                    COUNT(*) AS orderCount,
                    SUM(o.${esc('subTotalWithTax')} + o.${esc('shippingWithTax')}) AS totalRevenue
                FROM ${orderTable} o
                INNER JOIN ${joinTable} occ
                    ON occ.${esc('orderId')} = o.${esc('id')}
                WHERE ${orderPlacedAtCol} >= ${p(0)}
                  AND ${orderPlacedAtCol} <= ${p(1)}
                  AND occ.${esc('channelId')} = ${p(2)}
                GROUP BY ${bucketExpr}
            ) buckets
            ORDER BY ${sortColumn} ${sortDir}
            LIMIT ${take} OFFSET ${skip}
        `;

        const rows: SalesSummaryReportSqlRow[] = await this.connection.rawConnection.query(sql, [
            input.start,
            input.end,
            ctx.channelId,
        ]);

        if (rows.length === 0) {
            return { items: [], totalItems: 0 };
        }

        return {
            items: rows.map(row => ({
                periodStart: this.toDate(this.pick(row, 'periodStart', 'periodstart')),
                orderCount: Number(this.pick(row, 'orderCount', 'ordercount') ?? 0),
                totalRevenue: Number(this.pick(row, 'totalRevenue', 'totalrevenue') ?? 0),
            })),
            totalItems: Number(this.pick(rows[0], 'totalItems', 'totalitems') ?? 0),
        };
    }

    private getBucketExpression(column: string, bucket: SalesSummaryReportBucket): string {
        const type = this.connection.rawConnection.options.type;
        const isPostgres = type === 'postgres' || type === 'aurora-postgres' || type === 'cockroachdb';
        const isMysql = type === 'mysql' || type === 'mariadb' || type === 'aurora-mysql';

        if (bucket === SalesSummaryReportBucket.DAY) {
            if (isPostgres) {
                return `date_trunc('day', ${column})`;
            }
            if (isMysql) {
                return `DATE(${column})`;
            }
            return `date(${column})`;
        }
        if (bucket === SalesSummaryReportBucket.WEEK) {
            if (isPostgres) {
                return `date_trunc('week', ${column})`;
            }
            if (isMysql) {
                return `DATE_SUB(DATE(${column}), INTERVAL WEEKDAY(${column}) DAY)`;
            }
            return `date(${column}, '-' || ((CAST(strftime('%w', ${column}) AS INTEGER) + 6) % 7) || ' days')`;
        }
        if (isPostgres) {
            return `date_trunc('month', ${column})`;
        }
        if (isMysql) {
            return `DATE_FORMAT(${column}, '%Y-%m-01')`;
        }
        return `date(${column}, 'start of month')`;
    }

    private pick(row: SalesSummaryReportSqlRow, ...keys: Array<keyof SalesSummaryReportSqlRow>) {
        for (const key of keys) {
            const value = row[key];
            if (value != null) {
                return value;
            }
        }
        return undefined;
    }

    private toDate(value: Date | string | number | undefined): Date {
        if (value instanceof Date) {
            return value;
        }
        return new Date(value as string | number);
    }
}
