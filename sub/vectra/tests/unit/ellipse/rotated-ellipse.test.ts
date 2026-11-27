/**
 * ellipse rotated bridge — RotatedEllipse 타입 conversion·point·bounds·matrix transform 계약 검증.
 *
 * 검증(S10-RM-023):
 * - toRotatedInto / toRotated: axis-aligned ellipse → rotated ellipse 승급. rotation 기록,
 *   평평한 출력 객체.
 * - rotatedPointAtAngleInto / rotatedPointAtAngle: local parameter angle boundary point.
 *   rotation 0/π/2, empty → center.
 * - rotatedBoundsInto / rotatedBounds: closed-form AABB. rotation 0/90/45도, empty sentinel.
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
import type { PointWritable, RotatedEllipseWritable } from '../../../src/types/flat-shapes.internal';
import { makeBoundsOut } from './_helpers';

/** rotation 0인 zero rotated ellipse writable. */
function makeRotatedOut(): RotatedEllipseWritable {
  return { cx: 0, cy: 0, rx: 0, ry: 0, rotation: 0 };
}

/** 평평한 점 출력 객체를 만든다. */
function makeXYOut(): PointWritable {
  return { x: 0, y: 0 };
}

describe('toRotatedInto / toRotated', () => {
  it('axis-aligned ellipse를 rotation을 더해 승급한다', () => {
    const out = makeRotatedOut();
    const result = toRotatedInto(out, { cx: 1, cy: 2, rx: 3, ry: 4 }, Math.PI / 6);
    expect(result).toBe(out);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(4);
    expect(out.rotation).toBe(Math.PI / 6);
  });

  it('rotation은 normalization 없이 그대로 기록한다', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { cx: 0, cy: 0, rx: 1, ry: 1 }, 10 * Math.PI);
    expect(out.rotation).toBe(10 * Math.PI);
  });

  it('empty ellipse도 그대로 승급한다 (보정 없음)', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { cx: 1, cy: 1, rx: 0, ry: -2 }, 0);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(-2);
  });

  it('companion은 새 plain object를 반환한다', () => {
    const r = toRotated({ cx: 1, cy: 2, rx: 3, ry: 4 }, Math.PI / 3);
    expect(r).toEqual({ cx: 1, cy: 2, rx: 3, ry: 4, rotation: Math.PI / 3 });
  });

  it('non-finite 입력을 보정 없이 그대로 전파한다', () => {
    const out = makeRotatedOut();
    toRotatedInto(out, { cx: NaN, cy: Infinity, rx: -Infinity, ry: 4 }, NaN);
    expect(out.cx).toBeNaN();
    expect(out.cy).toBe(Infinity);
    expect(out.rx).toBe(-Infinity);
    expect(out.ry).toBe(4);
    expect(out.rotation).toBeNaN();
  });
});

describe('rotatedPointAtAngleInto / rotatedPointAtAngle', () => {
  it('rotation 0은 axis-aligned point와 같다', () => {
    const out = makeXYOut();
    const result = rotatedPointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4, rotation: 0 }, 0);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 4, y: 2 });

    rotatedPointAtAngleInto(out, { cx: 1, cy: 2, rx: 3, ry: 4, rotation: 0 }, Math.PI / 2);
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(6, 12);
  });

  it('rotation π/2에서 local x축 endpoint가 world +y로 회전한다', () => {
    const out = makeXYOut();
    rotatedPointAtAngleInto(out, { cx: 0, cy: 0, rx: 3, ry: 1, rotation: Math.PI / 2 }, 0);
    expect(out.x).toBeCloseTo(0, 12);
    expect(out.y).toBeCloseTo(3, 12);
  });

  it('empty ellipse는 center를 기록한다', () => {
    const out = makeXYOut();
    rotatedPointAtAngleInto(out, { cx: 5, cy: 6, rx: 0, ry: 4, rotation: 1 }, 1.23);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  it('companion은 새 plain object를 반환한다', () => {
    const p = rotatedPointAtAngle({ cx: 0, cy: 0, rx: 2, ry: 1, rotation: 0 }, Math.PI);
    expect(p.x).toBeCloseTo(-2, 12);
    expect(p.y).toBeCloseTo(0, 12);
  });

  it('non-finite radius/angle을 보정 없이 그대로 전파한다', () => {
    const out = makeXYOut();
    // rx = Infinity는 empty guard(rx <= 0)에 걸리지 않고 그대로 산술된다.
    // x = cosφ·Infinity = Infinity, y = sinφ·Infinity = 0·Infinity = NaN(caller 책임).
    rotatedPointAtAngleInto(out, { cx: 0, cy: 0, rx: Infinity, ry: 1, rotation: 0 }, 0);
    expect(out.x).toBe(Infinity);
    expect(out.y).toBeNaN();

    rotatedPointAtAngleInto(out, { cx: 0, cy: 0, rx: 2, ry: 1, rotation: 0 }, NaN);
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });
});

