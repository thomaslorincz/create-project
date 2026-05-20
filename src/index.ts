#!/usr/bin/env bun

import { run } from './scaffold.ts';

try {
  await run(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`\ncreate-project failed: ${message}`);
  process.exit(1);
}
