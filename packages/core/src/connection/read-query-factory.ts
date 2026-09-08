import { Injectable } from '@nestjs/common';
import { ID, Type } from '@vendure/common/lib/shared-types';
import { FindOneOptions, SelectQueryBuilder } from 'typeorm';

import { RequestContext } from '../api/common/request-context';
import { ChannelAware } from '../common/types/common-types';
import { VendureEntity } from '../entity/base/base.entity';
import { joinTreeRelationsDynamically } from '../service/helpers/utils/tree-relations-qb-joiner';

import { findOptionsObjectToArray } from './find-options-object-to-array';
import { ReadBoundary } from './read-boundary';
import { TransactionalConnection } from './transactional-connection';

export interface EntityReadInput<T extends ChannelAware & VendureEntity> {
    id: ID;
    options?: FindOneOptions<T>;
}

/** @internal */
@Injectable()
export class ReadQueryFactory {
    constructor(
        private connection: TransactionalConnection,
        private boundary: ReadBoundary,
    ) {}

    create<T extends ChannelAware & VendureEntity>(
        ctx: RequestContext,
        entityType: Type<T>,
        input: EntityReadInput<T>,
    ): SelectQueryBuilder<T> {
        const qb = this.connection.getRepository(ctx, entityType).createQueryBuilder('record');
        const options: FindOneOptions<T> = { ...(input.options ?? {}) };

        if (options.relations) {
            const joinedRelations = joinTreeRelationsDynamically(qb, entityType, options.relations);
            options.relations = findOptionsObjectToArray(options.relations).filter(
                relationPath => !joinedRelations.has(relationPath),
            );
        }

        qb.setFindOptions({
            relationLoadStrategy: 'query',
            ...options,
        });
        qb.andWhere('record.id = :recordId', { recordId: input.id });

        return this.boundary.apply(qb, ctx);
    }
}
