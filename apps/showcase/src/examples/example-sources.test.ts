import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertUniqueExampleIds } from '@repo/playground';
import { describe, expect, it } from 'vitest';
import { EXAMPLES } from './catalog';

const EXAMPLES_DIR = dirname(fileURLToPath(import.meta.url));

describe('showcase examples', () => {
  it('uses unique slug ids', () => {
    expect(() => assertUniqueExampleIds(EXAMPLES)).not.toThrow();
  });

  it('stores executable TypeScript source for each example', () => {
    for (const example of EXAMPLES) {
      expect(example.source.language).toBe('ts');
      expect(example.source.code).toContain('export async function setup');
    }
  });

  it('source.exam.ts files are executable source files, not string wrappers', () => {
    for (const example of EXAMPLES) {
      const sourcePath = join(EXAMPLES_DIR, example.id, 'source.exam.ts');
      const source = readFileSync(sourcePath, 'utf8');

      expect(source).not.toMatch(/^export const source = String\.raw`/);
      expect(source).toContain("import * as PIXI from 'pixi.js';");
      expect(source).toContain('export async function setup');
    }
  });
});
