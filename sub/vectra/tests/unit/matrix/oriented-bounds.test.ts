import { describe, expect, test } from 'vitest';
import { orientedTransformBounds } from '../../../src/matrix/oriented-transform-bounds';
import { orientedTransformBoundsInto } from '../../../src/matrix/oriented-transform-bounds-into';
import { orientedTransformRect } from '../../../src/matrix/oriented-transform-rect';
import { orientedTransformRectInto } from '../../../src/matrix/oriented-transform-rect-into';
import { transformRectInto } from '../../../src/matrix/transform-rect-into';
import type { MatrixLike, OrientedBoundsWritable } from '../../../src/types';

function makeOriented(): OrientedBoundsWritable {
  return {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  };
}

const IDENTITY: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
// R(90°): (x, y) → (-y, x)
const ROTATE90: MatrixLike = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };

// ─── orientedTransformRectInto ──────────────────────────────────────────────────

describe('matrix oriented output - orientedTransformRectInto', () => {
  test('identity matrix는 source rect corner를 그대로 기록하고 out을 반환한다', () => {
    const out = makeOriented();
    const result = orientedTransformRectInto(out, IDENTITY, { x: 1, y: 2, width: 3, height: 4 });
    expect(result).toBe(out);
    expect(out).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('rotation matrix는 AABB가 아니라 회전된 corner를 기록한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(out, ROTATE90, { x: 0, y: 0, width: 2, height: 4 });
    expect(out).toEqual({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 2 },
      bottomRight: { x: -4, y: 2 },
      bottomLeft: { x: -4, y: 0 },
    });
  });

  test('rotation oriented 결과는 transformRectInto AABB 결과와 다르다', () => {
    const rect = { x: 0, y: 0, width: 2, height: 4 };
    const oriented = orientedTransformRectInto(makeOriented(), ROTATE90, rect);
    const aabb = transformRectInto({ x: 0, y: 0, width: 0, height: 0 }, ROTATE90, rect);
    // AABB는 {x:-4, y:0, w:4, h:2}. oriented bottomRight는 AABB corner 어느 것과도 다른 (-4, 2)
    expect(aabb).toEqual({ x: -4, y: 0, width: 4, height: 2 });
    expect(oriented.bottomRight).toEqual({ x: -4, y: 2 });
    // AABB topLeft (-4, 0)와 oriented topLeft (0, 0)이 다르다
    expect(oriented.topLeft).toEqual({ x: 0, y: 0 });
  });

  test('zero-width rect는 한 변이 겹친 corner를 기록한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(out, IDENTITY, { x: 1, y: 2, width: 0, height: 4 });
    expect(out).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 1, y: 2 },
      bottomRight: { x: 1, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('zero-height rect는 한 변이 겹친 corner를 기록한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(out, IDENTITY, { x: 1, y: 2, width: 3, height: 0 });
    expect(out).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 2 },
      bottomLeft: { x: 1, y: 2 },
    });
  });

  test('point-like rect(w=0, h=0)는 네 corner가 모두 같은 점이다', () => {
    const out = makeOriented();
    orientedTransformRectInto(out, ROTATE90, { x: 3, y: 5, width: 0, height: 0 });
    // (3, 5) → (-5, 3)
    expect(out).toEqual({
      topLeft: { x: -5, y: 3 },
      topRight: { x: -5, y: 3 },
      bottomRight: { x: -5, y: 3 },
      bottomLeft: { x: -5, y: 3 },
    });
  });

  test('tuple matrix input을 처리한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(out, [1, 0, 0, 1, 10, 20], { x: 0, y: 0, width: 2, height: 2 });
    expect(out).toEqual({
      topLeft: { x: 10, y: 20 },
      topRight: { x: 12, y: 20 },
      bottomRight: { x: 12, y: 22 },
      bottomLeft: { x: 10, y: 22 },
    });
  });

  test('tuple corner storage를 지원한다', () => {
    const out: OrientedBoundsWritable<[number, number]> = {
      topLeft: [0, 0],
      topRight: [0, 0],
      bottomRight: [0, 0],
      bottomLeft: [0, 0],
    };
    orientedTransformRectInto(out, IDENTITY, { x: 1, y: 2, width: 3, height: 4 });
    expect(out.topLeft).toEqual([1, 2]);
    expect(out.bottomRight).toEqual([4, 6]);
  });

  test('NaN matrix component는 검증 없이 산술 결과를 기록한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(
      out,
      { a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      {
        x: 1,
        y: 2,
        width: 3,
        height: 4,
      }
    );
    expect(Number.isNaN((out.topRight as { x: number }).x)).toBe(true);
  });

  test('Infinity matrix component는 검증 없이 산술 결과를 기록한다', () => {
    const out = makeOriented();
    orientedTransformRectInto(
      out,
      { a: Number.POSITIVE_INFINITY, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      { x: 1, y: 2, width: 3, height: 4 }
    );
    // topRight.x = Infinity * (x+width) = Infinity
    expect((out.topRight as { x: number }).x).toBe(Number.POSITIVE_INFINITY);
  });
});

// ─── orientedTransformRect (companion) ──────────────────────────────────────────

