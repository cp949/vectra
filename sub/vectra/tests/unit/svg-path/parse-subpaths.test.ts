/**
 * svg-path parseSubpathsInto / parseSubpaths unit test.
 *
 * strict SVG path parse 후 subpath 분리 동작, atomic 실패 정책, allocating companion 일치를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { parseSubpaths } from '../../../src/svg-path/parse-subpaths';
import { parseSubpathsInto } from '../../../src/svg-path/parse-subpaths-into';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// parseSubpathsInto — strict parse 성공
// ──────────────────────────────────────────────
describe('parseSubpathsInto — strict parse 성공', () => {
  test('두 subpath를 분리한다', () => {
    const out: PathCommand[][] = [];
    const ok = parseSubpathsInto(out, 'M 0 0 L 10 0 Z M 20 20 Q 25 10 30 20');
    expect(ok).toBe(true);
    expect(out).toHaveLength(2);
    expect(out[0][0].kind).toBe('move');
    expect(out[1][0].kind).toBe('move');
  });

  test('단일 subpath를 반환한다', () => {
    const out: PathCommand[][] = [];
    const ok = parseSubpathsInto(out, 'M 0 0 L 10 10 Z');
    expect(ok).toBe(true);
    expect(out).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────
// parseSubpathsInto — empty data
// ──────────────────────────────────────────────
describe('parseSubpathsInto — empty data', () => {
  test('빈 string은 true를 반환하고 out은 빈 배열이다', () => {
    const out: PathCommand[][] = [];
    const ok = parseSubpathsInto(out, '');
    expect(ok).toBe(true);
    expect(out).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// parseSubpathsInto — output clear
// ──────────────────────────────────────────────
describe('parseSubpathsInto — output clear', () => {
  test('성공 시 기존 out 내용을 제거하고 새 subpath만 남긴다', () => {
    const sentinel: PathCommand[] = [{ kind: 'close' }];
    const out: PathCommand[][] = [sentinel];
    const ok = parseSubpathsInto(out, 'M 5 5 L 10 10');
    expect(ok).toBe(true);
    expect(out).toHaveLength(1);
    expect(out[0][0].kind).toBe('move');
    expect(out[0][0]).not.toBe(sentinel[0]);
  });
});

// ──────────────────────────────────────────────
// parseSubpathsInto — parse 실패 atomic
// ──────────────────────────────────────────────
describe('parseSubpathsInto — parse 실패 atomic', () => {
  const SENTINEL: PathCommand[] = [{ kind: 'close' }];

  /**
   * 실패 후 out이 변경되지 않았는지 확인할 sentinel 포함 out을 만든다.
   * 각 테스트는 이 out을 받아 parse 실패 시 sentinel이 그대로인지 검증한다.
   */
  function makeOut(): PathCommand[][] {
    return [[...SENTINEL]];
  }

  test('Move 없이 시작하면 false를 반환하고 out은 변경되지 않는다', () => {
    const out = makeOut();
    const ok = parseSubpathsInto(out, 'L 10 10');
    expect(ok).toBe(false);
    expect(out).toHaveLength(1);
    expect(out[0][0].kind).toBe('close');
  });

  test('지원하지 않는 letter가 있으면 false를 반환하고 out은 변경되지 않는다', () => {
    const out = makeOut();
    const ok = parseSubpathsInto(out, 'M 0 0 X 1 1');
    expect(ok).toBe(false);
    expect(out).toHaveLength(1);
    expect(out[0][0].kind).toBe('close');
  });

  test('두 번째 subpath 도중 미지원 letter가 있으면 false를 반환하고 out은 변경되지 않는다', () => {
    const out = makeOut();
    const ok = parseSubpathsInto(out, 'M 0 0 L 10 10 M 20 20 X 1 1');
    expect(ok).toBe(false);
    expect(out).toHaveLength(1);
    expect(out[0][0].kind).toBe('close');
  });
});

// ──────────────────────────────────────────────
// parseSubpaths — allocating companion
// ──────────────────────────────────────────────
describe('parseSubpaths — allocating companion', () => {
  test('parseSubpathsInto 결과와 deep equal이다', () => {
    const data = 'M 0 0 L 10 0 Z M 20 20 Q 25 10 30 20';
    const expected: PathCommand[][] = [];
    parseSubpathsInto(expected, data);
    expect(parseSubpaths(data)).toEqual(expected);
  });

  test('parse 실패 시 undefined를 반환한다', () => {
    expect(parseSubpaths('M 0 0 X bad')).toBeUndefined();
  });

  test('빈 string은 빈 배열을 반환한다', () => {
    expect(parseSubpaths('')).toEqual([]);
  });

  test('단일 subpath를 반환한다', () => {
    const result = parseSubpaths('M 0 0 L 10 10 Z');
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });
});
