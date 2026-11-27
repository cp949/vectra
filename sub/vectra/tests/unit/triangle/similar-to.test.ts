/**
 * triangle similarTo 단위 테스트.
 *
 * fixed vertex correspondence(A↔A', B↔B', C↔C') 기준의 side-length ratio 비교,
 * 기본 reflection 불허(orientation 부호), allowReflection option, epsilon 경계,
 * degenerate/non-finite 처리을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { similarTo } from '../../../src/triangle/similar-to';

/** 3-4-5 직각삼각형(CCW): AB=3, BC=5, CA=4 */
const right345 = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };

describe('similarTo', () => {
  test('동일 triangle: true를 반환한다', () => {
    expect(similarTo(right345, right345)).toBe(true);
  });

  test('scale만 다른 같은 orientation triangle: true를 반환한다', () => {
    const scaled = { x1: 0, y1: 0, x2: 6, y2: 0, x3: 0, y3: 8 };
    expect(similarTo(right345, scaled)).toBe(true);
  });

  test('translate한 triangle: true를 반환한다', () => {
    const moved = { x1: 10, y1: 5, x2: 13, y2: 5, x3: 10, y3: 9 };
    expect(similarTo(right345, moved)).toBe(true);
  });

  test('90도 회전한 triangle: true를 반환한다', () => {
    // (x, y) -> (-y, x) 회전. 변 길이와 orientation을 보존한다.
    const rotated = { x1: 0, y1: 0, x2: 0, y2: 3, x3: -4, y3: 0 };
    expect(similarTo(right345, rotated)).toBe(true);
  });

  test('vertex order가 바뀐 같은 모양: fixed correspondence라 false를 반환한다', () => {
    // right345의 vertex를 (B, C, A)로 cyclic rotate. 대응 변 ratio가 어긋난다.
    const reordered = { x1: 3, y1: 0, x2: 0, y2: 4, x3: 0, y3: 0 };
    expect(similarTo(right345, reordered)).toBe(false);
  });

  test('reflected triangle: 기본은 false를 반환한다', () => {
    // x축 대칭. 변 길이는 같지만 orientation 부호가 반대다.
    const reflected = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: -4 };
    expect(similarTo(right345, reflected)).toBe(false);
  });

  test('reflected triangle: allowReflection이면 true를 반환한다', () => {
    const reflected = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: -4 };
    expect(similarTo(right345, reflected, { epsilon: 1e-9, allowReflection: true })).toBe(true);
  });

  test('reflected + scale: allowReflection이면 true를 반환한다', () => {
    const reflectedScaled = { x1: 0, y1: 0, x2: 6, y2: 0, x3: 0, y3: -8 };
    expect(similarTo(right345, reflectedScaled, { epsilon: 1e-9, allowReflection: true })).toBe(true);
  });

  test('모양이 다른 triangle: false를 반환한다', () => {
    const different = { x1: 0, y1: 0, x2: 5, y2: 0, x3: 2, y3: 2 };
    expect(similarTo(right345, different)).toBe(false);
  });

  test('epsilon 경계: 거의 닮은 triangle은 기본 1e-9에서 false, 큰 epsilon에서 true', () => {
    // scaled x2에서 C를 4e-7만큼 어긋나게 둔다. ratio 차이 ~1e-7.
    const almost = { x1: 0, y1: 0, x2: 6, y2: 0, x3: 0, y3: 8.0000004 };
    expect(similarTo(right345, almost)).toBe(false);
    expect(similarTo(right345, almost, { epsilon: 1e-3, allowReflection: false })).toBe(true);
  });

  test('음수 epsilon: RangeError를 던진다', () => {
    expect(() => similarTo(right345, right345, { epsilon: -1, allowReflection: false })).toThrow(RangeError);
  });

  test('NaN epsilon: 비교가 모두 false가 되어 false를 반환한다', () => {
    expect(similarTo(right345, right345, { epsilon: NaN, allowReflection: false })).toBe(false);
  });

  test('첫 번째 triangle이 collinear(degenerate): false를 반환한다', () => {
    const collinear = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    expect(similarTo(collinear, right345)).toBe(false);
  });

  test('두 번째 triangle이 single-point(degenerate): false를 반환한다', () => {
    const singlePoint = { x1: 1, y1: 1, x2: 1, y2: 1, x3: 1, y3: 1 };
    expect(similarTo(right345, singlePoint)).toBe(false);
  });

  test('non-finite vertex(Infinity): false를 반환한다', () => {
    const bad = { x1: Infinity, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    expect(similarTo(bad, right345)).toBe(false);
  });

  test('non-finite vertex(NaN): false를 반환한다', () => {
    const bad = { x1: 0, y1: 0, x2: NaN, y2: 0, x3: 0, y3: 4 };
    expect(similarTo(right345, bad)).toBe(false);
  });

  test('non-finite vertex(-Infinity): false를 반환한다', () => {
    const bad = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: -Infinity };
    expect(similarTo(right345, bad)).toBe(false);
  });
});
