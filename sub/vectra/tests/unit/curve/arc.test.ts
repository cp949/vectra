import { describe, expect, it } from 'vitest';
import { arcBounds } from '../../../src/curve/arc-bounds';
import { arcBoundsInto } from '../../../src/curve/arc-bounds-into';
import { arcFlattenInto } from '../../../src/curve/arc-flatten-into';
import { arcLength } from '../../../src/curve/arc-length';
import { arcPointAtT } from '../../../src/curve/arc-point-at-t';
import { arcPointAtTInto } from '../../../src/curve/arc-point-at-t-into';
import { arcTangentAtInto } from '../../../src/curve/arc-tangent-at-into';
import { centerArcToEndpointInto } from '../../../src/curve/center-arc-to-endpoint-into';
import { correctEndpointArcRadiiInto } from '../../../src/curve/correct-endpoint-arc-radii-into';
import { endpointArcToCenterInto } from '../../../src/curve/endpoint-arc-to-center-into';
import {
  EPS,
  expectAbsNearZero,
  expectBoundsNear,
  expectNear,
  expectPointNear,
  LOOSE_EPS,
  makeArc,
  makeBoundsOut,
  makeCenterArc,
  makeCenterOut,
  makeEndpointOut,
  makePointOut,
  type PointOut,
  polylineLength,
  relErr,
} from './arc-test-helpers';

describe('correctEndpointArcRadiiInto', () => {
  it('correction이 필요 없으면 원본 rx/ry를 그대로 반환한다', () => {
    const out = { rx: 0, ry: 0 };
    correctEndpointArcRadiiInto(out, { x: 0, y: 0 }, makeArc({ rx: 1, ry: 1, x: 1, y: 0 }));
    expect(out).toEqual({ rx: 1, ry: 1 });
  });

  it('endpoint 거리가 표현 가능 범위를 넘으면 rx/ry를 동일 비율로 확대한다', () => {
    const out = { rx: 0, ry: 0 };
    correctEndpointArcRadiiInto(out, { x: 0, y: 0 }, makeArc({ rx: 1, ry: 1, x: 10, y: 0 }));
    expectNear(out.rx, 5);
    expectNear(out.ry, 5);
  });

  it('rx 또는 ry가 0이면 그대로 둔다 (degenerate)', () => {
    const out = { rx: 0, ry: 0 };
    correctEndpointArcRadiiInto(out, { x: 0, y: 0 }, makeArc({ rx: 0, ry: 1, x: 5, y: 0 }));
    expect(out).toEqual({ rx: 0, ry: 1 });
  });

  it('xRotation이 있는 ellipse도 올바르게 확대한다', () => {
    const out = { rx: 0, ry: 0 };
    correctEndpointArcRadiiInto(out, { x: 0, y: 0 }, makeArc({ rx: 1, ry: 1, xRotation: Math.PI / 2, x: 10, y: 0 }));
    expectNear(out.rx, 5);
    expectNear(out.ry, 5);
  });

  it('out을 반환한다', () => {
    const out = { rx: 0, ry: 0 };
    expect(correctEndpointArcRadiiInto(out, { x: 0, y: 0 }, makeArc())).toBe(out);
  });
});

