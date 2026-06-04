/**
 * ellipse.transform* / projectPoint* / containsCircle — axis-aligned transform·boundary projection·conservative containment 계약 검증.
 *
 * 검증: axis-aligned scale 성공, 90도 swap radii 교환, reflection 부호 전파, rotated/sheared matrix 실패와 out 보존,
 * outside/inside/center/empty point projection, epsilon 전달, bounding-square 기반 containment의 conservative behavior,
 * empty input, tuple input, aliasing, non-finite (NaN/±Infinity) pass-through.
 */
import { describe, expect, it } from 'vitest';
import { containsCircle } from '../../../src/ellipse/contains-circle';
import { projectPoint } from '../../../src/ellipse/project-point';
import { projectPointInto } from '../../../src/ellipse/project-point-into';
import { transform } from '../../../src/ellipse/transform';
import { transformInto } from '../../../src/ellipse/transform-into';
import type { EllipseWritable, XYTupleWritable } from '../../../src/types';

function makeEllipse(cx = 0, cy = 0, rx = 0, ry = 0): EllipseWritable {
  return { center: { x: cx, y: cy }, radiusX: rx, radiusY: ry };
}

describe('transformInto / transform', () => {
  it('translate + non-uniform scale matrix를 적용한다', () => {
    const out = makeEllipse();
    // [a, b, c, d, tx, ty] = [2, 0, 0, 3, 10, 20]
    const result = transformInto(
      out,
      { center: { x: 1, y: 1 }, radiusX: 4, radiusY: 5 },
      {
        a: 2,
        b: 0,
        c: 0,
        d: 3,
        tx: 10,
        ty: 20,
      }
    );
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 12, y: 23 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });

  it('90도 축 swap matrix는 radii를 swap한다', () => {
    const out = makeEllipse();
    // rotate 90 CW (SVG y-down): [a,b,c,d] = [0, 1, -1, 0]
    transformInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 7 }, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    // axisSwap branch: radiusX = ry * c = 7 * -1 = -7; radiusY = rx * b = 3 * 1 = 3
    expect(out.radiusX).toBe(-7);
    expect(out.radiusY).toBe(3);
  });

  it('reflection / negative scale은 radius 부호를 그대로 전파한다', () => {
    const out = makeEllipse();
    // reflect across y axis: a=-1, d=1
    transformInto(out, { center: { x: 5, y: 5 }, radiusX: 3, radiusY: 4 }, { a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out.center).toEqual({ x: -5, y: 5 });
    expect(out.radiusX).toBe(-3);
    expect(out.radiusY).toBe(4);
  });

  it('rotation matrix(45도)는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: EllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88 };
    const s = Math.SQRT1_2;
    // 45도 rotation: a=cos, b=sin, c=-sin, d=cos
    const result = transformInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 },
      {
        a: s,
        b: s,
        c: -s,
        d: s,
        tx: 0,
        ty: 0,
      }
    );
    expect(result).toBe(false);
    expect(out.center).toEqual({ x: 99, y: 99 });
    expect(out.radiusX).toBe(77);
    expect(out.radiusY).toBe(88);
  });

  it('shear matrix는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: EllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88 };
    // shear: a=1, b=0, c=0.5, d=1 (c != 0)
    const result = transformInto(out, makeEllipse(0, 0, 3, 4), { a: 1, b: 0, c: 0.5, d: 1, tx: 0, ty: 0 });
    expect(result).toBe(false);
    expect(out.center).toEqual({ x: 99, y: 99 });
    expect(out.radiusX).toBe(77);
    expect(out.radiusY).toBe(88);
  });

  it('tuple matrix input과 tuple ellipse input을 처리한다', () => {
    const out = makeEllipse();
    const tupEllipse: readonly [readonly [number, number], number, number] = [[1, 2], 3, 4];
    const tupMatrix: readonly [number, number, number, number, number, number] = [2, 0, 0, 2, 0, 0];
    transformInto(out, tupEllipse, tupMatrix);
    expect(out.center).toEqual({ x: 2, y: 4 });
    expect(out.radiusX).toBe(6);
    expect(out.radiusY).toBe(8);
  });

  it('tuple writable center storage에 기록한다', () => {
    const center: XYTupleWritable = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    transformInto(out, makeEllipse(1, 2, 3, 4), { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
    expect(out.center[0]).toBe(2);
    expect(out.center[1]).toBe(4);
  });

  it('out과 input ellipse가 같은 object여도 안전하다', () => {
    const out = makeEllipse(1, 2, 3, 4);
    transformInto(out, out, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(out.center).toEqual({ x: 3, y: 5 });
    expect(out.radiusX).toBe(6);
    expect(out.radiusY).toBe(8);
  });

  it('NaN scale component(b/c가 NaN)는 false (`b === 0`/`c === 0` exact check 통과 안 함)', () => {
    const out: EllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88 };
    const result = transformInto(out, makeEllipse(0, 0, 3, 4), { a: 1, b: Number.NaN, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result).toBe(false);
    expect(out.center).toEqual({ x: 99, y: 99 });
  });

  it('NaN a/d component는 axis-aligned guard 통과 후 산술 결과로 전파된다', () => {
    const out = makeEllipse();
    transformInto(out, makeEllipse(1, 1, 3, 4), { a: Number.NaN, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
    expect(out.center.x).toBeNaN();
    expect(out.center.y).toBe(2);
    expect(out.radiusX).toBeNaN();
    expect(out.radiusY).toBe(8);
  });

  it('Infinity a/d component는 axis-aligned guard 통과 후 산술 결과로 전파된다', () => {
    const out = makeEllipse();
    transformInto(out, makeEllipse(1, 1, 3, 4), {
      a: Number.POSITIVE_INFINITY,
      b: 0,
      c: 0,
      d: Number.NEGATIVE_INFINITY,
      tx: 0,
      ty: 0,
    });
    expect(out.center.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.center.y).toBe(Number.NEGATIVE_INFINITY);
    expect(out.radiusX).toBe(Number.POSITIVE_INFINITY);
    expect(out.radiusY).toBe(Number.NEGATIVE_INFINITY);
  });

  it('transform companion은 성공 시 새 plain object를 반환한다', () => {
    const e = transform(makeEllipse(0, 0, 3, 4), { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(e).toEqual({ center: { x: 1, y: 1 }, radiusX: 6, radiusY: 8 });
  });

  it('transform companion은 rotated/sheared matrix에서 undefined를 반환한다', () => {
    expect(
      transform(makeEllipse(0, 0, 3, 4), {
        a: Math.SQRT1_2,
        b: Math.SQRT1_2,
        c: -Math.SQRT1_2,
        d: Math.SQRT1_2,
        tx: 0,
        ty: 0,
      })
    ).toBeUndefined();
    expect(transform(makeEllipse(0, 0, 3, 4), { a: 1, b: 0, c: 0.5, d: 1, tx: 0, ty: 0 })).toBeUndefined();
  });
});

describe('projectPointInto / projectPoint', () => {
  it('outside point를 boundary closest point로 투영한다', () => {
    const out = { x: 0, y: 0 };
    const result = projectPointInto(out, makeEllipse(0, 0, 3, 3), { x: 6, y: 0 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('inside point도 boundary closest point로 투영한다', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, makeEllipse(0, 0, 5, 5), { x: 1, y: 0 });
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('center point tie-break는 (cx + radiusX, cy)이다', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, makeEllipse(2, 3, 4, 5), { x: 2, y: 3 });
    expect(out.x).toBeCloseTo(2 + 4, 10);
    expect(out.y).toBeCloseTo(3, 10);
  });

  it('empty ellipse는 center를 기록한다', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, makeEllipse(7, 8, 0, 5), { x: 100, y: 100 });
    expect(out.x).toBe(7);
    expect(out.y).toBe(8);

    const out2 = { x: 0, y: 0 };
    projectPointInto(out2, makeEllipse(7, 8, 5, 0), { x: 100, y: 100 });
    expect(out2.x).toBe(7);
    expect(out2.y).toBe(8);

    const out3 = { x: 0, y: 0 };
    projectPointInto(out3, makeEllipse(7, 8, -1, -1), { x: 100, y: 100 });
    expect(out3.x).toBe(7);
    expect(out3.y).toBe(8);
  });

  it('tuple point input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, makeEllipse(0, 0, 3, 3), [6, 0] as const);
    expect(out.x).toBeCloseTo(3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  it('out과 point가 같은 object여도 안전하다', () => {
    const shared = { x: 6, y: 0 };
    projectPointInto(shared, makeEllipse(0, 0, 3, 3), shared);
    expect(shared.x).toBeCloseTo(3, 10);
    expect(shared.y).toBeCloseTo(0, 10);
  });

  it('epsilon option은 그대로 전달된다 (큰 epsilon은 조기 종료)', () => {
    // 큰 epsilon은 첫 반복에서 종료하기 쉬워 결과 정확도가 떨어진다. 두 epsilon 결과가 같지 않거나 같을 수 있다.
    // 호출 경로 자체를 검증하기 위해 결과가 finite임을 확인한다.
    const tight = projectPoint(makeEllipse(0, 0, 3, 4), { x: 10, y: 10 }, 1e-12);
    const loose = projectPoint(makeEllipse(0, 0, 3, 4), { x: 10, y: 10 }, 1);
    expect(Number.isFinite(tight.x)).toBe(true);
    expect(Number.isFinite(tight.y)).toBe(true);
    expect(Number.isFinite(loose.x)).toBe(true);
    expect(Number.isFinite(loose.y)).toBe(true);
  });

  it('projectPoint companion은 새 plain object를 반환한다', () => {
    const p = projectPoint(makeEllipse(0, 0, 3, 3), { x: 6, y: 0 });
    expect(p.x).toBeCloseTo(3, 10);
    expect(p.y).toBeCloseTo(0, 10);
  });
});

describe('containsCircle', () => {
  it('bounding square가 ellipse 안이면 true', () => {
    // ellipse 10x10, circle r=1 at center → bounding square 2x2 안에 있음
    expect(containsCircle(makeEllipse(0, 0, 10, 10), { center: { x: 0, y: 0 }, radius: 1 })).toBe(true);
  });

  it('circle perimeter 일부가 ellipse 밖이면 false', () => {
    // ellipse 5x5, circle r=4 at center → bounding square corner (4,4): 16/25+16/25=1.28>1
    expect(containsCircle(makeEllipse(0, 0, 5, 5), { center: { x: 0, y: 0 }, radius: 4 })).toBe(false);
  });

  it('conservative false case: 실제 ellipse 안에 들어가는 circle도 bounding square corner가 밖이면 false', () => {
    // ellipse 10x10 (big circle), circle r=8 at center
    // 실제로는 8 < 10 이므로 circle은 ellipse 안에 있다.
    // bounding square corner (8,8): 64/100 + 64/100 = 1.28 > 1 → false (conservative)
    expect(containsCircle(makeEllipse(0, 0, 10, 10), { center: { x: 0, y: 0 }, radius: 8 })).toBe(false);
  });

  it('empty circle(radius <= 0)은 true', () => {
    expect(containsCircle(makeEllipse(0, 0, 0, 0), { center: { x: 100, y: 100 }, radius: 0 })).toBe(true);
    expect(containsCircle(makeEllipse(0, 0, 5, 5), { center: { x: 100, y: 100 }, radius: -1 })).toBe(true);
  });

  it('empty ellipse + non-empty circle은 false', () => {
    expect(containsCircle(makeEllipse(0, 0, 0, 0), { center: { x: 0, y: 0 }, radius: 1 })).toBe(false);
    expect(containsCircle(makeEllipse(0, 0, 5, 0), { center: { x: 0, y: 0 }, radius: 1 })).toBe(false);
    expect(containsCircle(makeEllipse(0, 0, -1, -1), { center: { x: 0, y: 0 }, radius: 1 })).toBe(false);
  });

  it('tuple circle input과 tuple ellipse input을 처리한다', () => {
    const tupEllipse: readonly [readonly [number, number], number, number] = [[0, 0], 10, 10];
    const tupCircle: readonly [readonly [number, number], number] = [[0, 0], 1];
    expect(containsCircle(tupEllipse, tupCircle)).toBe(true);
  });

  it('off-center circle도 bounding square corner 4개로 평가한다', () => {
    // ellipse 10x10 at origin, circle r=1 at (5, 0)
    // bounding square corners: (4,-1)/(6,-1)/(4,1)/(6,1)
    // (6, 1): 36/100 + 1/100 = 0.37 ≤ 1 → all corners inside → true
    expect(containsCircle(makeEllipse(0, 0, 10, 10), { center: { x: 5, y: 0 }, radius: 1 })).toBe(true);
  });
});
