/**
 * triangle similarTo 단위 테스트.
 *
 * fixed vertex correspondence(A↔A', B↔B', C↔C') 기준의 side-length ratio 비교,
 * 기본 reflection 불허(orientation 부호), allowReflection option, epsilon 경계,
 * degenerate/non-finite 처리, tuple/object input을 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { similarTo } from '../../../src/triangle/similar-to';

/** 3-4-5 직각삼각형(CCW): AB=3, BC=5, CA=4 */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };

describe('similarTo', () => {
  test('동일 triangle: true를 반환한다', () => {
    expect(similarTo(right345, right345)).toBe(true);
  });

  test('scale만 다른 같은 orientation triangle: true를 반환한다', () => {
    const scaled = { a: { x: 0, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 8 } };
    expect(similarTo(right345, scaled)).toBe(true);
  });

  test('translate한 triangle: true를 반환한다', () => {
    const moved = { a: { x: 10, y: 5 }, b: { x: 13, y: 5 }, c: { x: 10, y: 9 } };
    expect(similarTo(right345, moved)).toBe(true);
  });

  test('90도 회전한 triangle: true를 반환한다', () => {
    // (x, y) -> (-y, x) 회전. 변 길이와 orientation을 보존한다.
    const rotated = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: -4, y: 0 } };
    expect(similarTo(right345, rotated)).toBe(true);
  });

  test('vertex order가 바뀐 같은 모양: fixed correspondence라 false를 반환한다', () => {
    // right345의 vertex를 (B, C, A)로 cyclic rotate. 대응 변 ratio가 어긋난다.
    const reordered = { a: { x: 3, y: 0 }, b: { x: 0, y: 4 }, c: { x: 0, y: 0 } };
    expect(similarTo(right345, reordered)).toBe(false);
  });

  test('reflected triangle: 기본은 false를 반환한다', () => {
    // x축 대칭. 변 길이는 같지만 orientation 부호가 반대다.
    const reflected = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: -4 } };
    expect(similarTo(right345, reflected)).toBe(false);
  });

  test('reflected triangle: allowReflection이면 true를 반환한다', () => {
    const reflected = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: -4 } };
    expect(similarTo(right345, reflected, { allowReflection: true })).toBe(true);
  });

  test('reflected + scale: allowReflection이면 true를 반환한다', () => {
    const reflectedScaled = { a: { x: 0, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: -8 } };
    expect(similarTo(right345, reflectedScaled, { allowReflection: true })).toBe(true);
  });

  test('모양이 다른 triangle: false를 반환한다', () => {
    const different = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 }, c: { x: 2, y: 2 } };
    expect(similarTo(right345, different)).toBe(false);
  });

  test('epsilon 경계: 거의 닮은 triangle은 기본 1e-9에서 false, 큰 epsilon에서 true', () => {
    // scaled x2에서 C를 4e-7만큼 어긋나게 둔다. ratio 차이 ~1e-7.
    const almost = { a: { x: 0, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 8.0000004 } };
    expect(similarTo(right345, almost)).toBe(false);
    expect(similarTo(right345, almost, { epsilon: 1e-3 })).toBe(true);
  });

  test('음수 epsilon: RangeError를 던진다', () => {
    expect(() => similarTo(right345, right345, { epsilon: -1 })).toThrow(RangeError);
  });

  test('NaN epsilon: 비교가 모두 false가 되어 false를 반환한다', () => {
    expect(similarTo(right345, right345, { epsilon: NaN })).toBe(false);
  });

  test('첫 번째 triangle이 collinear(degenerate): false를 반환한다', () => {
    const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(similarTo(collinear, right345)).toBe(false);
  });

  test('두 번째 triangle이 single-point(degenerate): false를 반환한다', () => {
    const singlePoint = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 1, y: 1 } };
    expect(similarTo(right345, singlePoint)).toBe(false);
  });

  test('non-finite vertex(Infinity): false를 반환한다', () => {
    const bad = { a: { x: Infinity, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };
    expect(similarTo(bad, right345)).toBe(false);
  });

  test('non-finite vertex(NaN): false를 반환한다', () => {
    const bad = { a: { x: 0, y: 0 }, b: { x: NaN, y: 0 }, c: { x: 0, y: 4 } };
    expect(similarTo(right345, bad)).toBe(false);
  });

  test('non-finite vertex(-Infinity): false를 반환한다', () => {
    const bad = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: -Infinity } };
    expect(similarTo(right345, bad)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const a = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const b = [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: 8 },
    ] as const;
    expect(similarTo(a, b)).toBe(true);
  });

  test('tuple과 object input을 섞어도 처리한다', () => {
    const b = [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: 8 },
    ] as const;
    expect(similarTo(right345, b)).toBe(true);
  });
});
