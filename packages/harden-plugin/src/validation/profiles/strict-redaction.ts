import { GraphQLError } from 'graphql/error/index';

import { ValidationProfile } from '../validation-profile-loader';

export const validationProfile: ValidationProfile = {
    format(error: GraphQLError): GraphQLError {
        return new GraphQLError('Invalid request');
    },
};
