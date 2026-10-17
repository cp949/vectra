/**
 * ellipse 최근접점이 정규화 공간이 아니라 Euclidean 거리 기준인지 확인하는 회귀 테스트.
 *
 * 기준 해는 각도를 촘촘히 샘플링한 뒤 도함수 부호 bisection으로 정제한 brute-force 값이다.
 * closestPoint, closestPointInto, projectPoint, projectPointInto, distanceToPoint,
 * intersectsEllipseCircle이 같은 core를 쓰므로 함께 검증한다.
 * rx > ry, rx < ry, 원에 가까운 형태, 중심 이동, 내부·외부·축 위 점, evolute 근처를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/ellipse/closest-point';
import { closestPointInto } from '../../../src/ellipse/closest-point-into';
import { distanceToPoint } from '../../../src/ellipse/distance-to-point';
import { projectPoint } from '../../../src/ellipse/project-point';
import { projectPointInto } from '../../../src/ellipse/project-point-into';
import { intersectsEllipseCircle } from '../../../src/intersects/intersects-ellipse-circle';

interface Reference {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
}

/**
 * 축 정렬 ellipse의 brute-force 최근접점을 구한다.
 * 각도 20000개를 샘플해 최소 거리 각도를 찾고, 그 주변 구간에서 거리 제곱의 도함수 부호로 bisection한다.
 * 점과 반지름은 center 기준 오프셋으로 받는다. 반환 좌표도 center 기준이다.
 */
function bruteForceClosest(rx: number, ry: number, dx: number, dy: number): Reference {
  const samples = 20000;
  let bestAngle = 0;
  let bestSquared = Number.POSITIVE_INFINITY;
  for (let k = 0; k < samples; k++) {
    const angle = (2 * Math.PI * k) / samples;
    const squared = (rx * Math.cos(angle) - dx) ** 2 + (ry * Math.sin(angle) - dy) ** 2;
    if (squared < bestSquared) {
      bestSquared = squared;
      bestAngle = angle;
    }
  }

  const slope = (angle: number): number =>
    (rx * Math.cos(angle) - dx) * (-rx * Math.sin(angle)) + (ry * Math.sin(angle) - dy) * (ry * Math.cos(angle));

  const step = (2 * Math.PI) / samples;
  let lo = bestAngle - step;
  let hi = bestAngle + step;
  if (slope(lo) * slope(hi) <= 0) {
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (slope(lo) * slope(mid) <= 0) hi = mid;
      else lo = mid;
    }
    bestAngle = (lo + hi) / 2;
  }

  const x = rx * Math.cos(bestAngle);
  const y = ry * Math.sin(bestAngle);
  return { x, y, distance: Math.hypot(x - dx, y - dy) };
}

/**
 * center와 반지름으로 EllipseLike 객체를 만든다.
 */
function makeEllipse(cx: number, cy: number, rx: number, ry: number) {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

const RADII: ReadonlyArray<readonly [number, number]> = [
  [2, 1],
  [1, 2],
  [5, 0.5],
  [0.5, 5],
  [3, 2.9999],
  [3, 3],
  [1e-3, 1],
  [1000, 1],
];

const CENTERS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [10, -4],
];

/**
 * 반지름에 맞춰 내부·외부·축 위·evolute 근처 오프셋 점을 만든다.
 * center와 같은 점(0, 0)은 tie-break 계약이 따로 있어 제외한다.
 */
function sampleOffsets(rx: number, ry: number): Array<readonly [number, number]> {
  const fractions = [-3, -1.5, -1, -0.6, -0.2, -0.01, 0, 0.01, 0.2, 0.6, 1, 1.5, 3];
  const offsets: Array<readonly [number, number]> = [];
  for (const fx of fractions) {
    for (const fy of fractions) {
      if (fx === 0 && fy === 0) continue;
      offsets.push([fx * rx, fy * ry]);
    }
  }
  return offsets;
}

