import { Query, Resolver } from '@nestjs/graphql';

import { Promotion } from '../../../entity/promotion/promotion.entity';
import { PromotionService } from '../../../service/services/promotion.service';
import { RequestContext } from '../../common/request-context';
import { Ctx } from '../../decorators/request-context.decorator';

@Resolver()
export class ShopPromotionsResolver {
    constructor(readonly promotionService: PromotionService) {}

    @Query()
    async activePromotions(@Ctx() ctx: RequestContext): Promise<Promotion[]> {
        return this.promotionService.getActivePromotions(ctx);
    }
}