describe('matrix oriented output companion - orientedTransformRect', () => {
  test('plain oriented bounds object를 반환한다', () => {
    expect(orientedTransformRect(IDENTITY, { x: 1, y: 2, width: 3, height: 4 })).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('companion 결과는 Into 결과와 일치한다', () => {
    const into = makeOriented();
    orientedTransformRectInto(into, ROTATE90, { x: 0, y: 0, width: 2, height: 4 });
    expect(orientedTransformRect(ROTATE90, { x: 0, y: 0, width: 2, height: 4 })).toEqual(into);
  });
});

// ─── orientedTransformBoundsInto ─────────────────────────────────────────────────

describe('matrix oriented output - orientedTransformBoundsInto', () => {
  test('identity matrix는 source bounds corner를 그대로 기록한다', () => {
    const out = makeOriented();
    orientedTransformBoundsInto(out, IDENTITY, { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } });
    expect(out).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('rotation matrix는 회전된 corner를 기록한다', () => {
    const out = makeOriented();
    orientedTransformBoundsInto(out, ROTATE90, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } });
    expect(out).toEqual({
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 2 },
      bottomRight: { x: -4, y: 2 },
      bottomLeft: { x: -4, y: 0 },
    });
  });

  test('empty sentinel bounds는 네 corner를 min 변환값으로 축퇴 기록한다', () => {
    const out = makeOriented();
    // inverted (empty) bounds
    orientedTransformBoundsInto(out, ROTATE90, {
      min: { x: 3, y: 5 },
      max: { x: -1, y: -1 },
    });
    // min (3, 5) → (-5, 3). Infinity sentinel을 옮기지 않는다.
    expect(out).toEqual({
      topLeft: { x: -5, y: 3 },
      topRight: { x: -5, y: 3 },
      bottomRight: { x: -5, y: 3 },
      bottomLeft: { x: -5, y: 3 },
    });
  });

  test('canonical empty sentinel bounds는 Infinity/NaN corner 대신 transformed origin으로 축퇴한다', () => {
    const out = makeOriented();
    orientedTransformBoundsInto(
      out,
      { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 },
      {
        min: { x: Infinity, y: Infinity },
        max: { x: -Infinity, y: -Infinity },
      }
    );
    expect(out).toEqual({
      topLeft: { x: 10, y: 20 },
      topRight: { x: 10, y: 20 },
      bottomRight: { x: 10, y: 20 },
      bottomLeft: { x: 10, y: 20 },
    });
  });

  test('non-finite min을 가진 empty bounds는 부분 min corner가 아니라 transformed origin으로 축퇴한다', () => {
    const out = makeOriented();
    orientedTransformBoundsInto(
      out,
      { a: 1, b: 0, c: 0, d: 1, tx: -2, ty: 3 },
      {
        min: { x: 7, y: Infinity },
        max: { x: 8, y: 0 },
      }
    );
    expect(out).toEqual({
      topLeft: { x: -2, y: 3 },
      topRight: { x: -2, y: 3 },
      bottomRight: { x: -2, y: 3 },
      bottomLeft: { x: -2, y: 3 },
    });
  });

  test('tuple bounds input과 tuple corner를 처리한다', () => {
    const out: OrientedBoundsWritable<[number, number]> = {
      topLeft: [0, 0],
      topRight: [0, 0],
      bottomRight: [0, 0],
      bottomLeft: [0, 0],
    };
    orientedTransformBoundsInto(out, IDENTITY, [
      [1, 2],
      [4, 6],
    ]);
    expect(out.topLeft).toEqual([1, 2]);
    expect(out.bottomRight).toEqual([4, 6]);
  });

  test('out corner가 input bounds min과 aliasing되어도 안전하다', () => {
    const shared = { x: 1, y: 2 };
    const out: OrientedBoundsWritable = {
      topLeft: shared,
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    };
    orientedTransformBoundsInto(out, IDENTITY, { min: shared, max: { x: 4, y: 6 } });
    expect(out).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('NaN matrix component는 검증 없이 산술 결과를 기록한다', () => {
    const out = makeOriented();
    // 비어 있지 않은 bounds → 정상 경로에서 NaN 산술 결과 전파
    orientedTransformBoundsInto(
      out,
      { a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } }
    );
    expect(Number.isNaN((out.topRight as { x: number }).x)).toBe(true);
  });

  test('Infinity matrix component는 검증 없이 산술 결과를 기록한다', () => {
    const out = makeOriented();
    orientedTransformBoundsInto(
      out,
      { a: 1, b: 0, c: 0, d: Number.POSITIVE_INFINITY, tx: 0, ty: 0 },
      { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } }
    );
    // topLeft.y = d * minY = Infinity
    expect((out.topLeft as { y: number }).y).toBe(Number.POSITIVE_INFINITY);
  });
});

// ─── orientedTransformBounds (companion) ─────────────────────────────────────────

describe('matrix oriented output companion - orientedTransformBounds', () => {
  test('plain oriented bounds object를 반환한다', () => {
    expect(orientedTransformBounds(IDENTITY, { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } })).toEqual({
      topLeft: { x: 1, y: 2 },
      topRight: { x: 4, y: 2 },
      bottomRight: { x: 4, y: 6 },
      bottomLeft: { x: 1, y: 6 },
    });
  });

  test('companion 결과는 Into 결과와 일치한다', () => {
    const into = makeOriented();
    orientedTransformBoundsInto(into, ROTATE90, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } });
    expect(orientedTransformBounds(ROTATE90, { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } })).toEqual(into);
  });
});
