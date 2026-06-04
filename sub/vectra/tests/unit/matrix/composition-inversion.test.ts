import { describe, expect, test } from 'vitest';
import { appendRotateInto } from '../../../src/matrix/append-rotate-into';
import { appendScaleInto } from '../../../src/matrix/append-scale-into';
import { appendTranslateInto } from '../../../src/matrix/append-translate-into';
import { invertInto } from '../../../src/matrix/invert-into';
import { multiplyInto } from '../../../src/matrix/multiply-into';
import { preMultiplyInto } from '../../../src/matrix/pre-multiply-into';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { scalingMatrixInto } from '../../../src/matrix/scaling-matrix-into';
import { translationMatrixInto } from '../../../src/matrix/translation-matrix-into';
import type { MatrixWritable } from '../../../src/types';

function makeMatrix(): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

function makeIdentity(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

// matrix에 point를 직접 적용하는 helper (transformPointInto 미구현 시 인라인)
function applyPoint(m: MatrixWritable, x: number, y: number): [number, number] {
  return [m.a * x + m.c * y + m.tx, m.b * x + m.d * y + m.ty];
}

// ─── multiplyInto ─────────────────────────────────────────────────────────────

describe('matrix composition - multiplyInto', () => {
  test('out에 left * right를 기록하고 out을 반환한다', () => {
    // T(3,4) * S(2,3)
    const left = { a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 4 };
    const right = { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    const out = makeMatrix();
    const result = multiplyInto(out, left, right);
    expect(result).toBe(out);
    // T*S: a=1*2, b=0, c=0, d=1*3, tx=3*2+0, ty=4*3+0 → wait, let me compute properly
    // T(3,4) = {a:1,b:0,c:0,d:1,tx:3,ty:4}
    // S(2,3) = {a:2,b:0,c:0,d:3,tx:0,ty:0}
    // [T*S].a = T.a*S.a + T.c*S.b = 1*2+0*0 = 2
    // [T*S].b = T.b*S.a + T.d*S.b = 0*2+1*0 = 0
    // [T*S].c = T.a*S.c + T.c*S.d = 1*0+0*3 = 0
    // [T*S].d = T.b*S.c + T.d*S.d = 0*0+1*3 = 3
    // [T*S].tx = T.a*S.tx + T.c*S.ty + T.tx = 1*0+0*0+3 = 3
    // [T*S].ty = T.b*S.tx + T.d*S.ty + T.ty = 0*0+1*0+4 = 4
    expect(out).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 3, ty: 4 });
  });

  test('identity * M = M이다', () => {
    const m = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    const identity = makeIdentity();
    const out = makeMatrix();
    multiplyInto(out, identity, m);
    expect(out).toEqual(m);
  });

  test('M * identity = M이다', () => {
    const m = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    const identity = makeIdentity();
    const out = makeMatrix();
    multiplyInto(out, m, identity);
    expect(out).toEqual(m);
  });

  test('composition order: translation 후 scale과 scale 후 translation의 결과가 다르다', () => {
    const T = translationMatrixInto(makeMatrix(), { x: 5, y: 0 });
    const S = scalingMatrixInto(makeMatrix(), 2, 2);
    const ts = makeMatrix();
    const st = makeMatrix();
    // T*S: 먼저 scale, 나중에 translate
    multiplyInto(ts, T, S);
    // S*T: 먼저 translate, 나중에 scale
    multiplyInto(st, S, T);
    expect(ts).not.toEqual(st);
  });

  test('multiplyInto(m, left, right)로 만든 matrix에 point를 적용하면 right 먼저, left 나중에 적용된 결과와 같다', () => {
    // right = T(10, 0), left = S(2, 2)
    // point (1, 1)에 right 먼저: (1+10, 1) = (11, 1)
    // left 나중에 (S): (22, 2)
    const right = translationMatrixInto(makeMatrix(), { x: 10, y: 0 });
    const left = scalingMatrixInto(makeMatrix(), 2, 2);
    const combined = makeMatrix();
    multiplyInto(combined, left, right);

    const [rx, ry] = applyPoint(combined, 1, 1);
    expect(rx).toBeCloseTo(22, 10);
    expect(ry).toBeCloseTo(2, 10);
  });

  test('out self-aliasing: multiplyInto(out, out, right)', () => {
    const out: MatrixWritable = { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 };
    const right = { a: 3, b: 0, c: 0, d: 3, tx: 0, ty: 0 };
    // out * right = S(2)*S(3) composed with T(1,1)
    // out.a=2, out.b=0, out.c=0, out.d=2, out.tx=1, out.ty=1
    // [out*right].a = 2*3+0*0 = 6
    // [out*right].b = 0*3+2*0 = 0
    // [out*right].c = 2*0+0*3 = 0
    // [out*right].d = 0*0+2*3 = 6
    // [out*right].tx = 2*0+0*0+1 = 1
    // [out*right].ty = 0*0+2*0+1 = 1
    multiplyInto(out, out, right);
    expect(out).toEqual({ a: 6, b: 0, c: 0, d: 6, tx: 1, ty: 1 });
  });

  test('out self-aliasing: multiplyInto(out, left, out)', () => {
    const left = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    const out: MatrixWritable = { a: 3, b: 0, c: 0, d: 3, tx: 5, ty: 7 };
    // left * out
    // [left*out].a = 2*3+0*0 = 6
    // [left*out].b = 0*3+2*0 = 0
    // [left*out].c = 2*0+0*3 = 0
    // [left*out].d = 0*0+2*3 = 6
    // [left*out].tx = 2*5+0*7+0 = 10
    // [left*out].ty = 0*5+2*7+0 = 14
    multiplyInto(out, left, out);
    expect(out).toEqual({ a: 6, b: 0, c: 0, d: 6, tx: 10, ty: 14 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'mul' };
    const result = multiplyInto(out, makeIdentity(), makeIdentity());
    expect(result).toBe(out);
    expect(result.tag).toBe('mul');
  });
});

// ─── preMultiplyInto ─────────────────────────────────────────────────────────

describe('matrix composition - preMultiplyInto', () => {
  test('out에 left * matrix를 기록하고 out을 반환한다', () => {
    // matrix = S(2,3), left = T(5,0)
    // preMultiplyInto(out, matrix, left) = left * matrix = T(5,0) * S(2,3)
    const matrix = scalingMatrixInto(makeMatrix(), 2, 3);
    const left = translationMatrixInto(makeMatrix(), { x: 5, y: 0 });
    const out = makeMatrix();
    const result = preMultiplyInto(out, matrix, left);
    expect(result).toBe(out);

    // multiplyInto(ref, left, matrix)와 같아야 한다
    const ref = makeMatrix();
    multiplyInto(ref, left, matrix);
    expect(out).toEqual(ref);
  });

  test('preMultiplyInto(out, matrix, left) = multiplyInto(out, left, matrix)와 일치한다', () => {
    const matrix = { a: 2, b: 1, c: 3, d: 4, tx: 5, ty: 6 };
    const left = { a: 7, b: 8, c: 9, d: 10, tx: 11, ty: 12 };
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    preMultiplyInto(out1, matrix, left);
    multiplyInto(out2, left, matrix);
    expect(out1).toEqual(out2);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'pre' };
    const result = preMultiplyInto(out, makeIdentity(), makeIdentity());
    expect(result).toBe(out);
    expect(result.tag).toBe('pre');
  });
});

