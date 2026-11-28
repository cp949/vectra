/**
 * bbox로 선분 쌍을 거른 polyline 교차 결과를 기존 전수 비교와 대조한다.
 * 교점 좌표의 부호 있는 0, 반환 순서, output 배열 alias를 함께 확인한다.
 */

import { describe, expect, it } from 'vitest';
import { polylinePolylineIntersections, polylinePolylineIntersectionsInto } from '../../../src/intersects';
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';
import { readX, readY } from '../../../src/internal/xy';
import type { Polyline, PointWritable } from '../../../src/types/flat-shapes.internal';
import {
  hasNearbyPoint,
  hasNonFinitePolylinePoint,
  snapshotPolylinePoints,
} from '../../../src/intersects/polyline-intersections.internal';
import { segmentSegmentDetailXY } from '../../../src/intersects/segment-segment-detail.internal';

interface LocalHit {
  x: number;
  y: number;
  tA: number;
}

/** bbox 거절 전 구현을 고정해 좌표와 순서의 기준으로 쓴다. */
function referenceIntersectionsInto(
  outPoints: PointWritable[],
  subject: Polyline,
  target: Polyline,
  epsilon?: number
): PointWritable[] {
  const subPts = snapshotPolylinePoints(subject);
  const tgtPts = snapshotPolylinePoints(target);
  outPoints.length = 0;
  if (subPts.length < 2 || tgtPts.length < 2) return outPoints;
  if (hasNonFinitePolylinePoint(subPts) || hasNonFinitePolylinePoint(tgtPts)) return outPoints;

  const distEpsilon = epsilon ?? DEFAULT_EPSILON;
  const epsSq = distEpsilon * distEpsilon;
  for (let i = 0; i < subPts.length - 1; i++) {
    const ax0 = readX(subPts[i]);
    const ay0 = readY(subPts[i]);
    const ax1 = readX(subPts[i + 1]);
    const ay1 = readY(subPts[i + 1]);
    // zero-length subject segment는 point relation으로 환원하지 않고 건너뛴다.
    if (ax0 === ax1 && ay0 === ay1) continue;

    const local: LocalHit[] = [];
    for (let j = 0; j < tgtPts.length - 1; j++) {
      const bx0 = readX(tgtPts[j]);
      const by0 = readY(tgtPts[j]);
      const bx1 = readX(tgtPts[j + 1]);
      const by1 = readY(tgtPts[j + 1]);
      // zero-length target segment도 동일하게 건너뛴다.
      if (bx0 === bx1 && by0 === by1) continue;

      const detail = segmentSegmentDetailXY(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon);
      if (detail.kind === 'point') {
        local.push({ x: detail.point.x, y: detail.point.y, tA: detail.tA });
      } else if (detail.kind === 'overlap') {
        local.push({ x: detail.start.x, y: detail.start.y, tA: detail.tA[0] });
        local.push({ x: detail.end.x, y: detail.end.y, tA: detail.tA[1] });
      }
    }

    // 같은 subject segment 안에서는 segment-local parameter tA 오름차순으로 정렬한다.
    // 동률 tA(같은 좌표)는 stable sort로 target segment index 순서를 유지하고 dedupe로 1점만 남는다.
    local.sort((p, q) => p.tA - q.tA);
    for (let k = 0; k < local.length; k++) {
      if (!hasNearbyPoint(outPoints, local[k].x, local[k].y, epsSq)) {
        outPoints.push({ x: local[k].x, y: local[k].y });
      }
    }
  }

  return outPoints;
}

const EPSILONS = [undefined, 0, -0, -1e-9, 1e-12, 1e-9, 1e-4, 0.5, 1e12, 1e300, NaN, Infinity, -Infinity];

/** 값의 부호와 배열 순서를 유지했는지 검사하고, 실패하면 입력을 표시한다. */
function expectSame(actual: PointWritable[], expected: PointWritable[], context: string): void {
  if (
    actual.length !== expected.length ||
    actual.some((point, i) => !Object.is(point.x, expected[i].x) || !Object.is(point.y, expected[i].y))
  ) {
    expect({ context, points: actual }).toStrictEqual({ context, points: expected });
  }
}