describe('ellipse Euclidean 최근접점 - 보고된 예시', () => {
  test('rx=2, ry=1 ellipse에서 (3, 2)의 closest point는 (1.7254, 0.5057)이다', () => {
    const result = closestPoint(makeEllipse(0, 0, 2, 1), { x: 3, y: 2 });
    expect(result.x).toBeCloseTo(1.7254112548559848, 8);
    expect(result.y).toBeCloseTo(0.5057064369810552, 8);
  });

  test('rx=2, ry=1 ellipse에서 (3, 2)까지의 거리는 약 1.9640이다', () => {
    const d = distanceToPoint(makeEllipse(0, 0, 2, 1), { x: 3, y: 2 });
    expect(d).toBeCloseTo(1.9640493175395692, 8);
  });

  test('정규화 공간의 방사 투영점 (1.2, 0.8)을 반환하지 않는다', () => {
    const result = closestPoint(makeEllipse(0, 0, 2, 1), { x: 3, y: 2 });
    expect(Math.hypot(result.x - 1.2, result.y - 0.8)).toBeGreaterThan(0.1);
  });
});

describe('ellipse Euclidean 최근접점 - brute-force 대조', () => {
  for (const [rx, ry] of RADII) {
    for (const [cx, cy] of CENTERS) {
      test(`rx=${rx}, ry=${ry}, center=(${cx}, ${cy})에서 closestPoint가 brute-force 최소 거리와 일치한다`, () => {
        const ellipse = makeEllipse(cx, cy, rx, ry);
        const scale = Math.max(rx, ry);
        for (const [dx, dy] of sampleOffsets(rx, ry)) {
          const point = { x: cx + dx, y: cy + dy };
          const reference = bruteForceClosest(rx, ry, dx, dy);
          const result = closestPoint(ellipse, point);

          // 결과는 ellipse boundary 위에 있어야 한다
          const onBoundary = ((result.x - cx) / rx) ** 2 + ((result.y - cy) / ry) ** 2;
          expect(onBoundary).toBeCloseTo(1, 9);

          // 결과까지의 거리는 brute-force 최소 거리와 같아야 한다
          const distance = Math.hypot(result.x - point.x, result.y - point.y);
          expect(Math.abs(distance - reference.distance)).toBeLessThanOrEqual(1e-9 * scale);
        }
      });
    }
  }

  test('해가 하나인 점은 brute-force 좌표와도 일치한다', () => {
    const cases: ReadonlyArray<readonly [number, number, number, number]> = [
      [2, 1, 3, 2],
      [2, 1, -3, 2],
      [2, 1, -3, -2],
      [1, 2, 2, 3],
      [5, 0.5, 4, 1],
      [0.5, 5, 1, 4],
      [3, 2, 0.5, 0.5],
      [3, 2, -1, 1.2],
    ];
    for (const [rx, ry, dx, dy] of cases) {
      const reference = bruteForceClosest(rx, ry, dx, dy);
      const result = closestPoint(makeEllipse(0, 0, rx, ry), { x: dx, y: dy });
      expect(result.x).toBeCloseTo(reference.x, 7);
      expect(result.y).toBeCloseTo(reference.y, 7);
    }
  });

  test('closestPointInto, projectPoint, projectPointInto가 closestPoint와 같은 좌표를 반환한다', () => {
    const ellipse = makeEllipse(1, -2, 2, 1);
    const point = { x: 4, y: 0 };
    const expected = closestPoint(ellipse, point);

    const into = closestPointInto({ x: 0, y: 0 }, ellipse, point);
    const projected = projectPoint(ellipse, point);
    const projectedInto = projectPointInto({ x: 0, y: 0 }, ellipse, point);

    for (const actual of [into, projected, projectedInto]) {
      expect(actual.x).toBeCloseTo(expected.x, 12);
      expect(actual.y).toBeCloseTo(expected.y, 12);
    }

    const reference = bruteForceClosest(2, 1, 3, 2);
    expect(expected.x - 1).toBeCloseTo(reference.x, 8);
    expect(expected.y + 2).toBeCloseTo(reference.y, 8);
  });

  test('distanceToPoint는 외부 점에서 brute-force 최소 거리와 일치한다', () => {
    for (const [rx, ry] of RADII) {
      const ellipse = makeEllipse(-3, 7, rx, ry);
      for (const [dx, dy] of sampleOffsets(rx, ry)) {
        if ((dx / rx) ** 2 + (dy / ry) ** 2 <= 1) continue;
        const reference = bruteForceClosest(rx, ry, dx, dy);
        const distance = distanceToPoint(ellipse, { x: -3 + dx, y: 7 + dy });
        expect(Math.abs(distance - reference.distance)).toBeLessThanOrEqual(1e-9 * Math.max(rx, ry));
      }
    }
  });
});