// ─── appendTranslateInto ────────────────────────────────────────────────────────────

describe('matrix composition - appendTranslateInto', () => {
  test('matrix * T(offset)를 out에 기록하고 out을 반환한다', () => {
    const m = makeIdentity();
    const out = makeMatrix();
    const result = appendTranslateInto(out, m, { x: 3, y: 7 });
    expect(result).toBe(out);
    // identity * T(3,7) = T(3,7)
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 3, ty: 7 });
  });

  test('tuple offset을 사용할 수 있다', () => {
    const m = makeIdentity();
    const out = makeMatrix();
    appendTranslateInto(out, m, [10, -5]);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -5 });
  });

  test('appendTranslateInto(out, M, offset)는 multiplyInto(out, M, T(offset))과 일치한다', () => {
    const m = { a: 2, b: 1, c: 0, d: 3, tx: 5, ty: 6 };
    const offset = { x: 4, y: -2 };
    const T = translationMatrixInto(makeMatrix(), offset);
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    appendTranslateInto(out1, m, offset);
    multiplyInto(out2, m, T);
    expect(out1).toEqual(out2);
  });

  test('scale matrix에 translation을 붙이면 composition order가 반영된다', () => {
    const S = scalingMatrixInto(makeMatrix(), 2, 2);
    const out = makeMatrix();
    appendTranslateInto(out, S, { x: 3, y: 0 });
    // S * T(3,0): point (0,0)에 적용하면 T 먼저 → (3,0), S 나중 → (6,0)
    // S*T 에 point (0,0) 적용 결과
    const [rx, ry] = applyPoint(out, 0, 0);
    expect(rx).toBeCloseTo(6, 10);
    expect(ry).toBeCloseTo(0, 10);
  });

  test('self-aliasing: appendTranslateInto(out, out, offset)', () => {
    const out: MatrixWritable = { a: 2, b: 0, c: 0, d: 2, tx: 1, ty: 1 };
    appendTranslateInto(out, out, { x: 3, y: 4 });
    // S(2,2) * T(3,4)
    // a=2*1+0*0=2, b=0, c=0, d=2, tx=2*3+0*4+1=7, ty=0*3+2*4+1=9
    expect(out).toEqual({ a: 2, b: 0, c: 0, d: 2, tx: 7, ty: 9 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'trl' };
    const result = appendTranslateInto(out, makeIdentity(), { x: 1, y: 2 });
    expect(result).toBe(out);
    expect(result.tag).toBe('trl');
  });
});

