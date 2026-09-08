import { RequestContext } from '../../api/common/vendure-request-context';
import { PriceCalculationResult } from '../../common/types/shared-types';
import { ProductVariant } from '../../entity/product-variant/product-variant.entity';

import { OrderItemPriceCalculationStrategy } from './order-item-price-calculation-strategy';

/**
 * @description
 * The default {@link OrderItemPriceCalculationStrategy}, which simply passes through the price of
 * the ProductVariant without performing any calculations
 *
 * @docsCategory orders
 */
export class DefaultOrderItemPriceCalculationStrategy implements OrderItemPriceCalculationStrategy {
    calculateUnitPrice(
        ctx: RequestContext,
        productVariant: ProductVariant,
    ): PriceCalculationResult | Promise<PriceCalculationResult> {
        return {
            price: productVariant.listPrice,
            priceIncludesTax: productVariant.listPriceIncludesTax,
        };
    }
}
