import { describe, expect, test } from 'vitest';
import {
  infiniteLineToLineFamilyParam,
  lineFamilyIntersectionPoint,
  lineFamilyIntersects,
  rayToLineFamilyParam,
  segmentToLineFamilyParam,
} from '../../../src/internal/line-family';
import { findSingleLineFamilySideIntersectionPoint } from '../../../src/internal/line-family-side.internal';
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';
import type { XYWritable } from '../../../src/types';

// out 미수정 검증용 sentinel 좌표
const SENTINEL_X = 9999;
const SENTINEL_Y = -7777;

function makeOut(): XYWritable {
  return { x: SENTINEL_X, y: SENTINEL_Y };
}

describe('segmentToLineFamilyParam', () => {
  test('endpoint a/b 좌표를 origin/direction으로 정규화하고 kind를 finite로 설정한다', () => {
    const p = segmentToLineFamilyParam(1, 2, 4, 6);

    expect(p).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4, kind: 'finite' });
  });

  test('a와 b가 같은 좌표이면 direction이 0이 되고 kind는 finite로 남는다', () => {
    const p = segmentToLineFamilyParam(3, 4, 3, 4);

    expect(p).toEqual({ ox: 3, oy: 4, dx: 0, dy: 0, kind: 'finite' });
  });
});

describe('rayToLineFamilyParam', () => {
  test('origin/direction 좌표를 그대로 보존하고 kind를 ray로 설정한다', () => {
    const p = rayToLineFamilyParam(1, 2, 3, 4);

    expect(p).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4, kind: 'ray' });
  });
});

describe('infiniteLineToLineFamilyParam', () => {
  test('origin/direction 좌표를 그대로 보존하고 kind를 inf로 설정한다', () => {
    const p = infiniteLineToLineFamilyParam(1, 2, 3, 4);

    expect(p).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4, kind: 'inf' });
  });
});

