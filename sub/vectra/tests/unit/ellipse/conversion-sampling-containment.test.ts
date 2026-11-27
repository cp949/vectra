/**
 * ellipse.fromCircle* / toCircle* / containsRect / points* — conversion·sampling·containment 계약 검증.
 *
 * 검증: circle↔ellipse 상호 변환, rect containment, angle-uniform sampling, invalid `segments` `RangeError`,
 * empty input, aliasing, non-finite (NaN/±Infinity) pass-through.
 */
import { describe, expect, it } from 'vitest';
import { createEllipse } from '../../../src/ellipse/create-ellipse';
import { containsRect } from '../../../src/ellipse/contains-rect';
import { fromCircle } from '../../../src/ellipse/from-circle';
import { fromCircleInto } from '../../../src/ellipse/from-circle-into';
import { points } from '../../../src/ellipse/points';
import { pointsInto } from '../../../src/ellipse/points-into';
import type { EllipsePointsOptions } from '../../../src/ellipse/points-into';
import { toCircle } from '../../../src/ellipse/to-circle';
import { toCircleInto } from '../../../src/ellipse/to-circle-into';
import type { CircleWritable } from '../../../src/types/flat-shapes.internal';

/** 원 변환 시험용 객체를 만든다. */
function makeCircle(cx = 0, cy = 0, r = 0): CircleWritable {
  return { cx: cx, cy: cy, r: r };
}

describe('fromCircleInto / fromCircle', () => {
  it('object circle을 ellipse로 기록하고 out을 반환한다', () => {
    const out = createEllipse();
    const result = fromCircleInto(out, { cx: 3, cy: 4, r: 5 });
    expect(result).toBe(out);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.rx).toBe(5);
    expect(out.ry).toBe(5);
  });

  it('원과 타원이 같은 객체를 사용해도 중심과 반지름을 보존한다', () => {
    const shared = { cx: 5, cy: 6, r: 3, rx: 0, ry: 0 };
    expect(fromCircleInto(shared, shared)).toBe(shared);
    expect(shared).toEqual({ cx: 5, cy: 6, r: 3, rx: 3, ry: 3 });
  });

  it('radius 0/음수/NaN/Infinity는 보정 없이 그대로 기록한다', () => {
    const zero = fromCircleInto(createEllipse(), { cx: 0, cy: 0, r: 0 });
    expect(zero.rx).toBe(0);
    expect(zero.ry).toBe(0);

    const neg = fromCircleInto(createEllipse(), { cx: 0, cy: 0, r: -2 });
    expect(neg.rx).toBe(-2);
    expect(neg.ry).toBe(-2);

    const nan = fromCircleInto(createEllipse(), { cx: 0, cy: 0, r: Number.NaN });
    expect(nan.rx).toBeNaN();
    expect(nan.ry).toBeNaN();

    const posInf = fromCircleInto(createEllipse(), { cx: 0, cy: 0, r: Number.POSITIVE_INFINITY });
    expect(posInf.rx).toBe(Number.POSITIVE_INFINITY);
    expect(posInf.ry).toBe(Number.POSITIVE_INFINITY);

    const negInf = fromCircleInto(createEllipse(), { cx: 0, cy: 0, r: Number.NEGATIVE_INFINITY });
    expect(negInf.rx).toBe(Number.NEGATIVE_INFINITY);
    expect(negInf.ry).toBe(Number.NEGATIVE_INFINITY);
  });

  it('fromCircle companion은 새 plain object를 반환한다', () => {
    const src = { cx: 3, cy: 4, r: 5 };
    const e = fromCircle(src);
    expect(e).toEqual({ cx: 3, cy: 4, rx: 5, ry: 5 });
    expect(e).not.toBe(src);
  });
});

