import { RequestContext } from '../../api/common/vendure-request-context';
import { PriceCalculationResult } from '../../common/types/shared-types';

import { ChangedPriceHandlingStrategy } from './changed-price-handling-strategy';

/**
 * @description
 * The default {@link ChangedPriceHandlingStrategy} will always use the latest price when
 * updating existing OrderLines.
 */
export class DefaultChangedPriceHandlingStrategy implements ChangedPriceHandlingStrategy {
    handlePriceChange(ctx: RequestContext, current: PriceCalculationResult): PriceCalculationResult {
        return current;
    }
}