// ─── appendScaleInto ───────────────────────────────────────────────────────────────

describe('matrix composition - appendScaleInto', () => {
  test('matrix * S(sx, sy)를 out에 기록하고 out을 반환한다', () => {
    const m = makeIdentity();
    const out = makeMatrix();
    const result = appendScaleInto(out, m, 3, 4);
    expect(result).toBe(out);
    // identity * S(3,4) = S(3,4)
    expect(out).toEqual({ a: 3, b: 0, c: 0, d: 4, tx: 0, ty: 0 });
  });

  test('appendScaleInto(out, M, sx, sy)는 multiplyInto(out, M, S(sx, sy))과 일치한다', () => {
    const m = { a: 2, b: 1, c: 0, d: 3, tx: 5, ty: 6 };
    const S = scalingMatrixInto(makeMatrix(), 2, 3);
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    appendScaleInto(out1, m, 2, 3);
    multiplyInto(out2, m, S);
    expect(out1).toEqual(out2);
  });

  test('translation 후 scale과 scale 후 translation의 결과가 다르다', () => {
    const T = translationMatrixInto(makeMatrix(), { x: 5, y: 0 });
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    // T * S(2,2)
    appendScaleInto(out1, T, 2, 2);
    // S(2,2) * T(5,0)
    const S = scalingMatrixInto(makeMatrix(), 2, 2);
    appendTranslateInto(out2, S, { x: 5, y: 0 });
    expect(out1).not.toEqual(out2);
  });

  test('self-aliasing: appendScaleInto(out, out, sx, sy)', () => {
    const out: MatrixWritable = { a: 3, b: 0, c: 0, d: 3, tx: 6, ty: 9 };
    appendScaleInto(out, out, 2, 2);
    // S(3) * S(2): a=3*2=6, b=0, c=0, d=3*2=6, tx=3*0+0*0+6=6, ty=0*0+3*0+9=9
    // wait: out.a=3, out.b=0, out.c=0, out.d=3, out.tx=6, out.ty=9
    // S(2,2) matrix = {a:2,b:0,c:0,d:2,tx:0,ty:0}
    // result.a = 3*2+0*0 = 6
    // result.b = 0*2+3*0 = 0
    // result.c = 3*0+0*2 = 0
    // result.d = 0*0+3*2 = 6
    // result.tx = 3*0+0*0+6 = 6
    // result.ty = 0*0+3*0+9 = 9
    expect(out).toEqual({ a: 6, b: 0, c: 0, d: 6, tx: 6, ty: 9 });
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'scl' };
    const result = appendScaleInto(out, makeIdentity(), 2, 3);
    expect(result).toBe(out);
    expect(result.tag).toBe('scl');
  });
});

// ─── appendRotateInto ──────────────────────────────────────────────────────────────

