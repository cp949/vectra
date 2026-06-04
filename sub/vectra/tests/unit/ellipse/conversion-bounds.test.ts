import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/ellipse/bounds';
import { boundsInto } from '../../../src/ellipse/bounds-into';
import { fromBounds } from '../../../src/ellipse/from-bounds';
import { fromBoundsInto } from '../../../src/ellipse/from-bounds-into';
import { fromRect } from '../../../src/ellipse/from-rect';
import { fromRectInto } from '../../../src/ellipse/from-rect-into';
import type { EllipseWritable, XYTupleWritable } from '../../../src/types';
import { makeBoundsOut, makeEllipse } from './_helpers';

// ─── fromBoundsInto ──────────────────────────────────────────────────────────

describe('ellipse conversion - fromBoundsInto', () => {
  test('정사각형 bounds에서 ellipse를 기록하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 4 } });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 2, y: 2 });
    expect(out.radiusX).toBe(2);
    expect(out.radiusY).toBe(2);
  });

  test('직사각형 bounds에서 center와 radii를 기록한다', () => {
    const out = makeEllipse();
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 6, y: 4 } });
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('tuple min/max bounds를 처리한다', () => {
    const out = makeEllipse();
    fromBoundsInto(out, { min: [0, 0], max: [6, 4] });
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 6, y: 4 } });
    expect(center).toEqual([3, 2]);
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('empty bounds (x inverted): radii = 0, center = (min.x, min.y)를 기록한다', () => {
    const out = makeEllipse();
    fromBoundsInto(out, { min: { x: 5, y: 0 }, max: { x: 1, y: 5 } });
    expect(out.center).toEqual({ x: 5, y: 0 });
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(0);
  });

  test('empty bounds (y inverted): radii = 0, center = (min.x, min.y)를 기록한다', () => {
    const out = makeEllipse();
    fromBoundsInto(out, { min: { x: 0, y: 5 }, max: { x: 5, y: 1 } });
    expect(out.center).toEqual({ x: 0, y: 5 });
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(0);
  });

  test('sentinel empty bounds: radii = 0, center = (Infinity, Infinity)를 기록한다', () => {
    const out = makeEllipse();
    fromBoundsInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
    expect(out.center).toEqual({ x: Infinity, y: Infinity });
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(0);
  });

  test('out.center === bounds.min aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 0, y: 0 };
    const out: EllipseWritable = { center: shared, radiusX: 0, radiusY: 0 };
    fromBoundsInto(out, { min: shared, max: { x: 6, y: 4 } });
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('out.center === bounds.max aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 6, y: 4 };
    const out: EllipseWritable = { center: shared, radiusX: 0, radiusY: 0 };
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: shared });
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });
});

// ─── fromBounds ──────────────────────────────────────────────────────────────

describe('ellipse conversion - fromBounds', () => {
  test('bounds에서 plain object를 반환한다', () => {
    const result = fromBounds({ min: { x: 0, y: 0 }, max: { x: 6, y: 4 } });
    expect(result).toEqual({ center: { x: 3, y: 2 }, radiusX: 3, radiusY: 2 });
  });

  test('empty bounds는 radii = 0, center = min을 반환한다', () => {
    const result = fromBounds({ min: { x: 5, y: 3 }, max: { x: 1, y: 3 } });
    expect(result).toEqual({ center: { x: 5, y: 3 }, radiusX: 0, radiusY: 0 });
  });

  test('fromBoundsInto와 동일한 결과를 반환한다', () => {
    const out = makeEllipse();
    const b = { min: { x: 2, y: 1 }, max: { x: 10, y: 7 } };
    fromBoundsInto(out, b);
    const result = fromBounds(b);
    expect(result.center).toEqual(out.center);
    expect(result.radiusX).toBe(out.radiusX);
    expect(result.radiusY).toBe(out.radiusY);
  });
});

// ─── fromRectInto ────────────────────────────────────────────────────────────

