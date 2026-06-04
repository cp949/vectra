import { describe, expect, expectTypeOf, test } from 'vitest';
import { equals } from '../../../src/vec/equals';
import { nearEquals } from '../../../src/vec/near-equals';
import { normalizeInto } from '../../../src/vec/normalize-into';

describe('vec equality - equals', () => {
  test('object와 tuple이 같은 좌표이면 true를 반환한다', () => {
    expect(equals({ x: 1, y: 2 }, [1, 2])).toBe(true);
  });

  test('1 ULP 차이는 false를 반환한다', () => {
    // 수 2의 ULP는 2 * Number.EPSILON이므로 그것이 실제 다음 float64 값이다.
    // 2 + Number.EPSILON은 float64에서 여전히 2이므로 2 * Number.EPSILON을 사용한다.
    expect(equals({ x: 1, y: 2 }, { x: 1, y: 2 + 2 * Number.EPSILON })).toBe(false);
  });

  test('같은 object 참조는 true를 반환한다', () => {
    const v = { x: 3, y: 4 };

    expect(equals(v, v)).toBe(true);
  });

  test('x만 다르면 false를 반환한다', () => {
    expect(equals({ x: 1, y: 2 }, { x: 2, y: 2 })).toBe(false);
  });

  test('y만 다르면 false를 반환한다', () => {
    expect(equals([1, 2], [1, 3])).toBe(false);
  });

  test('tuple과 object 혼합에서 좌표가 같으면 true를 반환한다', () => {
    expect(equals([0, 0], { x: 0, y: 0 })).toBe(true);
  });

  test('input을 mutate하지 않는다', () => {
    const a = { x: 1, y: 2 };
    const b: [number, number] = [1, 2];

    equals(a, b);

    expect(a).toEqual({ x: 1, y: 2 });
    expect(b).toEqual([1, 2]);
  });
});

describe('vec equality - nearEquals', () => {
  test('default epsilon 안에 있으면 true를 반환한다', () => {
    // 1e-9 default epsilon 기준, 5e-10 차이는 범위 안
    expect(nearEquals({ x: 1, y: 2 }, [1 + 5e-10, 2 - 5e-10])).toBe(true);
  });

  test('caller-provided epsilon 범위 밖이면 false를 반환한다', () => {
    // 0.001 epsilon 기준, 0.01 차이는 범위 밖
    expect(nearEquals([1, 2], { x: 1.01, y: 2 }, 0.001)).toBe(false);
  });

  test('epsilon 경계값을 포함한다', () => {
    // 0.001 epsilon 기준, 정확히 0.001 차이는 포함
    expect(nearEquals([1, 2], { x: 1.001, y: 2 }, 0.001)).toBe(true);
  });

  test('diff === epsilon 정확히 경계에서 true를 반환한다 (<=)', () => {
    // 0.5는 float64에서 정확히 표현되므로 Math.abs(0 - 0.5) === 0.5 정확히 성립
    // nearEquals가 < 대신 <=를 쓰는지 실제로 검증한다
    expect(nearEquals({ x: 0, y: 0 }, { x: 0.5, y: 0 }, 0.5)).toBe(true);
  });

  test('정확히 같은 값은 true를 반환한다', () => {
    expect(nearEquals({ x: 5, y: -3 }, [5, -3])).toBe(true);
  });

  test('x가 epsilon 범위 밖이면 false를 반환한다', () => {
    expect(nearEquals({ x: 1, y: 0 }, { x: 1 + 2e-9, y: 0 })).toBe(false);
  });

  test('y가 epsilon 범위 밖이면 false를 반환한다', () => {
    expect(nearEquals([0, 1], [0, 1 + 2e-9])).toBe(false);
  });

  test('object와 tuple 혼합 입력을 처리한다', () => {
    expect(nearEquals({ x: 0, y: 0 }, [0, 0])).toBe(true);
  });

  test('input을 mutate하지 않는다', () => {
    const a = { x: 1, y: 2 };
    const b: [number, number] = [1, 2];

    nearEquals(a, b);

    expect(a).toEqual({ x: 1, y: 2 });
    expect(b).toEqual([1, 2]);
  });
});

describe('vec normalization - normalizeInto', () => {
  test('정규화 결과를 out에 기록하고 out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = normalizeInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0.6);
    expect(out.y).toBeCloseTo(0.8);
  });

  test('영 벡터에서 out을 { x: 0, y: 0 }으로 기록하고 throw하지 않는다', () => {
    const out = { x: 5, y: 5 };

    expect(() => normalizeInto(out, [0, 0])).not.toThrow();
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('같은 object를 input과 out으로 사용해도 안전하다', () => {
    const inputAsOut = { x: 3, y: 4 };
    const result = normalizeInto(inputAsOut, inputAsOut);

    expect(result).toBe(inputAsOut);
    expect(inputAsOut.x).toBeCloseTo(0.6);
    expect(inputAsOut.y).toBeCloseTo(0.8);
  });

  test('tuple input을 정규화할 수 있다', () => {
    const out = { x: 0, y: 0 };

    normalizeInto(out, [0, 5]);

    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(1);
  });

  test('단위 벡터를 정규화하면 그대로 유지된다', () => {
    const out = { x: 0, y: 0 };

    normalizeInto(out, { x: 1, y: 0 });

    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(0);
  });

  test('음수 좌표 벡터를 정규화한다', () => {
    const out = { x: 0, y: 0 };

    normalizeInto(out, { x: -3, y: -4 });

    expect(out.x).toBeCloseTo(-0.6);
    expect(out.y).toBeCloseTo(-0.8);
  });

  test('영 벡터에서 반환값도 out이다', () => {
    const out = { x: 0, y: 0 };
    const result = normalizeInto(out, [0, 0]);

    expect(result).toBe(out);
  });

  test('mutable tuple out에 정규화 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = normalizeInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(0.6);
    expect(out[1]).toBeCloseTo(0.8);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('영 벡터 입력에서 mutable tuple out에 0, 0을 기록한다', () => {
    // writeXY의 Array.isArray 분기가 normalizeInto의 영 벡터 경로에서도 동작하는지 고정한다.
    const out: [number, number] = [5, 5];

    normalizeInto(out, [0, 0]);

    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
  });
});