describe('endpointArcToCenterInto', () => {
  it('unit 원 quarter arc (largeArc=false, sweep=false): center는 두 endpoint에서 반지름 거리다', () => {
    const out = makeCenterOut();
    endpointArcToCenterInto(out, { x: 1, y: 1 }, makeArc({ rx: 1, ry: 1, sweep: false, largeArc: false, x: 0, y: 0 }));
    expectNear(out.rx, 1);
    expectNear(out.ry, 1);
    expectAbsNearZero(Math.hypot(out.cx - 1, out.cy - 1) - 1);
    expectAbsNearZero(Math.hypot(out.cx, out.cy) - 1);
  });

  it('unit 원 quarter arc 4가지 flag 조합에서 중심이 endpoint로부터 r 거리에 있다', () => {
    for (const c of [
      { largeArc: false, sweep: false },
      { largeArc: false, sweep: true },
      { largeArc: true, sweep: false },
      { largeArc: true, sweep: true },
    ]) {
      const out = makeCenterOut();
      endpointArcToCenterInto(out, { x: 1, y: 0 }, makeArc({ rx: 1, ry: 1, ...c, x: 0, y: 1 }));
      expectAbsNearZero(Math.hypot(out.cx - 1, out.cy) - 1);
      expectAbsNearZero(Math.hypot(out.cx, out.cy - 1) - 1);
    }
  });

  it('largeArc=false, sweep=true 호는 sweep 각도의 절댓값이 <= π이고 endAngle >= startAngle이다', () => {
    const out = makeCenterOut();
    endpointArcToCenterInto(out, { x: 1, y: 0 }, makeArc({ rx: 1, ry: 1, largeArc: false, sweep: true, x: 0, y: 1 }));
    expect(out.sweep).toBe(true);
    expect(out.endAngle).toBeGreaterThan(out.startAngle);
    expect(out.endAngle - out.startAngle).toBeLessThanOrEqual(Math.PI + EPS);
  });

  it('largeArc=true 호는 sweep 각도의 절댓값이 >= π이다', () => {
    const out = makeCenterOut();
    endpointArcToCenterInto(out, { x: 1, y: 0 }, makeArc({ rx: 1, ry: 1, largeArc: true, sweep: true, x: 0, y: 1 }));
    expect(Math.abs(out.endAngle - out.startAngle)).toBeGreaterThanOrEqual(Math.PI - EPS);
  });

  it('from == arc endpoint인 경우 zero-length center form을 반환한다 (NaN 없음)', () => {
    const out = makeCenterOut();
    endpointArcToCenterInto(out, { x: 2, y: 3 }, makeArc({ rx: 1, ry: 1, x: 2, y: 3 }));
    expect(Number.isFinite(out.cx)).toBe(true);
    expect(Number.isFinite(out.cy)).toBe(true);
    expect(Number.isFinite(out.startAngle)).toBe(true);
    expect(Number.isFinite(out.endAngle)).toBe(true);
    expect(out.startAngle).toBe(out.endAngle);
  });

  it('radius 부족 시 자동으로 rx/ry를 확대한다 (lambda 보정)', () => {
    const out = makeCenterOut();
    endpointArcToCenterInto(out, { x: 0, y: 0 }, makeArc({ rx: 1, ry: 1, x: 10, y: 0 }));
    expectNear(out.rx, 5);
    expectNear(out.ry, 5);
    expectNear(out.cx, 5);
    expectAbsNearZero(out.cy);
  });

  it('out을 반환한다', () => {
    const out = makeCenterOut();
    expect(endpointArcToCenterInto(out, { x: 1, y: 0 }, makeArc({ x: 0, y: 1 }))).toBe(out);
  });
});

describe('centerArcToEndpointInto', () => {
  it('center form에서 endAngle 위치의 좌표를 endpoint x/y와 같이 기록한다', () => {
    const out = makeEndpointOut();
    centerArcToEndpointInto(out, makeCenterArc());
    expectAbsNearZero(out.x);
    expectNear(out.y, 1);
    expect(out.largeArc).toBe(false);
    expect(out.sweep).toBe(true);
    expectNear(out.rx, 1);
  });

  it('largeArc>=π는 true로 기록한다', () => {
    const out = makeEndpointOut();
    centerArcToEndpointInto(out, makeCenterArc({ endAngle: Math.PI * 1.5 }));
    expect(out.largeArc).toBe(true);
  });

  it('out을 반환한다', () => {
    const out = makeEndpointOut();
    expect(centerArcToEndpointInto(out, makeCenterArc())).toBe(out);
  });
});

