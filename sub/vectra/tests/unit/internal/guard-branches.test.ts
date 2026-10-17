/**
 * internal helper의 경계·퇴화·overflow 분기 테스트.
 *
 * 검증 항목:
 *  1. Jacobi 회전 단계의 overflow를 RangeError로 알린다.
 *  2. line-family가 한쪽만 퇴화(방향 0)한 경우의 교점·원 교점·ellipse 접점 판정.
 *  3. line-family crop이 만나지 않는 직사각형을 거른다.
 *  4. 가시성 ray가 퇴화 입력을 건너뛴다.
 *  5. 다항식 곱과 [0, 1] 실근, rect·segment·bounds 포함 판정의 경계.
 */
import { describe, expect, test } from 'vitest';
import { boundsContainsPointXY } from '../../../src/internal/bounds';
import { jacobiSymmetricEigenRaw } from '../../../src/internal/jacobi-symmetric-eigen';
import { lineFamilyIntersectionPoint } from '../../../src/internal/line-family-core.internal';
import { cropLineFamilyByCircleInto, cropLineFamilyByRectInto } from '../../../src/internal/line-family-crop';
import { lineFamilyEllipseIntersectionPoint } from '../../../src/internal/line-family-ellipse';
import type { LineFamilyParam } from '../../../src/internal/line-family-param.internal';
import { lineFamilyCircleIntersectionPoint } from '../../../src/internal/line-family-shape.internal';
import { computeVisibilityRayHits } from '../../../src/internal/polygon-visibility';
import { multiplyPolynomials, realRootsInClosedUnit } from '../../../src/internal/polynomial';
import { rectContainsPointXY } from '../../../src/internal/rect';
import { segmentContainsPoint } from '../../../src/internal/segment';

const MAX = Number.MAX_VALUE;

/** Jacobi 옵션. 오류 메시지 접두사로 어느 단계에서 던졌는지 구분한다. */
const JACOBI = { maxIterations: 50, tolerance: 1e-12, errorPrefix: 'guard test' };

describe('jacobiSymmetricEigenRaw overflow', () => {
  test('대각 차이가 overflow하면 theta 오류를 던진다', () => {
    expect(() =>
      jacobiSymmetricEigenRaw(
        [
          [-MAX, 1],
          [1, MAX],
        ],
        2,
        JACOBI
      )
    ).toThrow(/non-finite theta/);
  });

  test('theta는 유한하지만 분모가 overflow하면 denominator 오류를 던진다', () => {
    expect(() =>
      jacobiSymmetricEigenRaw(
        [
          [0, 0.5],
          [0.5, 0.75 * MAX],
        ],
        2,
        JACOBI
      )
    ).toThrow(/non-finite denominator/);
  });

  test('회전한 대각 원소가 overflow하면 diagonal 오류를 던진다', () => {
    expect(() =>
      jacobiSymmetricEigenRaw(
        [
          [MAX, MAX],
          [MAX, MAX],
        ],
        2,
        JACOBI
      )
    ).toThrow(/non-finite diagonal/);
  });

  test('회전한 비대각 원소가 overflow하면 off-diagonal 오류를 던진다', () => {
    expect(() =>
      jacobiSymmetricEigenRaw(
        [
          [0, MAX, MAX],
          [MAX, 0, -MAX],
          [MAX, -MAX, 0],
        ],
        3,
        JACOBI
      )
    ).toThrow(/non-finite off-diagonal/);
  });
});

describe('line-family 한쪽 퇴화', () => {
  const xAxis: LineFamilyParam = { ox: 0, oy: 0, dx: 1, dy: 0, kind: 'inf' };

  /** 방향이 0인 line-family를 (x, y) 한 점으로 만든다. */
  function point(x: number, y: number): LineFamilyParam {
    return { ox: x, oy: y, dx: 0, dy: 0, kind: 'inf' };
  }

  test('lineFamilyIntersectionPoint는 b가 점이고 a 위에 있으면 그 점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    expect(lineFamilyIntersectionPoint(out, xAxis, point(5, 0), undefined)).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('lineFamilyIntersectionPoint는 b가 점이고 a 밖에 있으면 false다', () => {
    const out = { x: -1, y: -1 };
    expect(lineFamilyIntersectionPoint(out, xAxis, point(5, 1), undefined)).toBe(false);
    expect(out).toEqual({ x: -1, y: -1 });
  });

  test('lineFamilyCircleIntersectionPoint는 방향이 0인 origin이 경계 위면 그 점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    expect(lineFamilyCircleIntersectionPoint(out, point(3, 0), 0, 0, 3, 1e-9)).toBe(true);
    expect(out).toEqual({ x: 3, y: 0 });
  });

  test('lineFamilyCircleIntersectionPoint는 방향이 0인 origin이 경계 밖이면 false다', () => {
    expect(lineFamilyCircleIntersectionPoint({ x: 0, y: 0 }, point(1, 0), 0, 0, 3, 1e-9)).toBe(false);
  });

  test('lineFamilyCircleIntersectionPoint는 접점이 segment 범위 밖이면 false다', () => {
    // y = 3 직선은 원 (r = 3)에 (0, 3)에서 접한다. 접점은 t = 5라 [0, 1] 밖이다.
    const tangent: LineFamilyParam = { ox: -5, oy: 3, dx: 1, dy: 0, kind: 'finite' };
    expect(lineFamilyCircleIntersectionPoint({ x: 0, y: 0 }, tangent, 0, 0, 3, 1e-9)).toBe(false);
  });

  test('lineFamilyCircleIntersectionPoint는 근 하나만 범위 안이면 그 점을 기록한다', () => {
    // (-4, 0)에서 (-2, 0)까지의 segment는 x = -3에서 원 (r = 3)과 한 번 만난다.
    const segment: LineFamilyParam = { ox: -4, oy: 0, dx: 2, dy: 0, kind: 'finite' };
    const out = { x: 0, y: 0 };
    expect(lineFamilyCircleIntersectionPoint(out, segment, 0, 0, 3, 1e-9)).toBe(true);
    expect(out.x).toBeCloseTo(-3, 12);
    expect(out.y).toBeCloseTo(0, 12);
  });

  test('lineFamilyEllipseIntersectionPoint는 접점이 segment 범위 밖이면 false다', () => {
    // y = 2 직선은 ellipse (rx = 3, ry = 2)에 (0, 2)에서 접한다. 접점은 t = 5라 [0, 1] 밖이다.
    expect(lineFamilyEllipseIntersectionPoint({ x: 0, y: 0 }, -5, 2, 1, 0, 'finite', 0, 0, 3, 2, 1e-9)).toBe(false);
  });
});

