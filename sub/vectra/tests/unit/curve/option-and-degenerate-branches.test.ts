/**
 * curve의 옵션 필드 해석과 퇴화 입력 분기 테스트.
 *
 * 검증 항목:
 *  1. 옵션 객체에서 필드를 지정하거나 생략하면 각각 지정값과 기본값을 쓴다.
 *  2. 반지름이 0이거나 sweep이 0인 arc는 퇴화 결과를 돌려준다.
 *  3. cubic·quadratic bounds는 tuple 모양의 min/max에도 기록한다.
 *
 * 설계 메모:
 *  - tuple min/max는 `BoundsWritable` 타입이 막는 모양이다. 타입을 검사하지 않는 JS 호출자를 위해
 *    `as never`로 우회해 런타임 동작을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { arcBoundsInto } from '../../../src/curve/arc-bounds-into';
import { arcClosestPointInto } from '../../../src/curve/arc-closest-point-into';
import { arcFlattenInto } from '../../../src/curve/arc-flatten-into';
import { arcMiddleInto } from '../../../src/curve/arc-middle-into';
import { arcNormalAtInto } from '../../../src/curve/arc-normal-at-into';
import { arcTangentAtInto } from '../../../src/curve/arc-tangent-at-into';
import { cardinalPolylineInto } from '../../../src/curve/cardinal-polyline-into';
import { catmullRomPolylineInto } from '../../../src/curve/catmull-rom-polyline-into';
import { cubicBoundsInto } from '../../../src/curve/cubic-bounds-into';
import { monotoneYPolylineInto } from '../../../src/curve/monotone-y-polyline-into';
import { quadraticBoundsInto } from '../../../src/curve/quadratic-bounds-into';
import type { CenterArcLike, XYObjectWritable } from '../../../src/types';

const PI = Math.PI;

/**
 * 테스트용 center arc를 만든다.
 * 필요한 필드만 덮어써서 쓴다.
 */
function arc(overrides: Partial<CenterArcLike> = {}): CenterArcLike {
  return { cx: 0, cy: 0, rx: 2, ry: 1, xRotation: 0, startAngle: 0, endAngle: PI / 2, sweep: true, ...overrides };
}

describe('arcBoundsInto', () => {
  test('끝점보다 바깥인 x 최솟값 극점을 sweep 안에서 찾는다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    arcBoundsInto(out, arc({ startAngle: 0, endAngle: 2 * PI }));
    expect(out.min.x).toBeCloseTo(-2, 12);
    expect(out.max.x).toBeCloseTo(2, 12);
  });

  test('끝점보다 바깥인 x 최댓값 극점을 sweep 안에서 찾는다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    arcBoundsInto(out, arc({ startAngle: -PI / 2, endAngle: PI / 2 }));
    expect(out.max.x).toBeCloseTo(2, 12);
    expect(out.min.x).toBeCloseTo(0, 12);
  });
});

describe('arcClosestPointInto 옵션', () => {
  // 반원 위 30° 방향 먼 점. 11개 sample(18° 간격) 사이에 있어 옵션이 결과를 바꾼다.
  const halfCircle = arc({ rx: 1, ry: 1, startAngle: 0, endAngle: PI });
  const query = { x: 3 * Math.cos(PI / 6), y: 3 * Math.sin(PI / 6) };

  /**
   * 옵션을 적용한 가장 가까운 점의 각도를 도 단위로 돌려준다.
   * 점 좌표 대신 각도로 비교하면 옵션별 수렴 정도가 한 숫자로 드러난다.
   */
  function closestAngleDeg(options?: Parameters<typeof arcClosestPointInto>[3]): number {
    const p = arcClosestPointInto({ x: 0, y: 0 }, halfCircle, query, options);
    return (Math.atan2(p.y, p.x) * 180) / PI;
  }

  test('옵션이 없으면 Newton 정제로 30°에 수렴한다', () => {
    expect(closestAngleDeg()).toBeCloseTo(30, 10);
  });

  test('유효한 maxIterations: 0은 정제 없이 가장 가까운 sample을 쓴다', () => {
    expect(closestAngleDeg({ maxIterations: 0 })).toBeCloseTo(36, 10);
  });

  test('유효한 tolerance가 크면 Newton을 한 번만 돌고 멈춘다', () => {
    const angle = closestAngleDeg({ tolerance: 1e9 });
    expect(angle).not.toBeCloseTo(30, 6);
    expect(angle).toBeCloseTo(30, 1);
  });

  test('유효한 sampleCount: 2는 양 끝 sample만 비교한다', () => {
    expect(closestAngleDeg({ sampleCount: 2, maxIterations: 0 })).toBeCloseTo(0, 10);
  });
});

