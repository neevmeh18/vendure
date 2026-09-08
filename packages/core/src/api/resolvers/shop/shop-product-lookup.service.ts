import { Injectable } from '@nestjs/common';
import { ID } from '@vendure/common/lib/shared-types';

import { Translated } from '../../../common/types/locale-types';
import { Product } from '../../../entity/product/product.entity';
import { ProductService } from '../../../service/services/product.service';
import { RequestContext } from '../../common/request-context';
import { RelationPaths } from '../../decorators/relations.decorator';

@Injectable()
export class ShopProductLookupService {
    constructor(private productService: ProductService) {}

    async findOne(
        ctx: RequestContext,
        lookup: { id?: ID; slug?: string },
        relations?: RelationPaths<Product>,
    ): Promise<Translated<Product> | undefined> {
        const product = lookup.id
            ? await this.productService.findOne(ctx, lookup.id, relations)
            : await this.productService.findOneBySlug(ctx, lookup.slug!, relations);
        if (!product || product.enabled === false) {
            return;
        }
        product.facetValues = product.facetValues?.filter(fv => !fv.facet.isPrivate) as any;
        return product;
    }
}