describe('arcPointAtTInto', () => {
  const unitCircle = makeCenterArc();

  it.each([
    [0, { x: 1, y: 0 }],
    [1, { x: 0, y: 1 }],
    [0.5, { x: Math.SQRT1_2, y: Math.SQRT1_2 }],
  ])('t=%s에서 expected point를 반환한다', (t, expected) => {
    const out = makePointOut();
    arcPointAtTInto(out, unitCircle, t);
    expectPointNear(out, expected);
  });

  it('center가 이동된 ellipse에서도 정확하다', () => {
    const ellipse = makeCenterArc({ cx: 10, cy: 5, rx: 2, ry: 3, endAngle: Math.PI });
    const out = makePointOut();
    arcPointAtTInto(out, ellipse, 0);
    expectPointNear(out, { x: 12, y: 5 });
    arcPointAtTInto(out, ellipse, 0.5);
    expectPointNear(out, { x: 10, y: 8 });
  });

  it('xRotation이 적용된다', () => {
    const out = makePointOut();
    arcPointAtTInto(out, makeCenterArc({ xRotation: Math.PI / 2 }), 0);
    expectAbsNearZero(out.x);
    expectNear(out.y, 1);
  });

  it('rx=0인 degenerate arc는 center를 반환한다', () => {
    const out = makePointOut();
    arcPointAtTInto(out, makeCenterArc({ cx: 3, cy: 4, rx: 0, endAngle: Math.PI }), 0.5);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  it('out을 반환한다', () => {
    const out = makePointOut();
    expect(arcPointAtTInto(out, unitCircle, 0.5)).toBe(out);
  });
});

describe('arcPointAtT', () => {
  const unitCircle = makeCenterArc();

  it('arcPointAtTInto와 같은 좌표를 새 object로 반환한다', () => {
    const expected = arcPointAtTInto(makePointOut(), unitCircle, 0.5);
    const result = arcPointAtT(unitCircle, 0.5);
    expect(result).toEqual(expected);
  });

  it('rx=0인 degenerate arc는 center 좌표를 반환한다', () => {
    const result = arcPointAtT(makeCenterArc({ cx: 3, cy: 4, rx: 0, endAngle: Math.PI }), 0.5);
    expect(result).toEqual({ x: 3, y: 4 });
  });

  it('호출마다 fresh plain object를 반환한다', () => {
    const a = arcPointAtT(unitCircle, 0.5);
    const b = arcPointAtT(unitCircle, 0.5);
    expect(a).not.toBe(b);
    expect(Array.isArray(a)).toBe(false);
  });
});

describe('arcTangentAtInto', () => {
  const unitCircle = makeCenterArc();

  it('unit tangent의 길이가 1에 근사한다', () => {
    const out = makePointOut();
    arcTangentAtInto(out, unitCircle, 0.5);
    expectNear(Math.hypot(out.x, out.y), 1);
  });

  it('sweep=true(시계 방향, 각도 증가)일 때 t=0에서 +y 방향이다', () => {
    const out = makePointOut();
    arcTangentAtInto(out, unitCircle, 0);
    expectAbsNearZero(out.x);
    expectNear(out.y, 1);
  });

  it('sweep=false(반시계 방향, 각도 감소)일 때 t=0에서 -y 방향이다', () => {
    const out = makePointOut();
    arcTangentAtInto(out, makeCenterArc({ endAngle: -Math.PI / 2, sweep: false }), 0);
    expectAbsNearZero(out.x);
    expectNear(out.y, -1);
  });

  it('degenerate (rx=0)에서 zero vector를 반환한다', () => {
    const out = { x: 1, y: 1 };
    arcTangentAtInto(out, makeCenterArc({ rx: 0, endAngle: Math.PI }), 0.5);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  it('out을 반환한다', () => {
    const out = makePointOut();
    expect(arcTangentAtInto(out, unitCircle, 0.5)).toBe(out);
  });
});

describe('arcBoundsInto', () => {
  it('full quarter arc(unit 원, 1사분면)의 bounds = [(0,0), (1,1)]', () => {
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc());
    expectBoundsNear(out, { x: 0, y: 0 }, { x: 1, y: 1 });
  });

  it('extrema가 sweep 범위 안에 있으면 bounds에 포함한다 (반원: x=±1, y=0~1)', () => {
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc({ endAngle: Math.PI }));
    expectBoundsNear(out, { x: -1, y: 0 }, { x: 1, y: 1 });
  });

  it('extrema가 sweep 범위 밖이면 endpoint만으로 bounds 결정', () => {
    const a = Math.PI / 6;
    const b = Math.PI / 3;
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc({ startAngle: a, endAngle: b }));
    expectBoundsNear(
      out,
      { x: Math.min(Math.cos(a), Math.cos(b)), y: Math.min(Math.sin(a), Math.sin(b)) },
      { x: Math.max(Math.cos(a), Math.cos(b)), y: Math.max(Math.sin(a), Math.sin(b)) }
    );
  });

  it('degenerate (rx=0, ry=0) 시 점 bounds를 반환한다', () => {
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc({ cx: 3, cy: 4, rx: 0, ry: 0, endAngle: Math.PI }));
    expectBoundsNear(out, { x: 3, y: 4 }, { x: 3, y: 4 });
  });

  it('sweep=false(역방향) quarter arc의 bounds가 올바르다', () => {
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc({ startAngle: Math.PI / 2, endAngle: 0, sweep: false }));
    expectBoundsNear(out, { x: 0, y: 0 }, { x: 1, y: 1 });
  });

  it('sweep=false 반원의 bounds가 y extremum을 올바르게 포함한다', () => {
    const out = makeBoundsOut();
    arcBoundsInto(out, makeCenterArc({ startAngle: Math.PI, endAngle: 0, sweep: false }));
    expectBoundsNear(out, { x: -1, y: 0 }, { x: 1, y: 1 });
  });

  it('out을 반환한다', () => {
    const out = makeBoundsOut();
    expect(arcBoundsInto(out, makeCenterArc())).toBe(out);
  });
});

