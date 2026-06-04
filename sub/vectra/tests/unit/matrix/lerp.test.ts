/*
 * lerp.test.ts
 *
 * lerpInto / lerp: matrix component-wise 선형 보간 검증
 */

import { describe, expect, test } from 'vitest';
import { lerp } from '../../../src/matrix/lerp';
import { lerpInto } from '../../../src/matrix/lerp-into';
import type { MatrixWritable } from '../../../src/types';

/** 테스트용 MatrixWritable 생성 helper */
function makeMatrix(): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

const matA = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
const matB = { a: 7, b: 8, c: 9, d: 10, tx: 11, ty: 12 };

// ─── lerpInto ────────────────────────────────────────────────────────────────

describe('matrix operator - lerpInto', () => {
  test('out을 반환한다', () => {
    const out = makeMatrix();
    const result = lerpInto(out, matA, matB, 0);
    expect(result).toBe(out);
  });

  test('t=0이면 a와 같은 component를 기록한다', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, 0);
    expect(out.a).toBe(matA.a);
    expect(out.b).toBe(matA.b);
    expect(out.c).toBe(matA.c);
    expect(out.d).toBe(matA.d);
    expect(out.tx).toBe(matA.tx);
    expect(out.ty).toBe(matA.ty);
  });

  test('t=1이면 b와 같은 component를 기록한다', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, 1);
    expect(out.a).toBe(matB.a);
    expect(out.b).toBe(matB.b);
    expect(out.c).toBe(matB.c);
    expect(out.d).toBe(matB.d);
    expect(out.tx).toBe(matB.tx);
    expect(out.ty).toBe(matB.ty);
  });

  test('t=0.5이면 midpoint component를 기록한다', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, 0.5);
    expect(out.a).toBeCloseTo((matA.a + matB.a) / 2, 14);
    expect(out.b).toBeCloseTo((matA.b + matB.b) / 2, 14);
    expect(out.c).toBeCloseTo((matA.c + matB.c) / 2, 14);
    expect(out.d).toBeCloseTo((matA.d + matB.d) / 2, 14);
    expect(out.tx).toBeCloseTo((matA.tx + matB.tx) / 2, 14);
    expect(out.ty).toBeCloseTo((matA.ty + matB.ty) / 2, 14);
  });

  test('t=2이면 extrapolation 결과를 기록한다 (clamp 없음)', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, 2);
    // a + 2*(b - a) = 2b - a
    expect(out.a).toBeCloseTo(2 * matB.a - matA.a, 14);
    expect(out.b).toBeCloseTo(2 * matB.b - matA.b, 14);
    expect(out.c).toBeCloseTo(2 * matB.c - matA.c, 14);
    expect(out.d).toBeCloseTo(2 * matB.d - matA.d, 14);
    expect(out.tx).toBeCloseTo(2 * matB.tx - matA.tx, 14);
    expect(out.ty).toBeCloseTo(2 * matB.ty - matA.ty, 14);
  });

  test('t=-1이면 역방향 extrapolation 결과를 기록한다', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, -1);
    // a + (-1)*(b - a) = 2a - b
    expect(out.a).toBeCloseTo(2 * matA.a - matB.a, 14);
    expect(out.tx).toBeCloseTo(2 * matA.tx - matB.tx, 14);
  });

  test('tuple input a를 처리한다', () => {
    const out = makeMatrix();
    const aTuple = [1, 2, 3, 4, 5, 6] as const;
    lerpInto(out, aTuple, matB, 0);
    expect(out.a).toBe(1);
    expect(out.b).toBe(2);
    expect(out.c).toBe(3);
    expect(out.d).toBe(4);
    expect(out.tx).toBe(5);
    expect(out.ty).toBe(6);
  });

  test('tuple input b를 처리한다', () => {
    const out = makeMatrix();
    const bTuple = [7, 8, 9, 10, 11, 12] as const;
    lerpInto(out, matA, bTuple, 1);
    expect(out.a).toBe(7);
    expect(out.b).toBe(8);
    expect(out.c).toBe(9);
    expect(out.d).toBe(10);
    expect(out.tx).toBe(11);
    expect(out.ty).toBe(12);
  });

  test('NaN t → component가 NaN이다 (pass-through)', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matB, Number.NaN);
    expect(Number.isNaN(out.a)).toBe(true);
    expect(Number.isNaN(out.tx)).toBe(true);
  });

  test('a === b이면 t에 관계없이 a와 같은 component를 기록한다', () => {
    const out = makeMatrix();
    lerpInto(out, matA, matA, 0.7);
    expect(out.a).toBe(matA.a);
    expect(out.b).toBe(matA.b);
    expect(out.tx).toBe(matA.tx);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'lerp' };
    const result = lerpInto(out, matA, matB, 0.5);
    expect(result).toBe(out);
    expect(result.tag).toBe('lerp');
  });
});

// ─── lerp ────────────────────────────────────────────────────────────────────

describe('matrix operator - lerp', () => {
  test('t=0이면 a와 같은 component를 반환한다', () => {
    const result = lerp(matA, matB, 0);
    expect(result.a).toBe(matA.a);
    expect(result.tx).toBe(matA.tx);
  });

  test('t=1이면 b와 같은 component를 반환한다', () => {
    const result = lerp(matA, matB, 1);
    expect(result.a).toBe(matB.a);
    expect(result.tx).toBe(matB.tx);
  });

  test('t=0.5이면 midpoint를 반환한다', () => {
    const result = lerp(matA, matB, 0.5);
    expect(result.a).toBeCloseTo((matA.a + matB.a) / 2, 14);
    expect(result.d).toBeCloseTo((matA.d + matB.d) / 2, 14);
  });

  test('lerpInto와 동일한 component를 반환한다', () => {
    const out = makeMatrix();
    const t = 0.3;
    lerpInto(out, matA, matB, t);
    const r = lerp(matA, matB, t);
    expect(r.a).toBeCloseTo(out.a, 14);
    expect(r.b).toBeCloseTo(out.b, 14);
    expect(r.c).toBeCloseTo(out.c, 14);
    expect(r.d).toBeCloseTo(out.d, 14);
    expect(r.tx).toBeCloseTo(out.tx, 14);
    expect(r.ty).toBeCloseTo(out.ty, 14);
  });
});
