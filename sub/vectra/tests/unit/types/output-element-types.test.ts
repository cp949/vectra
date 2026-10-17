/**
 * 새 원소를 만드는 Into 함수의 출력 배열 타입 테스트.
 *
 * 대상 함수:
 *  - lineCommandsInto, transformCommandsInto : 새 PathCommand를 push하는 path Into
 *  - quadraticLineIntersectionsInto, cubicCubicIntersectionsInto : 새 `{ x, y }` point를 만드는 curve 교차 Into
 *  - fromRectInto, ellipse pointsInto : 새 `{ x, y }` point를 push하는 polygon·ellipse Into
 *  - tangentPointsFromExternalInto : 새 `{ x, y }` point를 push하는 circle Into
 *
 * 고정하는 계약:
 *  - path Into의 반환 타입은 caller의 좁은 원소 타입(MoveCommand[])을 따르지 않고 PathCommand[]다.
 *  - point 배열을 채우는 Into의 반환 타입은 caller의 좁은 원소 타입(`{ x, y, id }`)을 따르지 않고 `XYObjectWritable[]`이다.
 *  - point를 만드는 Into는 tuple point 배열(`XYTupleWritable[]`)을 받지 않는다.
 *
 * 거부 검사는 `@ts-expect-error`가 맡는다. 오류가 사라지면 `pnpm typecheck`가 실패한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { tangentPointsFromExternalInto } from '../../../src/circle/tangent-points-from-external-into';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { quadraticLineIntersectionsInto } from '../../../src/curve/quadratic-line-intersections-into';
import { pointsInto as ellipsePointsInto } from '../../../src/ellipse/points-into';
import { lineCommandsInto } from '../../../src/path/line-commands-into';
import { transformCommandsInto } from '../../../src/path/transform-commands-into';
import { fromRectInto } from '../../../src/polygon/from-rect-into';
import type { IntersectionHit, MoveCommand, PathCommand, XYObjectWritable, XYTupleWritable } from '../../../src/types';

describe('새 원소를 만드는 Into의 출력 배열 타입', () => {
  test('path Into는 PathCommand[]를 받고 PathCommand[]를 반환한다', () => {
    const out: PathCommand[] = [];
    const result = lineCommandsInto(out, [0, 0], [1, 1]);
    expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
    expect(result).toBe(out);
  });

  test('path Into에 MoveCommand[]를 넘겨도 반환 타입은 MoveCommand[]로 좁혀지지 않는다', () => {
    const narrow: MoveCommand[] = [];
    // 배열은 공변이라 인자는 받는다. 대신 반환 타입이 push된 line command를 가린다
    const lines = lineCommandsInto(narrow, [0, 0], [1, 1]);
    expectTypeOf(lines).toEqualTypeOf<PathCommand[]>();
    expect(lines.map((command) => command.kind)).toEqual(['move', 'line']);

    const transformed = transformCommandsInto(narrow, [{ kind: 'close' }], { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expectTypeOf(transformed).toEqualTypeOf<PathCommand[]>();
    expect(transformed.map((command) => command.kind)).toEqual(['close']);
  });

  test('point 배열 Into에 좁은 원소 배열을 넘겨도 반환 타입은 XYObjectWritable[]이다', () => {
    const tagged: (XYObjectWritable & { id: string })[] = [];
    // 배열은 공변이라 인자는 받는다. 대신 반환 타입이 id 없는 실제 원소를 가리지 않는다
    const rect = fromRectInto(tagged, { x: 0, y: 0, width: 2, height: 1 });
    expectTypeOf(rect).toEqualTypeOf<XYObjectWritable[]>();
    expect(rect).toHaveLength(4);
    expect('id' in rect[0]).toBe(false);

    const ring = ellipsePointsInto(tagged, { center: [0, 0], radiusX: 2, radiusY: 1 }, { segments: 8 });
    expectTypeOf(ring).toEqualTypeOf<XYObjectWritable[]>();
    expect(ring).toHaveLength(8);
  });

  test('curve 교차 Into는 tuple point를 담는 hit 배열을 받지 않는다', () => {
    const tupleHits: IntersectionHit<XYTupleWritable>[] = [];
    // @ts-expect-error hit.point는 항상 object이므로 tuple point 배열은 거짓이 된다
    quadraticLineIntersectionsInto(tupleHits, [0, 0], [1, 2], [2, 0], { origin: [0, 0.5], direction: [1, 0] });
    // @ts-expect-error 같은 이유로 curve×curve 교차도 받지 않는다
    cubicCubicIntersectionsInto(tupleHits, [0, 0], [1, 2], [2, 2], [3, 0], [0, 1], [1, -1], [2, 3], [3, 1]);
    // 타입이 거짓이라도 런타임 값은 object다
    expect(tupleHits.length).toBeGreaterThan(0);
    expect(tupleHits.every((hit) => !Array.isArray(hit.point))).toBe(true);
  });

  test('curve 교차 Into가 만든 hit.point는 object다', () => {
    const hits: IntersectionHit[] = [];
    quadraticLineIntersectionsInto(hits, [0, 0], [1, 2], [2, 0], { origin: [0, 0.5], direction: [1, 0] });
    expect(hits).toHaveLength(2);
    for (const hit of hits) {
      expectTypeOf(hit.point).toEqualTypeOf<XYObjectWritable>();
      expect(Array.isArray(hit.point)).toBe(false);
    }
  });

  test('circle 접선점 Into는 tuple 배열을 받지 않는다', () => {
    const tuples: XYTupleWritable[] = [];
    // @ts-expect-error 접선점은 항상 object이므로 tuple 배열은 거짓이 된다
    tangentPointsFromExternalInto(tuples, { center: [0, 0], radius: 1 }, [3, 0]);
    // 타입이 거짓이라도 런타임 값은 object다
    expect(tuples).toHaveLength(2);
    expect(tuples.every((p) => !Array.isArray(p))).toBe(true);
  });
});
