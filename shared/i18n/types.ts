export type TranslationParams = Record<string, string | number>

/** Nested leaf maps — keys are validated against pt-BR at compile time via TranslationKey. */
export type TranslationSection = Record<string, string>

export type TranslationDictionary = Record<string, TranslationSection>
