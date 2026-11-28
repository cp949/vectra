/**
 * intersects ray × shape hit-T 함수와 기존 점 반환 함수의 동일성 테스트.
 *
 * 난수 입력 수천 개에서 `origin + t * direction`이 기존 함수가 기록한 첫 교점과
 * ±1e-9 안에서 같은지, 기존 함수가 교점을 주지 않는 입력에서 Infinity인지 확인한다.
 * ray, circle, segment 같은 입력은 객체와 tuple 형태를 무작위로 섞는다. tMin은 0이다.
 *
 * 대상 함수:
 *  - rayCircleHitT   ↔ rayCircleIntersectionsInto
 *  - rayEllipseHitT  ↔ rayEllipseIntersectionsInto
 *  - raySegmentHitT  ↔ singleIntersectionSegmentRayInto
 *  - rayPolygonHitT  ↔ closestRayPolygonIntersectionInto
 *  - rayRectHitT     ↔ rayRectIntersectionsInto
 *  - rayBoundsHitT   ↔ rayBoundsIntersectionsInto
 *
 * 도형 입력이 퇴화하는 경계 조건은 ray-hit-t.test.ts가 고정한다. 여기서는 일반 위치만 본다.
 */
import { describe, expect, test } from 'vitest';
import { readX, readY } from '../../../src/internal/xy';
import { closestRayPolygonIntersectionInto } from '../../../src/intersects/closest-ray-polygon-intersection-into';
import { rayBoundsHitT } from '../../../src/intersects/ray-bounds-hit-t';
import { rayBoundsIntersectionsInto } from '../../../src/intersects/ray-bounds-intersections-into';
import { rayCircleHitT } from '../../../src/intersects/ray-circle-hit-t';
import { rayCircleIntersectionsInto } from '../../../src/intersects/ray-circle-intersections-into';
import { rayEllipseHitT } from '../../../src/intersects/ray-ellipse-hit-t';
import { rayEllipseIntersectionsInto } from '../../../src/intersects/ray-ellipse-intersections-into';
import { rayPolygonHitT } from '../../../src/intersects/ray-polygon-hit-t';
import { rayRectHitT } from '../../../src/intersects/ray-rect-hit-t';
import { rayRectIntersectionsInto } from '../../../src/intersects/ray-rect-intersections-into';
import { raySegmentHitT } from '../../../src/intersects/ray-segment-hit-t';
import { singleIntersectionSegmentRayInto } from '../../../src/intersects/single-intersection-segment-ray-into';
import { createRng } from '../../../src/random/create-rng';
import type {
  BoundsLike,
  CircleLike,
  EllipseLike,
  LinePolygonIntersectionHit,
  PolygonLike,
  RayLike,
  RectLike,
  SegmentLike,
  XYInput,
  XYObjectWritable,
} from '../../../src/types';

const CASES = 4000;
const TOLERANCE = 1e-9;

/** [min, max) 구간의 난수를 반환한다. */
function range(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

/** 객체나 tuple 중 하나로 점을 만든다. */
function point(rng: () => number, x: number, y: number): XYInput {
  return rng() < 0.5 ? { x, y } : [x, y];
}

/** 객체나 tuple 중 하나로 ray를 만든다. direction은 정규화하지 않는다. */
function makeRay(rng: () => number, ox: number, oy: number, dx: number, dy: number): RayLike {
  return rng() < 0.5 ? [ox, oy, dx, dy] : { origin: point(rng, ox, oy), direction: point(rng, dx, dy) };
}

/** 난수 ray의 좌표를 만든다. direction 길이는 약 0.1에서 4 사이다. */
function randomRayCoords(rng: () => number): [number, number, number, number] {
  const angle = range(rng, 0, Math.PI * 2);
  const length = range(rng, 0.1, 4);
  return [range(rng, -20, 20), range(rng, -20, 20), Math.cos(angle) * length, Math.sin(angle) * length];
}

/** hit이 있는 입력이 일정 비율 이상인지 확인하는 집계기. 모든 입력이 miss인 시험을 막는다. */
function expectEnoughHits(hits: number): void {
  expect(hits).toBeGreaterThan(CASES * 0.1);
  expect(hits).toBeLessThan(CASES * 0.95);
}

/**
 * `origin + t * direction`이 기대 교점과 ±1e-9 안에서 같은지 확인한다.
 *
 * @param coords ray 좌표 `[ox, oy, dx, dy]`
 * @param t 확인할 ray parameter
 * @param expected 기존 함수가 기록한 교점
 */
function expectSamePoint(coords: readonly number[], t: number, expected: XYObjectWritable): void {
  const [ox, oy, dx, dy] = coords;
  expect(Math.abs(ox + t * dx - expected.x)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(oy + t * dy - expected.y)).toBeLessThanOrEqual(TOLERANCE);
}

describe('rayCircleHitT — rayCircleIntersectionsInto와 같은 교점', () => {
  test('난수 입력 4000개에서 첫 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-circle-hit-t');
    const points: XYObjectWritable[] = [];
    let hits = 0;
    let twoPoints = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const radius = range(rng, 0.5, 8);
      const cx = range(rng, -15, 15);
      const cy = range(rng, -15, 15);
      const ray = makeRay(rng, ...coords);
      const circle: CircleLike = rng() < 0.5 ? { center: point(rng, cx, cy), radius } : [point(rng, cx, cy), radius];

      const t = rayCircleHitT(ray, circle);
      rayCircleIntersectionsInto(points, ray, circle);

      if (points.length === 0) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expectSamePoint(coords, t, points[0]);

      // 두 교점 사이로 tMin을 올리면 두 번째 교점이 나온다.
      if (points.length === 2) {
        twoPoints++;
        const gap = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) / Math.hypot(coords[2], coords[3]);
        const second = rayCircleHitT(ray, circle, t + gap / 2);
        expectSamePoint(coords, second, points[1]);
      }
    }
    expectEnoughHits(hits);
    expect(twoPoints).toBeGreaterThan(100);
  });
});

