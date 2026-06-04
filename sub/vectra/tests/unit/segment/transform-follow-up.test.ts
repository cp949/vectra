/**
 * segment shape transform helpers — transformInto, centerOnInto, extendInto, rotateInto
 */
import { describe, expect, test } from 'vitest';
import { centerOn } from '../../../src/segment/center-on';
import { centerOnInto } from '../../../src/segment/center-on-into';
import { extend } from '../../../src/segment/extend';
import { extendInto } from '../../../src/segment/extend-into';
import { rotate } from '../../../src/segment/rotate';
import { rotateInto } from '../../../src/segment/rotate-into';
import { transform } from '../../../src/segment/transform';
import { transformInto } from '../../../src/segment/transform-into';
import type { SegmentWritable } from '../../../src/types';

// helper
function seg(ax: number, ay: number, bx: number, by: number): SegmentWritable {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}
function out(): SegmentWritable {
  return seg(0, 0, 0, 0);
}

describe('segment transform - transformInto', () => {
  test('translation matrix를 두 endpoint에 적용한다', () => {
    const o = out();
    transformInto(o, seg(1, 2, 3, 4), { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 });
    expect(o.a).toEqual({ x: 11, y: 22 });
    expect(o.b).toEqual({ x: 13, y: 24 });
  });

  test('scale matrix를 적용한다', () => {
    const o = out();
    transformInto(o, seg(1, 2, 3, 4), { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(o.a).toEqual({ x: 2, y: 6 });
    expect(o.b).toEqual({ x: 6, y: 12 });
  });

  test('rotation matrix를 적용한다', () => {
    const o = out();
    transformInto(o, seg(1, 0, 2, 0), { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect((o.a as { x: number; y: number }).x).toBeCloseTo(0);
    expect((o.a as { x: number; y: number }).y).toBeCloseTo(1);
    expect((o.b as { x: number; y: number }).x).toBeCloseTo(0);
    expect((o.b as { x: number; y: number }).y).toBeCloseTo(2);
  });

  test('tuple matrix와 tuple endpoint input을 지원한다', () => {
    const o = out();
    transformInto(
      o,
      [
        [1, 0],
        [2, 0],
      ],
      [1, 0, 0, 1, 5, 5]
    );
    expect(o.a).toEqual({ x: 6, y: 5 });
    expect(o.b).toEqual({ x: 7, y: 5 });
  });

  test('mutable tuple endpoint output을 보존한다', () => {
    const tupleA: [number, number] = [0, 0];
    const tupleB: [number, number] = [0, 0];
    const o = { a: tupleA, b: tupleB };
    transformInto(o, seg(1, 2, 3, 4), { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(tupleA).toEqual([1, 2]);
    expect(tupleB).toEqual([3, 4]);
  });

  test('self-aliasing: transformInto(out, out, matrix)가 올바른 결과를 반환한다', () => {
    const o = seg(1, 0, 2, 0);
    transformInto(o, o, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 0 });
    expect(o.a).toEqual({ x: 11, y: 0 });
    expect(o.b).toEqual({ x: 12, y: 0 });
  });

  test('transform companion이 새 plain object를 반환한다', () => {
    const result = transform(seg(1, 2, 3, 4), { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 5 });
    expect(result).toEqual({ a: { x: 6, y: 7 }, b: { x: 8, y: 9 } });
  });
});

describe('segment transform - centerOnInto', () => {
  test('midpoint를 target point로 이동한다', () => {
    const o = out();
    // midpoint: (1.5, 1.5)  target: (5, 5)  offset: (3.5, 3.5)
    centerOnInto(o, seg(1, 1, 2, 2), { x: 5, y: 5 });
    expect(o.a).toEqual({ x: 4.5, y: 4.5 });
    expect(o.b).toEqual({ x: 5.5, y: 5.5 });
  });

  test('length를 보존한다', () => {
    const line = seg(0, 0, 3, 4); // length 5
    const o = out();
    centerOnInto(o, line, { x: 10, y: 10 });
    const dx = (o.b as { x: number; y: number }).x - (o.a as { x: number; y: number }).x;
    const dy = (o.b as { x: number; y: number }).y - (o.a as { x: number; y: number }).y;
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(5);
  });

  test('self-aliasing이 length를 보존한다', () => {
    const o = seg(0, 0, 3, 4);
    centerOnInto(o, o, { x: 0, y: 0 });
    const dx = (o.b as { x: number; y: number }).x - (o.a as { x: number; y: number }).x;
    const dy = (o.b as { x: number; y: number }).y - (o.a as { x: number; y: number }).y;
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(5);
  });

  test('zero-length segment에서 두 endpoint가 모두 target point로 이동한다', () => {
    const o = out();
    centerOnInto(o, seg(3, 3, 3, 3), { x: 7, y: 8 });
    expect(o.a).toEqual({ x: 7, y: 8 });
    expect(o.b).toEqual({ x: 7, y: 8 });
  });

  test('centerOn companion이 새 plain object를 반환한다', () => {
    const result = centerOn(seg(0, 0, 2, 0), { x: 5, y: 0 });
    expect(result).toEqual({ a: { x: 4, y: 0 }, b: { x: 6, y: 0 } });
  });
});

describe('segment transform - extendInto', () => {
  test('before/after만큼 양쪽 endpoint를 이동한다', () => {
    const o = out();
    // horizontal segment (0,0)→(4,0), unit dir (1,0)
    // before=1: a 뒤쪽으로 1 → (-1,0)
    // after=2: b 앞쪽으로 2 → (6,0)
    extendInto(o, seg(0, 0, 4, 0), 1, 2);
    expect(o.a).toEqual({ x: -1, y: 0 });
    expect(o.b).toEqual({ x: 6, y: 0 });
  });

  test('음수 before/after는 shrink로 동작하고 clamp하지 않는다', () => {
    const o = out();
    extendInto(o, seg(0, 0, 4, 0), -1, -1);
    expect(o.a).toEqual({ x: 1, y: 0 });
    expect(o.b).toEqual({ x: 3, y: 0 });
  });

  test('endpoint가 교차할 정도로 shrink해도 clamp하지 않는다', () => {
    const o = out();
    extendInto(o, seg(0, 0, 2, 0), -3, -3);
    // a goes to (3,0), b goes to (-1,0) — crossing allowed
    expect((o.a as { x: number; y: number }).x).toBeCloseTo(3);
    expect((o.b as { x: number; y: number }).x).toBeCloseTo(-1);
  });

  test('self-aliasing: extendInto(out, out, ...)가 올바른 결과를 반환한다', () => {
    const o = seg(0, 0, 4, 0);
    extendInto(o, o, 1, 1);
    expect(o.a).toEqual({ x: -1, y: 0 });
    expect(o.b).toEqual({ x: 5, y: 0 });
  });

  test('zero-length segment는 input을 그대로 복사한다', () => {
    const o = out();
    extendInto(o, seg(3, 5, 3, 5), 2, 2);
    expect(o.a).toEqual({ x: 3, y: 5 });
    expect(o.b).toEqual({ x: 3, y: 5 });
  });

  test('extend companion이 새 plain object를 반환한다', () => {
    const result = extend(seg(0, 0, 4, 0), 1, 1);
    expect(result).toEqual({ a: { x: -1, y: 0 }, b: { x: 5, y: 0 } });
  });
});

describe('segment transform - rotateInto', () => {
  test('원점 기준 CCW 회전 결과를 반환한다', () => {
    const o = out();
    // (1,0) → (0,1) after 90 degrees CCW
    rotateInto(o, seg(1, 0, 2, 0), Math.PI / 2);
    expect((o.a as { x: number; y: number }).x).toBeCloseTo(0);
    expect((o.a as { x: number; y: number }).y).toBeCloseTo(1);
    expect((o.b as { x: number; y: number }).x).toBeCloseTo(0);
    expect((o.b as { x: number; y: number }).y).toBeCloseTo(2);
  });

  test('self-aliasing이 올바른 결과를 반환한다', () => {
    const o = seg(1, 0, 2, 0);
    rotateInto(o, o, Math.PI / 2);
    expect((o.a as { x: number; y: number }).x).toBeCloseTo(0);
    expect((o.a as { x: number; y: number }).y).toBeCloseTo(1);
  });

  test('rotate companion이 새 plain object를 반환한다', () => {
    const result = rotate(seg(1, 0, 2, 0), Math.PI);
    expect((result.a as { x: number; y: number }).x).toBeCloseTo(-1);
    expect((result.a as { x: number; y: number }).y).toBeCloseTo(0);
    expect((result.b as { x: number; y: number }).x).toBeCloseTo(-2);
    expect((result.b as { x: number; y: number }).y).toBeCloseTo(0);
  });
});
