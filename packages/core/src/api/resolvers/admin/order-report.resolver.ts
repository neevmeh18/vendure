import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';

import {
    OrderReportService,
    SalesSummaryReport,
    SalesSummaryReportInput,
} from '../../../service/services/order-report.service';
import { RequestContext } from '../../common/request-context';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';

type QuerySalesSummaryReportArgs = {
    input: SalesSummaryReportInput;
};

@Resolver()
export class OrderReportResolver {
    constructor(private orderReportService: OrderReportService) {}

    @Query()
    @Allow(Permission.ReadOrder)
    salesSummaryReport(
        @Ctx() ctx: RequestContext,
        @Args() args: QuerySalesSummaryReportArgs,
    ): Promise<SalesSummaryReport> {
        return this.orderReportService.getSalesSummaryReport(ctx, args.input);
    }
}
