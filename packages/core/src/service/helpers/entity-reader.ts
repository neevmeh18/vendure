import { Injectable } from '@nestjs/common';
import { Type } from '@vendure/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { ChannelAware } from '../../common/types/common-types';
import { EntityReadAdapter } from '../../connection/entity-read-adapter';
import { EntityReadInput } from '../../connection/read-query-factory';
import { VendureEntity } from '../../entity/base/base.entity';

export type EntityReadRequest<T extends ChannelAware & VendureEntity> = EntityReadInput<T>;

export class EntityReadHandle<T extends ChannelAware & VendureEntity> {
    constructor(
        private readonly ctx: RequestContext,
        private readonly entityType: Type<T>,
        private readonly adapter: EntityReadAdapter,
    ) {}

    one(request: EntityReadRequest<T>): Promise<T | undefined> {
        return this.adapter.one(this.ctx, this.entityType, request);
    }
}

/**
 * Internal facade for request-bound entity reads.
 *
 * @internal
 */
@Injectable()
export class EntityReader {
    constructor(private adapter: EntityReadAdapter) {}

    for<T extends ChannelAware & VendureEntity>(
        ctx: RequestContext,
        entityType: Type<T>,
    ): EntityReadHandle<T> {
        return new EntityReadHandle(ctx, entityType, this.adapter);
    }
}
