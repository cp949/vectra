/**
 * 행렬의 점·벡터·사각형·경계 상자 변환과 출력 참조를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { transformBoundsInto } from '../../../src/matrix/transform-bounds-into';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import { transformRectInto } from '../../../src/matrix/transform-rect-into';
import { transformVectorInto } from '../../../src/matrix/transform-vector-into';
import type { BoundsWritable, Matrix, RectWritable } from '../../../src/types/flat-shapes.internal';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** 시험용 점 출력을 만든다. */
function makePt(): { x: number; y: number } {
  return { x: 0, y: 0 };
}

/** 시험용 사각형 출력을 만든다. */
function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

/** 시험용 경계 상자 출력을 만든다. */
function makeBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

/** 각도에 해당하는 회전 행렬을 만든다. */
function rotationMatrix(angle: number): Matrix {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 };
}

const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ─── transformPointInto ───────────────────────────────────────────────────────

describe('transformPointInto - translation/scale/rotation 적용', () => {
  test('translation을 포함하여 point를 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 7 };
    const out = makePt();
    const result = transformPointInto(out, m, { x: 2, y: 5 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(5, 12);
    expect(out.y).toBeCloseTo(12, 12);
  });

  test('scale matrix로 point를 변환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out = makePt();
    transformPointInto(out, m, { x: 4, y: 5 });
    expect(out.x).toBeCloseTo(8, 12);
    expect(out.y).toBeCloseTo(15, 12);
  });

  test('rotation matrix로 point를 변환한다', () => {
    const m = rotationMatrix(Math.PI / 2);
    const out = makePt();
    transformPointInto(out, m, { x: 1, y: 0 });
    // R(π/2): x' = cos(π/2)*1 + (-sin(π/2))*0 = 0, y' = sin(π/2)*1 + cos(π/2)*0 = 1
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('translation과 scale이 결합된 matrix로 변환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 };
    const out = makePt();
    transformPointInto(out, m, { x: 1, y: 2 });
    // x' = 2*1 + 0*2 + 10 = 12, y' = 0*1 + 3*2 + 20 = 26
    expect(out.x).toBeCloseTo(12, 12);
    expect(out.y).toBeCloseTo(26, 12);
  });
});

describe('transformPointInto - 점 입출력', () => {
  test('object input으로 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makePt();
    transformPointInto(out, m, { x: 3, y: 4 });
    expect(out.x).toBe(13);
    expect(out.y).toBe(24);
  });

  test('object output에 기록한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const out = makePt();
    transformPointInto(out, m, { x: 5, y: 6 });
    expect(out).toEqual({ x: 5, y: 6 });
  });
});

describe('transformPointInto - input-output self-aliasing', () => {
  test('object input-output self-aliasing이 안전하다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    const pt = { x: 4, y: 5 };
    transformPointInto(pt, m, pt);
    // x' = 2*4 + 0*5 + 1 = 9, y' = 0*4 + 3*5 + 2 = 17
    expect(pt.x).toBeCloseTo(9, 12);
    expect(pt.y).toBeCloseTo(17, 12);
  });
});

// ─── transformVectorInto ─────────────────────────────────────────────────────

describe('transformVectorInto - translation 무시', () => {
  test('translation을 무시하고 선형 변환만 적용한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 100, ty: 200 };
    const out = makePt();
    transformVectorInto(out, m, { x: 1, y: 1 });
    // x' = 2*1 + 0*1 = 2, y' = 0*1 + 3*1 = 3 (tx/ty 무시)
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(3, 12);
  });

  test('같은 matrix에서 transformPointInto와 결과가 다르다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
    const pt = makePt();
    const vec = makePt();
    transformPointInto(pt, m, { x: 1, y: 1 });
    transformVectorInto(vec, m, { x: 1, y: 1 });
    // point: (6, 11), vector: (1, 1)
    expect(pt.x).toBe(6);
    expect(pt.y).toBe(11);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(1);
  });

  test('rotation matrix로 vector를 변환한다', () => {
    const m = rotationMatrix(Math.PI / 2);
    const out = makePt();
    transformVectorInto(out, m, { x: 1, y: 0 });
    // x' = cos(π/2)*1 + (-sin(π/2))*0 = 0, y' = sin(π/2)*1 + cos(π/2)*0 = 1
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });
});

describe('transformVectorInto - 점 입출력', () => {
  test('object input으로 변환한다', () => {
    const m: Matrix = { a: 3, b: 0, c: 0, d: 2, tx: 99, ty: 99 };
    const out = makePt();
    transformVectorInto(out, m, { x: 2, y: 3 });
    expect(out.x).toBe(6);
    expect(out.y).toBe(6);
  });

  test('object output에 기록한다', () => {
    const out = makePt();
    transformVectorInto(out, identity, { x: 7, y: 8 });
    expect(out).toEqual({ x: 7, y: 8 });
  });
});

