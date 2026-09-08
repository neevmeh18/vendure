import { isValidationProfileName, ValidationProfileName } from './validation-profile-policy';

const defaultValidationProfile: ValidationProfileName = 'hide-suggestions';

export function resolveValidationProfile(candidate: string | undefined): ValidationProfileName {
    if (candidate == null) {
        return defaultValidationProfile;
    }

    const normalized = candidate.trim().toLowerCase();
    if (!isValidationProfileName(normalized)) {
        return defaultValidationProfile;
    }

    return normalized;
}
