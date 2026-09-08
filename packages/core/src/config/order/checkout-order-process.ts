import { configureDefaultOrderProcess } from './default-order-process';

/**
 * @description
 * The {@link OrderProcess} used by the default configuration. Under this process, an Order may
 * enter the `ArrangingPayment` state before a ShippingMethod has been selected, so that customers
 * in regions with no eligible ShippingMethod can complete checkout.
 *
 * @docsCategory Orders
 */
export const checkoutOrderProcess = configureDefaultOrderProcess({
    arrangingPaymentRequiresShipping: false,
});