describe('transformVectorInto - input-output self-aliasing', () => {
  test('object input-output self-aliasing이 안전하다', () => {
    const m: Matrix = { a: 2, b: 1, c: 3, d: 4, tx: 99, ty: 99 };
    const vec = { x: 2, y: 3 };
    transformVectorInto(vec, m, vec);
    // x' = 2*2 + 3*3 = 4+9 = 13, y' = 1*2 + 4*3 = 2+12 = 14
    expect(vec.x).toBeCloseTo(13, 12);
    expect(vec.y).toBeCloseTo(14, 12);
  });
});

// ─── transformRectInto ────────────────────────────────────────────────────────

describe('transformRectInto - rotated rect AABB', () => {
  test('rotated rect가 transformed corner AABB로 기록된다', () => {
    // rect (x=1, y=2, width=3, height=4) → corners (1,2),(4,2),(1,6),(4,6)
    // R(π/2): a=0, b=1, c=-1, d=0
    // (1,2) → (-2, 1), (4,2) → (-2, 4), (1,6) → (-6, 1), (4,6) → (-6, 4)
    // AABB: x=-6, y=1, width=4, height=3
    const m = rotationMatrix(Math.PI / 2);
    const out = makeRect();
    const result = transformRectInto(out, m, { x: 1, y: 2, width: 3, height: 4 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(-6, 10);
    expect(out.y).toBeCloseTo(1, 10);
    expect(out.width).toBeCloseTo(4, 10);
    expect(out.height).toBeCloseTo(3, 10);
  });

  test('180도 회전한 rect가 AABB로 기록된다', () => {
    // R(π): a=-1, b=0, c=0, d=-1
    // rect (0, 0, 4, 3)
    // corners (0,0),(4,0),(0,3),(4,3)
    // 변환: (0,0)→(0,0), (4,0)→(-4,0), (0,3)→(0,-3), (4,3)→(-4,-3)
    // AABB: x=-4, y=-3, width=4, height=3
    const m = rotationMatrix(Math.PI);
    const out = makeRect();
    transformRectInto(out, m, { x: 0, y: 0, width: 4, height: 3 });
    expect(out.x).toBeCloseTo(-4, 10);
    expect(out.y).toBeCloseTo(-3, 10);
    expect(out.width).toBeCloseTo(4, 10);
    expect(out.height).toBeCloseTo(3, 10);
  });
});

describe('transformRectInto - 기본 변환', () => {
  test('identity matrix로 rect를 변환하면 같은 rect가 기록된다', () => {
    const out = makeRect();
    transformRectInto(out, identity, { x: 2, y: 3, width: 5, height: 7 });
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(3, 12);
    expect(out.width).toBeCloseTo(5, 12);
    expect(out.height).toBeCloseTo(7, 12);
  });

  test('translation으로 rect를 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makeRect();
    transformRectInto(out, m, { x: 1, y: 2, width: 3, height: 4 });
    expect(out.x).toBeCloseTo(11, 12);
    expect(out.y).toBeCloseTo(22, 12);
    expect(out.width).toBeCloseTo(3, 12);
    expect(out.height).toBeCloseTo(4, 12);
  });

  test('scale로 rect를 변환한다', () => {
    const m: Matrix = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out = makeRect();
    transformRectInto(out, m, { x: 1, y: 2, width: 4, height: 5 });
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(6, 12);
    expect(out.width).toBeCloseTo(8, 12);
    expect(out.height).toBeCloseTo(15, 12);
  });
});

describe('transformRectInto - empty/degenerate rect 정책', () => {
  test('width=0인 rect는 변환 후 width=0인 degenerate AABB가 된다', () => {
    // 점 rect: 모든 corner가 같은 x를 가짐
    const out = makeRect();
    transformRectInto(out, identity, { x: 3, y: 4, width: 0, height: 5 });
    expect(out.x).toBeCloseTo(3, 12);
    expect(out.y).toBeCloseTo(4, 12);
    expect(out.width).toBeCloseTo(0, 12);
    expect(out.height).toBeCloseTo(5, 12);
  });

  test('height=0인 rect는 변환 후 height=0인 degenerate AABB가 된다', () => {
    const out = makeRect();
    transformRectInto(out, identity, { x: 3, y: 4, width: 5, height: 0 });
    expect(out.x).toBeCloseTo(3, 12);
    expect(out.y).toBeCloseTo(4, 12);
    expect(out.width).toBeCloseTo(5, 12);
    expect(out.height).toBeCloseTo(0, 12);
  });

  test('width=0, height=0인 점 rect는 변환 후 점 AABB가 된다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
    const out = makeRect();
    transformRectInto(out, m, { x: 1, y: 2, width: 0, height: 0 });
    expect(out.x).toBeCloseTo(6, 12);
    expect(out.y).toBeCloseTo(12, 12);
    expect(out.width).toBeCloseTo(0, 12);
    expect(out.height).toBeCloseTo(0, 12);
  });
});

