/*
 * reflection.test.ts
 *
 * reflectionInto / reflection: 원점 통과 축 반사 행렬 생성 검증
 */

import { describe, expect, test } from 'vitest';
import { identityInto } from '../../../src/matrix/identity-into';
import { multiplyInto } from '../../../src/matrix/multiply-into';
import { reflection } from '../../../src/matrix/reflection';
import { reflectionInto } from '../../../src/matrix/reflection-into';
import type { MatrixWritable } from '../../../src/types';

/** 테스트용 MatrixWritable 생성 helper */
function makeMatrix(): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

// ─── reflectionInto ───────────────────────────────────────────────────────────

describe('matrix factory - reflectionInto', () => {
  test('out을 반환한다', () => {
    const out = makeMatrix();
    const result = reflectionInto(out, 0);
    expect(result).toBe(out);
  });

  test('θ=0: x축 반사 행렬을 기록한다 (a=1, b=0, c=0, d=-1, tx=0, ty=0)', () => {
    const out = makeMatrix();
    reflectionInto(out, 0);
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(-1, 12);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('θ=0: (1,0) → (1,0), (0,1) → (0,-1) 반사', () => {
    const out = makeMatrix();
    reflectionInto(out, 0);
    // 점 (x, y)에 matrix 적용: x' = a*x + c*y + tx, y' = b*x + d*y + ty
    const x1 = out.a * 1 + out.c * 0 + out.tx;
    const y1 = out.b * 1 + out.d * 0 + out.ty;
    expect(x1).toBeCloseTo(1, 12);
    expect(y1).toBeCloseTo(0, 12);

    const x2 = out.a * 0 + out.c * 1 + out.tx;
    const y2 = out.b * 0 + out.d * 1 + out.ty;
    expect(x2).toBeCloseTo(0, 12);
    expect(y2).toBeCloseTo(-1, 12);
  });

  test('θ=π/2: y축 반사 (1,0) → (-1,0), (0,1) → (0,1)', () => {
    const out = makeMatrix();
    reflectionInto(out, Math.PI / 2);
    const x1 = out.a * 1 + out.c * 0 + out.tx;
    const y1 = out.b * 1 + out.d * 0 + out.ty;
    expect(x1).toBeCloseTo(-1, 12);
    expect(y1).toBeCloseTo(0, 12);

    const x2 = out.a * 0 + out.c * 1 + out.tx;
    const y2 = out.b * 0 + out.d * 1 + out.ty;
    expect(x2).toBeCloseTo(0, 12);
    expect(y2).toBeCloseTo(1, 12);
  });

  test('θ=π/4: y=x 반사 (1,0) → (0,1), (0,1) → (1,0)', () => {
    const out = makeMatrix();
    reflectionInto(out, Math.PI / 4);
    const x1 = out.a * 1 + out.c * 0 + out.tx;
    const y1 = out.b * 1 + out.d * 0 + out.ty;
    // cos(π/2) ≈ 0, sin(π/2) = 1
    expect(x1).toBeCloseTo(0, 12);
    expect(y1).toBeCloseTo(1, 12);

    const x2 = out.a * 0 + out.c * 1 + out.tx;
    const y2 = out.b * 0 + out.d * 1 + out.ty;
    expect(x2).toBeCloseTo(1, 12);
    expect(y2).toBeCloseTo(0, 12);
  });

  test('같은 각도로 두 번 반사하면 identity에 가깝다 (round-trip)', () => {
    const r = makeMatrix();
    const combined = makeMatrix();
    const identity = makeMatrix();
    identityInto(identity);

    reflectionInto(r, Math.PI / 6);
    multiplyInto(combined, r, r);

    expect(combined.a).toBeCloseTo(identity.a, 12);
    expect(combined.b).toBeCloseTo(identity.b, 12);
    expect(combined.c).toBeCloseTo(identity.c, 12);
    expect(combined.d).toBeCloseTo(identity.d, 12);
    expect(combined.tx).toBeCloseTo(identity.tx, 12);
    expect(combined.ty).toBeCloseTo(identity.ty, 12);
  });

  test('NaN axisAngle → component가 NaN이다 (pass-through)', () => {
    const out = makeMatrix();
    reflectionInto(out, Number.NaN);
    expect(Number.isNaN(out.a)).toBe(true);
    expect(Number.isNaN(out.b)).toBe(true);
    expect(Number.isNaN(out.c)).toBe(true);
    expect(Number.isNaN(out.d)).toBe(true);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('Infinity axisAngle → trig 결과는 NaN이다 (pass-through)', () => {
    const out = makeMatrix();
    reflectionInto(out, Number.POSITIVE_INFINITY);
    // Math.cos(Infinity) / Math.sin(Infinity) → NaN
    expect(Number.isNaN(out.a)).toBe(true);
    expect(Number.isNaN(out.b)).toBe(true);
    expect(Number.isNaN(out.c)).toBe(true);
    expect(Number.isNaN(out.d)).toBe(true);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'refl' };
    const result = reflectionInto(out, 0);
    expect(result).toBe(out);
    expect(result.tag).toBe('refl');
  });
});

// ─── reflection ───────────────────────────────────────────────────────────────

describe('matrix factory - reflection', () => {
  test('θ=0: x축 반사 행렬 object를 반환한다', () => {
    const result = reflection(0);
    expect(result.a).toBeCloseTo(1, 12);
    expect(result.b).toBeCloseTo(0, 12);
    expect(result.c).toBeCloseTo(0, 12);
    expect(result.d).toBeCloseTo(-1, 12);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });

  test('θ=π/4: y=x 반사 행렬 object를 반환한다', () => {
    const result = reflection(Math.PI / 4);
    // cos(π/2) ≈ 0, sin(π/2) = 1
    expect(result.a).toBeCloseTo(0, 12);
    expect(result.b).toBeCloseTo(1, 12);
    expect(result.c).toBeCloseTo(1, 12);
    expect(result.d).toBeCloseTo(0, 12);
  });

  test('reflectionInto와 동일한 component를 반환한다', () => {
    const out = makeMatrix();
    const angle = Math.PI / 3;
    reflectionInto(out, angle);
    const r = reflection(angle);
    expect(r.a).toBeCloseTo(out.a, 14);
    expect(r.b).toBeCloseTo(out.b, 14);
    expect(r.c).toBeCloseTo(out.c, 14);
    expect(r.d).toBeCloseTo(out.d, 14);
    expect(r.tx).toBe(out.tx);
    expect(r.ty).toBe(out.ty);
  });
});
