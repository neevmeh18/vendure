import { Injectable } from '@nestjs/common';
import { HistoryEntryType } from '@vendure/common/lib/generated-types';

import { OrderHistoryEntry } from '../../../entity/history-entry/order-history-entry.entity';

export type OrderTimelineStage = 'Placed' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderTimelineEvent {
    stage: OrderTimelineStage;
    label: string;
    message?: string;
    occurredAt: Date;
}

const ORDER_STATE_TO_STAGE: Record<string, OrderTimelineStage> = {
    ArrangingPayment: 'Placed',
    AddingItems: 'Placed',
    PaymentAuthorized: 'Paid',
    PaymentSettled: 'Paid',
    Shipped: 'Shipped',
    PartiallyShipped: 'Shipped',
    Delivered: 'Delivered',
    PartiallyDelivered: 'Delivered',
    Cancelled: 'Cancelled',
};

const STAGE_LABELS: Record<OrderTimelineStage, string> = {
    Placed: 'Order placed',
    Paid: 'Payment received',
    Shipped: 'Order shipped',
    Delivered: 'Order delivered',
    Cancelled: 'Order cancelled',
};

export function mapOrderStateToStage(state: string): OrderTimelineStage | undefined {
    return ORDER_STATE_TO_STAGE[state];
}

@Injectable()
export class OrderTimelineBuilder {
    build(entries: OrderHistoryEntry[]): OrderTimelineEvent[] {
        const sorted = entries.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const events: OrderTimelineEvent[] = [];
        for (const entry of sorted) {
            const event = this.eventFromEntry(entry, events);
            if (!event) {
                continue;
            }
            const previous = events[events.length - 1];
            if (previous && previous.stage === event.stage && !previous.message && !event.message) {
                continue;
            }
            events.push(event);
        }
        return events;
    }

    private eventFromEntry(
        entry: OrderHistoryEntry,
        events: OrderTimelineEvent[],
    ): OrderTimelineEvent | undefined {
        switch (entry.type) {
            case HistoryEntryType.ORDER_STATE_TRANSITION: {
                const stage = mapOrderStateToStage(entry.data.to);
                if (!stage) {
                    return;
                }
                return {
                    stage,
                    label: STAGE_LABELS[stage],
                    occurredAt: entry.createdAt,
                };
            }
            case HistoryEntryType.ORDER_FULFILLMENT_TRANSITION: {
                const to = entry.data.to;
                if (to !== 'Shipped' && to !== 'Delivered') {
                    return;
                }
                const stage: OrderTimelineStage = to;
                return {
                    stage,
                    label: STAGE_LABELS[stage],
                    occurredAt: entry.createdAt,
                };
            }
            case HistoryEntryType.ORDER_NOTE: {
                const preceding = events[events.length - 1];
                return {
                    stage: preceding?.stage ?? 'Placed',
                    label: 'Message from the store',
                    message: entry.data.note,
                    occurredAt: entry.createdAt,
                };
            }
            case HistoryEntryType.ORDER_CANCELLATION: {
                const event: OrderTimelineEvent = {
                    stage: 'Cancelled',
                    label: STAGE_LABELS.Cancelled,
                    occurredAt: entry.createdAt,
                };
                if (entry.data.reason) {
                    event.message = entry.data.reason;
                }
                return event;
            }
            default:
                return;
        }
    }
}
