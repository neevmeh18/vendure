import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    MutationApplyStockCountArgs,
    Permission,
    QueryStockCountSheetArgs,
} from '@vendure/common/lib/generated-types';

import { StockMovementService } from '../../../service/services/stock-movement.service';
import { RequestContext } from '../../common/request-context';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';
import { Transaction } from '../../decorators/transaction.decorator';

@Resolver()
export class StockCountResolver {
    constructor(private stockMovementService: StockMovementService) {}

    @Query()
    @Allow(Permission.ReadCatalog, Permission.ReadStockLocation)
    stockCountSheet(@Ctx() ctx: RequestContext, @Args() args: QueryStockCountSheetArgs) {
        return this.stockMovementService.getStockCountSheet(
            ctx,
            args.stockLocationId,
            args.productVariantIds,
        );
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.ReadCatalog, Permission.ReadStockLocation)
    applyStockCount(@Ctx() ctx: RequestContext, @Args() args: MutationApplyStockCountArgs) {
        return this.stockMovementService.applyStockCount(ctx, args.input);
    }
}