describe('ellipse Euclidean 최근접점 - 축 위와 evolute', () => {
  test('major axis 위에서 evolute 밖의 점은 axis vertex로 투영된다', () => {
    // rx=3, ry=2: evolute 반폭 = (rx² - ry²) / rx = 5/3. (2, 0)은 그 밖이다
    const result = closestPoint(makeEllipse(0, 0, 3, 2), { x: 2, y: 0 });
    const reference = bruteForceClosest(3, 2, 2, 0);
    expect(Math.hypot(result.x - 2, result.y)).toBeCloseTo(reference.distance, 10);
  });

  test('major axis 위에서 evolute 안의 점은 두 해 중 y가 양수인 쪽을 반환한다', () => {
    // rx=3, ry=2: (1, 0)은 evolute 안이라 (±x, ±y) 두 해가 같은 거리를 갖는다
    const result = closestPoint(makeEllipse(0, 0, 3, 2), { x: 1, y: 0 });
    const reference = bruteForceClosest(3, 2, 1, 0);
    expect(result.x).toBeCloseTo(1.8, 10);
    expect(result.y).toBeCloseTo(2 * Math.sqrt(1 - 0.36), 10);
    expect(Math.hypot(result.x - 1, result.y)).toBeCloseTo(reference.distance, 9);
  });

  test('major axis가 y인 ellipse에서 evolute 안의 점은 x가 양수인 쪽을 반환한다', () => {
    const result = closestPoint(makeEllipse(0, 0, 2, 3), { x: 0, y: 1 });
    expect(result.x).toBeCloseTo(2 * Math.sqrt(1 - 0.36), 10);
    expect(result.y).toBeCloseTo(1.8, 10);
  });

  test('음수 방향 축 위의 점도 같은 거리로 투영된다', () => {
    const left = closestPoint(makeEllipse(0, 0, 3, 2), { x: -1, y: 0 });
    expect(left.x).toBeCloseTo(-1.8, 10);
    expect(Math.abs(left.y)).toBeCloseTo(2 * Math.sqrt(1 - 0.36), 10);
  });

  test('minor axis 위의 점은 minor vertex로 투영된다', () => {
    const cases: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
      [3, 2, 0, 0.5, 0, 2],
      [3, 2, 0, -7, 0, -2],
      [2, 3, 0.5, 0, 2, 0],
      [2, 3, -7, 0, -2, 0],
    ];
    for (const [rx, ry, px, py, ex, ey] of cases) {
      const result = closestPoint(makeEllipse(0, 0, rx, ry), { x: px, y: py });
      expect(result.x).toBeCloseTo(ex, 12);
      expect(result.y).toBeCloseTo(ey, 12);
    }
  });

  test('major vertex 바깥 축 위의 점은 vertex로 투영된다', () => {
    expect(closestPoint(makeEllipse(0, 0, 3, 2), { x: 9, y: 0 }).x).toBeCloseTo(3, 12);
    expect(closestPoint(makeEllipse(0, 0, 2, 3), { x: 0, y: -9 }).y).toBeCloseTo(-3, 12);
  });

  test('원에서는 중심 방향 반직선과 boundary의 교점을 반환한다', () => {
    const result = closestPoint(makeEllipse(1, 1, 5, 5), { x: 4, y: 5 });
    // 중심 (1, 1), 오프셋 (3, 4), 거리 5 → (1 + 3, 1 + 4)
    expect(result.x).toBeCloseTo(4, 12);
    expect(result.y).toBeCloseTo(5, 12);
  });
});

