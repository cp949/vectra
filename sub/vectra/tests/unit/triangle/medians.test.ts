/**
 * TASK-03: triangle median family 단위 테스트
 *
 * 대상 함수:
 *   medianInto, median
 *   mediansInto, medians
 */
import { describe, expect, test } from 'vitest';
import { createSegment } from '../../../src/segment/create-segment';
import { median } from '../../../src/triangle/median';
import { medianInto } from '../../../src/triangle/median-into';
import { medians } from '../../../src/triangle/medians';
import type { TriangleMediansWritable } from '../../../src/triangle/medians-into';
import { mediansInto } from '../../../src/triangle/medians-into';
import type { SegmentWritable, TriangleLike } from '../../../src/types';

// ─── 공통 helper ─────────────────────────────────────────────────────────────

/** 두 좌표가 12 소수점 이내로 일치하는지 확인한다. */
function expectXY(actual: { x: number; y: number }, x: number, y: number): void {
  expect(actual.x).toBeCloseTo(x, 12);
  expect(actual.y).toBeCloseTo(y, 12);
}

/** TriangleMediansWritable seed를 새로 만든다. */
function seedMedians(): TriangleMediansWritable {
  return {
    a: createSegment(),
    b: createSegment(),
    c: createSegment(),
  };
}

// 기본 CCW 직각삼각형: A=(0,0), B=(4,0), C=(0,3)
// 예상 midpoint: M_BC=(2, 1.5), M_CA=(0, 1.5), M_AB=(2, 0)
const BASE: TriangleLike = {
  a: { x: 0, y: 0 },
  b: { x: 4, y: 0 },
  c: { x: 0, y: 3 },
};

// ─── medianInto ──────────────────────────────────────────────────────────────

describe('medianInto', () => {
  test("'a': A → midpoint(BC) segment를 기록하고 out을 반환한다", () => {
    const out = createSegment();
    const result = medianInto(out, BASE, 'a');
    expect(result).toBe(out);
    expectXY(out.a, 0, 0);
    expectXY(out.b, 2, 1.5);
  });

  test("'b': B → midpoint(CA) segment를 기록한다", () => {
    const out = createSegment();
    medianInto(out, BASE, 'b');
    expectXY(out.a, 4, 0);
    expectXY(out.b, 0, 1.5);
  });

  test("'c': C → midpoint(AB) segment를 기록한다", () => {
    const out = createSegment();
    medianInto(out, BASE, 'c');
    expectXY(out.a, 0, 3);
    expectXY(out.b, 2, 0);
  });

  test('tuple TriangleLike 입력을 처리한다', () => {
    const out = createSegment();
    medianInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ] as const,
      'a'
    );
    expectXY(out.a, 0, 0);
    expectXY(out.b, 2, 1.5);
  });

  test('runtime invalid vertex key는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = createSegment();
    out.a.x = 99;
    out.a.y = 88;
    out.b.x = 77;
    out.b.y = 66;
    // runtime 호출은 invalid key 전달 가능; type signature는 우회한다.
    const result = medianInto(out, BASE, 'd' as 'a');
    expect(result).toBe(false);
    expect(out.a.x).toBe(99);
    expect(out.a.y).toBe(88);
    expect(out.b.x).toBe(77);
    expect(out.b.y).toBe(66);
  });

  test('빈 문자열 vertex key는 false를 반환한다', () => {
    const out = createSegment();
    const result = medianInto(out, BASE, '' as 'a');
    expect(result).toBe(false);
  });

  test('대문자 vertex key는 false를 반환한다 (lowercase만 허용)', () => {
    const out = createSegment();
    const result = medianInto(out, BASE, 'A' as 'a');
    expect(result).toBe(false);
  });

  test('collinear degenerate triangle도 midpoint 산식으로 기록한다', () => {
    // A=(0,0), B=(2,0), C=(4,0). midpoint(BC) = (3,0).
    const out = createSegment();
    medianInto(out, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }, 'a');
    expectXY(out.a, 0, 0);
    expectXY(out.b, 3, 0);
  });

  test('all-same vertex triangle도 segment를 기록한다', () => {
    // A=B=C=(5,7). midpoint(BC) = (5,7). segment = (5,7)→(5,7).
    const out = createSegment();
    medianInto(out, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } }, 'b');
    expectXY(out.a, 5, 7);
    expectXY(out.b, 5, 7);
  });

  test('NaN vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createSegment();
    expect(() =>
      medianInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, 'b')
    ).not.toThrow();
    // 'b': B=(4,0), midpoint(CA) = ((0+NaN)/2, (3+0)/2) = (NaN, 1.5).
    expectXY(out.a, 4, 0);
    expect(Number.isNaN(out.b.x)).toBe(true);
    expect(out.b.y).toBeCloseTo(1.5, 12);
  });

  test('+Infinity vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createSegment();
    expect(() =>
      medianInto(out, { a: { x: Number.POSITIVE_INFINITY, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, 'a')
    ).not.toThrow();
    // 'a': A=(Inf,0), midpoint(BC) = ((4+0)/2, (0+3)/2) = (2, 1.5).
    expect(out.a.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.a.y).toBe(0);
    expectXY(out.b, 2, 1.5);
  });

  test('-Infinity vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createSegment();
    expect(() =>
      medianInto(out, { a: { x: 0, y: Number.NEGATIVE_INFINITY }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } }, 'c')
    ).not.toThrow();
    // 'c': C=(0,3), midpoint(AB) = ((0+4)/2, (-Inf+0)/2) = (2, -Inf).
    expectXY(out.a, 0, 3);
    expect(out.b.x).toBeCloseTo(2, 12);
    expect(out.b.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('aliasing: out.a가 triangle.a storage와 같아도 정확히 기록한다', () => {
    // 'a' median: out.a=triangle.a vertex, out.b=midpoint(BC).
    // out.a를 triangle.a와 같은 object로 넘기면 후속 단계에서 깨질 수 있는지 검증한다.
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const out: SegmentWritable = { a: tri.a, b: { x: 0, y: 0 } };
    medianInto(out, tri, 'a');
    // out.a는 A=(0,0). 같은 object이므로 결과적으로 (0,0) 유지.
    expectXY(out.a, 0, 0);
    expectXY(out.b, 2, 1.5);
    // tri.b, tri.c는 mutate되지 않는다.
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
  });

  test('aliasing: out.b가 triangle.b storage와 같아도 정확히 기록한다', () => {
    // 'b' median: out.a=B, out.b=midpoint(CA).
    // out.b로 tri.b를 넘기면 midpoint 계산 전에 B 값이 덮이지 않아야 한다.
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const out: SegmentWritable = { a: { x: 0, y: 0 }, b: tri.b };
    medianInto(out, tri, 'b');
    expectXY(out.a, 4, 0);
    // midpoint(CA) = ((0+0)/2, (3+0)/2) = (0, 1.5). aliasing 안전하면 그대로 기록된다.
    expectXY(out.b, 0, 1.5);
    expectXY(tri.a, 0, 0);
    expectXY(tri.c, 0, 3);
  });

  test('aliasing: out.a가 triangle.c storage와 같아도 정확히 기록한다 (cross vertex)', () => {
    // 'c' median: out.a=C, out.b=midpoint(AB).
    // out.a로 tri.c를 넘기면 결과적으로 같은 값을 덮어쓴다.
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const out: SegmentWritable = { a: tri.c, b: { x: 0, y: 0 } };
    medianInto(out, tri, 'c');
    expectXY(out.a, 0, 3);
    expectXY(out.b, 2, 0);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
  });
});

