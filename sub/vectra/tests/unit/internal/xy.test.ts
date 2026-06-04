// 이 파일은 runtime 동작 테스트와 type assertion을 함께 고정한다
import { describe, expect, expectTypeOf, test } from 'vitest';
import { readX, readY, writeXY } from '../../../src/internal/xy';
import type { XYInput, XYWritable } from '../../../src/types';

describe('internal XY primitive helpers', () => {
  test('object 좌표 입력에서 x와 y를 읽는다', () => {
    const input: XYInput = { x: 12, y: -4 };

    expect(readX(input)).toBe(12);
    expect(readY(input)).toBe(-4);
  });

  test('tuple 좌표 입력에서 x와 y를 읽는다', () => {
    const input: XYInput = [3, 9];

    expect(readX(input)).toBe(3);
    expect(readY(input)).toBe(9);
  });

  test('object output에 좌표를 기록하고 같은 객체를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = writeXY(out, 7, -11);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: -11 });
  });

  test('XYWritable union 변수로 넘기면 반환 타입이 XYWritable에 호환된다 (정확한 동일성이 아닌 단방향 할당 가능성 검증)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = writeXY(out, 1, 2);

    // union 타입으로 넘기면 Out = XYWritable이 돼 구체 타입이 좁혀지지 않는다.
    // toEqualTypeOf<XYWritable>()는 union type을 generic type parameter로 전달할 때
    // vitest 내부 constraint와 충돌하므로 단방향 호환성 검증으로 대체한다.
    // 이 테스트는 result가 XYWritable에 할당 가능함만 확인하며, 정확한 타입 동일성은 검증하지 않는다.
    expectTypeOf(result).toMatchTypeOf<XYWritable>();
    expect(result).toBe(out);
  });

  test('mutable tuple output에 좌표를 기록하고 같은 tuple을 반환한다', () => {
    const out: [number, number] = [0, 0];

    const result = writeXY(out, 7, -11);

    expect(result).toBe(out);
    expect(out[0]).toBe(7);
    expect(out[1]).toBe(-11);

    // generic 반환 타입이 [number, number]로 보존되는지 고정
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('배열과 x,y field를 동시에 가진 hybrid 값은 배열 branch를 탄다', () => {
    // Array.isArray 우선 분기 정책 고정: x,y field가 있어도 인덱스 쓰기만 수행
    const hybrid = Object.assign([0, 0] as [number, number], { x: 999, y: 999 });

    writeXY(hybrid, 3, 5);

    // 인덱스 기반 쓰기가 적용된다
    expect(hybrid[0]).toBe(3);
    expect(hybrid[1]).toBe(5);
    // x,y 프로퍼티는 변경되지 않는다 (배열 branch는 인덱스만 쓴다)
    expect(hybrid.x).toBe(999);
    expect(hybrid.y).toBe(999);
  });

  test('class instance를 output으로 받아 구체 타입을 반환한다 (method chaining 지원)', () => {
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

    const point = new Point(0, 0);
    const result = writeXY(point, 100, 200);

    // 런타임: 같은 instance, 값 변경 확인
    expect(result).toBe(point);
    expect(point.x).toBe(100);
    expect(point.y).toBe(200);

    // 타입: Point가 반환되어 method chaining 가능
    expectTypeOf(result).toEqualTypeOf<Point>();
  });

  test('collection map에서 writeXY가 구체 타입을 보존한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }

    const points: Point[] = [new Point(0, 0), new Point(1, 1)];
    const results = points.map((p) => writeXY(p, 5, 10));

    expectTypeOf(results).toEqualTypeOf<Point[]>();
    expect(results[0]).toBe(points[0]);
    expect(results[0]?.x).toBe(5);
  });
});