describe('rotatedBoundsInto / rotatedBounds', () => {
  it('rotation 0은 axis-aligned bounds와 같다', () => {
    const out = makeBoundsOut();
    const result = rotatedBoundsInto(out, { cx: 1, cy: 1, rx: 3, ry: 2, rotation: 0 });
    expect(result).toBe(out);
    expect(out.minX).toBe(-2);
    expect(out.minY).toBe(-1);
    expect(out.maxX).toBe(4);
    expect(out.maxY).toBe(3);
  });

  it('90도 rotation은 radius가 swap된 AABB를 만든다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { cx: 0, cy: 0, rx: 3, ry: 2, rotation: Math.PI / 2 });
    expect(out.minX).toBeCloseTo(-2, 12);
    expect(out.minY).toBeCloseTo(-3, 12);
    expect(out.maxX).toBeCloseTo(2, 12);
    expect(out.maxY).toBeCloseTo(3, 12);
  });

  it('45도 rotation은 analytic extent를 만든다', () => {
    const out = makeBoundsOut();
    // Δx = Δy = sqrt((rx² + ry²) / 2) = sqrt((4 + 1) / 2) = sqrt(2.5)
    rotatedBoundsInto(out, { cx: 0, cy: 0, rx: 2, ry: 1, rotation: Math.PI / 4 });
    const d = Math.sqrt(2.5);
    expect(out.minX).toBeCloseTo(-d, 12);
    expect(out.minY).toBeCloseTo(-d, 12);
    expect(out.maxX).toBeCloseTo(d, 12);
    expect(out.maxY).toBeCloseTo(d, 12);
  });

  it('empty ellipse는 sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { cx: 1, cy: 1, rx: -1, ry: 2, rotation: 0.5 });
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
  });

  it('companion은 새 plain bounds object를 반환한다', () => {
    const b = rotatedBounds({ cx: 0, cy: 0, rx: 3, ry: 2, rotation: 0 });
    expect(b).toEqual({ minX: -3, minY: -2, maxX: 3, maxY: 2 });
  });

  it('non-finite radius를 보정 없이 그대로 전파한다', () => {
    const out = makeBoundsOut();
    // rx = Infinity는 empty guard(rx <= 0)에 걸리지 않고 half-extent 산술로 그대로 전파된다.
    // rotation 0에서 x축 extent는 ±Infinity, y축 extent는 Infinity·sin0 = NaN으로 오염된다(caller 책임).
    rotatedBoundsInto(out, { cx: 0, cy: 0, rx: Infinity, ry: 2, rotation: 0 });
    expect(out.minX).toBe(-Infinity);
    expect(out.maxX).toBe(Infinity);
    expect(out.minY).toBeNaN();
    expect(out.maxY).toBeNaN();
  });

  it('finite 큰 radius는 half-extent 제곱 overflow 없이 bounds를 계산한다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, { cx: 0, cy: 0, rx: 1e308, ry: 1, rotation: Math.PI / 4 });
    const cos = Math.cos(Math.PI / 4);
    const sin = Math.sin(Math.PI / 4);
    const dx = Math.hypot(1e308 * cos, sin);
    const dy = Math.hypot(1e308 * sin, cos);
    expect(Number.isFinite(out.minX)).toBe(true);
    expect(Number.isFinite(out.maxX)).toBe(true);
    expect(Number.isFinite(out.minY)).toBe(true);
    expect(Number.isFinite(out.maxY)).toBe(true);
    expect(out.minX).toBe(-dx);
    expect(out.maxX).toBe(dx);
    expect(out.minY).toBe(-dy);
    expect(out.maxY).toBe(dy);
  });

  it('subnormal positive radius는 half-extent 제곱 underflow로 사라지지 않는다', () => {
    const out = makeBoundsOut();
    rotatedBoundsInto(out, {
      cx: 0,
      cy: 0,
      rx: Number.MIN_VALUE,
      ry: Number.MIN_VALUE,
      rotation: 0,
    });
    expect(out.minX).toBe(-Number.MIN_VALUE);
    expect(out.minY).toBe(-Number.MIN_VALUE);
    expect(out.maxX).toBe(Number.MIN_VALUE);
    expect(out.maxY).toBe(Number.MIN_VALUE);
  });
});

