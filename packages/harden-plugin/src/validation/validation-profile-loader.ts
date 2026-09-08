import { GraphQLError } from 'graphql/error/index';

import { moduleForValidationProfile, ValidationProfileName } from './validation-profile-policy';

export interface ValidationProfile {
    format(error: GraphQLError): GraphQLError;
}

export async function loadValidationProfile(profile: ValidationProfileName): Promise<ValidationProfile> {
    const modulePath = moduleForValidationProfile(profile);
    const loaded = await import(modulePath);
    return loaded.validationProfile;
}