// ─────────────────────────────────────────────
// segment × ray
// ─────────────────────────────────────────────
describe('lineFamilyIntersects: segment × ray', () => {
  test('non-parallel 교점이 finite range와 ray forward range 안이면 true를 반환한다', () => {
    // finite a=(0,0)-(10,0), ray b origin=(5,-5) dir=(0,1) — 교점 (5,0), t1=0.5, u=5
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, -5, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('non-parallel 교점이 ray backward 방향이면 false를 반환한다', () => {
    // finite a=(0,0)-(10,0), ray b origin=(5,5) dir=(0,1) — 교점 (5,0)은 ray backward(u=-5)
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, 5, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('non-parallel 교점이 finite range 밖이면 false를 반환한다', () => {
    // finite a=(0,0)-(2,0), ray b origin=(5,-1) dir=(0,1) — supporting line 교점 (5,0)은 finite 밖(t1=2.5)
    const a = segmentToLineFamilyParam(0, 0, 2, 0);
    const b = rayToLineFamilyParam(5, -1, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('collinear overlap이면 true를 반환한다', () => {
    // finite a=(0,0)-(10,0), ray b origin=(5,0) dir=(1,0) — collinear, b가 a 안에서 시작해 +x로 진행
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('collinear endpoint touch (ray.origin이 finite endpoint와 일치)는 true를 반환한다', () => {
    // a=(0,0)-(10,0), ray b origin=(10,0) dir=(1,0) — collinear, 한 점만 공유 (a.b == b.origin)
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(10, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('collinear non-overlap (ray가 finite 반대쪽 backward)는 false를 반환한다', () => {
    // a=(0,0)-(5,0), ray b origin=(10,0) dir=(1,0) — collinear지만 ray는 더 멀리 +x로 가서 a와 안 겹침
    const a = segmentToLineFamilyParam(0, 0, 5, 0);
    const b = rayToLineFamilyParam(10, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('parallel disjoint는 false를 반환한다', () => {
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(0, 1, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('segment zero-length point가 ray 위에 있으면 true를 반환한다', () => {
    // finite a=(3,0)-(3,0) (점), ray b origin=(0,0) dir=(1,0) — 점이 b 위(u=3 forward)
    const a = segmentToLineFamilyParam(3, 0, 3, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('segment zero-length point가 ray backward이면 false를 반환한다', () => {
    // finite a=(-3,0)-(-3,0), ray b origin=(0,0) dir=(1,0) — u=-3<0
    const a = segmentToLineFamilyParam(-3, 0, -3, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });
});

describe('lineFamilyIntersectionPoint: segment × ray', () => {
  test('non-parallel 교점이 양쪽 range 안이면 a 기준 좌표를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, -5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('ray backward 후보이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, 5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('collinear overlap이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('collinear endpoint touch도 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(10, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('segment zero-length point가 ray 위에 있으면 그 점을 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(3, 0, 3, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 0 });
  });
});

// ─────────────────────────────────────────────
// segment × infinite-line
// ─────────────────────────────────────────────
describe('lineFamilyIntersects: segment × infinite-line', () => {
  test('non-parallel 교점이 finite range 안이면 true를 반환한다', () => {
    // finite a=(0,0)-(10,0), inf b origin=(5,-5) dir=(0,1) — 교점 (5,0), t1=0.5
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = infiniteLineToLineFamilyParam(5, -5, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('non-parallel 교점이 finite range 밖이면 false를 반환한다', () => {
    // finite a=(0,0)-(2,0), inf b origin=(5,0) dir=(0,1) — supporting line 교점 (5,0)이 t1=2.5
    const a = segmentToLineFamilyParam(0, 0, 2, 0);
    const b = infiniteLineToLineFamilyParam(5, 0, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('parallel disjoint는 false를 반환한다', () => {
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = infiniteLineToLineFamilyParam(0, 1, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('collinear segment이 infinite-line 위에 있으면 true를 반환한다', () => {
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = infiniteLineToLineFamilyParam(50, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });
});

describe('lineFamilyIntersectionPoint: segment × infinite-line', () => {
  test('non-parallel 교점이 finite range 안이면 좌표를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = infiniteLineToLineFamilyParam(5, -5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('non-parallel 교점이 finite range 밖이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 2, 0);
    const b = infiniteLineToLineFamilyParam(5, 0, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('collinear segment이 infinite-line 위에 있으면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = infiniteLineToLineFamilyParam(50, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});

// ─────────────────────────────────────────────
// ray × infinite-line
// ─────────────────────────────────────────────
describe('lineFamilyIntersects: ray × infinite-line', () => {
  test('non-parallel 교점이 ray forward range 안이면 true를 반환한다', () => {
    // ray a origin=(0,0) dir=(1,0), inf b origin=(5,-5) dir=(0,1) — 교점 (5,0), t=5
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(5, -5, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('non-parallel 교점이 ray backward 방향이면 false를 반환한다', () => {
    // ray a origin=(0,0) dir=(1,0), inf b origin=(-5,-5) dir=(0,1) — 교점 (-5,0), t=-5
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(-5, -5, 0, 1);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('parallel disjoint는 false를 반환한다', () => {
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(0, 1, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('collinear ray가 infinite-line 위에 있으면 true를 반환한다', () => {
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(50, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });
});

describe('lineFamilyIntersectionPoint: ray × infinite-line', () => {
  test('non-parallel 교점이 ray forward range 안이면 좌표를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(5, -5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('non-parallel 교점이 ray backward 방향이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(-5, -5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('collinear ray가 infinite-line 위에 있으면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = rayToLineFamilyParam(0, 0, 1, 0);
    const b = infiniteLineToLineFamilyParam(50, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});

// ─────────────────────────────────────────────
// degenerate 공통
// ─────────────────────────────────────────────
describe('lineFamilyIntersects: degenerate 입력', () => {
  test('point × point: 정확히 같은 좌표이면 true를 반환한다', () => {
    const a = segmentToLineFamilyParam(3, 4, 3, 4);
    const b = rayToLineFamilyParam(3, 4, 0, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('point × point: epsilon 이내 거리이면 true를 반환한다', () => {
    // distance = 1e-10 → distSq = 1e-20 <= (1e-9)² = 1e-18
    const a = segmentToLineFamilyParam(3, 4, 3, 4);
    const b = rayToLineFamilyParam(3 + 1e-10, 4, 0, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('point × point: epsilon을 초과하는 거리이면 false를 반환한다', () => {
    // distance = 1e-8 → distSq = 1e-16 > (1e-9)² = 1e-18
    const a = segmentToLineFamilyParam(3, 4, 3, 4);
    const b = rayToLineFamilyParam(3 + 1e-8, 4, 0, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('degenerate segment(point) × normal ray containment: 점이 ray 위면 true를 반환한다', () => {
    const a = segmentToLineFamilyParam(5, 0, 5, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('degenerate ray(point) × normal segment containment: 점이 finite range 안이면 true를 반환한다', () => {
    const a = rayToLineFamilyParam(5, 0, 0, 0);
    const b = segmentToLineFamilyParam(0, 0, 10, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('degenerate ray(point) × normal segment: 점이 finite range 밖이면 false를 반환한다', () => {
    const a = rayToLineFamilyParam(15, 0, 0, 0);
    const b = segmentToLineFamilyParam(0, 0, 10, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });

  test('degenerate infinite-line(point) × normal ray: 점이 ray forward에 있으면 true를 반환한다', () => {
    const a = infiniteLineToLineFamilyParam(5, 0, 0, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(true);
  });

  test('degenerate infinite-line(point) × normal ray: 점이 ray backward이면 false를 반환한다', () => {
    const a = infiniteLineToLineFamilyParam(-5, 0, 0, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    expect(lineFamilyIntersects(a, b, DEFAULT_EPSILON)).toBe(false);
  });
});

describe('lineFamilyIntersectionPoint: degenerate 입력', () => {
  test('point × point 일치: a.origin을 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(3, 4, 3, 4);
    const b = rayToLineFamilyParam(3, 4, 0, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('point × point 불일치: false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(3, 4, 3, 4);
    const b = rayToLineFamilyParam(5, 6, 0, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('degenerate segment × normal ray containment: 점이 ray 위면 그 점을 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = segmentToLineFamilyParam(5, 0, 5, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('degenerate ray × normal segment containment: 점이 finite 위면 그 점을 기록하고 true를 반환한다', () => {
    const out = makeOut();
    const a = rayToLineFamilyParam(5, 0, 0, 0);
    const b = segmentToLineFamilyParam(0, 0, 10, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('degenerate ray × normal segment non-containment: false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = rayToLineFamilyParam(15, 0, 0, 0);
    const b = segmentToLineFamilyParam(0, 0, 10, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });

  test('degenerate infinite-line × normal ray backward: false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const a = infiniteLineToLineFamilyParam(-5, 0, 0, 0);
    const b = rayToLineFamilyParam(0, 0, 1, 0);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});

// ─────────────────────────────────────────────
// output writable variant
// ─────────────────────────────────────────────
describe('lineFamilyIntersectionPoint: output type', () => {
  test('mutable tuple output에도 교점 좌표를 기록한다', () => {
    const out: [number, number] = [SENTINEL_X, SENTINEL_Y];
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, -5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(0);
  });

  test('mutable tuple output: false 케이스에서 tuple은 수정되지 않는다', () => {
    const out: [number, number] = [SENTINEL_X, SENTINEL_Y];
    const a = segmentToLineFamilyParam(0, 0, 10, 0);
    const b = rayToLineFamilyParam(5, 5, 0, 1);

    const result = lineFamilyIntersectionPoint(out, a, b, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out[0]).toBe(SENTINEL_X);
    expect(out[1]).toBe(SENTINEL_Y);
  });
});

describe('findSingleLineFamilySideIntersectionPoint', () => {
  test('corner에서 같은 교점이 두 side에 보고되면 단일 교점으로 기록한다', () => {
    const out = makeOut();
    const line = segmentToLineFamilyParam(-1, -1, 0, 0);
    const sides = [
      segmentToLineFamilyParam(0, 0, 2, 0),
      segmentToLineFamilyParam(2, 0, 2, 2),
      segmentToLineFamilyParam(2, 2, 0, 2),
      segmentToLineFamilyParam(0, 2, 0, 0),
    ];

    const result = findSingleLineFamilySideIntersectionPoint(out, line, sides, DEFAULT_EPSILON);

    expect(result).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('distinct 교점이 2개 이상이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeOut();
    const line = infiniteLineToLineFamilyParam(1, -1, 0, 1);
    const sides = [
      segmentToLineFamilyParam(0, 0, 2, 0),
      segmentToLineFamilyParam(2, 0, 2, 2),
      segmentToLineFamilyParam(2, 2, 0, 2),
      segmentToLineFamilyParam(0, 2, 0, 0),
    ];

    const result = findSingleLineFamilySideIntersectionPoint(out, line, sides, DEFAULT_EPSILON);

    expect(result).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});
