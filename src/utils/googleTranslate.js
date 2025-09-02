/**
 * Google Translate Utility
 * Primary: MyMemory API (free, no API key required)
 * Fallback: Google's unofficial translate endpoint
 * Features: Caching, error handling, language auto-detection
 */

// API endpoints
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

// Cache configuration
const CACHE_PREFIX = 'translate_cache_';
const CACHE_EXPIRY_DAYS = 7;

/**
 * Get cached translation if available and not expired
 * @param {string} text - Original text
 * @param {string} targetLanguage - Target language code
 * @returns {string|null} - Cached translation or null
 */
const getCachedTranslation = (text, targetLanguage) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${text}_${targetLanguage}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { translation, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms

      if (now - timestamp < expiryTime) {
        return translation;
      }
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    // Silent error handling for cache read failures
  }

  return null;
};

/**
 * Cache translation result
 * @param {string} text - Original text
 * @param {string} targetLanguage - Target language code
 * @param {string} translation - Translated text
 */
const setCachedTranslation = (text, targetLanguage, translation) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${text}_${targetLanguage}`;
    const cacheData = {
      translation,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    // Silent error handling for cache write failures
  }
};

/**
 * Translate text using MyMemory API (primary method)
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
const translateWithMyMemory = async (text, targetLanguage) => {
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=auto|${targetLanguage}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  }

  throw new Error(`MyMemory API error: ${data.responseStatus}`);
};

/**
 * Fallback translation using Google's unofficial endpoint
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
const fallbackGoogleTranslate = async (text, targetLanguage) => {
  const url = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  const result = await response.json();

  if (result && result[0] && result[0][0] && result[0][0][0]) {
    return result[0][0][0];
  }

  throw new Error('Google Translate fallback failed');
};

/**
 * Validate language code
 * @param {string} language - Language code to validate
 * @returns {boolean} - Whether language is supported
 */
const isValidLanguage = (language) => {
  const supportedLanguages = ['en', 'pt', 'es', 'de', 'fr', 'ja', 'it', 'ar'];
  return supportedLanguages.includes(language.toLowerCase());
};

/**
 * Main translation function
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (en, pt, es, de, fr, ja, it, ar)
 * @returns {Promise<string>} - Translated text
 */
export const translateDynamicText = async (text, targetLanguage) => {
  // Input validation
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  if (!targetLanguage || !isValidLanguage(targetLanguage)) {
    return text;
  }

  // Normalize language code
  const normalizedLanguage = targetLanguage.toLowerCase();

  // Check cache first
  const cachedTranslation = getCachedTranslation(text, normalizedLanguage);
  if (cachedTranslation) {
    return cachedTranslation;
  }

  try {
    // Primary: MyMemory API
    const translatedText = await translateWithMyMemory(text, normalizedLanguage);

    // Cache successful translation
    setCachedTranslation(text, normalizedLanguage, translatedText);

    return translatedText;
  } catch (primaryError) {
    // Primary translation failed, try fallback

    try {
      // Fallback: Google unofficial API
      const fallbackTranslation = await fallbackGoogleTranslate(text, normalizedLanguage);

      // Cache successful fallback translation
      setCachedTranslation(text, normalizedLanguage, fallbackTranslation);

      return fallbackTranslation;
    } catch (fallbackError) {
      // All translation methods failed - return original text

      // Return original text as final fallback
      return text;
    }
  }
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    // Cache cleared successfully
  } catch (error) {
    // Silent error handling for cache clear failures
  }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    return {
      totalEntries: cacheKeys.length,
      cacheSize: JSON.stringify(cacheKeys.map((key) => localStorage.getItem(key))).length,
      oldestEntry: cacheKeys.reduce((oldest, key) => {
        const data = JSON.parse(localStorage.getItem(key));
        return !oldest || data.timestamp < oldest ? data.timestamp : oldest;
      }, null),
    };
  } catch (error) {
    // Error getting cache stats - return defaults
    return { totalEntries: 0, cacheSize: 0, oldestEntry: null };
  }
};

// Default export
export default translateDynamicText;
