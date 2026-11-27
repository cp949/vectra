/**
 * bounds.transformInto — matrix로 4 corner를 변환한 AABB를 out에 기록한다.
 *
 * 검증: identity/translate/scale/rotate/shear matrix 동작, empty/sentinel pass-through,
 * out===bounds aliasing, 반환값.
 */
import { describe, expect, test } from 'vitest';
import { transformInto } from '../../../src/bounds/transform-into';
import type { BoundsWritable } from '../../../src/types/flat-shapes.internal';

/** 변환 결과를 기록할 경계 상자를 만든다. */
function makeBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

describe('bounds - transformInto', () => {
  test('identity matrix는 bounds를 그대로 기록한다', () => {
    const out = makeBounds();
    const result = transformInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 6 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 6 });
    expect(result).toBe(out);
  });

  test('translate matrix는 bounds를 offset만큼 이동한다', () => {
    const out = makeBounds();
    transformInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 6 }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(out).toEqual({ minX: 11, minY: -1, maxX: 15, maxY: 3 });
  });

  test('scale matrix는 origin 기준으로 bounds를 scale한다', () => {
    const out = makeBounds();
    transformInto(out, { minX: 1, minY: 2, maxX: 3, maxY: 4 }, { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(out).toEqual({ minX: 2, minY: 6, maxX: 6, maxY: 12 });
  });

  test('음수 scale matrix는 corner가 뒤집혀도 AABB로 재정렬한다', () => {
    const out = makeBounds();
    // x축을 -1로 반전 → maxX가 음수가 되므로 AABB 재계산이 필요하다
    transformInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 6 }, { a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out).toEqual({ minX: -5, minY: 2, maxX: -1, maxY: 6 });
  });

  test('90° rotation matrix는 4 corner 회전 후 AABB를 재계산한다 (oriented bounds 아님)', () => {
    const out = makeBounds();
    // 90° CCW: (x,y) → (-y, x). bounds [(0,0),(2,4)] corner: (0,0),(2,0),(0,4),(2,4)
    // 회전: (0,0),(0,2),(-4,0),(-4,2). AABB: min=(-4,0), max=(0,2)
    transformInto(out, { minX: 0, minY: 0, maxX: 2, maxY: 4 }, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect(out.minX).toBeCloseTo(-4);
    expect(out.minY).toBeCloseTo(0);
    expect(out.maxX).toBeCloseTo(0);
    expect(out.maxY).toBeCloseTo(2);
  });

  test('shear matrix는 회전된 corner를 감싸는 AABB를 생성한다', () => {
    const out = makeBounds();
    // shear (a=1,b=0,c=1,d=1,tx=0,ty=0): x' = x + y, y' = y
    // bounds [(0,0),(2,4)] corner: (0,0),(2,0),(0,4),(2,4)
    // 변환: (0,0),(2,0),(4,4),(6,4). AABB: min=(0,0), max=(6,4)
    transformInto(out, { minX: 0, minY: 0, maxX: 2, maxY: 4 }, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 });
    expect(out).toEqual({ minX: 0, minY: 0, maxX: 6, maxY: 4 });
  });

  test('general affine matrix (rotation + translation)도 정확하게 감싼다', () => {
    const out = makeBounds();
    // 90° CCW + translation (10, 20)
    transformInto(out, { minX: 0, minY: 0, maxX: 2, maxY: 4 }, { a: 0, b: 1, c: -1, d: 0, tx: 10, ty: 20 });
    expect(out.minX).toBeCloseTo(6);
    expect(out.minY).toBeCloseTo(20);
    expect(out.maxX).toBeCloseTo(10);
    expect(out.maxY).toBeCloseTo(22);
  });

  test('inverted empty bounds는 sentinel을 기록한다', () => {
    const out = makeBounds();
    transformInto(out, { minX: 5, minY: 5, maxX: 0, maxY: 0 }, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('sentinel bounds는 sentinel을 그대로 기록한다', () => {
    const out = makeBounds();
    transformInto(
      out,
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      { a: 2, b: 0, c: 0, d: 2, tx: 5, ty: 5 }
    );
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { minX: 1, minY: 2, maxX: 5, maxY: 6 };
    transformInto(bounds, bounds, { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: -1 });
    expect(bounds).toEqual({ minX: 3, minY: 5, maxX: 11, maxY: 17 });
  });

  test('out === bounds aliasing: rotation에서도 corner가 뒤섞이지 않는다', () => {
    const bounds: BoundsWritable = { minX: 0, minY: 0, maxX: 2, maxY: 4 };
    // 90° CCW
    transformInto(bounds, bounds, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect(bounds.minX).toBeCloseTo(-4);
    expect(bounds.minY).toBeCloseTo(0);
    expect(bounds.maxX).toBeCloseTo(0);
    expect(bounds.maxY).toBeCloseTo(2);
  });
});
