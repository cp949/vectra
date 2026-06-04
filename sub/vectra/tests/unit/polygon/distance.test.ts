/**
 * polygon 거리 계산 함수를 검증하는 테스트.
 * closestPoint, closestPointInto, distanceToPoint의 정상 동작, 경계값, 실패 경로를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/polygon/closest-point';
import { closestPointInto } from '../../../src/polygon/closest-point-into';
import { distanceToPoint } from '../../../src/polygon/distance-to-point';
import type { PolygonLike, XYWritable } from '../../../src/types';
import { CCW_TRI, EMPTY, makePoint, REPEATED_PT, SINGLE, TWO_PT, UNIT_SQUARE } from './_access-distance-test-helpers';

describe('polygon distance allocating companions', () => {
  test('closestPoint는 성공 시 새 XYObjectWritable을 반환하고 실패 시 undefined를 반환한다', () => {
    expect(closestPoint(CCW_TRI, { x: 2, y: -1 })).toEqual({ x: 2, y: 0 });
    expect(closestPoint(EMPTY, { x: 0, y: 0 })).toBeUndefined();
  });
});

describe('polygon distance - closestPointInto', () => {
  test('빈 polygon(0점)은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    Object.assign(out, { x: 99, y: 99 });
    expect(closestPointInto(out, EMPTY, { x: 0, y: 0 })).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('bare point array로 closest point를 계산한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    const out = { x: 99, y: 99 };

    expect(closestPointInto(out, points, { x: 2, y: -1 })).toBe(true);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('단일 point polygon은 해당 점을 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(closestPointInto(out, SINGLE, { x: 100, y: 100 })).toBe(true);
    expect(out).toEqual({ x: 5, y: 7 });
  });

  test('2점 polygon: segment boundary closest를 계산한다 (interior case)', () => {
    const out = makePoint();
    // TWO_PT: (0,0)->(3,4), point (0,1)의 수선의 발은 segment 내부에 있다.
    expect(closestPointInto(out, TWO_PT, { x: 0, y: 1 })).toBe(true);
    expect(out.x).toBeCloseTo(0.48, 10);
    expect(out.y).toBeCloseTo(0.64, 10);
  });

  test('2점 polygon: endpoint에 있는 점의 closest는 해당 endpoint이다', () => {
    const out = makePoint();
    expect(closestPointInto(out, TWO_PT, { x: 0, y: 0 })).toBe(true);
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });

  test('삼각형 boundary 위 점의 closest는 해당 점 자신이다 (dist=0)', () => {
    const out = makePoint();
    expect(closestPointInto(out, CCW_TRI, { x: 2, y: 0 })).toBe(true);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('삼각형 외부 점의 closest는 가장 가까운 boundary 점이다', () => {
    const out = makePoint();
    expect(closestPointInto(out, CCW_TRI, { x: 2, y: -1 })).toBe(true);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('삼각형 내부 점의 closest는 가장 가까운 boundary 점이다 (incenter)', () => {
    const out = makePoint();
    expect(closestPointInto(out, CCW_TRI, { x: 1, y: 1 })).toBe(true);
    const dx = out.x - 1;
    const dy = out.y - 1;
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(1, 10);
  });

  test('equidistant edge가 여러 개이면 가장 작은 edge index의 closest를 채택한다', () => {
    const out = makePoint();
    expect(closestPointInto(out, UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBe(true);
    expect(out.x).toBe(0.5);
    expect(out.y).toBe(0);
  });

  test('단위 정사각형 내부 중심의 closest는 boundary에 있다 (dist=0.5)', () => {
    const out = makePoint();
    expect(closestPointInto(out, UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBe(true);
    const dx = out.x - 0.5;
    const dy = out.y - 0.5;
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(0.5, 10);
  });

  test('단위 정사각형 외부 오른쪽 점의 closest는 오른쪽 edge 위이다', () => {
    const out = makePoint();
    expect(closestPointInto(out, UNIT_SQUARE, { x: 2, y: 0.5 })).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0.5, 10);
  });

  test('repeated-point edge polygon에서 NaN이 발생하지 않는다', () => {
    const out = makePoint();
    const result = closestPointInto(out, REPEATED_PT, { x: 0.5, y: 1 });
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(closestPointInto(out, CCW_TRI, { x: 2, y: -1 })).toBe(true);
    expect(out[0]).toBeCloseTo(2, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });

  test('외부 Point class out에 기록한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }
    const p = new Point(0, 0);
    const result = closestPointInto(p as XYWritable, CCW_TRI, { x: 2, y: -1 });
    expect(result).toBe(true);
    expect(p.x).toBeCloseTo(2, 10);
    expect(p.y).toBeCloseTo(0, 10);
  });

  test('tuple point 입력 polygon에서 closest를 계산한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ] as const,
    };
    const out = makePoint();
    expect(closestPointInto(out, poly, { x: 2, y: -1 })).toBe(true);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('tuple point input에 tuple out을 사용할 수 있다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ] as const,
    };
    const out: [number, number] = [0, 0];
    expect(closestPointInto(out, poly, [2, -1] as const)).toBe(true);
    expect(out[0]).toBeCloseTo(2, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });
});

describe('polygon distance - distanceToPoint', () => {
  test('빈 polygon(0점)은 Infinity를 반환한다', () => {
    expect(distanceToPoint(EMPTY, { x: 0, y: 0 })).toBe(Infinity);
  });

  test('단일 point polygon은 해당 점까지의 Euclidean 거리를 반환한다', () => {
    expect(distanceToPoint(SINGLE, { x: 2, y: 3 })).toBeCloseTo(5, 10);
  });

  test('단일 point polygon — 같은 좌표는 거리 0', () => {
    expect(distanceToPoint(SINGLE, { x: 5, y: 7 })).toBeCloseTo(0, 10);
  });

  test('2점 polygon: segment 위 점은 거리 0이다', () => {
    expect(distanceToPoint(TWO_PT, { x: 1.5, y: 2 })).toBeCloseTo(0, 10);
  });

  test('2점 polygon: endpoint에서 거리는 0이다', () => {
    expect(distanceToPoint(TWO_PT, { x: 0, y: 0 })).toBeCloseTo(0, 10);
  });

  test('2점 polygon의 finite distance 제곱이 overflow해도 finite distance를 반환한다', () => {
    const far = 1e200;
    const poly = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    expect(distanceToPoint(poly, { x: 0, y: far })).toBe(far);
  });

  test('삼각형 boundary 위 점의 거리는 0이다', () => {
    expect(distanceToPoint(CCW_TRI, { x: 2, y: 0 })).toBeCloseTo(0, 10);
  });

  test('삼각형 외부 점의 거리는 가장 가까운 edge까지의 거리이다', () => {
    expect(distanceToPoint(CCW_TRI, { x: 2, y: -1 })).toBeCloseTo(1, 10);
  });

  test('bare point array로 distance를 계산한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;

    expect(distanceToPoint(points, { x: 2, y: -1 })).toBe(1);
  });

  test('삼각형 내부 incenter (1,1)의 거리는 inradius=1이다', () => {
    expect(distanceToPoint(CCW_TRI, { x: 1, y: 1 })).toBeCloseTo(1, 10);
  });

  test('단위 정사각형 중심 (0.5,0.5)의 거리는 0.5이다', () => {
    expect(distanceToPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBeCloseTo(0.5, 10);
  });

  test('단위 정사각형 외부 (2,0.5)의 거리는 1이다', () => {
    expect(distanceToPoint(UNIT_SQUARE, { x: 2, y: 0.5 })).toBeCloseTo(1, 10);
  });

  test('repeated-point edge polygon에서 NaN이 발생하지 않는다', () => {
    const result = distanceToPoint(REPEATED_PT, { x: 0.5, y: 1 });
    expect(Number.isNaN(result)).toBe(false);
  });

  test('tuple point input을 지원한다', () => {
    expect(distanceToPoint(CCW_TRI, [2, -1] as const)).toBeCloseTo(1, 10);
  });

  test('mixed input — object polygon, tuple point', () => {
    expect(distanceToPoint(CCW_TRI, [2, -1] as const)).toBeCloseTo(1, 10);
  });

  test('tuple point polygon, tuple point input', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ] as const,
    };
    expect(distanceToPoint(poly, [2, -1] as const)).toBeCloseTo(1, 10);
  });
});