describe('transformToRotatedInto / transformToRotated', () => {
  it('identity matrix는 rotation 0으로 그대로 둔다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { cx: 1, cy: 2, rx: 3, ry: 4 },
      { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(4);
    expect(out.rotation).toBe(0);
  });

  it('translate + non-uniform scale matrix를 적용한다', () => {
    const out = makeRotatedOut();
    transformToRotatedInto(out, { cx: 1, cy: 1, rx: 4, ry: 5 }, { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 });
    expect(out.cx).toBe(12);
    expect(out.cy).toBe(23);
    expect(out.rx).toBe(8);
    expect(out.ry).toBe(15);
    expect(out.rotation).toBe(0);
  });

  it('pure rotation matrix는 rotation을 기록하고 radii를 보존한다', () => {
    const out = makeRotatedOut();
    const theta = Math.PI / 6;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    transformToRotatedInto(out, { cx: 0, cy: 0, rx: 3, ry: 4 }, { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 });
    expect(out.rotation).toBeCloseTo(theta, 12);
    expect(out.rx).toBeCloseTo(3, 12);
    expect(out.ry).toBeCloseTo(4, 12);
  });

  it('rotation + uniform scale + translation을 적용한다', () => {
    const out = makeRotatedOut();
    const s = 2;
    const theta = Math.PI / 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    transformToRotatedInto(
      out,
      { cx: 1, cy: 0, rx: 3, ry: 2 },
      { a: s * cos, b: s * sin, c: -s * sin, d: s * cos, tx: 5, ty: 6 }
    );
    expect(out.rotation).toBeCloseTo(theta, 12);
    expect(out.rx).toBeCloseTo(6, 12);
    expect(out.ry).toBeCloseTo(4, 12);
    // center = (s*cos*1 + tx, s*sin*1 + ty) = (5, 8)
    expect(out.cx).toBeCloseTo(5, 12);
    expect(out.cy).toBeCloseTo(8, 12);
  });

  it('axis swap / reflection matrix를 지원한다', () => {
    const out = makeRotatedOut();
    // reflection: a=0,b=1,c=1,d=0 (det = -1, columns orthogonal)
    transformToRotatedInto(out, { cx: 1, cy: 2, rx: 3, ry: 5 }, { a: 0, b: 1, c: 1, d: 0, tx: 0, ty: 0 });
    expect(out.rx).toBeCloseTo(3, 12);
    expect(out.ry).toBeCloseTo(5, 12);
    // rotation = atan2(b, a) = atan2(1, 0) = π/2. det = a*d - b*c = -1 < 0이어도 outline은 정확하다
    expect(out.rotation).toBeCloseTo(Math.PI / 2, 12);
    // center swapped: (cy, cx) = (2, 1)
    expect(out.cx).toBe(2);
    expect(out.cy).toBe(1);
  });

  it('shear matrix는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: RotatedEllipseWritable = { cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 };
    // shear: a=1,b=0,c=1,d=1 → a*c + b*d = 1 ≠ 0
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 3, ry: 4 },
      { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    // failure atomicity: out 미수정
    expect(out).toEqual({ cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 });
  });

  it('입력과 출력이 같은 객체여도 안전하다', () => {
    const out = { cx: 1, cy: 2, rx: 3, ry: 4, rotation: 0 };
    transformToRotatedInto(out, out, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(5);
    expect(out.rx).toBe(6);
    expect(out.ry).toBe(8);
  });

  it('matrix bridge 결과는 rotatedPointAtAngle과 일치한다', () => {
    const ellipse = { cx: 0, cy: 0, rx: 2, ry: 1 } as const;
    const theta = 0.7;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const matrix = { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 } as const;
    const rotated = transformToRotated(ellipse, matrix);
    expect(rotated).toBeDefined();
    if (!rotated) return;
    const t = 0.3;
    // axis-aligned local point → matrix 적용한 world 좌표
    const lx = ellipse.rx * Math.cos(t);
    const ly = ellipse.ry * Math.sin(t);
    const worldX = matrix.a * lx + matrix.c * ly + matrix.tx;
    const worldY = matrix.b * lx + matrix.d * ly + matrix.ty;
    const p = rotatedPointAtAngle(rotated, t);
    expect(p.x).toBeCloseTo(worldX, 12);
    expect(p.y).toBeCloseTo(worldY, 12);
  });

  it('non-empty ellipse에서 zero column matrix는 degenerate line segment라 reject한다', () => {
    const out: RotatedEllipseWritable = { cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 };
    // column2 = (c, d) = (0, 0). affine image는 line segment지만 RotatedEllipseLike radius 0은 empty다.
    const result = transformToRotatedInto(
      out,
      { cx: 1, cy: 2, rx: 3, ry: 4 },
      { a: 2, b: 0, c: 0, d: 0, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 });
  });

  it('empty ellipse에서 zero column matrix는 empty rotated ellipse로 기록한다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { cx: 1, cy: 2, rx: 0, ry: 4 },
      { a: 2, b: 0, c: 0, d: 0, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });

  it('non-zero subnormal column은 zero column reject로 오분류하지 않는다', () => {
    const out = makeRotatedOut();
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 1, ry: 2 },
      { a: Number.MIN_VALUE, b: 0, c: 0, d: Number.MIN_VALUE, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.rx).toBe(Number.MIN_VALUE);
    expect(out.ry).toBe(1e-323);
  });

  it('subnormal dot underflow로 non-orthogonal column을 허용하지 않는다', () => {
    const out: RotatedEllipseWritable = { cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 };
    // raw a*c + b*d는 Number.MIN_VALUE * 0.5 underflow로 0이 되지만 두 column은 직교하지 않는다.
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 1, ry: 2 },
      { a: Number.MIN_VALUE, b: 0, c: 0.5, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 });
  });

  it('huge orthogonal column은 raw dot overflow 없이 허용한다', () => {
    const out = makeRotatedOut();
    // raw a*c + b*d는 Infinity + -Infinity = NaN이지만 scale-normalized 방향은 정확히 직교한다.
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 1, ry: 1 },
      { a: 1e308, b: 1e308, c: 1e308, d: -1e308, tx: 0, ty: 0 }
    );
    expect(result).toBe(out);
    expect(out.rx).toBe(Math.hypot(1e308, 1e308));
    expect(out.ry).toBe(Math.hypot(1e308, -1e308));
    expect(out.rotation).toBeCloseTo(Math.PI / 4, 12);
  });

  it('huge non-orthogonal column은 infinite length normalization으로 허용하지 않는다', () => {
    const out: RotatedEllipseWritable = { cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 };
    // Math.hypot(Number.MAX_VALUE, Number.MAX_VALUE)는 Infinity다.
    // length로 직접 나누면 second column direction이 (0, 0)으로 접혀 false positive가 생긴다.
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 1, ry: 2 },
      { a: Number.MAX_VALUE, b: 0, c: Number.MAX_VALUE, d: Number.MAX_VALUE, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ cx: 99, cy: 99, rx: 77, ry: 88, rotation: 7 });
  });

  it('exact-zero tolerance 없음: near-orthogonal column도 reject한다', () => {
    const out = makeRotatedOut();
    // a*c + b*d = 1e-15 ≠ 0 → tolerance 없이 false
    const result = transformToRotatedInto(
      out,
      { cx: 0, cy: 0, rx: 3, ry: 4 },
      { a: 1, b: 0, c: 1e-15, d: 1, tx: 0, ty: 0 }
    );
    expect(result).toBe(false);
  });

  it('shear companion은 undefined를 반환한다', () => {
    const r = transformToRotated({ cx: 0, cy: 0, rx: 3, ry: 4 }, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 });
    expect(r).toBeUndefined();
  });

  it('companion은 성공 시 새 plain object를 반환한다', () => {
    const r = transformToRotated({ cx: 1, cy: 2, rx: 3, ry: 4 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(r).toEqual({ cx: 1, cy: 2, rx: 3, ry: 4, rotation: 0 });
  });
});
