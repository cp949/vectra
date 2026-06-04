import { describe, expect, test } from 'vitest';
import { readX, readY } from '../../../src/internal/xy';
import { fromPoints } from '../../../src/matrix/from-points';
import { fromPointsInto } from '../../../src/matrix/from-points-into';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import type { MatrixWritable, XYInput } from '../../../src/types';

function makeMatrix(): MatrixWritable {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

/** matrix가 from[i]를 to[i]로 보내는지 transformPointInto로 검증한다. */
function expectMapsPoints(
  matrix: MatrixWritable,
  from: readonly [XYInput, XYInput, XYInput],
  to: readonly [XYInput, XYInput, XYInput]
): void {
  for (let i = 0; i < 3; i++) {
    const out = { x: 0, y: 0 };
    transformPointInto(out, matrix, from[i]);
    const target = to[i];
    expect(out.x).toBeCloseTo(readX(target), 10);
    expect(out.y).toBeCloseTo(readY(target), 10);
  }
}

// ─── fromPointsInto ────────────────────────────────────────────────────────────

describe('matrix factory - fromPointsInto', () => {
  test('3점 correspondence affine matrix를 기록하고 true를 반환한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    const ok = fromPointsInto(out, from, to);
    expect(ok).toBe(true);
    // unit 삼각형 → S(2, 3)
    expect(out).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expectMapsPoints(out, from, to);
  });

  test('rotation + translation correspondence를 복원한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 4, y: 5 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    // R(90°) + T(5, 5)
    expect(out.a).toBeCloseTo(0, 12);
    expect(out.b).toBeCloseTo(1, 12);
    expect(out.c).toBeCloseTo(-1, 12);
    expect(out.d).toBeCloseTo(0, 12);
    expect(out.tx).toBeCloseTo(5, 12);
    expect(out.ty).toBeCloseTo(5, 12);
    expectMapsPoints(out, from, to);
  });

  test('non-unit source 삼각형도 정확히 매핑한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 4 },
    ] as const;
    const to = [
      { x: 10, y: 20 },
      { x: 16, y: 20 },
      { x: 10, y: 5 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expectMapsPoints(out, from, to);
  });

  test('동일 from/to는 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const pts = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 4 },
    ] as const;
    expect(fromPointsInto(out, pts, pts)).toBe(true);
    expect(out.a).toBeCloseTo(1, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(out.c).toBeCloseTo(0, 12);
    expect(out.d).toBeCloseTo(1, 12);
    expect(out.tx).toBeCloseTo(0, 12);
    expect(out.ty).toBeCloseTo(0, 12);
  });

  test('tuple point input도 처리한다', () => {
    const out = makeMatrix();
    const from = [
      [0, 0],
      [1, 0],
      [0, 1],
    ] as const;
    const to = [
      [0, 0],
      [2, 0],
      [0, 3],
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expect(out).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
  });

  test('collinear source 점은 false를 반환하고 out을 수정하지 않는다', () => {
    const out: MatrixWritable = { a: 9, b: 9, c: 9, d: 9, tx: 9, ty: 9 };
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(false);
    expect(out).toEqual({ a: 9, b: 9, c: 9, d: 9, tx: 9, ty: 9 });
  });

  test('중복 source 점(degenerate)도 false를 반환한다', () => {
    const out: MatrixWritable = { a: 9, b: 9, c: 9, d: 9, tx: 9, ty: 9 };
    const from = [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 3 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(false);
    expect(out).toEqual({ a: 9, b: 9, c: 9, d: 9, tx: 9, ty: 9 });
  });

  test('NaN target은 검증 없이 산술 결과를 기록하고 true를 반환한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: Number.NaN, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expect(Number.isNaN(out.a)).toBe(true);
  });

  test('Infinity target은 검증 없이 산술 결과를 기록한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: Number.POSITIVE_INFINITY, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expect(out.a).toBe(Number.POSITIVE_INFINITY);
  });

  test('-Infinity target도 산술 결과를 기록한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: Number.NEGATIVE_INFINITY, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expect(out.a).toBe(Number.NEGATIVE_INFINITY);
  });

  test('NaN source 좌표는 det이 NaN(=== 0 false)이므로 산술 결과를 기록하고 true를 반환한다', () => {
    const out = makeMatrix();
    const from = [
      { x: Number.NaN, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    expect(Number.isNaN(out.a)).toBe(true);
  });

  test('Infinity source 좌표는 det이 Infinity(=== 0 false)이므로 산술 결과를 기록하고 true를 반환한다', () => {
    const out = makeMatrix();
    const from = [
      { x: 0, y: 0 },
      { x: Number.POSITIVE_INFINITY, y: 0 },
      { x: 0, y: 1 },
    ] as const;
    const to = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    expect(fromPointsInto(out, from, to)).toBe(true);
    // d = (-v1y*u2x + v2y*u1x) / det = (0 + 3*Infinity) / Infinity = Infinity/Infinity = NaN
    expect(Number.isNaN(out.d)).toBe(true);
  });

  test('generic Out 타입이 보존된다', () => {
    interface MyMatrix extends MatrixWritable {
      tag: string;
    }
    const out: MyMatrix = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'fp' };
    const result = fromPointsInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 3 },
      ]
    );
    expect(result).toBe(true);
    expect(out.tag).toBe('fp');
  });
});

// ─── fromPoints (companion) ─────────────────────────────────────────────────────

describe('matrix factory companion - fromPoints', () => {
  test('plain matrix object를 반환한다', () => {
    const result = fromPoints(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 3 },
      ]
    );
    expect(result).toEqual({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
  });

  test('companion 결과는 fromPointsInto 결과와 일치한다', () => {
    const from = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 4 },
    ] as const;
    const to = [
      { x: 10, y: 20 },
      { x: 16, y: 20 },
      { x: 10, y: 5 },
    ] as const;
    const into = makeMatrix();
    fromPointsInto(into, from, to);
    expect(fromPoints(from, to)).toEqual(into);
  });

  test('collinear source 점은 undefined를 반환한다', () => {
    const result = fromPoints(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]
    );
    expect(result).toBeUndefined();
  });
});