describe('cropLineFamilyByCircleInto 표현 한계', () => {
  test('반지름 제곱이 overflow하는 원은 끝점을 표현할 수 없어 false다', () => {
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(cropLineFamilyByCircleInto(out, 0, 0, 1, 0, 'ray', 0, 0, 1e300)).toBe(false);
    expect(cropLineFamilyByCircleInto(out, 0, 0, 1, 0, 'inf', 0, 0, 1e300)).toBe(false);
    expect(out).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });
  });
});

describe('cropLineFamilyByRectInto 비교차', () => {
  test('직선이 직사각형을 비껴가면 false다', () => {
    // y = x + 5는 [0, 2] x [0, 2] 직사각형을 지나지 않는다. slab 구간이 겹치지 않는다.
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(cropLineFamilyByRectInto(out, 0, 5, 1, 1, 'inf', 0, 0, 2, 2)).toBe(false);
  });
});

describe('polygon 교점·가시성 퇴화 입력', () => {
  const triangle = [
    { x: 3, y: -1 },
    { x: 3, y: 2 },
    { x: 5, y: 0.5 },
  ];

  test('computeVisibilityRayHits는 꼭짓점이 3개 미만인 장애물에서는 ray를 쏘지 않는다', () => {
    const segmentOnly = [
      { x: 2, y: 1 },
      { x: 6, y: 1 },
    ];
    const alone = computeVisibilityRayHits(0, 0, [triangle], 1e-9, 1e-4);
    expect(alone).toHaveLength(7);
    expect(computeVisibilityRayHits(0, 0, [triangle, segmentOnly], 1e-9, 1e-4)).toEqual(alone);
  });

  test('computeVisibilityRayHits는 origin과 겹치는 꼭짓점으로는 ray를 쏘지 않는다', () => {
    // origin (0,0)이 corner의 꼭짓점이다. 방향이 없는 그 꼭짓점이 각도 0 ray를 만들면 가림막에 hit가 더 생긴다.
    const corner = [
      { x: 0, y: 0 },
      { x: 3, y: 2 },
      { x: 1, y: 4 },
    ];
    const blocker = [
      { x: 5, y: -1 },
      { x: 5, y: 2 },
      { x: 7, y: 1 },
    ];
    const hits = computeVisibilityRayHits(0, 0, [corner, blocker], 1e-9, 1e-4);
    // corner의 다른 두 꼭짓점과 blocker의 세 꼭짓점이 만드는 ray 15개 중 11개가 닿는다.
    expect(hits).toHaveLength(11);
    expect(hits.some((h) => Math.abs(h.angle) < 1e-9)).toBe(false);
  });
});

describe('다항식·포함 판정 경계', () => {
  test('multiplyPolynomials는 한쪽이 비어 있으면 빈 배열이다', () => {
    expect(multiplyPolynomials([], [1, 2])).toEqual([]);
    expect(multiplyPolynomials([1, 2], [])).toEqual([]);
  });

  test('realRootsInClosedUnit은 1차 근이 [0, 1] 밖이면 빈 배열이다', () => {
    expect(realRootsInClosedUnit([2, 1])).toEqual([]);
    expect(realRootsInClosedUnit([-0.5, 1])).toEqual([0.5]);
  });

  test('rectContainsPointXY는 폭이나 높이가 0이면 변 위의 점도 포함하지 않는다', () => {
    expect(rectContainsPointXY(0, 0, 0, 10, 0, 5)).toBe(false);
    expect(rectContainsPointXY(0, 0, 10, 0, 5, 0)).toBe(false);
    expect(rectContainsPointXY(0, 0, 10, 10, 5, 5)).toBe(true);
  });

  test('segmentContainsPoint는 길이 0 segment를 점으로 본다', () => {
    const point = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 } };
    expect(segmentContainsPoint(point, 1, 1, 1e-9)).toBe(true);
    expect(segmentContainsPoint(point, 1, 2, 1e-9)).toBe(false);
  });

  test('boundsContainsPointXY는 min이 max보다 크면 어떤 점도 포함하지 않는다', () => {
    expect(boundsContainsPointXY(10, 0, 0, 10, 5, 5)).toBe(false);
    expect(boundsContainsPointXY(0, 10, 10, 0, 5, 5)).toBe(false);
    expect(boundsContainsPointXY(0, 0, 10, 10, 5, 5)).toBe(true);
  });
});
