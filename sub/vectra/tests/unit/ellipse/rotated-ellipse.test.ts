/**
 * ellipse rotated bridge — RotatedEllipse 타입 conversion·point·bounds·matrix transform 계약 검증.
 *
 * 검증(S10-RM-023):
 * - toRotatedInto / toRotated: axis-aligned ellipse → rotated ellipse 승급. rotation 기록,
 *   tuple/object input, tuple/object output aliasing.
 * - rotatedPointAtAngleInto / rotatedPointAtAngle: local parameter angle boundary point.
 *   rotation 0/π/2, empty → center, tuple input.
 * - rotatedBoundsInto / rotatedBounds: closed-form AABB. rotation 0/90/45도, empty sentinel,
 *   tuple input.
 * - transformToRotatedInto / transformToRotated: matrix bridge. 직교 column 지원,
 *   shear reject(false/undefined) + failure atomicity, aliasing, point 일치.
 * - non-finite(NaN/Infinity/-Infinity) caller-책임 pass-through.
 */
import { describe, expect, it } from 'vitest';
import { rotatedBounds } from '../../../src/ellipse/rotated-bounds';
import { rotatedBoundsInto } from '../../../src/ellipse/rotated-bounds-into';
import { rotatedPointAtAngle } from '../../../src/ellipse/rotated-point-at-angle';
import { rotatedPointAtAngleInto } from '../../../src/ellipse/rotated-point-at-angle-into';
import { toRotated } from '../../../src/ellipse/to-rotated';
import { toRotatedInto } from '../../../src/ellipse/to-rotated-into';
import { transformToRotated } from '../../../src/ellipse/transform-to-rotated';
import { transformToRotatedInto } from '../../../src/ellipse/transform-to-rotated-into';
import type { BoundsWritable, RotatedEllipseWritable, XYObjectWritable, XYTupleWritable } from '../../../src/types';

/** rotation 0인 zero rotated ellipse writable. */
function makeRotatedOut(): RotatedEllipseWritable {
  return { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0, rotation: 0 };
}

/** object 좌표 XY writable. */
function makeXYOut(): XYObjectWritable {
  return { x: 0, y: 0 };
}

/** object min/max bounds writable. */
function makeBoundsOut(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

describe('toRotatedInto / toRotated', () => {
  it('axis-aligned ellipse를 rotation을 더해 승급한다', () => {
    const out = makeRotatedOut();
    const result = toRotatedInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, Math.PI / 6);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
    expect(out.rotation).toBe(Math.PI / 6);
  });

  it('tuple input을 읽는다', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, [[5, 6], 7, 8], Math.PI / 2);
    expect(out.center).toEqual({ x: 5, y: 6 });
    expect(out.radiusX).toBe(7);
    expect(out.radiusY).toBe(8);
    expect(out.rotation).toBe(Math.PI / 2);
  });

  it('tuple output center에 기록한다', () => {
    const out: RotatedEllipseWritable<XYTupleWritable> = {
      center: [0, 0],
      radiusX: 0,
      radiusY: 0,
      rotation: 0,
    };
    toRotatedInto(out, { center: { x: 9, y: 10 }, radiusX: 1, radiusY: 2 }, 0.5);
    expect(out.center).toEqual([9, 10]);
    expect(out.rotation).toBe(0.5);
  });

  it('rotation은 normalization 없이 그대로 기록한다', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 }, 10 * Math.PI);
    expect(out.rotation).toBe(10 * Math.PI);
  });

  it('empty ellipse도 그대로 승급한다 (보정 없음)', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { center: { x: 1, y: 1 }, radiusX: 0, radiusY: -2 }, 0);
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(-2);
  });

  it('companion은 새 plain object를 반환한다', () => {
    const r = toRotated({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, Math.PI / 3);
    expect(r).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4, rotation: Math.PI / 3 });
  });

  it('non-finite 입력을 보정 없이 그대로 전파한다', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { center: { x: NaN, y: Infinity }, radiusX: -Infinity, radiusY: 4 }, NaN);
    expect(out.center.x).toBeNaN();
    expect(out.center.y).toBe(Infinity);
    expect(out.radiusX).toBe(-Infinity);
    expect(out.radiusY).toBe(4);
    expect(out.rotation).toBeNaN();
  });
});

