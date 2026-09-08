import { QueryProductArgs } from '@vendure/common/lib/generated-shop-types';
import { ID } from '@vendure/common/lib/shared-types';

import { UserInputError } from '../../../common/error/errors';

export interface ShopProductLookup {
    id?: ID;
    slug?: string;
}

/**
 * Normalizes the two supported Shop API product lookup forms before the
 * request crosses into the service layer.
 */
export function normalizeShopProductLookup(args: QueryProductArgs): ShopProductLookup {
    const slug = args.slug?.trim();
    if (!args.id && !slug) {
        throw new UserInputError('error.product-id-or-slug-must-be-provided');
    }
    return {
        id: args.id,
        slug,
    };
}