describe('toCircleInto / toCircle', () => {
  it('rx === ry이면 circle을 기록하고 out을 반환한다', () => {
    const out = makeCircle();
    const result = toCircleInto(out, { cx: 3, cy: 4, rx: 5, ry: 5 });
    expect(result).toBe(out);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.r).toBe(5);
  });

  it('rx !== ry이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeCircle(99, 88, 77);
    const result = toCircleInto(out, { cx: 3, cy: 4, rx: 5, ry: 6 });
    expect(result).toBe(false);
    expect(out.cx).toBe(99);
    expect(out.cy).toBe(88);
    expect(out.r).toBe(77);
  });

  it('rx = ry = 0이어도 structural circle로 기록한다', () => {
    const out = makeCircle();
    toCircleInto(out, { cx: 1, cy: 2, rx: 0, ry: 0 });
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.r).toBe(0);
  });

  it('rx = ry = 같은 음수여도 structural circle로 기록한다', () => {
    const out = makeCircle();
    toCircleInto(out, { cx: 0, cy: 0, rx: -3, ry: -3 });
    expect(out.r).toBe(-3);
  });

  it('NaN radii는 실패하고 out을 수정하지 않는다', () => {
    const out = makeCircle(99, 88, 77);
    const result = toCircleInto(out, { cx: 0, cy: 0, rx: Number.NaN, ry: Number.NaN });
    expect(result).toBe(false);
    expect(out.r).toBe(77);
  });

  it('아주 작은 차이도 epsilon 없이 실패한다', () => {
    const out = makeCircle();
    // 5에서 next representable double은 5 + 4 * Number.EPSILON. 5 + Number.EPSILON은 5로 round되므로 실험 불가.
    const ry = 5 + 4 * Number.EPSILON;
    expect(ry).not.toBe(5);
    const result = toCircleInto(out, { cx: 0, cy: 0, rx: 5, ry: ry });
    expect(result).toBe(false);
  });

  it('입력과 출력이 같은 객체여도 안전하다', () => {
    const shared = { cx: 5, cy: 6, rx: 4, ry: 4, r: 0 };
    expect(toCircleInto(shared, shared)).toBe(shared);
    expect(shared).toEqual({ cx: 5, cy: 6, rx: 4, ry: 4, r: 4 });
  });

  it('toCircle companion은 성공 시 새 plain object를 반환한다', () => {
    const c = toCircle({ cx: 3, cy: 4, rx: 5, ry: 5 });
    expect(c).toEqual({ cx: 3, cy: 4, r: 5 });
  });

  it('toCircle companion은 실패 시 undefined를 반환한다', () => {
    expect(toCircle({ cx: 0, cy: 0, rx: 5, ry: 6 })).toBeUndefined();
    expect(toCircle({ cx: 0, cy: 0, rx: Number.NaN, ry: Number.NaN })).toBeUndefined();
  });
});

