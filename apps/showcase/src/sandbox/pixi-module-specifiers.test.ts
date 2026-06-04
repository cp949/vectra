import { describe, expect, it } from 'vitest';
import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };
import { SHOWCASE_ALLOWED_SPECIFIERS, SHOWCASE_RUNTIME_MODULE_SPECIFIERS } from './pixi-module-specifiers';

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

describe('showcase sandbox module specifiers', () => {
  it('vectra sandbox allowlist가 package exports에서 파생된다', () => {
    const specifiers = packageExportSpecifiers();

    expect(SHOWCASE_ALLOWED_SPECIFIERS).toEqual(['pixi.js', ...specifiers]);
    expect(SHOWCASE_RUNTIME_MODULE_SPECIFIERS).toEqual(specifiers);
  });
});