describe('ellipse conversion - fromRectInto', () => {
  test('rect에서 ellipse를 기록하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = fromRectInto(out, { x: 0, y: 0, width: 6, height: 4 });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('rect tuple 형태를 처리한다', () => {
    const out = makeEllipse();
    fromRectInto(out, [0, 0, 6, 4]);
    expect(out.center).toEqual({ x: 3, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(2);
  });

  test('width <= 0이면 radiusX = 0을 기록한다', () => {
    const out = makeEllipse();
    fromRectInto(out, { x: 1, y: 2, width: 0, height: 4 });
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(2);
  });

  test('height <= 0이면 radiusY = 0을 기록한다', () => {
    const out = makeEllipse();
    fromRectInto(out, { x: 1, y: 2, width: 6, height: -2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(0);
  });

  test('width < 0 && height < 0 각각 독립으로 radiusX = 0, radiusY = 0을 기록한다', () => {
    const out = makeEllipse();
    fromRectInto(out, { x: 1, y: 2, width: -4, height: -6 });
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(0);
  });

  test('center는 width/height 부호와 무관하게 (x+width/2, y+height/2)를 기록한다', () => {
    const out = makeEllipse();
    fromRectInto(out, { x: 2, y: 3, width: -4, height: -6 });
    expect(out.center).toEqual({ x: 0, y: 0 });
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    fromRectInto(out, { x: 0, y: 0, width: 6, height: 4 });
    expect(center).toEqual([3, 2]);
  });

  test('양수 offset rect를 처리한다', () => {
    const out = makeEllipse();
    fromRectInto(out, { x: 2, y: 1, width: 8, height: 6 });
    expect(out.center).toEqual({ x: 6, y: 4 });
    expect(out.radiusX).toBe(4);
    expect(out.radiusY).toBe(3);
  });
});

// ─── fromRect ────────────────────────────────────────────────────────────────

describe('ellipse conversion - fromRect', () => {
  test('rect에서 plain object를 반환한다', () => {
    const result = fromRect({ x: 0, y: 0, width: 6, height: 4 });
    expect(result).toEqual({ center: { x: 3, y: 2 }, radiusX: 3, radiusY: 2 });
  });

  test('fromRectInto와 동일한 결과를 반환한다', () => {
    const out = makeEllipse();
    const r = { x: 2, y: 1, width: 8, height: 6 };
    fromRectInto(out, r);
    const result = fromRect(r);
    expect(result.center).toEqual(out.center);
    expect(result.radiusX).toBe(out.radiusX);
    expect(result.radiusY).toBe(out.radiusY);
  });

  test('width <= 0이면 radiusX = 0을 반환한다', () => {
    const result = fromRect({ x: 1, y: 2, width: 0, height: 4 });
    expect(result.radiusX).toBe(0);
    expect(result.radiusY).toBe(2);
  });
});

// ─── boundsInto ──────────────────────────────────────────────────────────────

describe('ellipse shape output - boundsInto', () => {
  test('ellipse의 AABB를 기록하고 out을 반환한다', () => {
    const out = makeBoundsOut();
    const result = boundsInto(out, { center: { x: 5, y: 3 }, radiusX: 4, radiusY: 2 });
    expect(result).toBe(out);
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 9, y: 5 });
  });

  test('tuple center EllipseLike를 처리한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, [[5, 3], 4, 2] as const);
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 9, y: 5 });
  });

  test('empty ellipse (radiusX = 0): sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { center: { x: 5, y: 5 }, radiusX: 0, radiusY: 3 });
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('empty ellipse (radiusY <= 0): sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { center: { x: 5, y: 5 }, radiusX: 3, radiusY: -1 });
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('origin ellipse의 AABB를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 });
    expect(out.min).toEqual({ x: -3, y: -2 });
    expect(out.max).toEqual({ x: 3, y: 2 });
  });
});

// ─── bounds ──────────────────────────────────────────────────────────────────

describe('ellipse shape output - bounds', () => {
  test('ellipse의 AABB를 plain object로 반환한다', () => {
    const result = bounds({ center: { x: 5, y: 3 }, radiusX: 4, radiusY: 2 });
    expect(result).toEqual({ min: { x: 1, y: 1 }, max: { x: 9, y: 5 } });
  });

  test('empty ellipse는 sentinel empty bounds를 반환한다', () => {
    const result = bounds({ center: { x: 5, y: 5 }, radiusX: 0, radiusY: 3 });
    expect(result).toEqual({ min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
  });

  test('boundsInto와 동일한 결과를 반환한다', () => {
    const out = makeBoundsOut();
    const e = { center: { x: 2, y: 1 }, radiusX: 5, radiusY: 3 };
    boundsInto(out, e);
    const result = bounds(e);
    expect(result.min).toEqual(out.min);
    expect(result.max).toEqual(out.max);
  });
});