// ─── median ──────────────────────────────────────────────────────────────────

describe('median', () => {
  test('성공 시 새 plain SegmentWritable을 반환한다', () => {
    const seg = median(BASE, 'a');
    expect(seg).toBeDefined();
    expect(seg).not.toBeUndefined();
    if (seg === undefined) return;
    expectXY(seg.a, 0, 0);
    expectXY(seg.b, 2, 1.5);
  });

  test("'b' median을 반환한다", () => {
    const seg = median(BASE, 'b');
    if (seg === undefined) throw new Error('expected segment');
    expectXY(seg.a, 4, 0);
    expectXY(seg.b, 0, 1.5);
  });

  test("'c' median을 반환한다", () => {
    const seg = median(BASE, 'c');
    if (seg === undefined) throw new Error('expected segment');
    expectXY(seg.a, 0, 3);
    expectXY(seg.b, 2, 0);
  });

  test('invalid key는 undefined를 반환한다', () => {
    expect(median(BASE, 'd' as 'a')).toBeUndefined();
    expect(median(BASE, '' as 'a')).toBeUndefined();
  });

  test('호출마다 새 object를 반환한다', () => {
    const s1 = median(BASE, 'a');
    const s2 = median(BASE, 'a');
    expect(s1).not.toBe(s2);
    expect(s1?.a).not.toBe(s2?.a);
  });

  test('input mutation 없음', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    median(tri, 'a');
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
  });
});

// ─── mediansInto ─────────────────────────────────────────────────────────────

