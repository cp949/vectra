/**
 * ellipse.fromCircle* / toCircle* / containsRect / points* — conversion·sampling·containment 계약 검증.
 *
 * 검증: circle↔ellipse 상호 변환, rect containment, angle-uniform sampling, invalid `segments` `RangeError`,
 * empty input, tuple input, aliasing, non-finite (NaN/±Infinity) pass-through.
 */
import { describe, expect, it } from 'vitest';
import { containsRect } from '../../../src/ellipse/contains-rect';
import { fromCircle } from '../../../src/ellipse/from-circle';
import { fromCircleInto } from '../../../src/ellipse/from-circle-into';
import { points } from '../../../src/ellipse/points';
import { pointsInto } from '../../../src/ellipse/points-into';
import { toCircle } from '../../../src/ellipse/to-circle';
import { toCircleInto } from '../../../src/ellipse/to-circle-into';
import type { CircleWritable, EllipseWritable, XYTupleWritable } from '../../../src/types';

function makeEllipse(cx = 0, cy = 0, rx = 0, ry = 0): EllipseWritable {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

function makeCircle(cx = 0, cy = 0, r = 0): CircleWritable {
  return { center: { x: cx, y: cy }, radius: r };
}

describe('fromCircleInto / fromCircle', () => {
  it('object circle을 ellipse로 기록하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = fromCircleInto(out, { center: { x: 3, y: 4 }, radius: 5 });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(5);
  });

  it('tuple circle을 ellipse로 기록한다', () => {
    const out = makeEllipse();
    fromCircleInto(out, [[1, 2], 7] as const);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(7);
    expect(out.radiusY).toBe(7);
  });

  it('mutable tuple center storage에 기록한다', () => {
    const center: XYTupleWritable = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    fromCircleInto(out, { center: { x: 9, y: 8 }, radius: 2 });
    expect(out.center[0]).toBe(9);
    expect(out.center[1]).toBe(8);
    expect(out.radiusX).toBe(2);
    expect(out.radiusY).toBe(2);
  });

  it('out.center가 circle.center와 같은 object여도 안전하다', () => {
    const shared = { x: 5, y: 6 };
    const out: EllipseWritable = { center: shared, radiusX: 0, radiusY: 0 };
    fromCircleInto(out, { center: shared, radius: 3 });
    expect(out.center).toBe(shared);
    expect(out.center.x).toBe(5);
    expect(out.center.y).toBe(6);
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(3);
  });

  it('radius 0/음수/NaN/Infinity는 보정 없이 그대로 기록한다', () => {
    const zero = fromCircleInto(makeEllipse(), { center: { x: 0, y: 0 }, radius: 0 });
    expect(zero.radiusX).toBe(0);
    expect(zero.radiusY).toBe(0);

    const neg = fromCircleInto(makeEllipse(), { center: { x: 0, y: 0 }, radius: -2 });
    expect(neg.radiusX).toBe(-2);
    expect(neg.radiusY).toBe(-2);

    const nan = fromCircleInto(makeEllipse(), { center: { x: 0, y: 0 }, radius: Number.NaN });
    expect(nan.radiusX).toBeNaN();
    expect(nan.radiusY).toBeNaN();

    const posInf = fromCircleInto(makeEllipse(), { center: { x: 0, y: 0 }, radius: Number.POSITIVE_INFINITY });
    expect(posInf.radiusX).toBe(Number.POSITIVE_INFINITY);
    expect(posInf.radiusY).toBe(Number.POSITIVE_INFINITY);

    const negInf = fromCircleInto(makeEllipse(), { center: { x: 0, y: 0 }, radius: Number.NEGATIVE_INFINITY });
    expect(negInf.radiusX).toBe(Number.NEGATIVE_INFINITY);
    expect(negInf.radiusY).toBe(Number.NEGATIVE_INFINITY);
  });

  it('fromCircle companion은 새 plain object를 반환한다', () => {
    const src = makeCircle(3, 4, 5);
    const e = fromCircle(src);
    expect(e).toEqual({ center: { x: 3, y: 4 }, radiusX: 5, radiusY: 5 });
    expect(e.center).not.toBe(src.center);
  });

  it('fromCircle은 tuple circle도 처리한다', () => {
    const e = fromCircle([[1, 2], 3] as const);
    expect(e).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 3 });
  });
});

