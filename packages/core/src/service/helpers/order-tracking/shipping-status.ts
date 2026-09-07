import { Fulfillment } from '../../../entity/fulfillment/fulfillment.entity';

/**
 * @description
 * A derived status summarizing the shipping progress of an Order based on its Fulfillments.
 *
 * @since 3.8.0
 */
export type ShippingStatus = 'NotShipped' | 'PartiallyShipped' | 'Shipped' | 'Delivered';

/**
 * @description
 * Derives a {@link ShippingStatus} from the given Fulfillments, ignoring any whose state is `Cancelled`.
 *
 * @since 3.8.0
 */
export function deriveShippingStatus(fulfillments: Fulfillment[]): ShippingStatus {
    const remaining = fulfillments.filter(f => f.state !== 'Cancelled');
    if (remaining.length === 0) {
        return 'NotShipped';
    }
    if (remaining.every(f => f.state === 'Delivered')) {
        return 'Delivered';
    }
    if (remaining.every(f => f.state === 'Shipped' || f.state === 'Delivered')) {
        return 'Shipped';
    }
    return 'PartiallyShipped';
}
