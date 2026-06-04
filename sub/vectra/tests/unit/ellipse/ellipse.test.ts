import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/ellipse/copy-into';
import { createEllipse } from '../../../src/ellipse/create-ellipse';
import { ellipseFrom } from '../../../src/ellipse/ellipse-from';
import type { EllipseWritable, XYTupleWritable } from '../../../src/types';
import { makeEllipse } from './_helpers';

// ─── createEllipse ───────────────────────────────────────────────────────────

describe('ellipse lifecycle - createEllipse', () => {
  test('인수 없이 호출하면 zero ellipse를 반환한다', () => {
    const e = createEllipse();
    expect(e).toEqual({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 0 });
  });
});

describe('ellipse lifecycle - ellipseFrom overload', () => {
  test('center + radii 인자로 새 object를 반환한다', () => {
    const e = ellipseFrom({ x: 3, y: 4 }, 5, 2);
    expect(e).toEqual({ center: { x: 3, y: 4 }, radiusX: 5, radiusY: 2 });
  });

  test('tuple center + radii 인자로 새 object를 반환한다', () => {
    const e = ellipseFrom([3, 4], 5, 2);
    expect(e).toEqual({ center: { x: 3, y: 4 }, radiusX: 5, radiusY: 2 });
  });

  test('EllipseObjectLike를 복사한 새 object를 반환한다', () => {
    const src = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const e = ellipseFrom(src);
    expect(e).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
    expect(e).not.toBe(src);
    expect(e.center).not.toBe(src.center);
  });

  test('EllipseTuple을 복사한 새 object를 반환한다', () => {
    const e = ellipseFrom([{ x: 1, y: 2 }, 3, 4] as const);
    expect(e).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
  });

  test('tuple center EllipseTuple을 복사한다', () => {
    const e = ellipseFrom([[1, 2], 3, 4] as const);
    expect(e).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
  });

  test('반환 center는 항상 새 { x, y } object이다', () => {
    const center = { x: 5, y: 6 };
    const e = ellipseFrom(center, 3, 4);
    expect(e.center).not.toBe(center);
  });
});

// ─── copyInto ────────────────────────────────────────────────────────────────

describe('ellipse lifecycle - copyInto', () => {
  test('center + radii 인자로 기록하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = copyInto(out, { x: 3, y: 4 }, 5, 2);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(2);
  });

  test('tuple center + radii 인자로 기록한다', () => {
    const out = makeEllipse();
    copyInto(out, [3, 4], 5, 2);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(2);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    const result = copyInto(out, { x: 3, y: 4 }, 5, 2);
    expect(result).toBe(out);
    expect(center).toEqual([3, 4]);
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(2);
  });

  test('EllipseObjectLike를 복사한다', () => {
    const out = makeEllipse();
    const src = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('EllipseTuple을 복사한다', () => {
    const out = makeEllipse();
    copyInto(out, [{ x: 1, y: 2 }, 3, 4] as const);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('tuple center EllipseTuple을 복사한다', () => {
    const out = makeEllipse();
    copyInto(out, [[1, 2], 3, 4] as const);
    expect(out.center).toEqual({ x: 1, y: 2 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('mutable tuple center storage에 EllipseLike를 복사한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    copyInto(out, { center: { x: 5, y: 6 }, radiusX: 2, radiusY: 3 });
    expect(center).toEqual([5, 6]);
    expect(out.radiusX).toBe(2);
    expect(out.radiusY).toBe(3);
  });

  test('out === ellipse aliasing에서도 안전하게 복사한다', () => {
    const out = makeEllipse(3, 4, 5, 2);
    copyInto(out, out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(2);
  });

  test('out.center === ellipse.center aliasing에서도 안전하게 복사한다', () => {
    const sharedCenter = { x: 3, y: 4 };
    const out: EllipseWritable = { center: sharedCenter, radiusX: 0, radiusY: 0 };
    const src = { center: sharedCenter, radiusX: 7, radiusY: 5 };
    copyInto(out, src);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radiusX).toBe(7);
    expect(out.radiusY).toBe(5);
  });

  test('radii <= 0을 그대로 기록한다', () => {
    const out = makeEllipse();
    copyInto(out, { x: 0, y: 0 }, 0, -2);
    expect(out.radiusX).toBe(0);
    expect(out.radiusY).toBe(-2);
  });
});

// ─── ellipseFrom ─────────────────────────────────────────────────────────────

describe('ellipse lifecycle - ellipseFrom', () => {
  test('EllipseObjectLike를 plain object로 반환한다', () => {
    const result = ellipseFrom({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
    expect(result).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
  });

  test('EllipseTuple을 plain object로 반환한다', () => {
    const result = ellipseFrom([{ x: 1, y: 2 }, 3, 4] as const);
    expect(result).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
  });

  test('tuple center EllipseTuple을 plain object로 반환한다', () => {
    const result = ellipseFrom([[1, 2], 3, 4] as const);
    expect(result).toEqual({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 });
  });

  test('반환 center는 새 { x, y } object이다', () => {
    const src = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const result = ellipseFrom(src);
    expect(result).not.toBe(src);
    expect(result.center).not.toBe(src.center);
  });
});