describe('transformRectInto - aliasing 및 generic type', () => {
  test('rect out self-aliasing이 안전하다', () => {
    const out: RectWritable = { x: 1, y: 2, width: 3, height: 4 };
    transformRectInto(out, identity, out);
    // identity로 변환: 원래 값 유지
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(2, 12);
    expect(out.width).toBeCloseTo(3, 12);
    expect(out.height).toBeCloseTo(4, 12);
  });
});

// ─── transformBoundsInto ──────────────────────────────────────────────────────

describe('transformBoundsInto - rotated bounds AABB', () => {
  test('rotated bounds가 transformed corner AABB로 기록된다', () => {
    // bounds min=(1,2), max=(4,6) → corners (1,2),(4,2),(1,6),(4,6)
    // R(π/2) 결과: AABB min=(-6,1), max=(-2,4)
    const m = rotationMatrix(Math.PI / 2);
    const out = makeBounds();
    const result = transformBoundsInto(out, m, {
      minX: 1,
      minY: 2,
      maxX: 4,
      maxY: 6,
    });
    expect(result).toBe(out);
    expect(out.minX).toBeCloseTo(-6, 10);
    expect(out.minY).toBeCloseTo(1, 10);
    expect(out.maxX).toBeCloseTo(-2, 10);
    expect(out.maxY).toBeCloseTo(4, 10);
  });

  test('180도 회전한 bounds가 AABB로 기록된다', () => {
    // bounds min=(0,0), max=(4,3)
    // R(π) 결과: min=(-4,-3), max=(0,0)
    const m = rotationMatrix(Math.PI);
    const out = makeBounds();
    transformBoundsInto(out, m, { minX: 0, minY: 0, maxX: 4, maxY: 3 });
    expect(out.minX).toBeCloseTo(-4, 10);
    expect(out.minY).toBeCloseTo(-3, 10);
    expect(out.maxX).toBeCloseTo(0, 10);
    expect(out.maxY).toBeCloseTo(0, 10);
  });
});

describe('transformBoundsInto - 기본 변환', () => {
  test('identity matrix로 bounds를 변환하면 같은 bounds가 기록된다', () => {
    const out = makeBounds();
    transformBoundsInto(out, identity, { minX: 2, minY: 3, maxX: 8, maxY: 11 });
    expect(out.minX).toBeCloseTo(2, 12);
    expect(out.minY).toBeCloseTo(3, 12);
    expect(out.maxX).toBeCloseTo(8, 12);
    expect(out.maxY).toBeCloseTo(11, 12);
  });

  test('translation으로 bounds를 변환한다', () => {
    const m: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
    const out = makeBounds();
    transformBoundsInto(out, m, { minX: 1, minY: 2, maxX: 4, maxY: 6 });
    expect(out.minX).toBeCloseTo(6, 12);
    expect(out.minY).toBeCloseTo(12, 12);
    expect(out.maxX).toBeCloseTo(9, 12);
    expect(out.maxY).toBeCloseTo(16, 12);
  });
});

describe('transformBoundsInto - empty sentinel 정책', () => {
  test('empty sentinel bounds (Infinity/-Infinity)는 변환 후 empty sentinel이 기록된다', () => {
    const m: Matrix = { a: 2, b: 1, c: 3, d: 4, tx: 5, ty: 6 };
    const out = makeBounds();
    transformBoundsInto(out, m, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    });
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
  });

  test('x축만 empty인 bounds도 sentinel이 기록된다', () => {
    const out = makeBounds();
    transformBoundsInto(out, identity, {
      minX: 5,
      minY: 0,
      maxX: 3,
      maxY: 10, // maxX < minX
    });
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
  });
});

test('transformBoundsInto는 입력과 같은 경계 상자에 회전 결과를 기록한다', () => {
  const bounds = { minX: 1, minY: 2, maxX: 4, maxY: 6 };
  const matrix = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
  expect(transformBoundsInto(bounds, matrix, bounds)).toBe(bounds);
  expect(bounds).toEqual({ minX: -6, minY: 1, maxX: -2, maxY: 4 });
});
