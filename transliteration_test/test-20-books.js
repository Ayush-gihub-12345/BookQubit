#!/usr/bin/env node

import { romanizeIndic } from 'romanize-string';
import transliterate from '@sindresorhus/transliterate';

const bookTitles = [
  'Atomic Habits',
  'Harry Potter and the Philosopher\'s Stone',
  'The Alchemist',
  'The Hobbit',
  'Lord of the Rings',
  'The God of Small Things',
  'A Suitable Boy',
  'The White Tiger',
  "Midnight's Children",
  'The Palace of Illusions',
  'The Catcher in the Rye',
  'To Kill a Mockingbird',
  'The Great Gatsby',
  'Pride and Prejudice',
  'The Diary of a Young Girl',
  'Animal Farm',
  'Nineteen Eighty-Four',
  'The Little Prince',
  'The Da Vinci Code',
  'Angels and Demons',
];

/**
 * Transliterate using multiple strategies
 */
function transliterateTitle(text, target = 'hi') {
  // Strategy 1: Try romanizeIndic (Latin → Indic)
  try {
    // romanizeIndic(text, languageCode, reverse)
    // reverse = true for Latin → Indic
    const result = romanizeIndic(text, target, true);
    if (result && result !== text) {
      return result;
    }
  } catch (err) {
    // Silent fail
  }

  // Strategy 2: Try word by word
  try {
    const words = text.split(' ');
    const translated = words.map(word => {
      try {
        const result = romanizeIndic(word, target, true);
        if (result && result !== word) {
          return result;
        }
      } catch (e) {}
      return word;
    });
    const result = translated.join(' ');
    if (result !== text) {
      return result;
    }
  } catch (err) {}

  // Strategy 3: Fallback to sindresorhus
  try {
    const result = transliterate(text);
    if (result && result !== text) {
      return result;
    }
  } catch (err) {}

  // Strategy 4: Return original with warning
  return text;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 BOOK TITLE TRANSLITERATION: ENGLISH → HINDI');
  console.log('🔄 Using romanize-string@1.3.1 with reverse=true');
  console.log('='.repeat(80));
  console.log(`\n📖 Transliterating ${bookTitles.length} book titles...\n`);

  console.log('📋 Results:\n');
  console.log('─'.repeat(80));

  const results = [];
  let successCount = 0;
  let fallbackCount = 0;
  let failedCount = 0;

  for (let i = 0; i < bookTitles.length; i++) {
    const title = bookTitles[i];
    const result = transliterateTitle(title, 'hi');
    results.push({ title, result });
    
    // Check if result is Devanagari
    const isDevanagari = /[\u0900-\u097F]/.test(result);
    if (isDevanagari && result !== title) {
      successCount++;
    } else if (result !== title) {
      fallbackCount++;
    } else {
      failedCount++;
    }
    
    const num = String(i + 1).padStart(2, ' ');
    const source = title.padEnd(50, ' ');
    const status = result === title ? '⚠️' : '✅';
    console.log(`  ${num}. ${source} → ${result} ${status}`);
  }

  console.log('─'.repeat(80));

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`  ✅ Total titles: ${results.length}`);
  console.log(`  🔤 romanizeIndic success: ${successCount} titles`);
  console.log(`  🔄 Fallback used: ${fallbackCount} titles`);
  console.log(`  ❌ Failed (original): ${failedCount} titles`);
  console.log('='.repeat(80) + '\n');

  // Final output
  console.log('📖 FINAL OUTPUT (All translations):\n');
  results.forEach(({ title, result }, i) => {
    console.log(`${i + 1}. "${title}" → "${result}"`);
  });

  // JSON output
  console.log('\n📋 JSON OUTPUT:\n');
  const jsonOutput = results.map(({ title, result }) => ({
    english: title,
    hindi: result
  }));
  console.log(JSON.stringify(jsonOutput, null, 2));

  return results;
}

main().catch(console.error);