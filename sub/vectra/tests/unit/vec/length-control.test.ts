/**
 * vec length control helper unit test.
 *
 * clampLengthInto          — 벡터 길이를 [min, max] 범위로 clamp한다.
 * setLengthInto / setLength — 벡터 길이를 지정한 값으로 설정한다.
 */

import { describe, expect, test } from 'vitest';
import { clampLengthInto } from '../../../src/vec/clamp-length-into';
import { setLength } from '../../../src/vec/set-length';
import { setLengthInto } from '../../../src/vec/set-length-into';

// ---------------------------------------------------------------------------
// clampLengthInto
// ---------------------------------------------------------------------------

describe('clampLengthInto — 벡터 길이 clamp (Into 버전)', () => {
  test('min보다 짧은 벡터를 minLength로 늘린다', () => {
    const out = { x: 0, y: 0 };
    const result = clampLengthInto(out, { x: 1, y: 0 }, 3, 5);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('max보다 긴 벡터를 maxLength로 줄인다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: 10, y: 0 }, 3, 5);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('범위 안 벡터는 그대로 복사한다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: 4, y: 0 }, 3, 5);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('zero vector는 (0, 0)을 기록한다', () => {
    const out = { x: 9, y: 9 };
    clampLengthInto(out, { x: 0, y: 0 }, 1, 5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('대각선 벡터 — min clamp 길이가 정확하다', () => {
    const out = { x: 0, y: 0 };
    // 길이 1 벡터 → minLength 4로 늘린다
    const v = { x: 1 / Math.sqrt(2), y: 1 / Math.sqrt(2) };
    clampLengthInto(out, v, 4, 10);
    const len = Math.hypot(out.x, out.y);
    expect(len).toBeCloseTo(4);
  });

  test('대각선 벡터 — max clamp 길이가 정확하다', () => {
    const out = { x: 0, y: 0 };
    // 길이 20 벡터 → maxLength 6으로 줄인다
    clampLengthInto(out, { x: 20 / Math.sqrt(2), y: 20 / Math.sqrt(2) }, 2, 6);
    const len = Math.hypot(out.x, out.y);
    expect(len).toBeCloseTo(6);
  });

  test('out === vector aliasing에서 안전하다', () => {
    const v = { x: 1, y: 0 };
    clampLengthInto(v, v, 3, 5);
    expect(v.x).toBeCloseTo(3);
    expect(v.y).toBeCloseTo(0);
  });

  test('mutable tuple out 타입 유지 — tuple을 out으로 받는다', () => {
    const out: [number, number] = [0, 0];
    const result = clampLengthInto(out, { x: 1, y: 0 }, 3, 5);
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(3);
    expect(out[1]).toBeCloseTo(0);
  });

  test('object input — x/y field로 읽는다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: 0, y: 10 }, 2, 4);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(4);
  });

  test('tuple input — [x, y] 형태로 읽는다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, [0, 0.5] as const, 2, 8);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('NaN 입력은 NaN을 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: Number.NaN, y: 0 }, 1, 5);
    expect(Number.isNaN(out.x) || Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity 입력은 JavaScript 연산 결과를 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: Infinity, y: 0 }, 1, 5);
    // Math.hypot(Infinity, 0) === Infinity, len > max → s = 5/Infinity = 0, Infinity * 0 = NaN
    expect(Number.isNaN(out.x)).toBe(true);
  });

  test('-Infinity 입력은 JavaScript 연산 결과를 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    clampLengthInto(out, { x: -Infinity, y: 0 }, 1, 5);
    // -Infinity * 0 = NaN
    expect(Number.isNaN(out.x)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setLengthInto
// ---------------------------------------------------------------------------

describe('setLengthInto — 벡터 길이 설정 (Into 버전)', () => {
  test('일반 벡터에 targetLength를 적용한다', () => {
    const out = { x: 0, y: 0 };
    const result = setLengthInto(out, { x: 3, y: 0 }, 7);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(7);
    expect(out.y).toBeCloseTo(0);
  });

  test('zero vector는 (0, 0)을 기록한다', () => {
    const out = { x: 9, y: 9 };
    setLengthInto(out, { x: 0, y: 0 }, 5);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('대각선 벡터 — 결과 길이가 targetLength와 일치한다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: 3, y: 4 }, 10);
    const len = Math.hypot(out.x, out.y);
    expect(len).toBeCloseTo(10);
  });

  test('방향이 보존된다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: 0, y: 1 }, 5);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(5);
  });

  test('out === vector aliasing에서 안전하다', () => {
    const v = { x: 3, y: 4 };
    setLengthInto(v, v, 10);
    const len = Math.hypot(v.x, v.y);
    expect(len).toBeCloseTo(10);
  });

  test('mutable tuple out 타입 유지 — tuple을 out으로 받는다', () => {
    const out: [number, number] = [0, 0];
    const result = setLengthInto(out, { x: 1, y: 0 }, 5);
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(5);
    expect(out[1]).toBeCloseTo(0);
  });

  test('object input — x/y field로 읽는다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: 0, y: 3 }, 9);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(9);
  });

  test('tuple input — [x, y] 형태로 읽는다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, [1, 0] as const, 4);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('NaN 입력은 NaN을 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: Number.NaN, y: 0 }, 5);
    expect(Number.isNaN(out.x) || Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity 입력은 JavaScript 연산 결과를 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: Infinity, y: 0 }, 5);
    // Math.hypot(Infinity, 0) === Infinity, s = 5/Infinity = 0, Infinity * 0 = NaN
    expect(Number.isNaN(out.x)).toBe(true);
  });

  test('-Infinity 입력은 JavaScript 연산 결과를 그대로 흘린다', () => {
    const out = { x: 0, y: 0 };
    setLengthInto(out, { x: -Infinity, y: 0 }, 5);
    // -Infinity * 0 = NaN
    expect(Number.isNaN(out.x)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setLength (companion)
// ---------------------------------------------------------------------------

describe('setLength — 벡터 길이 설정 (companion 버전)', () => {
  test('targetLength 길이의 새 벡터를 반환한다', () => {
    const result = setLength({ x: 1, y: 0 }, 5);
    expect(result.x).toBeCloseTo(5);
    expect(result.y).toBeCloseTo(0);
  });
});
