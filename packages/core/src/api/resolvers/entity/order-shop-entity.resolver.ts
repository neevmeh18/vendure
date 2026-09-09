import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Order } from '../../../entity/order/order.entity';
import {
    mapOrderStateToStage,
    OrderTimelineEvent,
    OrderTimelineStage,
} from '../../../service/helpers/order-timeline/order-timeline-builder';
import { OrderService } from '../../../service/services/order.service';
import { RequestContext } from '../../common/request-context';
import { Ctx } from '../../decorators/request-context.decorator';

@Resolver('Order')
export class OrderShopEntityResolver {
    constructor(private orderService: OrderService) {}

    @ResolveField()
    currentStage(@Ctx() ctx: RequestContext, @Parent() order: Order): OrderTimelineStage {
        return mapOrderStateToStage(order.state) ?? 'Placed';
    }

    @ResolveField()
    async timeline(
        @Ctx() ctx: RequestContext,
        @Parent() order: Order,
        @Args() args: { take?: number },
    ): Promise<OrderTimelineEvent[]> {
        return this.orderService.getOrderTimeline(ctx, order.id, {
            publicOnly: true,
            take: args.take ?? 50,
        });
    }
}
