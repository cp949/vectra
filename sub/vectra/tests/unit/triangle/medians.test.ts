/**
 * TASK-03: triangle median family 단위 테스트
 *
 * 대상 함수:
 *   medianInto, median
 *   mediansInto, medians
 */
import { describe, expect, test } from 'vitest';
import { createZeroSegment } from '../../../src/internal/segment';
import { median } from '../../../src/triangle/median';
import { medianInto } from '../../../src/triangle/median-into';
import { medians } from '../../../src/triangle/medians';
import type { TriangleMediansWritable } from '../../../src/triangle/medians-into';
import { mediansInto } from '../../../src/triangle/medians-into';
import type { SegmentWritable, Triangle } from '../../../src/types/flat-shapes.internal';

// ─── 공통 helper ─────────────────────────────────────────────────────────────

/** 두 좌표가 12 소수점 이내로 일치하는지 확인한다. */
function expectXY(actual: { x: number; y: number }, x: number, y: number): void {
  expect(actual.x).toBeCloseTo(x, 12);
  expect(actual.y).toBeCloseTo(y, 12);
}

/** TriangleMediansWritable seed를 새로 만든다. */
function seedMedians(): TriangleMediansWritable {
  return {
    a: createZeroSegment(),
    b: createZeroSegment(),
    c: createZeroSegment(),
  };
}

// 기본 CCW 직각삼각형: A=(0,0), B=(4,0), C=(0,3)
// 예상 midpoint: M_BC=(2, 1.5), M_CA=(0, 1.5), M_AB=(2, 0)
const BASE: Triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };

// ─── medianInto ──────────────────────────────────────────────────────────────

describe('medianInto', () => {
  test("'a': A → midpoint(BC) segment를 기록하고 out을 반환한다", () => {
    const out = createZeroSegment();
    const result = medianInto(out, BASE, 'a');
    expect(result).toBe(out);
    expectXY({ x: out.x1, y: out.y1 }, 0, 0);
    expectXY({ x: out.x2, y: out.y2 }, 2, 1.5);
  });

  test("'b': B → midpoint(CA) segment를 기록한다", () => {
    const out = createZeroSegment();
    medianInto(out, BASE, 'b');
    expectXY({ x: out.x1, y: out.y1 }, 4, 0);
    expectXY({ x: out.x2, y: out.y2 }, 0, 1.5);
  });

  test("'c': C → midpoint(AB) segment를 기록한다", () => {
    const out = createZeroSegment();
    medianInto(out, BASE, 'c');
    expectXY({ x: out.x1, y: out.y1 }, 0, 3);
    expectXY({ x: out.x2, y: out.y2 }, 2, 0);
  });

  test('runtime invalid vertex key는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = createZeroSegment();
    out.x1 = 99;
    out.y1 = 88;
    out.x2 = 77;
    out.y2 = 66;
    // runtime 호출은 invalid key 전달 가능; type signature는 우회한다.
    const result = medianInto(out, BASE, 'd' as 'a');
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.y1).toBe(88);
    expect(out.x2).toBe(77);
    expect(out.y2).toBe(66);
  });

  test('빈 문자열 vertex key는 false를 반환한다', () => {
    const out = createZeroSegment();
    const result = medianInto(out, BASE, '' as 'a');
    expect(result).toBe(false);
  });

  test('대문자 vertex key는 false를 반환한다 (lowercase만 허용)', () => {
    const out = createZeroSegment();
    const result = medianInto(out, BASE, 'A' as 'a');
    expect(result).toBe(false);
  });

  test('collinear degenerate triangle도 midpoint 산식으로 기록한다', () => {
    // A=(0,0), B=(2,0), C=(4,0). midpoint(BC) = (3,0).
    const out = createZeroSegment();
    medianInto(out, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 }, 'a');
    expectXY({ x: out.x1, y: out.y1 }, 0, 0);
    expectXY({ x: out.x2, y: out.y2 }, 3, 0);
  });

  test('all-same vertex triangle도 segment를 기록한다', () => {
    // A=B=C=(5,7). midpoint(BC) = (5,7). segment = (5,7)→(5,7).
    const out = createZeroSegment();
    medianInto(out, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 }, 'b');
    expectXY({ x: out.x1, y: out.y1 }, 5, 7);
    expectXY({ x: out.x2, y: out.y2 }, 5, 7);
  });

  test('NaN vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createZeroSegment();
    expect(() => medianInto(out, { x1: Number.NaN, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 }, 'b')).not.toThrow();
    // 'b': B=(4,0), midpoint(CA) = ((0+NaN)/2, (3+0)/2) = (NaN, 1.5).
    expectXY({ x: out.x1, y: out.y1 }, 4, 0);
    expect(Number.isNaN(out.x2)).toBe(true);
    expect(out.y2).toBeCloseTo(1.5, 12);
  });

  test('+Infinity vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createZeroSegment();
    expect(() =>
      medianInto(out, { x1: Number.POSITIVE_INFINITY, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 }, 'a')
    ).not.toThrow();
    // 'a': A=(Inf,0), midpoint(BC) = ((4+0)/2, (0+3)/2) = (2, 1.5).
    expect(out.x1).toBe(Number.POSITIVE_INFINITY);
    expect(out.y1).toBe(0);
    expectXY({ x: out.x2, y: out.y2 }, 2, 1.5);
  });

  test('-Infinity vertex는 JS 산술 결과를 기록한다 (throw 없음)', () => {
    const out = createZeroSegment();
    expect(() =>
      medianInto(out, { x1: 0, y1: Number.NEGATIVE_INFINITY, x2: 4, y2: 0, x3: 0, y3: 3 }, 'c')
    ).not.toThrow();
    // 'c': C=(0,3), midpoint(AB) = ((0+4)/2, (-Inf+0)/2) = (2, -Inf).
    expectXY({ x: out.x1, y: out.y1 }, 0, 3);
    expect(out.x2).toBeCloseTo(2, 12);
    expect(out.y2).toBe(Number.NEGATIVE_INFINITY);
  });
});

