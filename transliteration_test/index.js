#!/usr/bin/env node

/**
 * BookQubit Transliteration Test
 * Main entry point for the transliteration test harness
 */

import runTests from './src/tests.js';
import startInteractive from './src/interactive.js';

// Parse command line arguments
const args = process.argv.slice(2);

function showHelp() {
  console.log(`
📖 BookQubit Transliteration Test

Usage:
  node index.js [options]

Options:
  --test, -t          Run the test suite
  --interactive, -i   Start interactive mode
  --validate, -v      Validate transliterations
  --help, -h          Show this help

Examples:
  node index.js --test       # Run all tests
  node index.js --interactive # Start interactive mode
  node index.js -i           # Same as above
  `);
}

async function main() {
  // No args or help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Test mode
  if (args.includes('--test') || args.includes('-t')) {
    const verbose = !args.includes('--quiet');
    runTests(verbose);
    return;
  }

  // Interactive mode
  if (args.includes('--interactive') || args.includes('-i')) {
    await startInteractive();
    return;
  }

  // Validate mode
  if (args.includes('--validate') || args.includes('-v')) {
    console.log('🔍 Validating transliterations...');
    const { runValidation } = await import('./src/validate.js');
    await runValidation();
    return;
  }

  // Unknown option
  console.log(`❌ Unknown option: ${args[0]}`);
  showHelp();
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});