import { describe, expect, test } from 'vitest';
import { decompose } from '../../../src/matrix/decompose';
import { decomposeScaling } from '../../../src/matrix/decompose-scaling';
import { decomposeScalingInto } from '../../../src/matrix/decompose-scaling-into';
import { decomposeTranslation } from '../../../src/matrix/decompose-translation';
import { decomposeTranslationInto } from '../../../src/matrix/decompose-translation-into';
import { rotation } from '../../../src/matrix/rotation';
import { skewing } from '../../../src/matrix/skewing';
import { skewingInto } from '../../../src/matrix/skewing-into';
import type { MatrixLike, XYTupleWritable } from '../../../src/types';

describe('decomposeTranslation - tx/ty 추출', () => {
  test('decomposeTranslationInto는 tx/ty를 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = decomposeTranslationInto(out, { a: 2, b: 3, c: 4, d: 5, tx: 7, ty: 11 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 11 });
  });

  test('decomposeTranslation은 plain { x, y }를 반환한다', () => {
    expect(decomposeTranslation({ a: 1, b: 0, c: 0, d: 1, tx: -3, ty: 13 })).toEqual({ x: -3, y: 13 });
  });

  test('tuple matrix input', () => {
    expect(decomposeTranslation([1, 0, 0, 1, 5, 6])).toEqual({ x: 5, y: 6 });
  });

  test('tuple output에 기록한다', () => {
    const out: XYTupleWritable = [0, 0];
    decomposeTranslationInto(out, { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 7 });
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(7);
  });

  test('non-finite tx/ty는 pass through한다', () => {
    expect(decomposeTranslation({ a: 1, b: 0, c: 0, d: 1, tx: Number.NaN, ty: Number.POSITIVE_INFINITY })).toEqual({
      x: Number.NaN,
      y: Number.POSITIVE_INFINITY,
    });
  });
});

describe('decomposeScaling - scaling 추출', () => {
  test('decomposeScalingInto는 scaling을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = decomposeScalingInto(out, { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(3, 12);
  });

  test('decomposeScaling은 plain { x, y }를 반환한다', () => {
    const result = decomposeScaling({ a: 0, b: 2, c: -2, d: 0, tx: 0, ty: 0 });
    // r = 2. rotation = atan2(2, 0) = π/2. scaling.y = det/r = (0 - (-4))/2 = 2.
    expect(result.x).toBeCloseTo(2, 12);
    expect(result.y).toBeCloseTo(2, 12);
  });

  test('reflection에서 scaling.y는 음수다', () => {
    const result = decomposeScaling({ a: 1, b: 0, c: 0, d: -1, tx: 0, ty: 0 });
    expect(result.x).toBeCloseTo(1, 12);
    expect(result.y).toBeCloseTo(-1, 12);
  });

  test('singular case 2에서 scaling.x = 0', () => {
    const result = decomposeScaling({ a: 0, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result.x).toBe(0);
    expect(result.y).toBeCloseTo(1, 12);
  });
});

describe('rotation - rotation 추출', () => {
  test('identity는 0', () => {
    expect(rotation({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(0);
  });

  test('R(π/2)는 π/2', () => {
    expect(rotation({ a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 })).toBeCloseTo(Math.PI / 2, 12);
  });

  test('R(-π/2)는 -π/2', () => {
    expect(rotation({ a: 0, b: -1, c: 1, d: 0, tx: 0, ty: 0 })).toBeCloseTo(-Math.PI / 2, 12);
  });

  test('atan2 -π signed-zero 경계는 π로 정규화된다', () => {
    // a = -1, b = -0. atan2(-0, -1) = -π → π로 정규화.
    expect(rotation({ a: -1, b: -0, c: 0, d: -1, tx: 0, ty: 0 })).toBe(Math.PI);
  });

  test('a = -1, b = 0 (signed zero가 아닌)도 π를 반환한다', () => {
    expect(rotation({ a: -1, b: 0, c: 0, d: -1, tx: 0, ty: 0 })).toBe(Math.PI);
  });

  test('singular case 2는 y-basis 기반', () => {
    expect(rotation({ a: 0, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(0);
    expect(rotation({ a: 0, b: 0, c: -1, d: 0, tx: 0, ty: 0 })).toBeCloseTo(Math.PI / 2, 12);
  });

  test('zero matrix는 0', () => {
    expect(rotation({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 })).toBe(0);
  });

  test('tuple matrix input', () => {
    expect(rotation([0, 1, -1, 0, 0, 0])).toBeCloseTo(Math.PI / 2, 12);
  });
});

describe('skewing - skewing 추출', () => {
  test('skewingInto는 skewing을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = skewingInto(out, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(Math.PI / 4, 12);
    expect(out.y).toBe(0);
  });

  test('skewing은 plain { x, y }를 반환한다', () => {
    const result = skewing({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result).toEqual({ x: 0, y: 0 });
  });

  test('skewing.y는 항상 0', () => {
    const result = skewing({ a: 2, b: -1, c: 3, d: 4, tx: 0, ty: 0 });
    expect(result.y).toBe(0);
  });

  test('singular case 2에서 skewing은 0', () => {
    const result = skewing({ a: 0, b: 0, c: 1, d: 2, tx: 0, ty: 0 });
    expect(result).toEqual({ x: 0, y: 0 });
  });

  test('zero matrix에서 skewing은 0', () => {
    const result = skewing({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('decomposition 부분 함수는 decompose와 같은 oracle을 공유한다', () => {
  test('각 부분 함수의 결과가 decompose 결과와 일치한다', () => {
    const matrix: MatrixLike = {
      a: 1.5,
      b: 0.8,
      c: -0.3,
      d: 2.1,
      tx: 7,
      ty: -3,
    };
    const full = decompose(matrix);
    const trans = decomposeTranslation(matrix);
    const scale = decomposeScaling(matrix);
    const rot = rotation(matrix);
    const skew = skewing(matrix);

    expect(trans).toEqual(full.translation);
    expect(scale.x).toBe(full.scaling.x);
    expect(scale.y).toBe(full.scaling.y);
    expect(rot).toBe(full.rotation);
    expect(skew.x).toBe(full.skewing.x);
    expect(skew.y).toBe(full.skewing.y);
  });
});
