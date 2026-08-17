/**
 * Interactive mode for manual testing
 */

import { createInterface } from 'readline';
import TransliterationEngine from './engine.js';
import { detectScript, getDefaultSource, getDefaultTarget } from './detector.js';
import { getAllExceptions } from './exceptions.js';

export async function startInteractive() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const engine = new TransliterationEngine();
  engine.setVerbose(true);

  console.log('\n' + '='.repeat(80));
  console.log('🔄 INTERACTIVE TRANSLITERATION TEST');
  console.log('='.repeat(80));
  console.log('\n📖 Commands:');
  console.log('  • Just type a title to transliterate it');
  console.log('  • "exit" or "quit" - Exit the program');
  console.log('  • "cache" - Show cache stats');
  console.log('  • "clear" - Clear the cache');
  console.log('  • "stats" - Show performance stats');
  console.log('  • "exceptions" - Show all exceptions');
  console.log('  • "add <source> <target> <original> <transliterated>" - Add exception');
  console.log('  • "batch" - Run batch test');
  console.log('  • "verbose" - Toggle verbose mode');
  console.log('  • "help" - Show this help');
  console.log('='.repeat(80) + '\n');

  function prompt() {
    rl.question('📝 Enter book title: ', (input) => {
      const cmd = input.trim();
      
      // Handle commands
      if (['exit', 'quit'].includes(cmd.toLowerCase())) {
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }

      if (cmd.toLowerCase() === 'help') {
        console.log('\n📖 Commands:');
        console.log('  • Just type a title to transliterate it');
        console.log('  • "exit" or "quit" - Exit the program');
        console.log('  • "cache" - Show cache stats');
        console.log('  • "clear" - Clear the cache');
        console.log('  • "stats" - Show performance stats');
        console.log('  • "exceptions" - Show all exceptions');
        console.log('  • "add <source> <target> <original> <transliterated>" - Add exception');
        console.log('  • "batch" - Run batch test');
        console.log('  • "verbose" - Toggle verbose mode');
        console.log('  • "help" - Show this help\n');
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'cache') {
        const stats = engine.getCacheStats();
        console.log(`   📦 Cache entries: ${stats.size}/${stats.limit}`);
        if (stats.size > 0) {
          console.log('   Keys:', stats.keys);
        }
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'clear') {
        engine.clearCache();
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'stats') {
        engine.printStats();
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'exceptions') {
        const exceptions = getAllExceptions();
        console.log('   📕 Exceptions:', JSON.stringify(exceptions, null, 2));
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'verbose') {
        engine.setVerbose(!engine.verbose);
        console.log(`   Verbose mode: ${engine.verbose ? 'ON' : 'OFF'}`);
        prompt();
        return;
      }

      if (cmd.toLowerCase() === 'batch') {
        const batchTitles = [
          'Atomic Habits',
          'Harry Potter',
          'The Alchemist',
          'The Hobbit',
          'Lord of the Rings',
        ];
        const results = engine.transliterateBatch(batchTitles, 'en', 'hi');
        console.log('\n   📚 Batch Results:');
        results.forEach((result, i) => {
          console.log(`   ${i + 1}. "${batchTitles[i]}" → "${result}"`);
        });
        console.log('');
        prompt();
        return;
      }

      if (cmd.toLowerCase().startsWith('add ')) {
        const parts = cmd.split(' ');
        if (parts.length < 5) {
          console.log('   ❌ Usage: add <source> <target> <original> <transliterated>');
          console.log('   Example: add en hi Foundation फ़ाउंडेशन');
        } else {
          const [, source, target, ...rest] = parts;
          const original = rest.slice(0, -1).join(' ');
          const transliterated = rest[rest.length - 1];
          engine.addException(source, target, original, transliterated);
        }
        prompt();
        return;
      }

      // If we get here, treat it as a text to transliterate
      if (input.trim()) {
        const script = detectScript(input);
        const source = getDefaultSource(script);
        const target = script === 'latin' ? 'hi' : 'latin';
        
        console.log(`   🔍 Detected: ${script} (${source} → ${target})`);
        const result = engine.transliterate(input, source, target);
        console.log(`   📝 Result: "${result}"\n`);
      }
      
      prompt();
    });
  }

  prompt();
}

export default startInteractive;