describe('toCircleInto / toCircle', () => {
  it('radiusX === radiusY이면 circle을 기록하고 out을 반환한다', () => {
    const out = makeCircle();
    const result = toCircleInto(out, { center: { x: 3, y: 4 }, radiusX: 5, radiusY: 5 });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  it('radiusX !== radiusY이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeCircle(99, 88, 77);
    const result = toCircleInto(out, { center: { x: 3, y: 4 }, radiusX: 5, radiusY: 6 });
    expect(result).toBe(false);
    expect(out.center).toEqual({ x: 99, y: 88 });
    expect(out.radius).toBe(77);
  });

  it('radiusX = radiusY = 0이어도 structural circle로 기록한다', () => {
    const out = makeCircle();
    toCircleInto(out, { center: { x: 1, y: 2 }, radiusX: 0, radiusY: 0 });
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radius).toBe(0);
  });

  it('radiusX = radiusY = 같은 음수여도 structural circle로 기록한다', () => {
    const out = makeCircle();
    toCircleInto(out, { center: { x: 0, y: 0 }, radiusX: -3, radiusY: -3 });
    expect(out.radius).toBe(-3);
  });

  it('NaN radii는 실패하고 out을 수정하지 않는다', () => {
    const out = makeCircle(99, 88, 77);
    const result = toCircleInto(out, { center: { x: 0, y: 0 }, radiusX: Number.NaN, radiusY: Number.NaN });
    expect(result).toBe(false);
    expect(out.radius).toBe(77);
  });

  it('아주 작은 차이도 epsilon 없이 실패한다', () => {
    const out = makeCircle();
    // 5에서 next representable double은 5 + 4 * Number.EPSILON. 5 + Number.EPSILON은 5로 round되므로 실험 불가.
    const ry = 5 + 4 * Number.EPSILON;
    expect(ry).not.toBe(5);
    const result = toCircleInto(out, { center: { x: 0, y: 0 }, radiusX: 5, radiusY: ry });
    expect(result).toBe(false);
  });

  it('tuple ellipse input도 처리한다', () => {
    const out = makeCircle();
    toCircleInto(out, [[1, 2], 3, 3] as const);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radius).toBe(3);
  });

  it('out.center가 ellipse.center와 같은 object여도 안전하다', () => {
    const shared = { x: 5, y: 6 };
    const out: CircleWritable = { center: shared, radius: 0 };
    toCircleInto(out, { center: shared, radiusX: 4, radiusY: 4 });
    expect(out.center).toBe(shared);
    expect(out.center.x).toBe(5);
    expect(out.center.y).toBe(6);
    expect(out.radius).toBe(4);
  });

  it('toCircle companion은 성공 시 새 plain object를 반환한다', () => {
    const c = toCircle({ center: { x: 3, y: 4 }, radiusX: 5, radiusY: 5 });
    expect(c).toEqual({ center: { x: 3, y: 4 }, radius: 5 });
  });

  it('toCircle companion은 실패 시 undefined를 반환한다', () => {
    expect(toCircle({ center: { x: 0, y: 0 }, radiusX: 5, radiusY: 6 })).toBeUndefined();
    expect(toCircle({ center: { x: 0, y: 0 }, radiusX: Number.NaN, radiusY: Number.NaN })).toBeUndefined();
  });
});

