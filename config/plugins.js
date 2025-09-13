module.exports = {
  'auto-slug-manager': {
    enabled: true,
    config: {
      enabled: true,                    // Enable/disable plugin globally
      sourceField: 'title',             // Primary field to generate slug from
      fallbackField: 'name',            // Fallback field if primary is empty
      handleRichText: true,             // Process Rich Text (blocks) fields
      addSuffixForUnique: true,         // Add suffixes for uniqueness
      supportCyrillic: true,            // Support Cyrillic transliteration
      updateExistingSlugs: true,        // Update existing slugs when title changes
      slugifyOptions: {
        lower: true,
        strict: true,
        locale: 'ru'
      }
    }
  }
};