describe('matrix composition - appendRotateInto', () => {
  test('matrix * R(angle)를 out에 기록하고 out을 반환한다', () => {
    const m = makeIdentity();
    const out = makeMatrix();
    const result = appendRotateInto(out, m, Math.PI / 2);
    expect(result).toBe(out);
    // identity * R(π/2) = R(π/2)
    const ref = rotationMatrixInto(makeMatrix(), Math.PI / 2);
    expect(out.a).toBeCloseTo(ref.a, 12);
    expect(out.b).toBeCloseTo(ref.b, 12);
    expect(out.c).toBeCloseTo(ref.c, 12);
    expect(out.d).toBeCloseTo(ref.d, 12);
    expect(out.tx).toBeCloseTo(ref.tx, 12);
    expect(out.ty).toBeCloseTo(ref.ty, 12);
  });

  test('appendRotateInto(out, M, angle)는 multiplyInto(out, M, R(angle))과 일치한다', () => {
    const m = { a: 2, b: 1, c: 0, d: 3, tx: 5, ty: 6 };
    const angle = Math.PI / 3;
    const R = rotationMatrixInto(makeMatrix(), angle);
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    appendRotateInto(out1, m, angle);
    multiplyInto(out2, m, R);
    expect(out1.a).toBeCloseTo(out2.a, 12);
    expect(out1.b).toBeCloseTo(out2.b, 12);
    expect(out1.c).toBeCloseTo(out2.c, 12);
    expect(out1.d).toBeCloseTo(out2.d, 12);
    expect(out1.tx).toBeCloseTo(out2.tx, 12);
    expect(out1.ty).toBeCloseTo(out2.ty, 12);
  });

  test('self-aliasing: appendRotateInto(out, out, angle)', () => {
    const out: MatrixWritable = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 0 };
    const angle = Math.PI / 2;
    appendRotateInto(out, out, angle);
    // identity * R(π/2) with tx=5
    // out = T(5,0) initially, then T(5,0) * R(π/2)
    // result.a = 1*cos + 0*sin = cos(π/2) ≈ 0
    // result.b = 0*cos + 1*sin = sin(π/2) = 1
    // result.c = 1*(-sin) + 0*cos = -1
    // result.d = 0*(-sin) + 1*cos = 0
    // result.tx = 1*0 + 0*0 + 5 = 5
    // result.ty = 0*0 + 1*0 + 0 = 0
    expect(out.a).toBeCloseTo(0, 12);
    expect(out.b).toBeCloseTo(1, 12);
    expect(out.c).toBeCloseTo(-1, 12);
    expect(out.d).toBeCloseTo(0, 12);
    expect(out.tx).toBeCloseTo(5, 12);
    expect(out.ty).toBeCloseTo(0, 12);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'rot' };
    const result = appendRotateInto(out, makeIdentity(), 0);
    expect(result).toBe(out);
    expect(result.tag).toBe('rot');
  });
});

// ─── invertInto ──────────────────────────────────────────────────────────────

