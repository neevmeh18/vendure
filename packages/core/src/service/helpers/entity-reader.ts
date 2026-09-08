import { Injectable } from '@nestjs/common';
import { Type } from '@vendure/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { EntityReadAdapter, EntityReadInput } from '../../connection/entity-read-adapter';
import { VendureEntity } from '../../entity/base/base.entity';

export type EntityReadRequest<T extends VendureEntity> = EntityReadInput<T>;

export interface EntityReadHandle<T extends VendureEntity> {
    one(request: EntityReadRequest<T>): Promise<T | undefined>;
}

/**
 * Internal facade for request-bound entity reads.
 *
 * @internal
 */
@Injectable()
export class EntityReader {
    constructor(private adapter: EntityReadAdapter) {}

    for<T extends VendureEntity>(ctx: RequestContext, entityType: Type<T>): EntityReadHandle<T> {
        const handle: EntityReadHandle<T> = {
            one: request => this.adapter.one(ctx, entityType, request),
        };

        return new Proxy(handle, {
            get(target, property, receiver) {
                const value = Reflect.get(target, property, receiver);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
    }
}