describe('mediansInto', () => {
  test('a, b, c 세 median을 한 번에 기록하고 out을 반환한다', () => {
    const out = seedMedians();
    const result = mediansInto(out, BASE);
    expect(result).toBe(out);
    // median a: A → midpoint(BC) = (0,0)→(2,1.5)
    expectXY(out.a.a, 0, 0);
    expectXY(out.a.b, 2, 1.5);
    // median b: B → midpoint(CA) = (4,0)→(0,1.5)
    expectXY(out.b.a, 4, 0);
    expectXY(out.b.b, 0, 1.5);
    // median c: C → midpoint(AB) = (0,3)→(2,0)
    expectXY(out.c.a, 0, 3);
    expectXY(out.c.b, 2, 0);
  });

  test('nested output object identity를 보존한다', () => {
    const out = seedMedians();
    const segA = out.a;
    const segB = out.b;
    const segC = out.c;
    const aA = out.a.a;
    const aB = out.a.b;
    const bA = out.b.a;
    const bB = out.b.b;
    const cA = out.c.a;
    const cB = out.c.b;

    mediansInto(out, BASE);

    expect(out.a).toBe(segA);
    expect(out.b).toBe(segB);
    expect(out.c).toBe(segC);
    expect(out.a.a).toBe(aA);
    expect(out.a.b).toBe(aB);
    expect(out.b.a).toBe(bA);
    expect(out.b.b).toBe(bB);
    expect(out.c.a).toBe(cA);
    expect(out.c.b).toBe(cB);
  });

  test('tuple TriangleLike 입력을 처리한다', () => {
    const out = seedMedians();
    mediansInto(out, [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const);
    expectXY(out.a.a, 0, 0);
    expectXY(out.a.b, 2, 1.5);
    expectXY(out.b.a, 4, 0);
    expectXY(out.b.b, 0, 1.5);
    expectXY(out.c.a, 0, 3);
    expectXY(out.c.b, 2, 0);
  });

  test('collinear degenerate triangle도 midpoint 산식으로 기록한다', () => {
    // A=(0,0), B=(2,0), C=(4,0).
    // midpoint(BC) = (3,0), midpoint(CA) = (2,0), midpoint(AB) = (1,0).
    const out = seedMedians();
    mediansInto(out, { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } });
    expectXY(out.a.a, 0, 0);
    expectXY(out.a.b, 3, 0);
    expectXY(out.b.a, 2, 0);
    expectXY(out.b.b, 2, 0);
    expectXY(out.c.a, 4, 0);
    expectXY(out.c.b, 1, 0);
  });

  test('all-same vertex triangle도 세 segment를 기록한다', () => {
    const out = seedMedians();
    mediansInto(out, { a: { x: 5, y: 7 }, b: { x: 5, y: 7 }, c: { x: 5, y: 7 } });
    expectXY(out.a.a, 5, 7);
    expectXY(out.a.b, 5, 7);
    expectXY(out.b.a, 5, 7);
    expectXY(out.b.b, 5, 7);
    expectXY(out.c.a, 5, 7);
    expectXY(out.c.b, 5, 7);
  });

  test('NaN vertex도 throw하지 않고 JS 산술 결과를 기록한다', () => {
    const out = seedMedians();
    expect(() => mediansInto(out, { a: { x: Number.NaN, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } })).not.toThrow();
    // median a: out.a.a = (NaN, 0)
    expect(Number.isNaN(out.a.a.x)).toBe(true);
    // median b: out.b.a = B=(4,0), out.b.b = midpoint(CA) = ((0+NaN)/2, 1.5).
    expectXY(out.b.a, 4, 0);
    expect(Number.isNaN(out.b.b.x)).toBe(true);
    expect(out.b.b.y).toBeCloseTo(1.5, 12);
  });

  test('+Infinity vertex도 throw하지 않는다', () => {
    const out = seedMedians();
    expect(() =>
      mediansInto(out, { a: { x: Number.POSITIVE_INFINITY, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } })
    ).not.toThrow();
    expect(out.a.a.x).toBe(Number.POSITIVE_INFINITY);
  });

  test('-Infinity vertex도 throw하지 않는다', () => {
    const out = seedMedians();
    expect(() =>
      mediansInto(out, { a: { x: 0, y: 0 }, b: { x: Number.NEGATIVE_INFINITY, y: 0 }, c: { x: 0, y: 3 } })
    ).not.toThrow();
  });

  test('aliasing: out.a.a가 triangle.a storage와 같아도 정확히 기록한다', () => {
    // out.a.a를 triangle.a vertex와 공유한다. mediansInto는 모든 좌표를 local에 읽은 뒤
    // 기록해야 하므로 'b' median(B→midpoint(CA))과 'c' median(C→midpoint(AB))이 A 좌표를
    // 다시 읽을 때 깨지지 않아야 한다.
    const tri = {
      a: { x: 1, y: 2 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    const out: TriangleMediansWritable = {
      a: { a: tri.a, b: { x: 0, y: 0 } },
      b: createSegment(),
      c: createSegment(),
    };
    mediansInto(out, tri);
    // median a: out.a.a = A=(1,2), out.a.b = midpoint(BC) = (2, 1.5).
    expectXY(out.a.a, 1, 2);
    expectXY(out.a.b, 2, 1.5);
    // median b: out.b.a = B=(4,0), out.b.b = midpoint(CA) = ((0+1)/2, (3+2)/2) = (0.5, 2.5).
    expectXY(out.b.a, 4, 0);
    expectXY(out.b.b, 0.5, 2.5);
    // median c: out.c.a = C=(0,3), out.c.b = midpoint(AB) = ((1+4)/2, (2+0)/2) = (2.5, 1).
    expectXY(out.c.a, 0, 3);
    expectXY(out.c.b, 2.5, 1);
  });

  test('aliasing(cross-vertex): out.a.a가 triangle.b storage와 같아도 정확히 기록한다', () => {
    // 회귀 시나리오: implementation이 "median별로 좌표를 inline read 후 write"로 바뀌면,
    // 첫 번째 write(out.a.a = A 좌표)가 tri.b storage를 덮어쓰므로 이어지는 median b/c
    // 계산에서 B 좌표를 다시 읽을 때 A 좌표로 오염된다.
    // readTriangleRawCoords로 6개 좌표를 먼저 local에 읽어두면 안전하다.
    const triB = { x: 4, y: 0 };
    const out: TriangleMediansWritable = {
      a: { a: triB, b: { x: 0, y: 0 } },
      b: createSegment(),
      c: createSegment(),
    };
    const tri = { a: { x: 1, y: 2 }, b: triB, c: { x: 0, y: 3 } };
    mediansInto(out, tri);
    // median a: out.a.a = A=(1,2), out.a.b = midpoint(BC) = ((4+0)/2, (0+3)/2) = (2, 1.5).
    expectXY(out.a.a, 1, 2);
    expectXY(out.a.b, 2, 1.5);
    // median b: out.b.a = B=(4,0), out.b.b = midpoint(CA) = ((0+1)/2, (3+2)/2) = (0.5, 2.5).
    // 회귀 시 B 좌표가 (1,2)로 오염되어 out.b.a / midpoint(AB)이 깨진다.
    expectXY(out.b.a, 4, 0);
    expectXY(out.b.b, 0.5, 2.5);
    // median c: out.c.a = C=(0,3), out.c.b = midpoint(AB) = ((1+4)/2, (2+0)/2) = (2.5, 1).
    expectXY(out.c.a, 0, 3);
    expectXY(out.c.b, 2.5, 1);
  });

  test('aliasing(cross-vertex): out.b.b가 triangle.a storage와 같아도 정확히 기록한다', () => {
    // 회귀 시나리오: median b를 inline read 방식으로 처리할 때 write(out.b.b = midpoint(CA))가
    // tri.a storage를 덮어쓰면, 이어지는 median c의 midpoint(AB) 계산에서 A가 오염된다.
    const triA = { x: 1, y: 2 };
    const out: TriangleMediansWritable = {
      a: createSegment(),
      b: { a: { x: 0, y: 0 }, b: triA },
      c: createSegment(),
    };
    const tri = { a: triA, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    mediansInto(out, tri);
    expectXY(out.a.a, 1, 2);
    expectXY(out.a.b, 2, 1.5);
    expectXY(out.b.a, 4, 0);
    // midpoint(CA) = ((0+1)/2, (3+2)/2) = (0.5, 2.5). 이 값이 tri.a에도 기록된다.
    expectXY(out.b.b, 0.5, 2.5);
    // median c: midpoint(AB) = ((1+4)/2, (2+0)/2) = (2.5, 1).
    // 회귀 시 A가 (0.5, 2.5)로 오염되어 midpoint(AB) = ((0.5+4)/2, (2.5+0)/2) = (2.25, 1.25)로 깨진다.
    expectXY(out.c.a, 0, 3);
    expectXY(out.c.b, 2.5, 1);
  });
});

// ─── medians ─────────────────────────────────────────────────────────────────

describe('medians', () => {
  test('새 nested plain object를 반환한다', () => {
    const result = medians(BASE);
    expectXY(result.a.a, 0, 0);
    expectXY(result.a.b, 2, 1.5);
    expectXY(result.b.a, 4, 0);
    expectXY(result.b.b, 0, 1.5);
    expectXY(result.c.a, 0, 3);
    expectXY(result.c.b, 2, 0);
  });

  test('호출마다 새 object를 반환한다', () => {
    const r1 = medians(BASE);
    const r2 = medians(BASE);
    expect(r1).not.toBe(r2);
    expect(r1.a).not.toBe(r2.a);
    expect(r1.a.a).not.toBe(r2.a.a);
  });

  test('input mutation 없음', () => {
    const tri = {
      a: { x: 0, y: 0 },
      b: { x: 4, y: 0 },
      c: { x: 0, y: 3 },
    };
    medians(tri);
    expectXY(tri.a, 0, 0);
    expectXY(tri.b, 4, 0);
    expectXY(tri.c, 0, 3);
  });
});
