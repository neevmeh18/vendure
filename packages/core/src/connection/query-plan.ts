import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { RequestContext } from '../api/common/request-context';
import { VendureEntity } from '../entity/base/base.entity';

/**
 * Applies request-bound defaults to entity reads immediately before execution.
 *
 * @internal
 */
@Injectable()
export class QueryPlan {
    apply<T extends VendureEntity>(qb: SelectQueryBuilder<T>, ctx: RequestContext): SelectQueryBuilder<T> {
        const metadata = qb.expressionMap.mainAlias?.metadata;
        const relation = metadata?.relations.find(item => item.propertyName === 'channels');
        if (!relation) {
            return qb;
        }

        const alias = '__ctx_ref';
        const joined = qb.expressionMap.joinAttributes.some(item => item.alias?.name === alias);
        if (!joined) {
            qb.innerJoin(`${qb.alias}.${relation.propertyPath}`, alias);
        }
        qb.andWhere(`${alias}.id = :__ctx_key`, { __ctx_key: ctx.channelId });
        return qb;
    }
}