describe('arcBounds', () => {
  it('반원 arc에서 arcBoundsInto와 같은 bounds를 새 object로 반환한다', () => {
    const arc = makeCenterArc({ endAngle: Math.PI });
    const expected = arcBoundsInto(makeBoundsOut(), arc);
    const result = arcBounds(arc);
    expect(result).toEqual(expected);
  });

  it('sweep=false 역방향 arc도 arcBoundsInto와 일치한다', () => {
    const arc = makeCenterArc({ startAngle: Math.PI, endAngle: 0, sweep: false });
    const expected = arcBoundsInto(makeBoundsOut(), arc);
    const result = arcBounds(arc);
    expect(result).toEqual(expected);
  });

  it('degenerate(rx=0, ry=0) arc는 점 bounds를 반환한다', () => {
    const result = arcBounds(makeCenterArc({ cx: 3, cy: 4, rx: 0, ry: 0, endAngle: Math.PI }));
    expectBoundsNear(result, { x: 3, y: 4 }, { x: 3, y: 4 });
  });

  it('fresh top-level bounds와 fresh min/max point object를 반환한다', () => {
    const a = arcBounds(makeCenterArc());
    const b = arcBounds(makeCenterArc());
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(a.max);
    expect(a.min).not.toBe(b.min);
    expect(a.max).not.toBe(b.max);
  });
});

