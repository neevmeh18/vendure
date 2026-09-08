import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { RequestContext } from '../api/common/request-context';
import { ChannelAware } from '../common/types/common-types';
import { VendureEntity } from '../entity/base/base.entity';

/**
 * Applies request-bound constraints immediately before an entity read is executed.
 *
 * @internal
 */
@Injectable()
export class ReadBoundary {
    apply<T extends ChannelAware & VendureEntity>(
        qb: SelectQueryBuilder<T>,
        ctx: RequestContext,
    ): SelectQueryBuilder<T> {
        const metadata = qb.expressionMap.mainAlias?.metadata;
        const channelRelation = metadata?.relations.find(relation => relation.propertyName === 'channels');

        // EntityReader is intentionally restricted to ChannelAware entities. If the runtime
        // metadata does not match that contract, fail closed rather than executing an
        // unconstrained query.
        if (!channelRelation) {
            throw new Error(`Cannot execute request-bound read for ${metadata?.name ?? 'unknown entity'}`);
        }

        const alias = '__read_ref';
        qb.leftJoin(`${qb.alias}.${channelRelation.propertyPath}`, alias);
        qb.andWhere(`${alias}.id = :__read_key`, { __read_key: ctx.channelId });
        return qb;
    }
}