describe('rotatedPointAtAngleInto / rotatedPointAtAngle', () => {
  it('rotation 0은 axis-aligned point와 같다', () => {
    const out = makeXYOut();
    const result = rotatedPointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4, rotation: 0 }, 0);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 4, y: 2 });

    rotatedPointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4, rotation: 0 }, Math.PI / 2);
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(6, 12);
  });

  it('rotation π/2에서 local x축 endpoint가 world +y로 회전한다', () => {
    const out = makeXYOut();
    rotatedPointAtAngleInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 1, rotation: Math.PI / 2 }, 0);
    expect(out.x).toBeCloseTo(0, 12);
    expect(out.y).toBeCloseTo(3, 12);
  });

  it('empty ellipse는 center를 기록한다', () => {
    const out = makeXYOut();
    rotatedPointAtAngleInto(out, { center: { x: 5, y: 6 }, radiusX: 0, radiusY: 4, rotation: 1 }, 1.23);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  it('tuple input을 읽는다', () => {
    const out = makeXYOut();
    rotatedPointAtAngleInto(out, [[0, 0], 2, 1, 0], 0);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  it('companion은 새 plain object를 반환한다', () => {
    const p = rotatedPointAtAngle({ center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1, rotation: 0 }, Math.PI);
    expect(p.x).toBeCloseTo(-2, 12);
    expect(p.y).toBeCloseTo(0, 12);
  });

  it('non-finite radius/angle을 보정 없이 그대로 전파한다', () => {
    const out = makeXYOut();
    // radiusX = Infinity는 empty guard(rx <= 0)에 걸리지 않고 그대로 산술된다.
    // x = cosφ·Infinity = Infinity, y = sinφ·Infinity = 0·Infinity = NaN(caller 책임).
    rotatedPointAtAngleInto(out, { center: { x: 0, y: 0 }, radiusX: Infinity, radiusY: 1, rotation: 0 }, 0);
    expect(out.x).toBe(Infinity);
    expect(out.y).toBeNaN();

    rotatedPointAtAngleInto(out, { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1, rotation: 0 }, NaN);
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });
});

describe('rotatedBoundsInto / rotatedBounds', () => {
  it('rotation 0은 axis-aligned bounds와 같다', () => {
    const out = makeBoundsOut();
    const result = rotatedBoundsInto(out, { center: { x: 1, y: 1 }, radiusX: 3, radiusY: 2, rotation: 0 });
    expect(result).toBe(out);
    expect(out.min).toEqual({ x: -2, y: -1 });
    expect(out.max).toEqual({ x: 4, y: 3 });
  });

  it('90도 rotation은 radius가 swap된 AABB를 만든다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2, rotation: Math.PI / 2 });
    expect(out.min.x).toBeCloseTo(-2, 12);
    expect(out.min.y).toBeCloseTo(-3, 12);
    expect(out.max.x).toBeCloseTo(2, 12);
    expect(out.max.y).toBeCloseTo(3, 12);
  });

  it('45도 rotation은 analytic extent를 만든다', () => {
    const out = makeBoundsOut();
    // Δx = Δy = sqrt((rx² + ry²) / 2) = sqrt((4 + 1) / 2) = sqrt(2.5)
    rotatedBoundsInto(out, { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1, rotation: Math.PI / 4 });
    const d = Math.sqrt(2.5);
    expect(out.min.x).toBeCloseTo(-d, 12);
    expect(out.min.y).toBeCloseTo(-d, 12);
    expect(out.max.x).toBeCloseTo(d, 12);
    expect(out.max.y).toBeCloseTo(d, 12);
  });

  it('empty ellipse는 sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { center: { x: 1, y: 1 }, radiusX: -1, radiusY: 2, rotation: 0.5 });
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  it('tuple input을 읽는다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, [[0, 0], 3, 2, 0]);
    expect(out.min).toEqual({ x: -3, y: -2 });
    expect(out.max).toEqual({ x: 3, y: 2 });
  });

  it('companion은 새 plain bounds object를 반환한다', () => {
    const b = rotatedBounds({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2, rotation: 0 });
    expect(b).toEqual({ min: { x: -3, y: -2 }, max: { x: 3, y: 2 } });
  });

  it('non-finite radius를 보정 없이 그대로 전파한다', () => {
    const out = makeBoundsOut();
    // radiusX = Infinity는 empty guard(rx <= 0)에 걸리지 않고 half-extent 산술로 그대로 전파된다.
    // rotation 0에서 x축 extent는 ±Infinity, y축 extent는 Infinity·sin0 = NaN으로 오염된다(caller 책임).
    rotatedBoundsInto(out, { center: { x: 0, y: 0 }, radiusX: Infinity, radiusY: 2, rotation: 0 });
    expect(out.min.x).toBe(-Infinity);
    expect(out.max.x).toBe(Infinity);
    expect(out.min.y).toBeNaN();
    expect(out.max.y).toBeNaN();
  });

  it('finite 큰 radius는 half-extent 제곱 overflow 없이 bounds를 계산한다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { center: { x: 0, y: 0 }, radiusX: 1e308, radiusY: 1, rotation: Math.PI / 4 });
    const cos = Math.cos(Math.PI / 4);
    const sin = Math.sin(Math.PI / 4);
    const dx = Math.hypot(1e308 * cos, sin);
    const dy = Math.hypot(1e308 * sin, cos);
    expect(Number.isFinite(out.min.x)).toBe(true);
    expect(Number.isFinite(out.max.x)).toBe(true);
    expect(Number.isFinite(out.min.y)).toBe(true);
    expect(Number.isFinite(out.max.y)).toBe(true);
    expect(out.min.x).toBe(-dx);
    expect(out.max.x).toBe(dx);
    expect(out.min.y).toBe(-dy);
    expect(out.max.y).toBe(dy);
  });

  it('subnormal positive radius는 half-extent 제곱 underflow로 사라지지 않는다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, {
      center: { x: 0, y: 0 },
      radiusX: Number.MIN_VALUE,
      radiusY: Number.MIN_VALUE,
      rotation: 0,
    });
    expect(out.min).toEqual({ x: -Number.MIN_VALUE, y: -Number.MIN_VALUE });
    expect(out.max).toEqual({ x: Number.MIN_VALUE, y: Number.MIN_VALUE });
  });
});

