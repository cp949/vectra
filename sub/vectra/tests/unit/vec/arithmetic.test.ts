/**
 * vec arithmetic helper 단위 테스트.
 *
 * addInto/subInto/scaleInto 및 arithmetic companion을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import type { Point, PointWritable } from '../../../src/types/flat-shapes.internal';
import type { XYWritable } from '../../../src/types';
import { add } from '../../../src/vec/add';
import { addInto } from '../../../src/vec/add-into';
import { copyInto } from '../../../src/vec/copy-into';
import { scale } from '../../../src/vec/scale';
import { scaleInto } from '../../../src/vec/scale-into';
import { sub } from '../../../src/vec/sub';
import { subInto } from '../../../src/vec/sub-into';
import { vecFrom } from '../../../src/vec/vec-from';

test('addInto는 x/y 벡터를 받아 구체 타입의 out을 그대로 반환한다', () => {
  expectTypeOf(addInto).parameter(0).toEqualTypeOf<PointWritable>();
  expectTypeOf(addInto).parameter(1).toEqualTypeOf<Point>();
  const out = { x: 2, y: 3, label: '합' };
  const result = addInto(out, out, { x: 4, y: 5 });
  expectTypeOf(result).toEqualTypeOf<typeof out>();
  expect(result).toBe(out);
  expect(out).toEqual({ x: 6, y: 8, label: '합' });
});

describe('vec arithmetic - addInto', () => {
  test('caller가 제공한 out 객체를 재사용하고 같은 객체를 반환한다', () => {
    // 동일 out에 두 번 기록하더라도 동일 reference를 반환해야 한다
    const out: XYWritable = { x: 99, y: 99 };

    const first = addInto(out, { x: 10, y: 20 }, { x: 1, y: 2 });
    const second = addInto(out, { x: 5, y: -5 }, { x: 5, y: 5 });

    expect(first).toBe(out);
    expect(second).toBe(out);
    expect(out).toEqual({ x: 10, y: 0 });
  });

  test('사용자 정의 class instance out 반환 타입이 보존되어 method chaining이 가능하다', () => {
    // ADR 0006이 강조한 외부 point class instance 반환 보존을 catalog 함수에서도 검증한다.
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}

      translateX(dx: number): this {
        this.x += dx;
        return this;
      }
    }

    const result = addInto(new Point(0, 0), { x: 1, y: 2 }, { x: 3, y: 4 }).translateX(10);

    expect(result).toBeInstanceOf(Point);
    expect(result.x).toBe(14);
    expect(result.y).toBe(6);
    expectTypeOf(result).toEqualTypeOf<Point>();
  });
});

describe('vec arithmetic - subInto', () => {
  test('tuple 입력에서 object 입력을 빼서 out에 기록한다', () => {
    // a는 tuple, b는 object로 혼합 입력을 검증한다
    const out: XYWritable = { x: 0, y: 0 };

    const result = subInto(out, [10, 5], { x: 3, y: 8 });

    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: -3 });
  });

  test('caller가 제공한 out 객체를 재사용하고 같은 객체를 반환한다', () => {
    // 두 번 연속 호출에서도 같은 out reference를 반환해야 한다
    const out: XYWritable = { x: 99, y: 99 };

    const first = subInto(out, { x: 10, y: 10 }, [4, 1]);
    const second = subInto(out, [0, 0], { x: 2, y: -2 });

    expect(first).toBe(out);
    expect(second).toBe(out);
    expect(out).toEqual({ x: -2, y: 2 });
  });

  test('mutable tuple out에 뺄셈 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = subInto(out, [10, 5], { x: 3, y: 8 });

    expect(result).toBe(out);
    expect(out[0]).toBe(7);
    expect(out[1]).toBe(-3);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('vec arithmetic - scaleInto', () => {
  test('object 입력에 scalar를 곱해 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = scaleInto(out, { x: 3, y: -4 }, 2);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 6, y: -8 });
  });

  test('소수 배율을 곱해 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = scaleInto(out, { x: 5, y: 10 }, 0.5);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 2.5, y: 5 });
  });

  test('caller가 제공한 out 객체를 재사용하고 같은 객체를 반환한다', () => {
    // 두 번 연속 호출에서도 같은 out reference를 반환해야 한다
    const out: XYWritable = { x: 99, y: 99 };

    const first = scaleInto(out, { x: 4, y: 6 }, 2);
    const second = scaleInto(out, { x: 1, y: -1 }, -3);

    expect(first).toBe(out);
    expect(second).toBe(out);
    expect(out).toEqual({ x: -3, y: 3 });
  });
});

// --- companion 함수 테스트 ---

describe('vec companion - vecFrom', () => {
  test('input의 x, y를 복사한 새 object를 반환한다', () => {
    const input = { x: 3, y: 7 };
    const result = vecFrom(input);

    expect(result).not.toBe(input);
    expect(result).toEqual({ x: 3, y: 7 });
  });

  test('copyInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const input = { x: 5, y: -2 };

    copyInto(out, input);
    const result = vecFrom(input);

    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });
});

describe('vec companion - add', () => {
  test('a + b를 계산해 새 object를 반환한다', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 3, y: 4 };
    const result = add(a, b);

    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
    expect(result).toEqual({ x: 4, y: 6 });
  });

  test('addInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    addInto(out, { x: 10, y: -3 }, { x: 2, y: 5 });
    const result = add({ x: 10, y: -3 }, { x: 2, y: 5 });

    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });
});

describe('vec companion - sub', () => {
  test('a - b를 계산해 새 object를 반환한다', () => {
    const a = { x: 10, y: 5 };
    const b = { x: 3, y: 8 };
    const result = sub(a, b);

    expect(result).not.toBe(a);
    expect(result).not.toBe(b);
    expect(result).toEqual({ x: 7, y: -3 });
  });

  test('subInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    subInto(out, { x: 10, y: 5 }, [3, 8]);
    const result = sub({ x: 10, y: 5 }, [3, 8]);

    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });
});

describe('vec companion - scale', () => {
  test('input * scalar를 계산해 새 object를 반환한다', () => {
    const input = { x: 3, y: -4 };
    const result = scale(input, 2);

    expect(result).not.toBe(input);
    expect(result).toEqual({ x: 6, y: -8 });
  });

  test('scaleInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    scaleInto(out, { x: 5, y: 10 }, 0.5);
    const result = scale({ x: 5, y: 10 }, 0.5);

    expect(result.x).toBe(out.x);
    expect(result.y).toBe(out.y);
  });
});
