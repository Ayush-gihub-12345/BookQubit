/**
 * Test suite for transliteration engine
 */

import TransliterationEngine from './engine.js';

export const TEST_BOOKS = [
  // English book titles
  'Atomic Habits',
  "Harry Potter and the Philosopher's Stone",
  'The Alchemist',
  'The Hobbit',
  'Lord of the Rings',
  'The God of Small Things',
  'A Suitable Boy',
  'The White Tiger',
  "Midnight's Children",
  'The Palace of Illusions',
  
  // Japanese titles
  'ノルウェイの森',
  '君の名は',
  '海辺のカフカ',
  
  // Cyrillic titles
  'Война и мир',
  'Преступление и наказание',
  
  // Arabic titles
  'ألف ليلة وليلة',
];

export const TEST_CASES = [
  { input: 'Atomic Habits', source: 'en', target: 'hi', expected: 'एटॉमिक हैबिट्स' },
  { input: 'Harry Potter', source: 'en', target: 'hi', expected: 'हैरी पॉटर' },
  { input: 'Atomic Habits', source: 'en', target: 'bn', expected: 'এটমিক হ্যাবিটস' },
  { input: 'Atomic Habits', source: 'en', target: 'ta', expected: 'அடோமிக் ஹேபிட்ஸ்' },
];

export function runTests(verbose = true) {
  console.log('\n' + '='.repeat(80));
  console.log('📖 BOOKQUBIT TRANSLITERATION TEST SUITE');
  console.log('='.repeat(80));

  const engine = new TransliterationEngine();
  engine.setVerbose(verbose);
  
  let passed = 0;
  let failed = 0;
  const results = [];

  // Run test cases
  console.log('\n🔹 Running Test Cases');
  console.log('-'.repeat(40));
  
  for (const testCase of TEST_CASES) {
    const result = engine.transliterate(testCase.input, testCase.source, testCase.target);
    const isPass = result === testCase.expected;
    
    if (isPass) {
      passed++;
    } else {
      failed++;
    }
    
    results.push({
      ...testCase,
      result,
      passed: isPass,
    });
    
    console.log(`   ${isPass ? '✅' : '❌'} "${testCase.input}" → "${result}"`);
    if (!isPass) {
      console.log(`      Expected: "${testCase.expected}"`);
    }
  }

  // Run batch test
  console.log('\n🔹 Batch Transliteration Test');
  console.log('-'.repeat(40));
  
  const batch = [
    'The Alchemist',
    'The Hobbit',
    'Lord of the Rings',
    'The God of Small Things',
    'A Suitable Boy',
  ];
  
  const batchResults = engine.transliterateBatch(batch, 'en', 'hi');
  batchResults.forEach((result, i) => {
    console.log(`   ${i + 1}. "${batch[i]}" → "${result}"`);
  });

  // Run auto-detection tests
  console.log('\n🔹 Auto-Detection Test');
  console.log('-'.repeat(40));
  
  const autoTests = [
    'Atomic Habits',
    'ノルウェイの森',
    'Война и мир',
    'ألف ليلة وليلة',
  ];
  
  for (const text of autoTests) {
    const result = engine.autoTransliterate(text, 'hi');
    console.log(`   "${text}" → "${result}"`);
  }

  // Performance test
  console.log('\n🔹 Cache Performance Test');
  console.log('-'.repeat(40));
  
  const testText = 'Atomic Habits';
  console.time('First call (cache miss)');
  engine.transliterate(testText, 'en', 'hi');
  console.timeEnd('First call (cache miss)');
  
  console.time('Second call (cache hit)');
  engine.transliterate(testText, 'en', 'hi');
  console.timeEnd('Second call (cache hit)');

  // Print stats
  engine.printStats();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Cache Size: ${engine.getCacheStats().size}`);
  console.log('='.repeat(80) + '\n');

  return {
    passed,
    failed,
    results,
    engine,
  };
}

export default runTests;