describe('arc 퇴화 입력', () => {
  test('arcFlattenInto는 시작점과 끝점이 같은 전체 호도 두 점으로 평탄화하지 않고 처리한다', () => {
    // cy가 커서 sin(2π) 오차가 반올림으로 사라져 시작점과 끝점이 정확히 같다.
    const out: { x: number; y: number }[] = [];
    arcFlattenInto(out, arc({ rx: 1, ry: 1, cx: 0, cy: 1000, startAngle: 0, endAngle: 2 * PI }));
    expect(out.length).toBeGreaterThan(2);
    expect(out[0]).toEqual(out[out.length - 1]);
  });

  test('arcFlattenInto는 시작점과 끝점이 같아도 mid-arc가 flatness 이내면 두 점만 돌려준다', () => {
    const out: { x: number; y: number }[] = [];
    arcFlattenInto(out, arc({ rx: 0.1, ry: 0.1, cx: 0, cy: 1000, startAngle: 0, endAngle: 2 * PI }));
    expect(out).toHaveLength(2);
  });

  test('arcFlattenInto는 sweep이 0이면 같은 점 두 개를 돌려준다', () => {
    const out: { x: number; y: number }[] = [];
    arcFlattenInto(out, arc({ startAngle: 1, endAngle: 1 }));
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(out[1]);
  });

  test('arcFlattenInto는 flatness가 0이어도 sweep이 0이면 재귀하지 않는다', () => {
    const out: { x: number; y: number }[] = [];
    arcFlattenInto(out, arc({ startAngle: 1, endAngle: 1 }), { flatness: 0, maxRecursion: 10 });
    expect(out).toHaveLength(2);
  });

  test('arcMiddleInto는 반지름이 0이면 중심을 돌려준다', () => {
    expect(arcMiddleInto({ x: 9, y: 9 }, arc({ cx: 3, cy: 4, rx: 0, ry: 0 }))).toEqual({ x: 3, y: 4 });
  });

  test('arcMiddleInto는 한 축 반지름만 0이어도 중심을 돌려준다', () => {
    expect(arcMiddleInto({ x: 9, y: 9 }, arc({ cx: 3, cy: 4, rx: 0, ry: 1 }))).toEqual({ x: 3, y: 4 });
  });

  test('arcNormalAtInto는 sweep이 0이면 영벡터를 돌려준다', () => {
    expect(arcNormalAtInto({ x: 9, y: 9 }, arc({ startAngle: 1, endAngle: 1 }), 0.5)).toEqual({ x: 0, y: 0 });
  });

  test('arcTangentAtInto는 sweep이 0이면 영벡터를 돌려준다', () => {
    expect(arcTangentAtInto({ x: 9, y: 9 }, arc({ startAngle: 1, endAngle: 1 }), 0.5)).toEqual({ x: 0, y: 0 });
  });
});

