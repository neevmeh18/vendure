import { ID } from '@vendure/common/lib/shared-types';
import { SelectQueryBuilder } from 'typeorm';

import { RequestContext } from '../../../api/common/request-context';
import { TransactionalConnection } from '../../../connection/transactional-connection';
import { Customer } from '../../../entity/customer/customer.entity';

export function findCustomerInChannelByEmailAddress(
    connection: TransactionalConnection,
    ctx: RequestContext,
    emailAddress: string,
    excludeCustomerId?: ID,
): Promise<Customer | undefined> {
    return createCustomerEmailAddressQuery(connection, ctx, emailAddress, excludeCustomerId)
        .getOne()
        .then(result => result ?? undefined);
}

function createCustomerEmailAddressQuery(
    connection: TransactionalConnection,
    ctx: RequestContext,
    emailAddress: string,
    excludeCustomerId?: ID,
): SelectQueryBuilder<Customer> {
    const predicates = [
        'channel.id = :channelId',
        'customer.emailAddress = :emailAddress',
        'customer.deletedAt is null',
    ];
    const parameters: Record<string, ID | string> = {
        channelId: ctx.channelId,
        emailAddress,
    };

    if (excludeCustomerId != null) {
        predicates.push('customer.id != :excludeCustomerId');
        parameters.excludeCustomerId = excludeCustomerId;
    }

    return connection
        .getRepository(ctx, Customer)
        .createQueryBuilder('customer')
        .leftJoin('customer.channels', 'channel')
        .where(predicates.join(' AND '), parameters);
}
