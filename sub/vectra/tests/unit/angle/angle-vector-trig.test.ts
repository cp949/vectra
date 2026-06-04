/**
 * angle domain vector 변환과 sin/cos 변환 helper를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { angleFromSinCos } from '../../../src/angle/angle-from-sin-cos';
import { fromVector } from '../../../src/angle/from-vector';
import { sinCos } from '../../../src/angle/sin-cos';
import { sinCosInto } from '../../../src/angle/sin-cos-into';
import { toUnitVector } from '../../../src/angle/to-unit-vector';
import { toUnitVectorInto } from '../../../src/angle/to-unit-vector-into';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('toUnitVectorInto - 각도에서 unit vector 기록', () => {
  test('angle=0 → object output { x: 1, y: 0 }', () => {
    const out = { x: 0, y: 0 };
    const result = toUnitVectorInto(out, 0);
    expect(result).toBe(out);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('angle=π/2 → object output { x: 0, y: 1 }에 가깝다', () => {
    const out = { x: 0, y: 0 };
    const result = toUnitVectorInto(out, Math.PI / 2);
    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });

  test('angle=π → { x: -1, y: 0 }에 가깝다', () => {
    const out = { x: 0, y: 0 };
    const result = toUnitVectorInto(out, Math.PI);
    expect(result.x).toBeCloseTo(-1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('tuple output에 기록하고 같은 tuple을 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = toUnitVectorInto(out, Math.PI / 2);
    expect(result).toBe(out);
    expect(result[0]).toBeCloseTo(0, 10);
    expect(result[1]).toBeCloseTo(1, 10);
  });

  test('out 구체 타입이 보존된다 (타입 레벨 확인)', () => {
    // 컴파일 오류 없이 타입이 보존되면 통과
    const obj = { x: 0, y: 0, label: 'test' };
    const result = toUnitVectorInto(obj, 0);
    expect(result.label).toBe('test');
  });

  test.each(nonFiniteValues)('finite하지 않은 angle %s는 RangeError를 던진다', (value) => {
    expect(() => toUnitVectorInto({ x: 0, y: 0 }, value)).toThrow(RangeError);
  });
});

describe('toUnitVector - 각도에서 unit vector 새 object 반환', () => {
  test('angle=0 → { x: 1, y: 0 }에 가깝다', () => {
    const result = toUnitVector(0);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('angle=π/2 → { x: 0, y: 1 }에 가깝다', () => {
    const result = toUnitVector(Math.PI / 2);
    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });

  test('새 object를 반환한다', () => {
    const a = toUnitVector(0);
    const b = toUnitVector(0);
    expect(a).not.toBe(b);
  });

  test.each(nonFiniteValues)('finite하지 않은 angle %s는 RangeError를 던진다', (value) => {
    expect(() => toUnitVector(value)).toThrow(RangeError);
  });
});

describe('fromVector - 벡터에서 angle 추출', () => {
  test('{ x: 1, y: 0 } → 0이다', () => {
    expect(fromVector({ x: 1, y: 0 })).toBe(0);
  });

  test('{ x: 0, y: 1 } → π/2이다', () => {
    expect(fromVector({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2, 10);
  });

  test('{ x: -1, y: 0 } → π이다', () => {
    expect(fromVector({ x: -1, y: 0 })).toBeCloseTo(Math.PI, 10);
  });

  test('{ x: 0, y: -1 } → -π/2이다', () => {
    expect(fromVector({ x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2, 10);
  });

  test('zero vector { x: 0, y: 0 } → 0이다 (atan2(0,0) fallback)', () => {
    expect(fromVector({ x: 0, y: 0 })).toBe(0);
  });

  test('tuple input [0, 1] → π/2이다', () => {
    expect(fromVector([0, 1])).toBeCloseTo(Math.PI / 2, 10);
  });

  test('tuple zero vector [0, 0] → 0이다', () => {
    expect(fromVector([0, 0])).toBe(0);
  });

  test.each(nonFiniteValues)('x 성분이 finite하지 않은 %s이면 RangeError를 던진다', (value) => {
    expect(() => fromVector({ x: value, y: 0 })).toThrow(RangeError);
    expect(() => fromVector([value, 0])).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('y 성분이 finite하지 않은 %s이면 RangeError를 던진다', (value) => {
    expect(() => fromVector({ x: 0, y: value })).toThrow(RangeError);
    expect(() => fromVector([0, value])).toThrow(RangeError);
  });
});

describe('sinCosInto - sin/cos 기록', () => {
  test('angle=0 → sin=0, cos=1을 기록하고 out을 반환한다', () => {
    const out = { sin: 0, cos: 0 };
    const result = sinCosInto(out, 0);
    expect(result).toBe(out);
    expect(result.sin).toBeCloseTo(0, 10);
    expect(result.cos).toBeCloseTo(1, 10);
  });

  test('angle=π/2 → sin=1, cos=0에 가깝다', () => {
    const out = { sin: 0, cos: 0 };
    const result = sinCosInto(out, Math.PI / 2);
    expect(result.sin).toBeCloseTo(1, 10);
    expect(result.cos).toBeCloseTo(0, 10);
  });

  test('angle=π → sin=0, cos=-1에 가깝다', () => {
    const out = { sin: 0, cos: 0 };
    const result = sinCosInto(out, Math.PI);
    expect(result.sin).toBeCloseTo(0, 10);
    expect(result.cos).toBeCloseTo(-1, 10);
  });

  test('out 구체 타입이 보존된다', () => {
    const out = { sin: 0, cos: 0, label: 'test' };
    const result = sinCosInto(out, 0);
    expect(result.label).toBe('test');
  });

  test.each(nonFiniteValues)('finite하지 않은 angle %s는 RangeError를 던진다', (value) => {
    expect(() => sinCosInto({ sin: 0, cos: 0 }, value)).toThrow(RangeError);
  });
});

describe('sinCos - sin/cos 새 object 반환', () => {
  test('angle=0 → { sin: 0, cos: 1 }에 가깝다', () => {
    const result = sinCos(0);
    expect(result.sin).toBeCloseTo(0, 10);
    expect(result.cos).toBeCloseTo(1, 10);
  });

  test('angle=π/4 → sin/cos 모두 √2/2에 가깝다', () => {
    const expected = Math.SQRT2 / 2;
    const result = sinCos(Math.PI / 4);
    expect(result.sin).toBeCloseTo(expected, 10);
    expect(result.cos).toBeCloseTo(expected, 10);
  });

  test('새 object를 반환한다', () => {
    const a = sinCos(0);
    const b = sinCos(0);
    expect(a).not.toBe(b);
  });

  test.each(nonFiniteValues)('finite하지 않은 angle %s는 RangeError를 던진다', (value) => {
    expect(() => sinCos(value)).toThrow(RangeError);
  });
});

describe('angleFromSinCos - sin/cos로부터 angle 복원', () => {
  test('(0, 1) → 0이다', () => {
    expect(angleFromSinCos(0, 1)).toBe(0);
  });

  test('(1, 0) → π/2이다', () => {
    expect(angleFromSinCos(1, 0)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('(0, -1) → π이다', () => {
    expect(angleFromSinCos(0, -1)).toBeCloseTo(Math.PI, 10);
  });

  test('(-1, 0) → -π/2이다', () => {
    expect(angleFromSinCos(-1, 0)).toBeCloseTo(-Math.PI / 2, 10);
  });

  test('(-0, -1) → Math.PI이다 (signed zero 정규화)', () => {
    expect(angleFromSinCos(-0, -1)).toBe(Math.PI);
  });

  test('(0, 0) → 0이다', () => {
    expect(angleFromSinCos(0, 0)).toBe(0);
  });

  test.each(nonFiniteValues)('sin에 finite하지 않은 값 %s는 RangeError를 던진다', (value) => {
    expect(() => angleFromSinCos(value, 0)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('cos에 finite하지 않은 값 %s는 RangeError를 던진다', (value) => {
    expect(() => angleFromSinCos(0, value)).toThrow(RangeError);
  });
});
