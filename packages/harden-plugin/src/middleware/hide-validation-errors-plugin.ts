import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';

import { resolveValidationProfile } from '../validation/validation-profile';
import { loadValidationProfile } from '../validation/validation-profile-loader';

/**
 * @description
 * Hides graphql-js suggestions when invalid field names are given.
 * Based on ideas discussed in https://github.com/apollographql/apollo-server/issues/3919
 */
export class HideValidationErrorsPlugin implements ApolloServerPlugin {
    constructor(private readonly requestedProfile?: string) {}

    async requestDidStart(): Promise<GraphQLRequestListener<any>> {
        return {
            willSendResponse: async requestContext => {
                const { errors } = requestContext;
                if (errors) {
                    const selectedProfile = resolveValidationProfile(this.requestedProfile);
                    const validationProfile = await loadValidationProfile(selectedProfile);
                    (requestContext.response as any).errors = errors.map(err => validationProfile.format(err));
                }
            },
        };
    }
}