describe('matrix composition - invertInto', () => {
  test('invertible matrix의 inverse를 out에 기록하고 true를 반환한다', () => {
    const m = { a: 2, b: 0, c: 0, d: 3, tx: 5, ty: 7 };
    const out = makeMatrix();
    const ok = invertInto(out, m);
    expect(ok).toBe(true);
    // S(2,3) T(5,7)의 inverse: S(1/2,1/3) T(-5/2,-7/3)
    // det = 2*3 = 6
    // a' = d/det = 3/6 = 0.5
    // b' = -b/det = 0
    // c' = -c/det = 0
    // d' = a/det = 2/6 ≈ 0.333...
    // tx' = (c*ty - d*tx)/det = (0*7 - 3*5)/6 = -15/6 = -2.5
    // ty' = (b*tx - a*ty)/det = (0*5 - 2*7)/6 = -14/6 ≈ -2.333...
    expect(out.a).toBeCloseTo(0.5, 10);
    expect(out.b).toBeCloseTo(0, 10);
    expect(out.c).toBeCloseTo(0, 10);
    expect(out.d).toBeCloseTo(1 / 3, 10);
    expect(out.tx).toBeCloseTo(-2.5, 10);
    expect(out.ty).toBeCloseTo(-7 / 3, 10);
  });

  test('identity의 inverse는 identity이다', () => {
    const out = makeMatrix();
    const ok = invertInto(out, makeIdentity());
    expect(ok).toBe(true);
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(1, 12);
    expect(out.tx).toBeCloseTo(0, 12);
    expect(out.ty).toBeCloseTo(0, 12);
  });

  test('singular matrix(det === 0)에서 false를 반환하고 out을 수정하지 않는다', () => {
    const singular = { a: 1, b: 2, c: 3, d: 6, tx: 0, ty: 0 }; // det = 1*6 - 2*3 = 0
    const out: MatrixWritable = { a: 9, b: 8, c: 7, d: 6, tx: 5, ty: 4 };
    const ok = invertInto(out, singular);
    expect(ok).toBe(false);
    // out이 수정되지 않아야 한다
    expect(out).toEqual({ a: 9, b: 8, c: 7, d: 6, tx: 5, ty: 4 });
  });

  test('zero matrix(det === 0)에서 false를 반환하고 out을 수정하지 않는다', () => {
    const out: MatrixWritable = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const ok = invertInto(out, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(ok).toBe(false);
    expect(out).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('inverse와 원본을 곱하면 identity에 near-equal이다', () => {
    const m = { a: 3, b: 1, c: 2, d: 4, tx: 5, ty: 6 };
    const inv = makeMatrix();
    expect(invertInto(inv, m)).toBe(true);
    const product = makeMatrix();
    multiplyInto(product, m, inv);
    // M * M^-1 should be near identity
    expect(product.a).toBeCloseTo(1, 10);
    expect(product.b).toBeCloseTo(0, 10);
    expect(product.c).toBeCloseTo(0, 10);
    expect(product.d).toBeCloseTo(1, 10);
    expect(product.tx).toBeCloseTo(0, 10);
    expect(product.ty).toBeCloseTo(0, 10);
  });

  test('inv * 원본을 곱해도 identity에 near-equal이다', () => {
    const m = { a: 3, b: 1, c: 2, d: 4, tx: 5, ty: 6 };
    const inv = makeMatrix();
    expect(invertInto(inv, m)).toBe(true);
    const product = makeMatrix();
    multiplyInto(product, inv, m);
    expect(product.a).toBeCloseTo(1, 10);
    expect(product.b).toBeCloseTo(0, 10);
    expect(product.c).toBeCloseTo(0, 10);
    expect(product.d).toBeCloseTo(1, 10);
    expect(product.tx).toBeCloseTo(0, 10);
    expect(product.ty).toBeCloseTo(0, 10);
  });

  test('out self-aliasing: invertInto(out, out)', () => {
    const out: MatrixWritable = { a: 2, b: 0, c: 0, d: 3, tx: 5, ty: 7 };
    const ok = invertInto(out, out);
    expect(ok).toBe(true);
    expect(out.a).toBeCloseTo(0.5, 10);
    expect(out.b).toBeCloseTo(0, 10);
    expect(out.c).toBeCloseTo(0, 10);
    expect(out.d).toBeCloseTo(1 / 3, 10);
    expect(out.tx).toBeCloseTo(-2.5, 10);
    expect(out.ty).toBeCloseTo(-7 / 3, 10);
  });

  test('rotation matrix의 inverse는 transpose이다', () => {
    const angle = Math.PI / 6;
    const R = rotationMatrixInto(makeMatrix(), angle);
    const Rinv = makeMatrix();
    expect(invertInto(Rinv, R)).toBe(true);
    const Rt = rotationMatrixInto(makeMatrix(), -angle);
    expect(Rinv.a).toBeCloseTo(Rt.a, 10);
    expect(Rinv.b).toBeCloseTo(Rt.b, 10);
    expect(Rinv.c).toBeCloseTo(Rt.c, 10);
    expect(Rinv.d).toBeCloseTo(Rt.d, 10);
    expect(Rinv.tx).toBeCloseTo(Rt.tx, 10);
    expect(Rinv.ty).toBeCloseTo(Rt.ty, 10);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'inv' };
    const ok = invertInto(out, makeIdentity());
    expect(ok).toBe(true);
    expect(out.tag).toBe('inv');
  });
});
