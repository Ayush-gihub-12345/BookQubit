/**
 * Main transliteration engine
 */

import transliterate from '@sindresorhus/transliterate';
import { 
  romanizeIndic, 
  romanizeJapanese, 
  romanizeCyrillic, 
  romanizeArabic 
} from 'romanize-string';
import { getException, addException as addExceptionToDict } from './exceptions.js';
import { detectScript, needsTransliteration, getDefaultTarget, getDefaultSource } from './detector.js';

export class TransliterationEngine {
  constructor(options = {}) {
    this.cache = new Map();
    this.cacheLimit = options.cacheLimit || 10000;
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      exceptionsUsed: 0,
      methods: {},
    };
    this.verbose = options.verbose !== undefined ? options.verbose : true;
  }

  /**
   * Main transliteration method
   */
  transliterate(text, source = 'en', target = 'hi', mode = 'hybrid') {
    // Guard against empty input
    if (!text || text.trim() === '') {
      return '';
    }

    this.stats.totalRequests++;

    // Step 1: Check cache
    const cacheKey = `${source}:${target}:${text}`;
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.cache.get(cacheKey);
    }
    this.stats.cacheMisses++;

    let result = '';
    let method = '';

    // Step 2: Check exceptions
    const exceptionResult = getException(source, target, text);
    if (exceptionResult) {
      result = exceptionResult;
      method = 'exception';
      this.stats.exceptionsUsed++;
      this._log(`📕 Exception found for "${text}" → "${result}"`);
    }
    // Step 3: English → Sinhala
    else if (source === 'en' && target === 'si') {
      result = `[Sinhala] ${text}`;
      method = 'sinhala-placeholder';
      this._log(`🇱🇰 Sinhala placeholder for "${text}"`);
    }
    // Step 4: English → Indic scripts (phonetic)
    else if (source === 'en' && needsTransliteration(target)) {
      try {
        // Try romanizeIndic first
        const indicResult = romanizeIndic(text, target, false);
        // Check if romanizeIndic actually did something
        if (indicResult && indicResult !== text) {
          result = indicResult;
          method = 'romanize-indic';
          this._log(`🔤 Using romanizeIndic for "${text}" → ${target}`);
        } else {
          // If romanizeIndic returned same text, use sindresorhus as fallback
          this._log(`⚠️ romanizeIndic returned unchanged text for "${text}"`);
          result = transliterate(text);
          method = 'sindresorhus-fallback';
          this._log(`🔄 Using sindresorhus fallback: "${result}"`);
        }
      } catch (err) {
        this._log(`⚠️ romanizeIndic failed: ${err.message}`);
        try {
          result = transliterate(text);
          method = 'sindresorhus-fallback';
          this._log(`🔄 Using sindresorhus fallback: "${result}"`);
        } catch (fallbackErr) {
          this._log(`⚠️ Fallback also failed: ${fallbackErr.message}`);
          result = text;
          method = 'original';
        }
      }
    }
    // Step 5: Japanese → Latin
    else if (source === 'ja' && target === 'latin') {
      try {
        result = romanizeJapanese(text);
        method = 'romanize-japanese';
        this._log(`🇯🇵 Romanizing Japanese: "${text}"`);
      } catch (err) {
        this._log(`⚠️ Japanese romanization failed: ${err.message}`);
        result = transliterate(text);
        method = 'fallback';
      }
    }
    // Step 6: Cyrillic → Latin
    else if (source === 'ru' && target === 'latin') {
      try {
        result = romanizeCyrillic(text, 'ru');
        method = 'romanize-cyrillic';
        this._log(`🇷🇺 Romanizing Cyrillic: "${text}"`);
      } catch (err) {
        this._log(`⚠️ Cyrillic romanization failed: ${err.message}`);
        result = transliterate(text);
        method = 'fallback';
      }
    }
    // Step 7: Arabic → Latin
    else if (source === 'ar' && target === 'latin') {
      try {
        result = romanizeArabic(text);
        method = 'romanize-arabic';
        this._log(`🇸🇦 Romanizing Arabic: "${text}"`);
      } catch (err) {
        this._log(`⚠️ Arabic romanization failed: ${err.message}`);
        result = transliterate(text);
        method = 'fallback';
      }
    }
    // Step 8: Latin → other scripts
    else if (source === 'latin' && needsTransliteration(target)) {
      try {
        const indicResult = romanizeIndic(text, target, false);
        if (indicResult && indicResult !== text) {
          result = indicResult;
          method = 'romanize-indic';
          this._log(`🔤 Using romanizeIndic for "${text}" → ${target}`);
        } else {
          result = transliterate(text);
          method = 'sindresorhus-fallback';
          this._log(`🔄 Using sindresorhus fallback: "${result}"`);
        }
      } catch (err) {
        this._log(`⚠️ romanizeIndic failed: ${err.message}`);
        result = transliterate(text);
        method = 'fallback';
      }
    }
    // Step 9: Generic fallback
    else {
      try {
        result = transliterate(text);
        method = 'sindresorhus';
        this._log(`🔄 Using generic transliterator for "${text}"`);
      } catch (err) {
        this._log(`⚠️ Generic transliteration failed: ${err.message}`);
        result = text;
        method = 'original';
      }
    }

    // Update method stats
    if (!this.stats.methods[method]) {
      this.stats.methods[method] = 0;
    }
    this.stats.methods[method]++;

    // Cache the result (with limit)
    if (this.cache.size < this.cacheLimit) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Batch transliteration
   */
  transliterateBatch(texts, source = 'en', target = 'hi') {
    this._log(`\n📚 Batch Transliteration: ${texts.length} titles`);
    this._log(`   Source: ${source} → Target: ${target}\n`);
    
    const results = [];
    for (const text of texts) {
      const result = this.transliterate(text, source, target);
      results.push(result);
    }
    return results;
  }

  /**
   * Auto-detect and transliterate
   */
  autoTransliterate(text, targetLang = 'hi') {
    const script = detectScript(text);
    const source = getDefaultSource(script);
    const target = script === 'latin' ? targetLang : 'latin';
    
    this._log(`🔍 Detected: ${script} (${source} → ${target})`);
    return this.transliterate(text, source, target);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this._log('🧹 Cache cleared');
  }

  /**
   * Add a new exception
   */
  addException(source, target, original, transliterated) {
    addExceptionToDict(source, target, original, transliterated);
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      limit: this.cacheLimit,
      keys: Array.from(this.cache.keys()).slice(0, 10),
    };
  }

  /**
   * Get performance stats
   */
  getStats() {
    const { totalRequests, cacheHits, cacheMisses, exceptionsUsed, methods } = this.stats;
    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      exceptionsUsed,
      hitRate: totalRequests > 0 
        ? (cacheHits / totalRequests * 100).toFixed(2) + '%'
        : 'N/A',
      methods,
    };
  }

  /**
   * Print stats
   */
  printStats() {
    const stats = this.getStats();
    console.log('\n📊 Performance Stats:');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Cache Hits: ${stats.cacheHits}`);
    console.log(`   Cache Misses: ${stats.cacheMisses}`);
    console.log(`   Hit Rate: ${stats.hitRate}`);
    console.log(`   Exceptions Used: ${stats.exceptionsUsed}`);
    console.log(`   Methods Used:`, stats.methods);
  }

  /**
   * Internal logging - can be overridden or silenced
   */
  _log(message) {
    if (this.verbose !== false) {
      console.log(message);
    }
  }

  /**
   * Toggle verbose logging
   */
  setVerbose(verbose) {
    this.verbose = verbose;
  }
}

export default TransliterationEngine;