describe('arcFlattenInto', () => {
  it('quarter arc를 flatten한 polyline의 시작/끝이 일치한다', () => {
    const out: PointOut[] = [];
    arcFlattenInto(out, makeCenterArc());
    expect(out.length).toBeGreaterThanOrEqual(2);
    expectPointNear(out[0], { x: 1, y: 0 }, LOOSE_EPS);
    expectPointNear(out[out.length - 1], { x: 0, y: 1 }, LOOSE_EPS);
  });

  it('flatness가 작을수록 point 수가 증가한다', () => {
    const arc = makeCenterArc({ rx: 10, ry: 10, endAngle: Math.PI });
    const coarse: PointOut[] = [];
    const fine: PointOut[] = [];
    arcFlattenInto(coarse, arc, { flatness: 2.0 });
    arcFlattenInto(fine, arc, { flatness: 0.1 });
    expect(fine.length).toBeGreaterThanOrEqual(coarse.length);
  });

  it('polyline 길이가 실제 arc 길이에 수렴한다', () => {
    const arc = makeCenterArc({ rx: 5, ry: 5 });
    const out: PointOut[] = [];
    arcFlattenInto(out, arc, { flatness: 0.01 });
    const expected = (Math.PI * 5) / 2;
    expect(Math.abs(polylineLength(out) - expected) / expected).toBeLessThan(1e-3);
  });

  it('기존 내용을 clear 후 push한다', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    arcFlattenInto(out, makeCenterArc());
    expect(out[0]).not.toBe(sentinel);
  });

  it('degenerate (rx=0) 시 시작/끝이 모두 center에 있는 polyline을 반환한다', () => {
    const out: PointOut[] = [];
    arcFlattenInto(out, makeCenterArc({ cx: 3, cy: 4, rx: 0, ry: 0, endAngle: Math.PI }));
    for (const p of out) expect(p).toEqual({ x: 3, y: 4 });
  });

  it('sweep=false(역방향) arc를 flatten해도 점이 arc 위에 있다', () => {
    const out: PointOut[] = [];
    arcFlattenInto(out, makeCenterArc({ startAngle: Math.PI / 2, endAngle: 0, sweep: false }));
    expect(out.length).toBeGreaterThanOrEqual(2);
    expectPointNear(out[0], { x: 0, y: 1 }, LOOSE_EPS);
    expectPointNear(out[out.length - 1], { x: 1, y: 0 }, LOOSE_EPS);
    for (const p of out) expect(Math.abs(Math.hypot(p.x, p.y) - 1)).toBeLessThan(LOOSE_EPS);
  });

  it('out을 반환한다', () => {
    const out: PointOut[] = [];
    expect(arcFlattenInto(out, makeCenterArc())).toBe(out);
  });
});

describe('arcLength', () => {
  it.each([
    ['quarter circle (r=1)', makeCenterArc(), Math.PI / 2],
    ['half circle (r=5)', makeCenterArc({ rx: 5, ry: 5, endAngle: Math.PI }), 5 * Math.PI],
    ['full circle (r=2)', makeCenterArc({ rx: 2, ry: 2, endAngle: 2 * Math.PI }), 4 * Math.PI],
  ])('%s의 길이가 기대값에 근사한다', (_name, arc, expected) => {
    expect(relErr(arcLength(arc), expected)).toBeLessThan(1e-6);
  });

  it('zero-sweep arc의 길이가 0이다', () => {
    expect(arcLength(makeCenterArc({ startAngle: Math.PI / 4, endAngle: Math.PI / 4 }))).toBe(0);
  });

  it('segments 옵션을 변경해도 일관된 결과를 반환한다', () => {
    const arc = makeCenterArc({ rx: 3, ry: 5, endAngle: Math.PI });
    expect(relErr(arcLength(arc, { segments: 12 }), arcLength(arc, { segments: 24 }))).toBeLessThan(1e-4);
  });

  it('degenerate (rx=0, ry=0)의 길이가 0이다', () => {
    expect(arcLength(makeCenterArc({ rx: 0, ry: 0, endAngle: Math.PI }))).toBe(0);
  });
});

describe('arc round-trip: endpoint -> center -> endpoint', () => {
  it('endpoint form을 center로 변환 후 다시 endpoint로 돌리면 원본 좌표를 유지한다', () => {
    const from = { x: 1, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, largeArc: false, sweep: true, x: 0, y: 1 });
    const center = makeCenterOut();
    endpointArcToCenterInto(center, from, arc);

    const back = makeEndpointOut();
    centerArcToEndpointInto(back, center);
    expectNear(back.x, arc.x);
    expectNear(back.y, arc.y);
    expect(back.largeArc).toBe(arc.largeArc);
    expect(back.sweep).toBe(arc.sweep);
  });

  it('arcPointAtTInto(t=0)이 endpoint from과 일치한다', () => {
    const from = { x: 1, y: 0 };
    const arc = makeArc({ rx: 1, ry: 1, largeArc: false, sweep: true, x: 0, y: 1 });
    const center = makeCenterOut();
    const point = makePointOut();
    endpointArcToCenterInto(center, from, arc);

    arcPointAtTInto(point, center, 0);
    expectPointNear(point, from);
    arcPointAtTInto(point, center, 1);
    expectPointNear(point, { x: 0, y: arc.y });
  });
});