describe('rayEllipseHitT — rayEllipseIntersectionsInto와 같은 교점', () => {
  test('난수 입력 4000개에서 첫 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-ellipse-hit-t');
    const points: XYObjectWritable[] = [];
    let hits = 0;
    let twoPoints = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const radiusX = range(rng, 0.5, 8);
      const radiusY = range(rng, 0.5, 8);
      const cx = range(rng, -15, 15);
      const cy = range(rng, -15, 15);
      const ray = makeRay(rng, ...coords);
      const ellipse: EllipseLike =
        rng() < 0.5 ? { center: point(rng, cx, cy), radiusX, radiusY } : [point(rng, cx, cy), radiusX, radiusY];

      const t = rayEllipseHitT(ray, ellipse);
      rayEllipseIntersectionsInto(points, ray, ellipse);

      if (points.length === 0) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expectSamePoint(coords, t, points[0]);

      if (points.length === 2) {
        twoPoints++;
        const gap = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) / Math.hypot(coords[2], coords[3]);
        const second = rayEllipseHitT(ray, ellipse, t + gap / 2);
        expectSamePoint(coords, second, points[1]);
      }
    }
    expectEnoughHits(hits);
    expect(twoPoints).toBeGreaterThan(100);
  });
});

describe('raySegmentHitT — singleIntersectionSegmentRayInto와 같은 교점', () => {
  test('난수 입력 4000개에서 단일 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-segment-hit-t');
    const out: XYObjectWritable = { x: 0, y: 0 };
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const ray = makeRay(rng, ...coords);
      const a = point(rng, range(rng, -20, 20), range(rng, -20, 20));
      const b = point(rng, range(rng, -20, 20), range(rng, -20, 20));
      const segment: SegmentLike = rng() < 0.5 ? { a, b } : [a, b];

      const [ox, oy, dx, dy] = coords;
      const t = raySegmentHitT({ ox, oy, dx, dy }, { x1: readX(a), y1: readY(a), x2: readX(b), y2: readY(b) });
      const found = singleIntersectionSegmentRayInto(out, segment, ray);

      if (!found) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expectSamePoint(coords, t, out);
    }
    expectEnoughHits(hits);
  });
});

describe('rayPolygonHitT — closestRayPolygonIntersectionInto와 같은 교점', () => {
  test('난수 polygon 4000개에서 가장 가까운 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-polygon-hit-t');
    const hit: LinePolygonIntersectionHit = {
      point: { x: 0, y: 0 },
      kind: 'cross',
      tLine: 0,
      tEdge: 0,
      edgeIndex: 0,
    };
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const ray = makeRay(rng, ...coords);
      const count = 3 + Math.floor(rng() * 6);
      const points: XYInput[] = [];
      for (let k = 0; k < count; k++) points.push(point(rng, range(rng, -20, 20), range(rng, -20, 20)));
      const polygon: PolygonLike = rng() < 0.5 ? points : { points };

      const t = rayPolygonHitT(ray, polygon);
      const found = closestRayPolygonIntersectionInto(hit, ray, polygon);

      if (!found) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expect(Math.abs(t - hit.tLine)).toBeLessThanOrEqual(TOLERANCE);
      expectSamePoint(coords, t, hit.point);
    }
    expectEnoughHits(hits);
  });
});

describe('rayRectHitT — rayRectIntersectionsInto와 같은 교점', () => {
  test('난수 입력 4000개에서 첫 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-rect-hit-t');
    const points: XYObjectWritable[] = [];
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const ray = makeRay(rng, ...coords);
      const x = range(rng, -15, 10);
      const y = range(rng, -15, 10);
      const width = range(rng, 0.5, 12);
      const height = range(rng, 0.5, 12);
      const rect: RectLike = rng() < 0.5 ? { x, y, width, height } : [x, y, width, height];

      const t = rayRectHitT(ray, rect);
      rayRectIntersectionsInto(points, ray, rect);

      if (points.length === 0) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expectSamePoint(coords, t, points[0]);
    }
    expectEnoughHits(hits);
  });
});

describe('rayBoundsHitT — rayBoundsIntersectionsInto와 같은 교점', () => {
  test('난수 입력 4000개에서 첫 교점과 같고, 교점이 없으면 Infinity다', () => {
    const rng = createRng('ray-bounds-hit-t');
    const points: XYObjectWritable[] = [];
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const coords = randomRayCoords(rng);
      const ray = makeRay(rng, ...coords);
      const x = range(rng, -15, 10);
      const y = range(rng, -15, 10);
      const min = point(rng, x, y);
      const max = point(rng, x + range(rng, 0.5, 12), y + range(rng, 0.5, 12));
      const bounds: BoundsLike = rng() < 0.5 ? { min, max } : [min, max];

      const t = rayBoundsHitT(ray, bounds);
      rayBoundsIntersectionsInto(points, ray, bounds);

      if (points.length === 0) {
        expect(t).toBe(Infinity);
        continue;
      }
      hits++;
      expectSamePoint(coords, t, points[0]);
    }
    expectEnoughHits(hits);
  });
});