describe('containsRect', () => {
  it('네 corner가 모두 내부이면 true', () => {
    const e = makeEllipse(0, 0, 10, 10);
    // 1x1 rect at center
    expect(containsRect(e, { x: -0.5, y: -0.5, width: 1, height: 1 })).toBe(true);
  });

  it('boundary 위 corner도 포함되어 true', () => {
    const e = makeEllipse(0, 0, 10, 10);
    // corner (6, 8): 36/100 + 64/100 = 1 → boundary
    expect(containsRect(e, { x: -6, y: -8, width: 12, height: 16 })).toBe(true);
  });

  it('corner 하나가 밖이면 false', () => {
    const e = makeEllipse(0, 0, 5, 5);
    expect(containsRect(e, { x: -3, y: -3, width: 10, height: 10 })).toBe(false);
  });

  it('empty rect(width <= 0)는 true', () => {
    const e = makeEllipse(0, 0, 0, 0);
    expect(containsRect(e, { x: 100, y: 100, width: 0, height: 1 })).toBe(true);
    expect(containsRect(e, { x: 100, y: 100, width: -1, height: 1 })).toBe(true);
  });

  it('empty rect(height <= 0)는 true', () => {
    const e = makeEllipse(0, 0, 5, 5);
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: 0 })).toBe(true);
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: -1 })).toBe(true);
  });

  it('empty ellipse + non-empty rect는 false', () => {
    const e = makeEllipse(0, 0, 0, 0);
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
    const e2 = makeEllipse(0, 0, 5, 0);
    expect(containsRect(e2, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
    const e3 = makeEllipse(0, 0, -1, -1);
    expect(containsRect(e3, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
  });

  it('tuple ellipse input과 tuple rect input을 처리한다', () => {
    const tupleEllipse: readonly [readonly [number, number], number, number] = [[0, 0], 10, 10];
    const tupleRect: readonly [number, number, number, number] = [-1, -1, 2, 2];
    expect(containsRect(tupleEllipse, tupleRect)).toBe(true);
  });

  it('비대칭 ellipse도 axis-aligned로 정확히 평가한다', () => {
    const e = makeEllipse(0, 0, 10, 2);
    // (5, 1): 25/100 + 1/4 = 0.5 ≤ 1
    expect(containsRect(e, { x: -5, y: -1, width: 10, height: 2 })).toBe(true);
    // (5, 1.9): 25/100 + 3.61/4 = 0.25 + 0.9025 > 1
    expect(containsRect(e, { x: -5, y: -1.9, width: 10, height: 3.8 })).toBe(false);
  });
});

describe('pointsInto / points', () => {
  it('기본값으로 64개 point를 생성한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 3, 2));
    expect(out).toHaveLength(64);
    // 첫 sample: angle = 0 → (cx + rx, cy)
    expect(out[0].x).toBeCloseTo(3, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
  });

  it('segments option을 따른다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 4 });
    expect(out).toHaveLength(4);
    expect(out[0].x).toBeCloseTo(1, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
    expect(out[1].x).toBeCloseTo(0, 10);
    expect(out[1].y).toBeCloseTo(1, 10);
    expect(out[2].x).toBeCloseTo(-1, 10);
    expect(out[2].y).toBeCloseTo(0, 10);
    expect(out[3].x).toBeCloseTo(0, 10);
    expect(out[3].y).toBeCloseTo(-1, 10);
  });

  it('startAngle을 따른다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 4, startAngle: Math.PI / 2 });
    expect(out[0].x).toBeCloseTo(0, 10);
    expect(out[0].y).toBeCloseTo(1, 10);
  });

  it('clockwise=false이면 반대 방향으로 진행한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 4, clockwise: false });
    // angle 0, -π/2, -π, -3π/2
    expect(out[0].y).toBeCloseTo(0, 10);
    expect(out[1].y).toBeCloseTo(-1, 10);
    expect(out[2].y).toBeCloseTo(0, 10);
    expect(out[3].y).toBeCloseTo(1, 10);
  });

  it('empty ellipse는 각 sample을 center 좌표로 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(7, 8, 0, 5), { segments: 3 });
    expect(out).toHaveLength(3);
    for (const p of out) {
      expect(p.x).toBe(7);
      expect(p.y).toBe(8);
    }
  });

  it('segments < 1, 0, 음수, non-integer, NaN, Infinity는 RangeError를 던지고 out을 보존한다', () => {
    const preserved = [{ x: 1, y: 1 }];
    const cases: number[] = [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    for (const seg of cases) {
      const out = preserved.slice();
      expect(() => pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: seg })).toThrow(RangeError);
      expect(out).toEqual(preserved);
    }
  });

  it('segments: undefined는 default 64를 적용한다 (nullish coalescing 정책)', () => {
    // `?? 64` 가 `|| 64` 로 회귀하면 segments=0이 64로 silently 바뀐다. 회귀 가드.
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: undefined });
    expect(out).toHaveLength(64);
  });

  it('NaN/+Infinity radius는 산술 결과를 그대로 기록한다', () => {
    // NaN은 `rx <= 0` false이므로 산술 분기로 흐른다
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, Number.NaN, 1), { segments: 4 });
    expect(out).toHaveLength(4);
    expect(out[0].x).toBeNaN();
    expect(out[0].y).toBe(0);

    // +Infinity도 `rx <= 0` false이므로 산술 분기로 흐른다
    const out2: { x: number; y: number }[] = [];
    pointsInto(out2, makeEllipse(0, 0, Number.POSITIVE_INFINITY, 1), { segments: 4 });
    expect(out2[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out2[0].y).toBe(0);
  });

  it('-Infinity radius는 `rx <= 0` empty 분기로 가서 center를 기록한다', () => {
    // pointAtAngleInto와 동일한 정책: rx <= 0 검사가 산술보다 먼저다
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(7, 8, Number.NEGATIVE_INFINITY, 1), { segments: 3 });
    expect(out).toHaveLength(3);
    for (const p of out) {
      expect(p.x).toBe(7);
      expect(p.y).toBe(8);
    }
  });

  it('NaN startAngle은 모든 sample을 NaN으로 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 4, startAngle: Number.NaN });
    for (const p of out) {
      expect(p.x).toBeNaN();
      expect(p.y).toBeNaN();
    }
  });

  it('Infinity startAngle은 NaN sample을 만든다 (Math.cos/sin(Infinity) = NaN)', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 2, startAngle: Number.POSITIVE_INFINITY });
    for (const p of out) {
      expect(p.x).toBeNaN();
      expect(p.y).toBeNaN();
    }
  });

  it('tuple ellipse input을 처리한다', () => {
    const tup: readonly [readonly [number, number], number, number] = [[1, 2], 3, 4];
    const out: { x: number; y: number }[] = [];
    pointsInto(out, tup, { segments: 4 });
    expect(out).toHaveLength(4);
    expect(out[0].x).toBeCloseTo(4, 10);
    expect(out[0].y).toBeCloseTo(2, 10);
  });

  it('재사용 시 out.length = 0으로 비운다', () => {
    const out: { x: number; y: number }[] = [{ x: 999, y: 999 }];
    pointsInto(out, makeEllipse(0, 0, 1, 1), { segments: 3 });
    expect(out).toHaveLength(3);
    expect(out[0].x).toBeCloseTo(1, 10);
  });

  it('points companion은 새 배열을 반환한다', () => {
    const arr = points(makeEllipse(0, 0, 1, 1), { segments: 4 });
    expect(arr).toHaveLength(4);
    expect(arr[0].x).toBeCloseTo(1, 10);
  });

  it('points companion도 invalid segments에서 RangeError를 던진다', () => {
    expect(() => points(makeEllipse(0, 0, 1, 1), { segments: 0 })).toThrow(RangeError);
    expect(() => points(makeEllipse(0, 0, 1, 1), { segments: 0.5 })).toThrow(RangeError);
    expect(() => points(makeEllipse(0, 0, 1, 1), { segments: Number.NaN })).toThrow(RangeError);
  });
});
