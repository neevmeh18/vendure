import { RequestContextService } from '../../service/helpers/request-context/request-context.service';
import { ApiKeyService } from '../../service/services/api-key.service';
import { ScheduledTask } from '../scheduled-task';

/**
 * @description
 * A {@link ScheduledTask} that retires API keys which have not been used for a configured period.
 *
 * @example
 * ```ts
 * import { cleanInactiveApiKeysTask, VendureConfig } from '\@vendure/core';
 *
 * export const config: VendureConfig = {
 *   // ...
 *   schedulerOptions: {
 *     tasks: [
 *       // Use the task as is
 *       cleanInactiveApiKeysTask,
 *       // or configure the task
 *       cleanInactiveApiKeysTask.configure({
 *         // Run the task every day at 3:00am
 *         // The default schedule is every day at 2:30am
 *         schedule: cron => cron.everyDayAt(3, 0),
 *         params: {
 *           // How long a key may go unused before it is retired
 *           // Default: '180d'
 *           unusedFor: '90d',
 *           // How many keys to process in each batch
 *           // Default: 100
 *           batchSize: 500,
 *         },
 *       }),
 *     ],
 *   },
 * };
 * ```
 *
 * @since 3.6.0
 * @docsCategory scheduled-tasks
 */
export const cleanInactiveApiKeysTask = new ScheduledTask({
    id: 'clean-inactive-api-keys',
    description: 'Retire API keys which have not been used for a configured period',
    params: {
        unusedFor: '180d',
        batchSize: 100,
    },
    schedule: cron => cron.everyDayAt(2, 30),
    async execute({ injector, params }) {
        const requestContextService = injector.get(RequestContextService);
        const ctx = await requestContextService.create({
            apiType: 'admin',
        });
        const apiKeyService = injector.get(ApiKeyService);
        return apiKeyService.softDeleteInactive(ctx, {
            unusedFor: params.unusedFor,
            batchSize: params.batchSize,
        });
    },
});