/** 두 공개 함수의 기본 epsilon 차이까지 포함해 기준 구현과 비교한다. */
function checkPair(subject: Polyline, target: Polyline, epsilon: number | undefined, context: string): void {
  const out = [{ x: NaN, y: NaN }];
  const actual = polylinePolylineIntersectionsInto(out, subject, target, epsilon);
  if (actual !== out) throw new Error(context);
  expectSame(actual, referenceIntersectionsInto([], subject, target, epsilon), context);
  expectSame(
    polylinePolylineIntersections(subject, target, epsilon),
    referenceIntersectionsInto([], subject, target, epsilon ?? DEFAULT_EPSILON),
    context
  );
}

/** 기준 데이터의 좌표 쌍을 점 배열로 바꾼다. */
function makePolyline(points: readonly (readonly [number, number])[]): Polyline {
  return points.map(([x, y]) => ({ x, y }));
}

describe('polyline 교차 bbox 거절의 비트 단위 동등성', () => {
  it('bbox가 떨어진 공선 보정과 epsilon 경계의 교점을 보존한다', () => {
    const nearSubject = [
      [0, 0],
      [10, 10],
    ] as const;
    const nearTarget = [
      [0.1, -0.5],
      [0.2, -0.4],
    ] as const;
    const mappedSubject = [
      [0, 0],
      [1e-5, 1e-5],
    ] as const;
    const mappedTarget = [
      [-0.1, -0.1],
      [0.1, -0.1],
    ] as const;
    expect(referenceIntersectionsInto([], makePolyline(nearSubject), makePolyline(nearTarget), 0.5)).toHaveLength(1);
    expect(referenceIntersectionsInto([], makePolyline(mappedSubject), makePolyline(mappedTarget), 3e-6)).toHaveLength(
      2
    );

    checkPair(makePolyline(nearSubject), makePolyline(nearTarget), 0.5, '공선 거리');
    checkPair(makePolyline(mappedSubject), makePolyline(mappedTarget), 3e-6, '투영 구간');
  });

  it('같은 매개변수의 교점은 대상 선분 순서대로 중복을 제거한다', () => {
    const subject = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ] as const;
    const target = [
      { x: 2, y: 0.25 },
      { x: 4, y: 0.25 },
      { x: 20, y: 20 },
      { x: 2, y: -0.25 },
      { x: 4, y: -0.25 },
    ] as const;
    const expected = referenceIntersectionsInto([], subject, target, 0.5);
    expect(expected[0]).toStrictEqual({ x: 2, y: 0.25 });
    checkPair(subject, target, 0.5, '동률');
  });

  it('끝점 접촉, 공선 겹침, 퇴화 입력과 극단값에서 기존 결과를 보존한다', () => {
    const fixtures: readonly (readonly [Polyline, Polyline])[] = [
      [
        [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
        ],
        [
          { x: 3, y: 0 },
          { x: 4, y: 2 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
        ],
        [
          { x: 2, y: 0 },
          { x: 4, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
        ],
        [
          { x: 4, y: 0 },
          { x: 5, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
        ],
        [
          { x: 1, y: 8e-10 },
          { x: 2, y: 8e-10 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 3, y: 0 },
        ],
        [
          { x: 0, y: -0 },
          { x: 0, y: -0 },
          { x: 0, y: 2 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 4 },
        ],
        [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 4, y: 4 },
        ],
        [
          { x: 0, y: 4 },
          { x: 4, y: 0 },
          { x: 4, y: 2 },
          { x: 0, y: 2 },
        ],
      ],
      [
        [
          { x: 1e9, y: 1e9 },
          { x: 1e9 + 2, y: 1e9 },
        ],
        [
          { x: 1e9 + 1, y: 1e9 + 2e-7 },
          { x: 1e9 + 2, y: 1e9 + 2e-7 },
        ],
      ],
      [
        [
          { x: -1e300, y: -1e300 },
          { x: 1e300, y: 1e300 },
        ],
        [
          { x: -1e300, y: 1e300 },
          { x: 1e300, y: -1e300 },
        ],
      ],
      [
        [
          { x: -1e308, y: 0 },
          { x: 1e308, y: 0 },
        ],
        [
          { x: 0, y: -1e308 },
          { x: 0, y: 1e308 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 1e-300, y: 1e-300 },
        ],
        [
          { x: 0, y: 1e-300 },
          { x: 1e-300, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: Number.MIN_VALUE, y: Number.MIN_VALUE },
        ],
        [
          { x: 0, y: Number.MIN_VALUE },
          { x: Number.MIN_VALUE, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 2, y: 2 },
          { x: NaN, y: 0 },
        ],
        [
          { x: 0, y: 2 },
          { x: 2, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 2, y: 2 },
        ],
        [
          { x: 0, y: 2 },
          { x: 2, y: 0 },
          { x: 0, y: Infinity },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 2, y: -Infinity },
        ],
        [
          { x: 0, y: 2 },
          { x: 2, y: 0 },
        ],
      ],
      [
        [],
        [
          { x: 0, y: 2 },
          { x: 2, y: 0 },
        ],
      ],
      [
        [
          { x: 0, y: 0 },
          { x: 2, y: 2 },
        ],
        [{ x: 0, y: 0 }],
      ],
    ];

    for (const [i, [subject, target]] of fixtures.entries()) {
      for (const epsilon of EPSILONS) {
        checkPair(subject, target, epsilon, `경계 ${i}, epsilon=${epsilon}`);
        checkPair(target, subject, epsilon, `경계 역순 ${i}, epsilon=${epsilon}`);
      }
    }
  });

  it('출력 배열이 두 입력 중 하나와 같아도 교점을 보존한다', () => {
    for (const aliasTarget of [false, true]) {
      const subject = [
        { x: 0, y: 0 },
        { x: 2, y: 2 },
      ];
      const target = [
        { x: 0, y: 2 },
        { x: 2, y: 0 },
      ];
      const expected = referenceIntersectionsInto([], subject, target);
      const out = aliasTarget ? target : subject;
      expect(polylinePolylineIntersectionsInto(out, subject, target)).toBe(out);
      expectSame(out, expected, '입출력 배열 공유');
    }
  });

  it('고정 시드로 생성한 열린 polyline 7200쌍에서 기존 결과를 보존한다', () => {
    let seed = 0xf7a2c1ab;
    /** 실패한 반복을 같은 입력으로 다시 실행할 수 있도록 난수열을 고정한다. */
    const random = (): number => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    for (let i = 0; i < 7200; i++) {
      const scale = [1, 1, 1, 1e-8, 1e8, 1e-150, 1e150, 1e300][i % 8];
      const offset = i % 5 === 0 ? 1e9 : 0;
      const mode = i % 6;
      const maxPoints = i % 17 === 0 ? 47 : 12;
      const points = [0, 1].map((side) => {
        const length = 2 + Math.floor(random() * maxPoints);
        const result: [number, number][] = [];
        for (let j = 0; j < length; j++) {
          const x = mode === 0 ? j : (random() - 0.5) * 16;
          const y =
            mode === 0
              ? side * 8e-10
              : mode === 1
                ? side * 30 + random()
                : mode === 2
                  ? x + side * 1e-10
                  : (random() - 0.5) * 16;
          result.push(j > 0 && random() < 0.14 ? result[j - 1] : [x * scale + offset, y * scale - offset]);
        }
        return makePolyline(result);
      });
      const epsilon = i % 4 === 0 ? undefined : EPSILONS[Math.floor(random() * EPSILONS.length)];
      checkPair(points[0], points[1], epsilon, `시드 0xf7a2c1ab, 반복 ${i}, epsilon=${epsilon}`);
    }
  });
});