describe('transformToRotatedInto / transformToRotated', () => {
  it('identity matrix는 rotation 0으로 그대로 둔다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 },
      { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
    expect(out.rotation).toBe(0);
  });

  it('translate + non-uniform scale matrix를 적용한다', () => {
    const out = makeRotatedOut();
    transformToRotatedInto(
      out,
      { center: { x: 1, y: 1 }, radiusX: 4, radiusY: 5 },
      { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 }
    );
    expect(out.center).toEqual({ x: 12, y: 23 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
    expect(out.rotation).toBe(0);
  });

  it('pure rotation matrix는 rotation을 기록하고 radii를 보존한다', () => {
    const out = makeRotatedOut();
    const theta = Math.PI / 6;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 },
      { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 }
    );
    expect(out.rotation).toBeCloseTo(theta, 12);
    expect(out.radiusX).toBeCloseTo(3, 12);
    expect(out.radiusY).toBeCloseTo(4, 12);
  });

  it('rotation + uniform scale + translation을 적용한다', () => {
    const out = makeRotatedOut();
    const s = 2;
    const theta = Math.PI / 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    transformToRotatedInto(
      out,
      { center: { x: 1, y: 0 }, radiusX: 3, radiusY: 2 },
      { a: s * cos, b: s * sin, c: -s * sin, d: s * cos, tx: 5, ty: 6 }
    );
    expect(out.rotation).toBeCloseTo(theta, 12);
    expect(out.radiusX).toBeCloseTo(6, 12);
    expect(out.radiusY).toBeCloseTo(4, 12);
    // center = (s*cos*1 + tx, s*sin*1 + ty) = (5, 8)
    expect(out.center.x).toBeCloseTo(5, 12);
    expect(out.center.y).toBeCloseTo(8, 12);
  });

  it('axis swap / reflection matrix를 지원한다', () => {
    const out = makeRotatedOut();
    // reflection: a=0,b=1,c=1,d=0 (det = -1, columns orthogonal)
    transformToRotatedInto(
      out,
      { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 5 },
      { a: 0, b: 1, c: 1, d: 0, tx: 0, ty: 0 }
    );
    expect(out.radiusX).toBeCloseTo(3, 12);
    expect(out.radiusY).toBeCloseTo(5, 12);
    // rotation = atan2(b, a) = atan2(1, 0) = π/2. det = a*d - b*c = -1 < 0이어도 outline은 정확하다
    expect(out.rotation).toBeCloseTo(Math.PI / 2, 12);
    // center swapped: (cy, cx) = (2, 1)
    expect(out.center).toEqual({ x: 2, y: 1 });
  });

  it('shear matrix는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: RotatedEllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 };
    // shear: a=1,b=0,c=1,d=1 → a*c + b*d = 1 ≠ 0
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 },
      { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    // failure atomicity: out 미수정
    expect(out).toEqual({ center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 });
  });

  it('out.center가 input center와 alias되어도 안전하다', () => {
    const shared = { x: 1, y: 2 };
    const out: RotatedEllipseWritable = { center: shared, radiusX: 0, radiusY: 0, rotation: 0 };
    transformToRotatedInto(out, { center: shared, radiusX: 3, radiusY: 4 }, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(out.center).toEqual({ x: 3, y: 5 });
    expect(out.radiusX).toBe(6);
    expect(out.radiusY).toBe(8);
  });

  it('matrix bridge 결과는 rotatedPointAtAngle과 일치한다', () => {
    const ellipse = { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 } as const;
    const theta = 0.7;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const matrix = { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 } as const;
    const rotated = transformToRotated(ellipse, matrix);
    expect(rotated).toBeDefined();
    if (!rotated) return;
    const t = 0.3;
    // axis-aligned local point → matrix 적용한 world 좌표
    const lx = ellipse.radiusX * Math.cos(t);
    const ly = ellipse.radiusY * Math.sin(t);
    const worldX = matrix.a * lx + matrix.c * ly + matrix.tx;
    const worldY = matrix.b * lx + matrix.d * ly + matrix.ty;
    const p = rotatedPointAtAngle(rotated, t);
    expect(p.x).toBeCloseTo(worldX, 12);
    expect(p.y).toBeCloseTo(worldY, 12);
  });

  it('tuple matrix / tuple ellipse input을 읽는다', () => {
    const out = makeRotatedOut();
    transformToRotatedInto(out, [[0, 0], 3, 4], [1, 0, 0, 1, 2, 3]);
    expect(out.center).toEqual({ x: 2, y: 3 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
    expect(out.rotation).toBe(0);
  });

  it('non-empty ellipse에서 zero column matrix는 degenerate line segment라 reject한다', () => {
    const out: RotatedEllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 };
    // column2 = (c, d) = (0, 0). affine image는 line segment지만 RotatedEllipseLike radius 0은 empty다.
    const result = transformToRotatedInto(
      out,
      { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 },
      { a: 2, b: 0, c: 0, d: 0, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 });
  });

  it('empty ellipse에서 zero column matrix는 empty rotated ellipse로 기록한다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { center: { x: 1, y: 2 }, radiusX: 0, radiusY: 4 },
      { a: 2, b: 0, c: 0, d: 0, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(0);
  });

  it('non-zero subnormal column은 zero column reject로 오분류하지 않는다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 2 },
      { a: Number.MIN_VALUE, b: 0, c: 0, d: Number.MIN_VALUE, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.radiusX).toBe(Number.MIN_VALUE);
    expect(out.radiusY).toBe(1e-323);
  });

  it('subnormal dot underflow로 non-orthogonal column을 허용하지 않는다', () => {
    const out: RotatedEllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 };
    // raw a*c + b*d는 Number.MIN_VALUE * 0.5 underflow로 0이 되지만 두 column은 직교하지 않는다.
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 2 },
      { a: Number.MIN_VALUE, b: 0, c: 0.5, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 });
  });

  it('huge orthogonal column은 raw dot overflow 없이 허용한다', () => {
    const out = makeRotatedOut();
    // raw a*c + b*d는 Infinity + -Infinity = NaN이지만 scale-normalized 방향은 정확히 직교한다.
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 },
      { a: 1e308, b: 1e308, c: 1e308, d: -1e308, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.radiusX).toBe(Math.hypot(1e308, 1e308));
    expect(out.radiusY).toBe(Math.hypot(1e308, -1e308));
    expect(out.rotation).toBeCloseTo(Math.PI / 4, 12);
  });

  it('huge non-orthogonal column은 infinite length normalization으로 허용하지 않는다', () => {
    const out: RotatedEllipseWritable = { center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 };
    // Math.hypot(Number.MAX_VALUE, Number.MAX_VALUE)는 Infinity다.
    // length로 직접 나누면 second column direction이 (0, 0)으로 접혀 false positive가 생긴다.
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 2 },
      { a: Number.MAX_VALUE, b: 0, c: Number.MAX_VALUE, d: Number.MAX_VALUE, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ center: { x: 99, y: 99 }, radiusX: 77, radiusY: 88, rotation: 7 });
  });

  it('exact-zero tolerance 없음: near-orthogonal column도 reject한다', () => {
    const out = makeRotatedOut();
    // a*c + b*d = 1e-15 ≠ 0 → tolerance 없이 false
    const result = transformToRotatedInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 },
      { a: 1, b: 0, c: 1e-15, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
  });

  it('shear companion은 undefined를 반환한다', () => {
    const r = transformToRotated(
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 4 },
      { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 }
    );
    expect(r).toBeUndefined();
  });

  it('companion은 성공 시 새 plain object를 반환한다', () => {
    const r = transformToRotated(
      { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 },
      { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    );
    expect(r).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4, rotation: 0 });
  });
});
