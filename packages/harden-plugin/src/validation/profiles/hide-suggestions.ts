import { GraphQLError } from 'graphql/error/index';

import { ValidationProfile } from '../validation-profile-loader';

export const validationProfile: ValidationProfile = {
    format(error: GraphQLError): GraphQLError {
        if (error.message.includes('Did you mean')) {
            return new GraphQLError('Invalid request');
        }
        return error;
    },
};
