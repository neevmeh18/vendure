export const validationProfileModules = {
    'hide-suggestions': './profiles/hide-suggestions.js',
    'strict-redaction': './profiles/strict-redaction.js',
} as const;

export type ValidationProfileName = keyof typeof validationProfileModules;
export type ValidationProfileModule = (typeof validationProfileModules)[ValidationProfileName];

export function isValidationProfileName(value: string): value is ValidationProfileName {
    return Object.prototype.hasOwnProperty.call(validationProfileModules, value);
}

export function moduleForValidationProfile(profile: ValidationProfileName): ValidationProfileModule {
    return validationProfileModules[profile];
}