describe('containsRect', () => {
  it('네 corner가 모두 내부이면 true', () => {
    const e = { cx: 0, cy: 0, rx: 10, ry: 10 };
    // 1x1 rect at center
    expect(containsRect(e, { x: -0.5, y: -0.5, width: 1, height: 1 })).toBe(true);
  });

  it('boundary 위 corner도 포함되어 true', () => {
    const e = { cx: 0, cy: 0, rx: 10, ry: 10 };
    // corner (6, 8): 36/100 + 64/100 = 1 → boundary
    expect(containsRect(e, { x: -6, y: -8, width: 12, height: 16 })).toBe(true);
  });

  it('corner 하나가 밖이면 false', () => {
    const e = { cx: 0, cy: 0, rx: 5, ry: 5 };
    expect(containsRect(e, { x: -3, y: -3, width: 10, height: 10 })).toBe(false);
  });

  it('empty rect(width <= 0)는 true', () => {
    const e = { cx: 0, cy: 0, rx: 0, ry: 0 };
    expect(containsRect(e, { x: 100, y: 100, width: 0, height: 1 })).toBe(true);
    expect(containsRect(e, { x: 100, y: 100, width: -1, height: 1 })).toBe(true);
  });

  it('empty rect(height <= 0)는 true', () => {
    const e = { cx: 0, cy: 0, rx: 5, ry: 5 };
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: 0 })).toBe(true);
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: -1 })).toBe(true);
  });

  it('empty ellipse + non-empty rect는 false', () => {
    const e = { cx: 0, cy: 0, rx: 0, ry: 0 };
    expect(containsRect(e, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
    const e2 = { cx: 0, cy: 0, rx: 5, ry: 0 };
    expect(containsRect(e2, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
    const e3 = { cx: 0, cy: 0, rx: -1, ry: -1 };
    expect(containsRect(e3, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
  });

  it('비대칭 ellipse도 axis-aligned로 정확히 평가한다', () => {
    const e = { cx: 0, cy: 0, rx: 10, ry: 2 };
    // (5, 1): 25/100 + 1/4 = 0.5 ≤ 1
    expect(containsRect(e, { x: -5, y: -1, width: 10, height: 2 })).toBe(true);
    // (5, 1.9): 25/100 + 3.61/4 = 0.25 + 0.9025 > 1
    expect(containsRect(e, { x: -5, y: -1.9, width: 10, height: 3.8 })).toBe(false);
  });
});

describe('pointsInto / points', () => {
  it('기본값으로 64개 point를 생성한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 0, cy: 0, rx: 3, ry: 2 });
    expect(out).toHaveLength(64);
    // 첫 sample: angle = 0 → (cx + rx, cy)
    expect(out[0].x).toBeCloseTo(3, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
  });

  it('segments option을 따른다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 4, startAngle: 0, clockwise: true });
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
    pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 4, startAngle: Math.PI / 2, clockwise: true });
    expect(out[0].x).toBeCloseTo(0, 10);
    expect(out[0].y).toBeCloseTo(1, 10);
  });

  it('clockwise=false이면 반대 방향으로 진행한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 4, clockwise: false, startAngle: 0 });
    // angle 0, -π/2, -π, -3π/2
    expect(out[0].y).toBeCloseTo(0, 10);
    expect(out[1].y).toBeCloseTo(-1, 10);
    expect(out[2].y).toBeCloseTo(0, 10);
    expect(out[3].y).toBeCloseTo(1, 10);
  });

  it('empty ellipse는 각 sample을 center 좌표로 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 7, cy: 8, rx: 0, ry: 5 }, { segments: 3, startAngle: 0, clockwise: true });
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
      expect(() =>
        pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: seg, startAngle: 0, clockwise: true })
      ).toThrow(RangeError);
      expect(out).toEqual(preserved);
    }
  });

  it('옵션 객체에 segments가 없으면 기본값을 쓰지 않고 RangeError를 던진다', () => {
    const options = { startAngle: 0, clockwise: true } as EllipsePointsOptions;

    expect(() => pointsInto([], { cx: 0, cy: 0, rx: 1, ry: 1 }, options)).toThrow(RangeError);
  });

  it('NaN/+Infinity radius는 산술 결과를 그대로 기록한다', () => {
    // NaN은 `rx <= 0` false이므로 산술 분기로 흐른다
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 0, cy: 0, rx: Number.NaN, ry: 1 }, { segments: 4, startAngle: 0, clockwise: true });
    expect(out).toHaveLength(4);
    expect(out[0].x).toBeNaN();
    expect(out[0].y).toBe(0);

    // +Infinity도 `rx <= 0` false이므로 산술 분기로 흐른다
    const out2: { x: number; y: number }[] = [];
    pointsInto(
      out2,
      { cx: 0, cy: 0, rx: Number.POSITIVE_INFINITY, ry: 1 },
      { segments: 4, startAngle: 0, clockwise: true }
    );
    expect(out2[0].x).toBe(Number.POSITIVE_INFINITY);
    expect(out2[0].y).toBe(0);
  });

  it('-Infinity radius는 `rx <= 0` empty 분기로 가서 center를 기록한다', () => {
    // pointAtAngleInto와 동일한 정책: rx <= 0 검사가 산술보다 먼저다
    const out: { x: number; y: number }[] = [];
    pointsInto(
      out,
      { cx: 7, cy: 8, rx: Number.NEGATIVE_INFINITY, ry: 1 },
      { segments: 3, startAngle: 0, clockwise: true }
    );
    expect(out).toHaveLength(3);
    for (const p of out) {
      expect(p.x).toBe(7);
      expect(p.y).toBe(8);
    }
  });

  it('NaN startAngle은 모든 sample을 NaN으로 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 4, startAngle: Number.NaN, clockwise: true });
    for (const p of out) {
      expect(p.x).toBeNaN();
      expect(p.y).toBeNaN();
    }
  });

  it('Infinity startAngle은 NaN sample을 만든다 (Math.cos/sin(Infinity) = NaN)', () => {
    const out: { x: number; y: number }[] = [];
    pointsInto(
      out,
      { cx: 0, cy: 0, rx: 1, ry: 1 },
      { segments: 2, startAngle: Number.POSITIVE_INFINITY, clockwise: true }
    );
    for (const p of out) {
      expect(p.x).toBeNaN();
      expect(p.y).toBeNaN();
    }
  });

  it('재사용 시 out.length = 0으로 비운다', () => {
    const out: { x: number; y: number }[] = [{ x: 999, y: 999 }];
    pointsInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 3, startAngle: 0, clockwise: true });
    expect(out).toHaveLength(3);
    expect(out[0].x).toBeCloseTo(1, 10);
  });

  it('points companion은 새 배열을 반환한다', () => {
    const arr = points({ cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 4, startAngle: 0, clockwise: true });
    expect(arr).toHaveLength(4);
    expect(arr[0].x).toBeCloseTo(1, 10);
  });

  it('points companion도 invalid segments에서 RangeError를 던진다', () => {
    expect(() => points({ cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 0, startAngle: 0, clockwise: true })).toThrow(
      RangeError
    );
    expect(() => points({ cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: 0.5, startAngle: 0, clockwise: true })).toThrow(
      RangeError
    );
    expect(() =>
      points({ cx: 0, cy: 0, rx: 1, ry: 1 }, { segments: Number.NaN, startAngle: 0, clockwise: true })
    ).toThrow(RangeError);
  });
});
