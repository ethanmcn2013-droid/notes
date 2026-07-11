import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

const file = 'src/components/system/SuiteLoader.tsx';
const expected = '95e28dc4d049e0a215c3e9b820e9ceb6460440c8c3a65d2627bf99eb9649f185';

if (!existsSync(file)) {
  console.error(`ERROR: ${file} not found. Run from repo root.`);
  process.exit(1);
}

const actual = createHash('sha256')
  .update(readFileSync(file, 'utf8').replaceAll('\r', ''), 'utf8')
  .digest('hex');

if (actual !== expected) {
  console.error('FAIL: SuiteLoader.tsx has drifted from canonical reference.');
  console.error(`  Expected: ${expected}`);
  console.error(`  Actual:   ${actual}`);
  console.error('  Fix: copy studio/src/components/system/SuiteLoader.tsx byte-identical to this repo.');
  process.exit(1);
}

console.log('OK: SuiteLoader.tsx is byte-identical to canonical reference.');
