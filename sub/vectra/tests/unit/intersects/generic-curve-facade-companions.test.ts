/**
 * generic curve relation facade allocating companion 단위 테스트.
 *
 * S2-RM-028: lineCurve / segmentCurve / curveCurve / curveSelf companion이 대응 *Into 호출과
 * deep equal 결과를 내고, 호출마다 새 배열 reference를 생성하는지 검증한다.
 * 좌표/range 필터링 자체는 *Into 테스트(`generic-curve-facade.test.ts`)에서 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { curveCurveIntersections } from '../../../src/intersects/curve-curve-intersections';
import { curveCurveIntersectionsInto } from '../../../src/intersects/curve-curve-intersections-into';
import { curveSelfIntersections } from '../../../src/intersects/curve-self-intersections';
import { curveSelfIntersectionsInto } from '../../../src/intersects/curve-self-intersections-into';
import { lineCurveIntersections } from '../../../src/intersects/line-curve-intersections';
import { lineCurveIntersectionsInto } from '../../../src/intersects/line-curve-intersections-into';
import { segmentCurveIntersections } from '../../../src/intersects/segment-curve-intersections';
import { segmentCurveIntersectionsInto } from '../../../src/intersects/segment-curve-intersections-into';
import type { CurveIntersectionHit, CurveLike } from '../../../src/types';

const QUADRATIC: CurveLike = { kind: 'quadratic', p0: { x: 0, y: 0 }, p1: { x: 0.5, y: 2 }, p2: { x: 1, y: 0 } };
const CUBIC: CurveLike = {
  kind: 'cubic',
  p0: { x: 0, y: 0 },
  p1: { x: 0, y: 1 },
  p2: { x: 1, y: 1 },
  p3: { x: 1, y: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// lineCurveIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('lineCurveIntersections', () => {
  const line = { origin: { x: 0, y: 0.5 }, direction: { x: 1, y: 0 } };

  test('함수가 존재한다', () => {
    expect(typeof lineCurveIntersections).toBe('function');
  });

  test('quadratic에서 Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(expected, line, QUADRATIC);
    const actual = lineCurveIntersections(line, QUADRATIC);
    expect(actual).toEqual(expected);
    expect(actual).toHaveLength(2);
  });

  test('cubic에서 Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    lineCurveIntersectionsInto(expected, line, CUBIC);
    const actual = lineCurveIntersections(line, CUBIC);
    expect(actual).toEqual(expected);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    const miss = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    const actual = lineCurveIntersections(miss, QUADRATIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const a = lineCurveIntersections(line, QUADRATIC);
    const b = lineCurveIntersections(line, QUADRATIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentCurveIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('segmentCurveIntersections', () => {
  const segment = { a: { x: 0, y: 0.5 }, b: { x: 1, y: 0.5 } };

  test('함수가 존재한다', () => {
    expect(typeof segmentCurveIntersections).toBe('function');
  });

  test('quadratic에서 Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(expected, segment, QUADRATIC);
    const actual = segmentCurveIntersections(segment, QUADRATIC);
    expect(actual).toEqual(expected);
    expect(actual).toHaveLength(2);
  });

  test('cubic에서 Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    segmentCurveIntersectionsInto(expected, segment, CUBIC);
    const actual = segmentCurveIntersections(segment, CUBIC);
    expect(actual).toEqual(expected);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    const miss = { a: { x: 5, y: 0.5 }, b: { x: 6, y: 0.5 } };
    const actual = segmentCurveIntersections(miss, QUADRATIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const a = segmentCurveIntersections(segment, QUADRATIC);
    const b = segmentCurveIntersections(segment, QUADRATIC);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// curveCurveIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('curveCurveIntersections', () => {
  const QA = {
    kind: 'quadratic',
    p0: { x: 0, y: 0 },
    p1: { x: 0.5, y: 2 },
    p2: { x: 1, y: 0 },
  } as const satisfies CurveLike;
  const QB = {
    kind: 'quadratic',
    p0: { x: 0, y: 1 },
    p1: { x: 0.5, y: -1 },
    p2: { x: 1, y: 1 },
  } as const satisfies CurveLike;

  test('함수가 존재한다', () => {
    expect(typeof curveCurveIntersections).toBe('function');
  });

  test('Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    curveCurveIntersectionsInto(expected, QA, QB);
    const actual = curveCurveIntersections(QA, QB);
    expect(actual).toEqual(expected);
    expect(actual.length).toBeGreaterThanOrEqual(2);
  });

  test('교차하지 않으면 빈 배열을 반환한다', () => {
    const ca = {
      kind: 'quadratic',
      p0: { x: 0, y: 5 },
      p1: { x: 0.5, y: 6 },
      p2: { x: 1, y: 5 },
    } as const satisfies CurveLike;
    const cb = {
      kind: 'quadratic',
      p0: { x: 0, y: 0 },
      p1: { x: 0.5, y: -1 },
      p2: { x: 1, y: 0 },
    } as const satisfies CurveLike;
    const actual = curveCurveIntersections(ca, cb);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const a = curveCurveIntersections(QA, QB);
    const b = curveCurveIntersections(QA, QB);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// curveSelfIntersections
// ─────────────────────────────────────────────────────────────────────────────

describe('curveSelfIntersections', () => {
  const LOOP = {
    kind: 'cubic',
    p0: { x: 0, y: 0 },
    p1: { x: 2, y: 2 },
    p2: { x: -2, y: 2 },
    p3: { x: 2, y: 0 },
  } as const satisfies CurveLike;

  test('함수가 존재한다', () => {
    expect(typeof curveSelfIntersections).toBe('function');
  });

  test('Into 결과와 동치 배열을 반환한다', () => {
    const expected: CurveIntersectionHit[] = [];
    curveSelfIntersectionsInto(expected, LOOP);
    const actual = curveSelfIntersections(LOOP);
    expect(actual).toEqual(expected);
    expect(actual.length).toBeGreaterThanOrEqual(1);
  });

  test('quadratic은 빈 배열을 반환한다', () => {
    const actual = curveSelfIntersections(QUADRATIC);
    expect(actual).toEqual([]);
  });

  test('호출마다 새 배열 reference를 생성한다', () => {
    const a = curveSelfIntersections(LOOP);
    const b = curveSelfIntersections(LOOP);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
