import { describe, expect, test } from 'vitest';
import { transformBoundsInto } from '../../../src/matrix/transform-bounds-into';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import { transformRectInto } from '../../../src/matrix/transform-rect-into';
import { transformVectorInto } from '../../../src/matrix/transform-vector-into';
import type { BoundsWritable, MatrixLike, RectWritable, XYTupleWritable } from '../../../src/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makePt(): { x: number; y: number } {
  return { x: 0, y: 0 };
}

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

// 회전 matrix 생성 helper
function rotationMatrix(angle: number): MatrixLike {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 };
}

const identity: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

// ─── transformPointInto ───────────────────────────────────────────────────────

describe('transformPointInto - translation/scale/rotation 적용', () => {
  test('translation을 포함하여 point를 변환한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 7 };
    const out = makePt();
    const result = transformPointInto(out, m, { x: 2, y: 5 });
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(5, 12);
    expect(out.y).toBeCloseTo(12, 12);
  });

  test('scale matrix로 point를 변환한다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
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
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 20 };
    const out = makePt();
    transformPointInto(out, m, { x: 1, y: 2 });
    // x' = 2*1 + 0*2 + 10 = 12, y' = 0*1 + 3*2 + 20 = 26
    expect(out.x).toBeCloseTo(12, 12);
    expect(out.y).toBeCloseTo(26, 12);
  });
});

describe('transformPointInto - object/tuple input/output', () => {
  test('object input으로 변환한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makePt();
    transformPointInto(out, m, { x: 3, y: 4 });
    expect(out.x).toBe(13);
    expect(out.y).toBe(24);
  });

  test('tuple input으로 변환한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makePt();
    transformPointInto(out, m, [3, 4]);
    expect(out.x).toBe(13);
    expect(out.y).toBe(24);
  });

  test('object output에 기록한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const out = makePt();
    transformPointInto(out, m, { x: 5, y: 6 });
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('tuple output에 기록한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 1, ty: 2 };
    const out: XYTupleWritable = [0, 0];
    transformPointInto(out, m, { x: 3, y: 4 });
    expect(out[0]).toBe(4);
    expect(out[1]).toBe(6);
  });

  test('tuple matrix input으로 point를 변환한다', () => {
    const m: MatrixLike = [2, 3, 4, 5, 6, 7];
    const out = makePt();
    transformPointInto(out, m, { x: 1, y: 2 });
    expect(out.x).toBe(16);
    expect(out.y).toBe(20);
  });
});

describe('transformPointInto - input-output self-aliasing', () => {
  test('object input-output self-aliasing이 안전하다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 1, ty: 2 };
    const pt = { x: 4, y: 5 };
    transformPointInto(pt, m, pt);
    // x' = 2*4 + 0*5 + 1 = 9, y' = 0*4 + 3*5 + 2 = 17
    expect(pt.x).toBeCloseTo(9, 12);
    expect(pt.y).toBeCloseTo(17, 12);
  });

  test('tuple input-output self-aliasing이 안전하다', () => {
    const m: MatrixLike = { a: 2, b: 1, c: 3, d: 4, tx: 5, ty: 6 };
    const pt: XYTupleWritable = [2, 3];
    transformPointInto(pt, m, pt);
    // x' = 2*2 + 3*3 + 5 = 4+9+5 = 18, y' = 1*2 + 4*3 + 6 = 2+12+6 = 20
    expect(pt[0]).toBeCloseTo(18, 12);
    expect(pt[1]).toBeCloseTo(20, 12);
  });
});

