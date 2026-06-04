/**
 * bounds.transformInto — matrix로 4 corner를 변환한 AABB를 out에 기록한다.
 *
 * 검증: identity/translate/scale/rotate/shear matrix 동작, empty/sentinel pass-through,
 * out===bounds aliasing, 반환값.
 */
import { describe, expect, test } from 'vitest';
import { transformInto } from '../../../src/bounds/transform-into';
import type { BoundsWritable } from '../../../src/types';

// out으로 쓸 plain BoundsWritable을 만든다
function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

describe('bounds - transformInto', () => {
  test('identity matrix는 bounds를 그대로 기록한다', () => {
    const out = makeBounds();
    const result = transformInto(
      out,
      { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } },
      { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }
    );
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
    expect(result).toBe(out);
  });

  test('translate matrix는 bounds를 offset만큼 이동한다', () => {
    const out = makeBounds();
    transformInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(out.min).toEqual({ x: 11, y: -1 });
    expect(out.max).toEqual({ x: 15, y: 3 });
  });

  test('scale matrix는 origin 기준으로 bounds를 scale한다', () => {
    const out = makeBounds();
    transformInto(out, { min: { x: 1, y: 2 }, max: { x: 3, y: 4 } }, { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(out.min).toEqual({ x: 2, y: 6 });
    expect(out.max).toEqual({ x: 6, y: 12 });
  });

  test('음수 scale matrix는 corner가 뒤집혀도 AABB로 재정렬한다', () => {
    const out = makeBounds();
    // x축을 -1로 반전 → max.x가 음수가 되므로 AABB 재계산이 필요하다
    transformInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, { a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out.min).toEqual({ x: -5, y: 2 });
    expect(out.max).toEqual({ x: -1, y: 6 });
  });

  test('90° rotation matrix는 4 corner 회전 후 AABB를 재계산한다 (oriented bounds 아님)', () => {
    const out = makeBounds();
    // 90° CCW: (x,y) → (-y, x). bounds [(0,0),(2,4)] corner: (0,0),(2,0),(0,4),(2,4)
    // 회전: (0,0),(0,2),(-4,0),(-4,2). AABB: min=(-4,0), max=(0,2)
    transformInto(out, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } }, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect(out.min.x).toBeCloseTo(-4);
    expect(out.min.y).toBeCloseTo(0);
    expect(out.max.x).toBeCloseTo(0);
    expect(out.max.y).toBeCloseTo(2);
  });

  test('shear matrix는 회전된 corner를 감싸는 AABB를 생성한다', () => {
    const out = makeBounds();
    // shear (a=1,b=0,c=1,d=1,tx=0,ty=0): x' = x + y, y' = y
    // bounds [(0,0),(2,4)] corner: (0,0),(2,0),(0,4),(2,4)
    // 변환: (0,0),(2,0),(4,4),(6,4). AABB: min=(0,0), max=(6,4)
    transformInto(out, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } }, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 6, y: 4 });
  });

  test('general affine matrix (rotation + translation)도 정확하게 감싼다', () => {
    const out = makeBounds();
    // 90° CCW + translation (10, 20)
    transformInto(out, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } }, { a: 0, b: 1, c: -1, d: 0, tx: 10, ty: 20 });
    expect(out.min.x).toBeCloseTo(6);
    expect(out.min.y).toBeCloseTo(20);
    expect(out.max.x).toBeCloseTo(10);
    expect(out.max.y).toBeCloseTo(22);
  });

  test('inverted empty bounds는 sentinel을 기록한다', () => {
    const out = makeBounds();
    transformInto(out, { min: { x: 5, y: 5 }, max: { x: 0, y: 0 } }, { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 });
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('sentinel bounds는 sentinel을 그대로 기록한다', () => {
    const out = makeBounds();
    transformInto(
      out,
      { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } },
      { a: 2, b: 0, c: 0, d: 2, tx: 5, ty: 5 }
    );
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('out === bounds aliasing: 정확하게 기록된다', () => {
    const bounds: BoundsWritable = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    transformInto(bounds, bounds, { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: -1 });
    expect(bounds.min).toEqual({ x: 3, y: 5 });
    expect(bounds.max).toEqual({ x: 11, y: 17 });
  });

  test('out === bounds aliasing: rotation에서도 corner가 뒤섞이지 않는다', () => {
    const bounds: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } };
    // 90° CCW
    transformInto(bounds, bounds, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect(bounds.min.x).toBeCloseTo(-4);
    expect(bounds.min.y).toBeCloseTo(0);
    expect(bounds.max.x).toBeCloseTo(0);
    expect(bounds.max.y).toBeCloseTo(2);
  });

  test('tuple bounds 입력도 처리한다', () => {
    const out = makeBounds();
    transformInto(out, { min: [1, 2], max: [5, 6] }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(out.min).toEqual({ x: 11, y: -1 });
    expect(out.max).toEqual({ x: 15, y: 3 });
  });

  test('tuple matrix 입력도 처리한다', () => {
    const out = makeBounds();
    transformInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, [2, 0, 0, 2, 0, 0]);
    expect(out.min).toEqual({ x: 2, y: 4 });
    expect(out.max).toEqual({ x: 10, y: 12 });
  });

  test('mutable tuple writable output을 보존한다', () => {
    const minTuple: [number, number] = [0, 0];
    const maxTuple: [number, number] = [0, 0];
    const out = { min: minTuple, max: maxTuple };
    transformInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(minTuple).toEqual([1, 2]);
    expect(maxTuple).toEqual([5, 6]);
  });
});