// ─── median ──────────────────────────────────────────────────────────────────

describe('median', () => {
  test('성공 시 새 plain SegmentWritable을 반환한다', () => {
    const seg = median(BASE, 'a');
    expect(seg).toBeDefined();
    expect(seg).not.toBeUndefined();
    if (seg === undefined) return;
    expectXY({ x: seg.x1, y: seg.y1 }, 0, 0);
    expectXY({ x: seg.x2, y: seg.y2 }, 2, 1.5);
  });

  test("'b' median을 반환한다", () => {
    const seg = median(BASE, 'b');
    if (seg === undefined) throw new Error('expected segment');
    expectXY({ x: seg.x1, y: seg.y1 }, 4, 0);
    expectXY({ x: seg.x2, y: seg.y2 }, 0, 1.5);
  });

  test("'c' median을 반환한다", () => {
    const seg = median(BASE, 'c');
    if (seg === undefined) throw new Error('expected segment');
    expectXY({ x: seg.x1, y: seg.y1 }, 0, 3);
    expectXY({ x: seg.x2, y: seg.y2 }, 2, 0);
  });

  test('invalid key는 undefined를 반환한다', () => {
    expect(median(BASE, 'd' as 'a')).toBeUndefined();
    expect(median(BASE, '' as 'a')).toBeUndefined();
  });

  test('호출마다 새 object를 반환한다', () => {
    const s1 = median(BASE, 'a');
    const s2 = median(BASE, 'a');
    expect(s1).not.toBe(s2);
  });

  test('input mutation 없음', () => {
    const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };
    median(tri, 'a');
    expectXY({ x: tri.x1, y: tri.y1 }, 0, 0);
    expectXY({ x: tri.x2, y: tri.y2 }, 4, 0);
    expectXY({ x: tri.x3, y: tri.y3 }, 0, 3);
  });
});

// ─── mediansInto ─────────────────────────────────────────────────────────────