describe('transformPointInto - generic return type 보존', () => {
  test('XYTupleWritable output에서 generic Out이 보존된다', () => {
    const m = identity;
    const out: XYTupleWritable = [0, 0];
    const result = transformPointInto(out, m, { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(Array.isArray(result)).toBe(true);
  });

  test('custom object output에서 generic Out이 보존된다', () => {
    const out = { x: 0, y: 0, tag: 'pt' };
    const result = transformPointInto(out, identity, { x: 3, y: 4 });
    expect(result).toBe(out);
    expect(result.tag).toBe('pt');
  });
});

// ─── transformVectorInto ─────────────────────────────────────────────────────

describe('transformVectorInto - translation 무시', () => {
  test('translation을 무시하고 선형 변환만 적용한다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 100, ty: 200 };
    const out = makePt();
    transformVectorInto(out, m, { x: 1, y: 1 });
    // x' = 2*1 + 0*1 = 2, y' = 0*1 + 3*1 = 3 (tx/ty 무시)
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(3, 12);
  });

  test('같은 matrix에서 transformPointInto와 결과가 다르다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
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

describe('transformVectorInto - object/tuple input/output', () => {
  test('object input으로 변환한다', () => {
    const m: MatrixLike = { a: 3, b: 0, c: 0, d: 2, tx: 99, ty: 99 };
    const out = makePt();
    transformVectorInto(out, m, { x: 2, y: 3 });
    expect(out.x).toBe(6);
    expect(out.y).toBe(6);
  });

  test('tuple input으로 변환한다', () => {
    const m: MatrixLike = { a: 3, b: 0, c: 0, d: 2, tx: 99, ty: 99 };
    const out = makePt();
    transformVectorInto(out, m, [2, 3]);
    expect(out.x).toBe(6);
    expect(out.y).toBe(6);
  });

  test('object output에 기록한다', () => {
    const out = makePt();
    transformVectorInto(out, identity, { x: 7, y: 8 });
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('tuple output에 기록한다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 99, ty: 99 };
    const out: XYTupleWritable = [0, 0];
    transformVectorInto(out, m, [3, 4]);
    expect(out[0]).toBe(6);
    expect(out[1]).toBe(8);
  });
});

describe('transformVectorInto - input-output self-aliasing', () => {
  test('object input-output self-aliasing이 안전하다', () => {
    const m: MatrixLike = { a: 2, b: 1, c: 3, d: 4, tx: 99, ty: 99 };
    const vec = { x: 2, y: 3 };
    transformVectorInto(vec, m, vec);
    // x' = 2*2 + 3*3 = 4+9 = 13, y' = 1*2 + 4*3 = 2+12 = 14
    expect(vec.x).toBeCloseTo(13, 12);
    expect(vec.y).toBeCloseTo(14, 12);
  });
});

describe('transformVectorInto - generic return type 보존', () => {
  test('XYTupleWritable output에서 generic Out이 보존된다', () => {
    const out: XYTupleWritable = [0, 0];
    const result = transformVectorInto(out, identity, { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(Array.isArray(result)).toBe(true);
  });

  test('custom object output에서 generic Out이 보존된다', () => {
    const out = { x: 0, y: 0, tag: 'vec' };
    const result = transformVectorInto(out, identity, { x: 5, y: 6 });
    expect(result).toBe(out);
    expect(result.tag).toBe('vec');
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

  test('tuple rect를 변환한다', () => {
    const out = makeRect();
    transformRectInto(out, identity, [2, 3, 5, 7]);
    expect(out.x).toBeCloseTo(2, 12);
    expect(out.y).toBeCloseTo(3, 12);
    expect(out.width).toBeCloseTo(5, 12);
    expect(out.height).toBeCloseTo(7, 12);
  });

  test('translation으로 rect를 변환한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const out = makeRect();
    transformRectInto(out, m, { x: 1, y: 2, width: 3, height: 4 });
    expect(out.x).toBeCloseTo(11, 12);
    expect(out.y).toBeCloseTo(22, 12);
    expect(out.width).toBeCloseTo(3, 12);
    expect(out.height).toBeCloseTo(4, 12);
  });

  test('scale로 rect를 변환한다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
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
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
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

  test('generic Out 타입이 보존된다', () => {
    const out = { x: 0, y: 0, width: 0, height: 0, tag: 'rect' };
    const result = transformRectInto(out, identity, { x: 1, y: 2, width: 3, height: 4 });
    expect(result).toBe(out);
    expect(result.tag).toBe('rect');
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
      min: { x: 1, y: 2 },
      max: { x: 4, y: 6 },
    });
    expect(result).toBe(out);
    expect(out.min.x).toBeCloseTo(-6, 10);
    expect(out.min.y).toBeCloseTo(1, 10);
    expect(out.max.x).toBeCloseTo(-2, 10);
    expect(out.max.y).toBeCloseTo(4, 10);
  });

  test('180도 회전한 bounds가 AABB로 기록된다', () => {
    // bounds min=(0,0), max=(4,3)
    // R(π) 결과: min=(-4,-3), max=(0,0)
    const m = rotationMatrix(Math.PI);
    const out = makeBounds();
    transformBoundsInto(out, m, { min: { x: 0, y: 0 }, max: { x: 4, y: 3 } });
    expect(out.min.x).toBeCloseTo(-4, 10);
    expect(out.min.y).toBeCloseTo(-3, 10);
    expect(out.max.x).toBeCloseTo(0, 10);
    expect(out.max.y).toBeCloseTo(0, 10);
  });
});

describe('transformBoundsInto - 기본 변환', () => {
  test('identity matrix로 bounds를 변환하면 같은 bounds가 기록된다', () => {
    const out = makeBounds();
    transformBoundsInto(out, identity, { min: { x: 2, y: 3 }, max: { x: 8, y: 11 } });
    expect(out.min.x).toBeCloseTo(2, 12);
    expect(out.min.y).toBeCloseTo(3, 12);
    expect(out.max.x).toBeCloseTo(8, 12);
    expect(out.max.y).toBeCloseTo(11, 12);
  });

  test('translation으로 bounds를 변환한다', () => {
    const m: MatrixLike = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 10 };
    const out = makeBounds();
    transformBoundsInto(out, m, { min: { x: 1, y: 2 }, max: { x: 4, y: 6 } });
    expect(out.min.x).toBeCloseTo(6, 12);
    expect(out.min.y).toBeCloseTo(12, 12);
    expect(out.max.x).toBeCloseTo(9, 12);
    expect(out.max.y).toBeCloseTo(16, 12);
  });

  test('tuple min/max input으로 bounds를 변환한다', () => {
    const m: MatrixLike = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    const out = makeBounds();
    transformBoundsInto(out, m, { min: [1, 2], max: [3, 4] });
    expect(out.min.x).toBeCloseTo(2, 12);
    expect(out.min.y).toBeCloseTo(4, 12);
    expect(out.max.x).toBeCloseTo(6, 12);
    expect(out.max.y).toBeCloseTo(8, 12);
  });
});

describe('transformBoundsInto - empty sentinel 정책', () => {
  test('empty sentinel bounds (Infinity/-Infinity)는 변환 후 empty sentinel이 기록된다', () => {
    const m: MatrixLike = { a: 2, b: 1, c: 3, d: 4, tx: 5, ty: 6 };
    const out = makeBounds();
    transformBoundsInto(out, m, {
      min: { x: Infinity, y: Infinity },
      max: { x: -Infinity, y: -Infinity },
    });
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });

  test('x축만 empty인 bounds도 sentinel이 기록된다', () => {
    const out = makeBounds();
    transformBoundsInto(out, identity, {
      min: { x: 5, y: 0 },
      max: { x: 3, y: 10 }, // maxX < minX
    });
    expect(out.min.x).toBe(Infinity);
    expect(out.min.y).toBe(Infinity);
    expect(out.max.x).toBe(-Infinity);
    expect(out.max.y).toBe(-Infinity);
  });
});

describe('transformBoundsInto - aliasing 및 generic type', () => {
  test('bounds out self-aliasing이 안전하다', () => {
    // out.min / out.max가 input bounds.min / bounds.max와 같은 객체일 때
    const minPt = { x: 1, y: 2 };
    const maxPt = { x: 4, y: 6 };
    const out: BoundsWritable = { min: minPt, max: maxPt };
    // out을 input으로도 전달
    transformBoundsInto(out, identity, out);
    expect(out.min.x).toBeCloseTo(1, 12);
    expect(out.min.y).toBeCloseTo(2, 12);
    expect(out.max.x).toBeCloseTo(4, 12);
    expect(out.max.y).toBeCloseTo(6, 12);
  });

  test('generic Out 타입이 보존된다', () => {
    const out = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, tag: 'bounds' };
    const result = transformBoundsInto(out, identity, {
      min: { x: 1, y: 2 },
      max: { x: 3, y: 4 },
    });
    expect(result).toBe(out);
    expect(result.tag).toBe('bounds');
  });
});
