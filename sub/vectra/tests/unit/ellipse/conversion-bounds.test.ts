/** bounds·rect에서 타원을 생성하고 타원의 축 정렬 경계 상자를 구하는 계약을 검증한다. */
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/ellipse/bounds';
import { boundsInto } from '../../../src/ellipse/bounds-into';
import { fromBounds } from '../../../src/ellipse/from-bounds';
import { fromBoundsInto } from '../../../src/ellipse/from-bounds-into';
import { fromRect } from '../../../src/ellipse/from-rect';
import { fromRectInto } from '../../../src/ellipse/from-rect-into';
import { createEllipse } from '../../../src/ellipse/create-ellipse';
import { makeBoundsOut } from './_helpers';

// ─── fromBoundsInto ──────────────────────────────────────────────────────────

describe('ellipse conversion - fromBoundsInto', () => {
  test('정사각형 bounds에서 ellipse를 기록하고 out을 반환한다', () => {
    const out = createEllipse();
    const result = fromBoundsInto(out, { minX: 0, minY: 0, maxX: 4, maxY: 4 });
    expect(result).toBe(out);
    expect(out.cx).toBe(2);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(2);
    expect(out.ry).toBe(2);
  });

  test('직사각형 bounds에서 center와 radii를 기록한다', () => {
    const out = createEllipse();
    fromBoundsInto(out, { minX: 0, minY: 0, maxX: 6, maxY: 4 });
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(2);
  });

  test('empty bounds (x inverted): radii = 0, center = (minX, minY)를 기록한다', () => {
    const out = createEllipse();
    fromBoundsInto(out, { minX: 5, minY: 0, maxX: 1, maxY: 5 });
    expect(out.cx).toBe(5);
    expect(out.cy).toBe(0);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });

  test('empty bounds (y inverted): radii = 0, center = (minX, minY)를 기록한다', () => {
    const out = createEllipse();
    fromBoundsInto(out, { minX: 0, minY: 5, maxX: 5, maxY: 1 });
    expect(out.cx).toBe(0);
    expect(out.cy).toBe(5);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });

  test('sentinel empty bounds: radii = 0, center = (Infinity, Infinity)를 기록한다', () => {
    const out = createEllipse();
    fromBoundsInto(out, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    expect(out.cx).toBe(Infinity);
    expect(out.cy).toBe(Infinity);
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });
});

// ─── fromBounds ──────────────────────────────────────────────────────────────

describe('ellipse conversion - fromBounds', () => {
  test('bounds에서 plain object를 반환한다', () => {
    const result = fromBounds({ minX: 0, minY: 0, maxX: 6, maxY: 4 });
    expect(result).toEqual({ cx: 3, cy: 2, rx: 3, ry: 2 });
  });

  test('empty bounds는 radii = 0, center = min을 반환한다', () => {
    const result = fromBounds({ minX: 5, minY: 3, maxX: 1, maxY: 3 });
    expect(result).toEqual({ cx: 5, cy: 3, rx: 0, ry: 0 });
  });

  test('fromBoundsInto와 동일한 결과를 반환한다', () => {
    const out = createEllipse();
    const b = { minX: 2, minY: 1, maxX: 10, maxY: 7 };
    fromBoundsInto(out, b);
    const result = fromBounds(b);
    expect(result).toEqual(out);
  });
});

// ─── fromRectInto ────────────────────────────────────────────────────────────

describe('ellipse conversion - fromRectInto', () => {
  test('rect에서 ellipse를 기록하고 out을 반환한다', () => {
    const out = createEllipse();
    const result = fromRectInto(out, { x: 0, y: 0, width: 6, height: 4 });
    expect(result).toBe(out);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(2);
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(2);
  });

  test('width <= 0이면 rx = 0을 기록한다', () => {
    const out = createEllipse();
    fromRectInto(out, { x: 1, y: 2, width: 0, height: 4 });
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(2);
  });

  test('height <= 0이면 ry = 0을 기록한다', () => {
    const out = createEllipse();
    fromRectInto(out, { x: 1, y: 2, width: 6, height: -2 });
    expect(out.rx).toBe(3);
    expect(out.ry).toBe(0);
  });

  test('width < 0 && height < 0 각각 독립으로 rx = 0, ry = 0을 기록한다', () => {
    const out = createEllipse();
    fromRectInto(out, { x: 1, y: 2, width: -4, height: -6 });
    expect(out.rx).toBe(0);
    expect(out.ry).toBe(0);
  });

  test('center는 width/height 부호와 무관하게 (x+width/2, y+height/2)를 기록한다', () => {
    const out = createEllipse();
    fromRectInto(out, { x: 2, y: 3, width: -4, height: -6 });
    expect(out.cx).toBe(0);
    expect(out.cy).toBe(0);
  });

  test('양수 offset rect를 처리한다', () => {
    const out = createEllipse();
    fromRectInto(out, { x: 2, y: 1, width: 8, height: 6 });
    expect(out.cx).toBe(6);
    expect(out.cy).toBe(4);
    expect(out.rx).toBe(4);
    expect(out.ry).toBe(3);
  });
});

// ─── fromRect ────────────────────────────────────────────────────────────────

describe('ellipse conversion - fromRect', () => {
  test('rect에서 plain object를 반환한다', () => {
    const result = fromRect({ x: 0, y: 0, width: 6, height: 4 });
    expect(result).toEqual({ cx: 3, cy: 2, rx: 3, ry: 2 });
  });

  test('fromRectInto와 동일한 결과를 반환한다', () => {
    const out = createEllipse();
    const r = { x: 2, y: 1, width: 8, height: 6 };
    fromRectInto(out, r);
    const result = fromRect(r);
    expect(result).toEqual(out);
  });

  test('width <= 0이면 rx = 0을 반환한다', () => {
    const result = fromRect({ x: 1, y: 2, width: 0, height: 4 });
    expect(result.rx).toBe(0);
    expect(result.ry).toBe(2);
  });
});

// ─── boundsInto ──────────────────────────────────────────────────────────────

describe('ellipse shape output - boundsInto', () => {
  test('ellipse의 AABB를 기록하고 out을 반환한다', () => {
    const out = makeBoundsOut();
    const result = boundsInto(out, { cx: 5, cy: 3, rx: 4, ry: 2 });
    expect(result).toBe(out);
    expect(out).toEqual({ minX: 1, minY: 1, maxX: 9, maxY: 5 });
  });

  test('empty ellipse (rx = 0): sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { cx: 5, cy: 5, rx: 0, ry: 3 });
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('empty ellipse (ry <= 0): sentinel empty bounds를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { cx: 5, cy: 5, rx: 3, ry: -1 });
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('origin ellipse의 AABB를 기록한다', () => {
    const out = makeBoundsOut();
    boundsInto(out, { cx: 0, cy: 0, rx: 3, ry: 2 });
    expect(out).toEqual({ minX: -3, minY: -2, maxX: 3, maxY: 2 });
  });
});

// ─── bounds ──────────────────────────────────────────────────────────────────

describe('ellipse shape output - bounds', () => {
  test('ellipse의 AABB를 plain object로 반환한다', () => {
    const result = bounds({ cx: 5, cy: 3, rx: 4, ry: 2 });
    expect(result).toEqual({ minX: 1, minY: 1, maxX: 9, maxY: 5 });
  });

  test('empty ellipse는 sentinel empty bounds를 반환한다', () => {
    const result = bounds({ cx: 5, cy: 5, rx: 0, ry: 3 });
    expect(result).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('boundsInto와 동일한 결과를 반환한다', () => {
    const out = makeBoundsOut();
    const e = { cx: 2, cy: 1, rx: 5, ry: 3 };
    boundsInto(out, e);
    const result = bounds(e);
    expect(result).toEqual(out);
  });
});