describe('ellipse Euclidean 최근접점 - 중심과 퇴화 입력', () => {
  test('point가 center이면 rx > ry여도 (cx + rx, cy)로 tie-break한다', () => {
    expect(closestPoint(makeEllipse(2, 3, 4, 1), { x: 2, y: 3 })).toEqual({ x: 6, y: 3 });
    expect(closestPoint(makeEllipse(2, 3, 1, 4), { x: 2, y: 3 })).toEqual({ x: 3, y: 3 });
  });

  test('center에 매우 가까운 점은 minor vertex 쪽으로 투영된다', () => {
    const result = closestPoint(makeEllipse(0, 0, 4, 1), { x: 1e-9, y: 1e-9 });
    const reference = bruteForceClosest(4, 1, 1e-9, 1e-9);
    expect(Math.hypot(result.x - 1e-9, result.y - 1e-9)).toBeCloseTo(reference.distance, 9);
  });

  test('반지름이 매우 작은 축에서도 유한한 boundary 점을 반환한다', () => {
    for (const ry of [1e-20, 1e-100, 1e-200, 1e-300]) {
      const result = closestPoint(makeEllipse(0, 0, 1, ry), { x: 0.3, y: 5 * ry });
      expect(Number.isFinite(result.x)).toBe(true);
      expect(Number.isFinite(result.y)).toBe(true);
      expect(result.x).toBeCloseTo(0.3, 6);
      expect(Math.abs(result.y)).toBeLessThanOrEqual(ry);
    }
  });

  test('반지름이 매우 큰 값에서도 정규화 오차 없이 계산한다', () => {
    const result = closestPoint(makeEllipse(0, 0, 1e6, 1e3), { x: 2e6, y: 2e3 });
    const reference = bruteForceClosest(1e6, 1e3, 2e6, 2e3);
    const distance = Math.hypot(result.x - 2e6, result.y - 2e3);
    expect(Math.abs(distance - reference.distance)).toBeLessThanOrEqual(1e-6);
  });

  test('매우 멀리 있는 점은 그 방향 법선이 닿는 점으로 투영된다', () => {
    // 45도 방향 법선 (cosθ / 2, sinθ) ∝ (1, 1) → tanθ = 1/2
    const result = closestPoint(makeEllipse(0, 0, 2, 1), { x: 1e12, y: 1e12 });
    expect(result.x).toBeCloseTo(2 * Math.cos(Math.atan(0.5)), 6);
    expect(result.y).toBeCloseTo(Math.sin(Math.atan(0.5)), 6);
  });
});

describe('ellipse Euclidean 최근접점 - epsilon', () => {
  test('큰 epsilon으로 호출해도 boundary 위의 유한한 점을 반환한다', () => {
    const result = closestPoint(makeEllipse(0, 0, 2, 1), { x: 3, y: 2 }, 1);
    expect((result.x / 2) ** 2 + result.y ** 2).toBeCloseTo(1, 10);
  });

  test('epsilon 0은 반복 상한 안에서 끝난다', () => {
    const result = closestPoint(makeEllipse(0, 0, 2, 1), { x: 3, y: 2 }, 0);
    expect(result.x).toBeCloseTo(1.7254112548559848, 10);
    expect(result.y).toBeCloseTo(0.5057064369810552, 10);
  });
});

describe('intersectsEllipseCircle - Euclidean 최근접 거리', () => {
  test('최근접 거리 1.9640보다 큰 반지름 2 circle은 교차한다', () => {
    // 정규화 공간 투영점까지 거리는 2.163이라 이전에는 false였다
    const ellipse = makeEllipse(0, 0, 2, 1);
    expect(intersectsEllipseCircle(ellipse, { center: { x: 3, y: 2 }, radius: 2 })).toBe(true);
  });

  test('최근접 거리 1.9640보다 작은 반지름 1.95 circle은 교차하지 않는다', () => {
    const ellipse = makeEllipse(0, 0, 2, 1);
    expect(intersectsEllipseCircle(ellipse, { center: { x: 3, y: 2 }, radius: 1.95 })).toBe(false);
  });
});
