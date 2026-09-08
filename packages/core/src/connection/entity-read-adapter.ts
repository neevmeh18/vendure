import { Injectable } from '@nestjs/common';
import { Type } from '@vendure/common/lib/shared-types';

import { RequestContext } from '../api/common/request-context';
import { ChannelAware } from '../common/types/common-types';
import { VendureEntity } from '../entity/base/base.entity';

import { EntityReadInput, ReadQueryFactory } from './read-query-factory';

/** @internal */
@Injectable()
export class EntityReadAdapter {
    constructor(private queryFactory: ReadQueryFactory) {}

    async one<T extends ChannelAware & VendureEntity>(
        ctx: RequestContext,
        entityType: Type<T>,
        input: EntityReadInput<T>,
    ): Promise<T | undefined> {
        return this.queryFactory
            .create(ctx, entityType, input)
            .getOne()
            .then(result => result ?? undefined);
    }
}