describe('mediansInto', () => {
  test('a, b, c 세 median을 한 번에 기록하고 out을 반환한다', () => {
    const out = seedMedians();
    const result = mediansInto(out, BASE);
    expect(result).toBe(out);
    // median a: A → midpoint(BC) = (0,0)→(2,1.5)
    expectXY({ x: out.a.x1, y: out.a.y1 }, 0, 0);
    expectXY({ x: out.a.x2, y: out.a.y2 }, 2, 1.5);
    // median b: B → midpoint(CA) = (4,0)→(0,1.5)
    expectXY({ x: out.b.x1, y: out.b.y1 }, 4, 0);
    expectXY({ x: out.b.x2, y: out.b.y2 }, 0, 1.5);
    // median c: C → midpoint(AB) = (0,3)→(2,0)
    expectXY({ x: out.c.x1, y: out.c.y1 }, 0, 3);
    expectXY({ x: out.c.x2, y: out.c.y2 }, 2, 0);
  });

  test('입력 객체가 첫 중선 출력과 같아도 나머지 중선을 올바르게 기록한다', () => {
    const triangle = { x1: 1, y1: 2, x2: 4, y2: 0, x3: 0, y3: 3 };
    const out = { ...seedMedians(), a: triangle };
    mediansInto(out, triangle);
    expect(out.a).toBe(triangle);
    expect(out.a).toEqual({ x1: 1, y1: 2, x2: 2, y2: 1.5, x3: 0, y3: 3 });
    expect(out.b).toEqual({ x1: 4, y1: 0, x2: 0.5, y2: 2.5 });
    expect(out.c).toEqual({ x1: 0, y1: 3, x2: 2.5, y2: 1 });
  });

  test('nested output object identity를 보존한다', () => {
    const out = seedMedians();
    const segA = out.a;
    const segB = out.b;
    const segC = out.c;

    mediansInto(out, BASE);

    expect(out.a).toBe(segA);
    expect(out.b).toBe(segB);
    expect(out.c).toBe(segC);
  });

  test('collinear degenerate triangle도 midpoint 산식으로 기록한다', () => {
    // A=(0,0), B=(2,0), C=(4,0).
    // midpoint(BC) = (3,0), midpoint(CA) = (2,0), midpoint(AB) = (1,0).
    const out = seedMedians();
    mediansInto(out, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 });
    expectXY({ x: out.a.x1, y: out.a.y1 }, 0, 0);
    expectXY({ x: out.a.x2, y: out.a.y2 }, 3, 0);
    expectXY({ x: out.b.x1, y: out.b.y1 }, 2, 0);
    expectXY({ x: out.b.x2, y: out.b.y2 }, 2, 0);
    expectXY({ x: out.c.x1, y: out.c.y1 }, 4, 0);
    expectXY({ x: out.c.x2, y: out.c.y2 }, 1, 0);
  });

  test('all-same vertex triangle도 세 segment를 기록한다', () => {
    const out = seedMedians();
    mediansInto(out, { x1: 5, y1: 7, x2: 5, y2: 7, x3: 5, y3: 7 });
    expectXY({ x: out.a.x1, y: out.a.y1 }, 5, 7);
    expectXY({ x: out.a.x2, y: out.a.y2 }, 5, 7);
    expectXY({ x: out.b.x1, y: out.b.y1 }, 5, 7);
    expectXY({ x: out.b.x2, y: out.b.y2 }, 5, 7);
    expectXY({ x: out.c.x1, y: out.c.y1 }, 5, 7);
    expectXY({ x: out.c.x2, y: out.c.y2 }, 5, 7);
  });

  test('NaN vertex도 throw하지 않고 JS 산술 결과를 기록한다', () => {
    const out = seedMedians();
    expect(() => mediansInto(out, { x1: Number.NaN, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 })).not.toThrow();
    // median a 시작점 = (NaN, 0)
    expect(Number.isNaN(out.a.x1)).toBe(true);
    // median b 시작점 = B(4, 0), 끝점 = midpoint(CA) = ((0+NaN)/2, 1.5).
    expectXY({ x: out.b.x1, y: out.b.y1 }, 4, 0);
    expect(Number.isNaN(out.b.x2)).toBe(true);
    expect(out.b.y2).toBeCloseTo(1.5, 12);
  });

  test('+Infinity vertex도 throw하지 않는다', () => {
    const out = seedMedians();
    expect(() => mediansInto(out, { x1: Number.POSITIVE_INFINITY, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 })).not.toThrow();
    expect(out.a.x1).toBe(Number.POSITIVE_INFINITY);
  });

  test('-Infinity vertex도 throw하지 않는다', () => {
    const out = seedMedians();
    expect(() => mediansInto(out, { x1: 0, y1: 0, x2: Number.NEGATIVE_INFINITY, y2: 0, x3: 0, y3: 3 })).not.toThrow();
  });
});

// ─── medians ─────────────────────────────────────────────────────────────────

describe('medians', () => {
  test('새 nested plain object를 반환한다', () => {
    const result = medians(BASE);
    expectXY({ x: result.a.x1, y: result.a.y1 }, 0, 0);
    expectXY({ x: result.a.x2, y: result.a.y2 }, 2, 1.5);
    expectXY({ x: result.b.x1, y: result.b.y1 }, 4, 0);
    expectXY({ x: result.b.x2, y: result.b.y2 }, 0, 1.5);
    expectXY({ x: result.c.x1, y: result.c.y1 }, 0, 3);
    expectXY({ x: result.c.x2, y: result.c.y2 }, 2, 0);
  });

  test('호출마다 새 object를 반환한다', () => {
    const r1 = medians(BASE);
    const r2 = medians(BASE);
    expect(r1).not.toBe(r2);
    expect(r1.a).not.toBe(r2.a);
  });

  test('input mutation 없음', () => {
    const tri = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };
    medians(tri);
    expectXY({ x: tri.x1, y: tri.y1 }, 0, 0);
    expectXY({ x: tri.x2, y: tri.y2 }, 4, 0);
    expectXY({ x: tri.x3, y: tri.y3 }, 0, 3);
  });
});
