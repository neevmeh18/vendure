import { Order } from '../../../entity/order/order.entity';

export type CheckoutRequirementCode = 'CONTENTS' | 'CUSTOMER' | 'SHIPPING_ADDRESS';

/**
 * @description
 * Returns the checkout requirement codes that are currently unmet on the given Order:
 * contents, customer, and shipping address.
 */
export function getCheckoutReadiness(order: Order): CheckoutRequirementCode[] {
    const unmet: CheckoutRequirementCode[] = [];
    if (!order.lines?.length) {
        unmet.push('CONTENTS');
    }
    if (!order.customer) {
        unmet.push('CUSTOMER');
    }
    if (!order.shippingAddress?.countryCode) {
        unmet.push('SHIPPING_ADDRESS');
    }
    return unmet;
}