describe('spline polyline 옵션 객체', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: 1 },
    { x: 4, y: 3 },
  ];

  test('cardinalPolylineInto는 빈 옵션 객체면 기본값을 쓴다', () => {
    const fromEmpty = cardinalPolylineInto([], points, {});
    const fromDefaults = cardinalPolylineInto([], points);
    expect(fromEmpty).toEqual(fromDefaults);
  });

  test('cardinalPolylineInto는 steps만 지정하면 나머지는 기본값을 쓴다', () => {
    const out = cardinalPolylineInto([], points, { steps: 4 });
    expect(out).toEqual(cardinalPolylineInto([], points, { steps: 4, tension: 0, closed: false }));
  });

  test('cardinalPolylineInto는 tension 옵션을 반영한다', () => {
    const withTension = cardinalPolylineInto([], points, { steps: 4, tension: 0.5 });
    expect(withTension).not.toEqual(cardinalPolylineInto([], points, { steps: 4 }));
  });

  test('cardinalPolylineInto는 closed 옵션을 반영한다', () => {
    const closed = cardinalPolylineInto([], points, { steps: 4, closed: true });
    expect(closed).toHaveLength(4);
    expect(closed).not.toEqual(cardinalPolylineInto([], points, { steps: 4 }));
  });

  test('catmullRomPolylineInto는 빈 옵션 객체면 기본값을 쓴다', () => {
    expect(catmullRomPolylineInto([], points, {})).toEqual(catmullRomPolylineInto([], points));
  });

  test('catmullRomPolylineInto는 alpha 옵션을 반영한다', () => {
    const withAlpha = catmullRomPolylineInto([], points, { steps: 4, alpha: 0 });
    expect(withAlpha).not.toEqual(catmullRomPolylineInto([], points, { steps: 4 }));
  });

  test('catmullRomPolylineInto는 closed 옵션을 반영한다', () => {
    const closed = catmullRomPolylineInto([], points, { steps: 4, closed: true });
    expect(closed).toHaveLength(4);
    expect(closed).not.toEqual(catmullRomPolylineInto([], points, { steps: 4 }));
  });

  test('catmullRomPolylineInto는 steps만 지정하면 alpha와 closed는 기본값을 쓴다', () => {
    const out = catmullRomPolylineInto([], points, { steps: 4 });
    expect(out).toEqual(catmullRomPolylineInto([], points, { steps: 4, alpha: 0.5, closed: false }));
  });

  test('monotoneYPolylineInto는 steps 옵션 객체와 숫자 인자가 같은 결과를 낸다', () => {
    const ys = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 3, y: 2 },
    ];
    expect(monotoneYPolylineInto([], ys, { steps: 5 })).toEqual(monotoneYPolylineInto([], ys, 5));
  });

  test('monotoneYPolylineInto는 두 점이면 직선 위의 점을 만든다', () => {
    // 접선이 0으로 잘못 잡히면 t=1/3 표본이 직선에서 벗어난다.
    const out: XYObjectWritable[] = [];
    monotoneYPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      4
    );
    expect(out).toHaveLength(4);
    for (const p of out) expect(p.x).toBeCloseTo(p.y, 12);
    expect(out[1].y).toBeCloseTo(1 / 3, 12);
  });

  test('monotoneYPolylineInto는 빈 옵션 객체면 기본 steps를 쓴다', () => {
    const ys = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(monotoneYPolylineInto([], ys, {})).toEqual(monotoneYPolylineInto([], ys));
    expect(monotoneYPolylineInto([], ys, {})).toHaveLength(16);
  });
});

describe('cubic·quadratic bounds', () => {
  test('cubicBoundsInto는 y 최솟값 극점이 끝점보다 낮으면 그 값을 쓴다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    cubicBoundsInto(out, { x: 0, y: 0 }, { x: 1, y: -3 }, { x: 2, y: -3 }, { x: 3, y: 0 });
    expect(out.min.y).toBeCloseTo(-2.25, 12);
    expect(out.max.y).toBe(0);
  });

  test('cubicBoundsInto는 tuple min/max에도 기록한다', () => {
    const out = { min: [9, 9], max: [9, 9] };
    cubicBoundsInto(out as never, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 0 });
    expect(out.min).toEqual([0, 0]);
    expect(out.max).toEqual([3, 1.5]);
  });

  test('quadraticBoundsInto는 tuple min/max에도 기록한다', () => {
    const out = { min: [9, 9], max: [9, 9] };
    quadraticBoundsInto(out as never, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 0 });
    expect(out.min).toEqual([0, 0]);
    expect(out.max).toEqual([2, 1]);
  });
});
