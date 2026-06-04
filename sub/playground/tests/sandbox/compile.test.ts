/**
 * compileForSandbox 단위 테스트
 *
 * 핵심 변환 동작(import 파싱, allowlist 검증, export 제거)을 검증한다.
 */
import { describe, expect, it } from 'vitest';
import { compileForSandbox } from '../../src/sandbox/compile';

/** 테스트용 허용 specifier 목록 */
const ALLOWED = ['@cp949/vectra/vec', '@cp949/vectra/vec/add-into', '@cp949/vectra/finite-line'];

describe('compileForSandbox', () => {
  describe('named import 변환', () => {
    it('단일 named import를 __modules__ 참조로 변환한다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      // leaf specifier /vectra/vec/add-into → barrel /vectra/vec 로 매핑된다
      expect(result.compiledJs).toContain('const { addInto } = __modules__["@cp949/vectra/vec"]');
      expect(result.specifiers).toContain('@cp949/vectra/vec/add-into');
    });

    it('복수 named import를 구조분해 할당으로 변환한다', () => {
      const src = `import { addInto, subInto } from '@cp949/vectra/vec';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.compiledJs).toContain('const { addInto, subInto } = __modules__["@cp949/vectra/vec"]');
    });

    it('alias import를 올바르게 처리한다 (a as b 형태)', () => {
      const src = `import { addInto as add } from '@cp949/vectra/vec';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.compiledJs).toContain('addInto: add');
    });
  });

  describe('타입 import 무시', () => {
    it('import type은 변환하지 않고 무시한다 (specifier 수집 안 함)', () => {
      const src = `import type { XYLike } from '@cp949/vectra/vec';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.specifiers).not.toContain('@cp949/vectra/vec');
    });
  });

  describe('export 키워드 제거', () => {
    it('export function을 function으로 변환한다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export function draw(ctx, runtime) { return addInto; }`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.compiledJs).toContain('function draw(');
      expect(result.compiledJs).not.toMatch(/^export function/m);
    });

    it('export const를 const로 변환한다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export const x = 1;
export function draw() { return addInto; }`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.compiledJs).toContain('const x = 1');
      expect(result.compiledJs).not.toMatch(/^export const/m);
    });
  });

  describe('allowlist 검증', () => {
    it('허용되지 않은 specifier는 error diagnostic을 반환한다', () => {
      const src = `import { readFileSync } from 'fs';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.severity).toBe('error');
      expect(result.diagnostics[0]?.source).toBe('import');
      expect(result.diagnostics[0]?.message).toContain("'fs'");
      expect(result.compiledJs).toBe('');
    });

    it('허용되지 않은 specifier가 있으면 compiledJs를 빈 문자열로 반환한다', () => {
      const src = `import { something } from 'react';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.compiledJs).toBe('');
      expect(result.specifiers).toHaveLength(0);
    });

    it('허용된 specifier만 사용하면 오류가 없다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
    });
  });

  describe('TypeScript 타입 제거', () => {
    it('TypeScript 타입 어노테이션을 제거한다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export function draw(ctx: CanvasRenderingContext2D): void {
  const out: { x: number; y: number } = { x: 0, y: 0 };
  addInto(out, { x: 1, y: 2 }, { x: 3, y: 4 });
}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      // 타입 어노테이션이 제거되어야 한다
      expect(result.compiledJs).not.toContain(': CanvasRenderingContext2D');
      expect(result.compiledJs).not.toContain(': void');
      expect(result.compiledJs).toContain('function draw(');
    });
  });

  describe('specifier 중복 제거', () => {
    it('같은 specifier를 여러 번 import해도 한 번만 수집한다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec';
import { subInto } from '@cp949/vectra/vec';
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.specifiers.filter((s) => s === '@cp949/vectra/vec')).toHaveLength(1);
    });
  });

  describe('dynamic import / require 차단', () => {
    it('dynamic import()를 import diagnostic으로 차단한다', () => {
      const src = `const m = await import('@cp949/vectra/vec');
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.source).toBe('import');
      expect(result.diagnostics[0]?.severity).toBe('error');
      expect(result.diagnostics[0]?.message).toContain('dynamic import()');
      expect(result.compiledJs).toBe('');
    });

    it('require() 호출을 import diagnostic으로 차단한다', () => {
      const src = `const fs = require('fs');
export function draw() {}`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.source).toBe('import');
      expect(result.diagnostics[0]?.severity).toBe('error');
      expect(result.diagnostics[0]?.message).toContain('require()');
      expect(result.compiledJs).toBe('');
    });
  });

  describe('namespace import 및 leaf specifier 변환', () => {
    it('namespace import를 __modules__[specifier] 전체 참조로 변환한다', () => {
      const src = `import * as vec from '@cp949/vectra/vec';
export function draw() { return vec; }`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      expect(result.compiledJs).toContain('const vec = __modules__["@cp949/vectra/vec"]');
    });

    it('leaf specifier를 barrel 경로로 해석하여 __modules__ 키와 일치시킨다', () => {
      const src = `import { addInto } from '@cp949/vectra/vec/add-into';
export function draw() { return addInto; }`;
      const result = compileForSandbox(src, { allowedSpecifiers: ALLOWED });

      expect(result.diagnostics).toHaveLength(0);
      // leaf specifier /vectra/vec/add-into → barrel /vectra/vec
      expect(result.compiledJs).toContain('__modules__["@cp949/vectra/vec"]');
    });
  });
});
