import { Injectable } from '@nestjs/common';
import { ID, Type } from '@vendure/common/lib/shared-types';
import { FindOneOptions } from 'typeorm';

import { RequestContext } from '../api/common/request-context';
import { VendureEntity } from '../entity/base/base.entity';

import { QueryPlan } from './query-plan';
import { TransactionalConnection } from './transactional-connection';

export interface EntityReadInput<T extends VendureEntity> {
    id: ID;
    options?: FindOneOptions<T>;
}

/** @internal */
@Injectable()
export class EntityReadAdapter {
    constructor(
        private connection: TransactionalConnection,
        private queryPlan: QueryPlan,
    ) {}

    async one<T extends VendureEntity>(
        ctx: RequestContext,
        entityType: Type<T>,
        input: EntityReadInput<T>,
    ): Promise<T | undefined> {
        const qb = this.connection.getRepository(ctx, entityType).createQueryBuilder('record');
        qb.setFindOptions({
            relationLoadStrategy: 'query',
            ...(input.options ?? {}),
        });
        qb.andWhere('record.id = :recordId', { recordId: input.id });

        return this.queryPlan
            .apply(qb, ctx)
            .getOne()
            .then(result => result ?? undefined);
    }
}
