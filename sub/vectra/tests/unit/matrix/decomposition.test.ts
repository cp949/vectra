import { describe, expect, test } from 'vitest';
import { decompose } from '../../../src/matrix/decompose';
import { decomposeInto } from '../../../src/matrix/decompose-into';
import { matrixCompose } from '../../../src/matrix/matrix-compose';
import { matrixComposeInto } from '../../../src/matrix/matrix-compose-into';
import { multiply } from '../../../src/matrix/multiply';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { scalingMatrixInto } from '../../../src/matrix/scaling-matrix-into';
import type { MatrixDecompositionWritable, MatrixLike, MatrixWritable, XYTupleWritable } from '../../../src/types';
import { compose, expectMatrixClose, makeDecomp, makeMatrix } from './_decomposition-test-helpers';

// ─── decompose / decomposeInto ────────────────────────────────────────────────

describe('decomposeInto - 표준 케이스', () => {
  test('identity matrix를 분해한다', () => {
    const out = makeDecomp();
    const result = decomposeInto(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result).toBe(out);
    expect(out.translation).toEqual({ x: 0, y: 0 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('pure translation을 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 7 });
    expect(out.translation).toEqual({ x: 5, y: 7 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('pure positive scaling을 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 });
    expect(out.translation).toEqual({ x: 0, y: 0 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBeCloseTo(2, 12);
    expect(out.scaling.y).toBeCloseTo(3, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('pure rotation π/2를 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 });
    expect(out.translation).toEqual({ x: 0, y: 0 });
    expect(out.rotation).toBeCloseTo(Math.PI / 2, 12);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing.x).toBeCloseTo(0, 12);
    expect(out.skewing.y).toBe(0);
  });

  test('pure rotation π를 분해한다 (atan2(-0, -1) 경계 정규화)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: -1, b: 0, c: 0, d: -1, tx: 0, ty: 0 });
    // atan2(0, -1) === π. 정규화 케이스. -0이어도 정규화로 π를 반환해야 한다.
    expect(out.rotation).toBe(Math.PI);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing.x).toBeCloseTo(0, 12);
    expect(out.skewing.y).toBe(0);
  });

  test('pure rotation -π/2를 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: -1, c: 1, d: 0, tx: 0, ty: 0 });
    expect(out.rotation).toBeCloseTo(-Math.PI / 2, 12);
  });

  test('skewX(π/4)를 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing.x).toBeCloseTo(Math.PI / 4, 12);
    expect(out.skewing.y).toBe(0);
  });

  test('reflection x축 (det < 0)을 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 1, b: 0, c: 0, d: -1, tx: 0, ty: 0 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(-1, 12);
    expect(out.skewing.x).toBeCloseTo(0, 12);
    expect(out.skewing.y).toBe(0);
  });

  test('reflection y축을 분해한다 (rotation π + scaling.y -1)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out.rotation).toBe(Math.PI);
    expect(out.scaling.x).toBeCloseTo(1, 12);
    expect(out.scaling.y).toBeCloseTo(-1, 12);
  });

  test('rotation π/4 + scale (2,3) + translation (10,20) composite를 분해한다', () => {
    // a=2cos(π/4), b=2sin(π/4), c=-3sin(π/4), d=3cos(π/4)
    const c45 = Math.cos(Math.PI / 4);
    const s45 = Math.sin(Math.PI / 4);
    const out = makeDecomp();
    decomposeInto(out, {
      a: 2 * c45,
      b: 2 * s45,
      c: -3 * s45,
      d: 3 * c45,
      tx: 10,
      ty: 20,
    });
    expect(out.translation).toEqual({ x: 10, y: 20 });
    expect(out.rotation).toBeCloseTo(Math.PI / 4, 12);
    expect(out.scaling.x).toBeCloseTo(2, 12);
    expect(out.scaling.y).toBeCloseTo(3, 12);
    expect(out.skewing.x).toBeCloseTo(0, 12);
    expect(out.skewing.y).toBe(0);
  });
});

describe('decomposeInto - singular / fallback 분기', () => {
  test('x-basis가 0이고 y-basis=(1,0)인 singular matrix (case 2)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: 1, d: 0, tx: 0, ty: 0 });
    // y-basis (1,0). atan2(-1, 0) = -π/2.
    expect(out.rotation).toBeCloseTo(-Math.PI / 2, 12);
    expect(out.scaling.x).toBe(0);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('x-basis가 0이고 y-basis=(0,1)인 singular matrix (case 2)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    // atan2(-0, 1) = 0.
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBe(0);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('x-basis가 0이고 y-basis=(0,-1)인 singular matrix (atan2 -π → π 정규화)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: 0, d: -1, tx: 0, ty: 0 });
    // atan2(-0, -1) = -π. 정규화로 π.
    expect(out.rotation).toBe(Math.PI);
    expect(out.scaling.x).toBe(0);
    expect(out.scaling.y).toBeCloseTo(1, 12);
  });

  test('x-basis 제곱합이 underflow되면 y-basis fallback으로 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: Number.MIN_VALUE, b: 0, c: 1, d: 0, tx: 0, ty: 0 });
    expect(out.rotation).toBeCloseTo(-Math.PI / 2, 12);
    expect(out.scaling.x).toBe(0);
    expect(out.scaling.y).toBeCloseTo(1, 12);
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('y-basis 제곱합도 underflow되면 zero branch로 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: Number.MIN_VALUE, d: 0, tx: 5, ty: 7 });
    expect(out.translation).toEqual({ x: 5, y: 7 });
    expect(out.rotation).toBe(0);
    expect(out.scaling).toEqual({ x: 0, y: 0 });
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('zero matrix를 분해한다 (case 3)', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(out.translation).toEqual({ x: 0, y: 0 });
    expect(out.rotation).toBe(0);
    expect(out.scaling).toEqual({ x: 0, y: 0 });
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('zero matrix + non-zero translation도 case 3', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: 0, b: 0, c: 0, d: 0, tx: 5, ty: 7 });
    expect(out.translation).toEqual({ x: 5, y: 7 });
    expect(out.scaling).toEqual({ x: 0, y: 0 });
  });
});

describe('decomposeInto - skewY를 skewX convention으로 재표현', () => {
  test('skewY(π/4)는 rotation+scale+skewX 조합으로 분해된다', () => {
    // skewY matrix: a=1, b=1, c=0, d=1
    const out = makeDecomp();
    decomposeInto(out, { a: 1, b: 1, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out.rotation).toBeCloseTo(Math.PI / 4, 12);
    expect(out.scaling.x).toBeCloseTo(Math.SQRT2, 12);
    expect(out.scaling.y).toBeCloseTo(1 / Math.SQRT2, 12);
    expect(out.skewing.x).toBeCloseTo(Math.atan2(1, 2), 12);
    expect(out.skewing.y).toBe(0);
  });
});

describe('decomposeInto - round-trip 재구성', () => {
  test('rotation + scale + skewX + translation을 round-trip 재구성한다', () => {
    const original: MatrixLike = {
      a: 1.234,
      b: -0.567,
      c: 0.789,
      d: 2.345,
      tx: 10,
      ty: -20,
    };
    const out = makeDecomp();
    decomposeInto(out, original);
    const reconstructed = compose(out);
    expectMatrixClose(reconstructed, original, 10);
  });

  test('reflection을 round-trip 재구성한다', () => {
    const original: MatrixLike = { a: 1, b: 0, c: 0, d: -1, tx: 0, ty: 0 };
    const out = makeDecomp();
    decomposeInto(out, original);
    expectMatrixClose(compose(out), original, 12);
  });

  test('composite (R · S · K)를 round-trip 재구성한다', () => {
    // M = R(π/3) · S(2, -1) · K(π/6)
    const R = makeMatrix();
    rotationMatrixInto(R, Math.PI / 3);
    const S = makeMatrix();
    scalingMatrixInto(S, 2, -1);
    const K: MatrixWritable = {
      a: 1,
      b: 0,
      c: Math.tan(Math.PI / 6),
      d: 1,
      tx: 0,
      ty: 0,
    };
    const original = multiply(multiply(R, S), K);
    const out = makeDecomp();
    decomposeInto(out, original);
    expectMatrixClose(compose(out), original, 10);
  });
});

describe('decomposeInto - tuple matrix input', () => {
  test('tuple matrix input을 분해한다', () => {
    const out = makeDecomp();
    decomposeInto(out, [2, 0, 0, 3, 4, 5]);
    expect(out.translation).toEqual({ x: 4, y: 5 });
    expect(out.scaling.x).toBeCloseTo(2, 12);
    expect(out.scaling.y).toBeCloseTo(3, 12);
  });
});

describe('decomposeInto - nested tuple output / object output', () => {
  test('nested tuple output에 기록한다', () => {
    const out: MatrixDecompositionWritable<XYTupleWritable, XYTupleWritable, XYTupleWritable> = {
      translation: [0, 0],
      scaling: [0, 0],
      skewing: [0, 0],
      rotation: 0,
    };
    const result = decomposeInto(out, { a: 2, b: 0, c: 0, d: 3, tx: 5, ty: 7 });
    expect(result).toBe(out);
    expect(out.translation[0]).toBe(5);
    expect(out.translation[1]).toBe(7);
    expect(out.scaling[0]).toBeCloseTo(2, 12);
    expect(out.scaling[1]).toBeCloseTo(3, 12);
  });

  test('custom output type이 보존된다', () => {
    const out = {
      translation: { x: 0, y: 0, tag: 't' },
      scaling: { x: 0, y: 0, tag: 's' },
      skewing: { x: 0, y: 0, tag: 'k' },
      rotation: 0,
    };
    const result = decomposeInto(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result).toBe(out);
    expect(result.translation.tag).toBe('t');
  });
});

describe('decomposeInto - non-finite pass-through', () => {
  test('NaN x-basis와 finite y-basis는 case 2 fallback으로 분해된다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: Number.NaN, b: 0, c: 0, d: 1, tx: 5, ty: 7 });
    // r2 = NaN. NaN > 0 false → s2 분기 진입. s2 = 0 + 1 = 1 > 0이므로 case 2.
    // case 2에서 rotation = atan2(-0, 1) = 0, scaling.x = 0, scaling.y = sqrt(1) = 1.
    expect(out.translation).toEqual({ x: 5, y: 7 });
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBe(0);
    expect(out.scaling.y).toBeCloseTo(1, 12);
  });

  test('NaN matrix 전체는 case 3로 흘러 zero 결과를 기록한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: Number.NaN, b: Number.NaN, c: Number.NaN, d: Number.NaN, tx: 1, ty: 2 });
    // r2 = NaN+NaN = NaN. NaN > 0 false. s2 = NaN. NaN > 0 false. case 3 진입.
    expect(out.translation).toEqual({ x: 1, y: 2 });
    expect(out.rotation).toBe(0);
    expect(out.scaling).toEqual({ x: 0, y: 0 });
    expect(out.skewing).toEqual({ x: 0, y: 0 });
  });

  test('Infinity matrix component는 case 1로 흘러 JS 산술 결과를 기록한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: Number.POSITIVE_INFINITY, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    // r2 = Infinity > 0 → case 1. r = Infinity. rotation = atan2(0, Inf) = 0.
    expect(out.rotation).toBe(0);
    expect(out.scaling.x).toBe(Number.POSITIVE_INFINITY);
    // scaling.y = det/r = Inf/Inf = NaN
    expect(Number.isNaN(out.scaling.y)).toBe(true);
  });

  test('-Infinity matrix component는 case 1로 흘러 JS 산술 결과를 기록한다', () => {
    const out = makeDecomp();
    decomposeInto(out, { a: Number.NEGATIVE_INFINITY, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    // r2 = Infinity > 0 → case 1. r = Infinity. rotation = atan2(0, -Inf) = π.
    expect(out.rotation).toBe(Math.PI);
    expect(out.scaling.x).toBe(Number.POSITIVE_INFINITY);
  });
});

// ─── matrixCompose / matrixComposeInto ────────────────────────────────────────

describe('matrixComposeInto - 표준 케이스', () => {
  test('identity decomposition을 identity matrix로 합성한다', () => {
    const out = makeMatrix();
    const result = matrixComposeInto(out, {
      translation: { x: 0, y: 0 },
      scaling: { x: 1, y: 1 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    });
    expect(result).toBe(out);
    expectMatrixClose(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('translation + rotation + scale + skewX를 합성한다', () => {
    const decomp: MatrixDecompositionWritable = {
      translation: { x: 10, y: 20 },
      scaling: { x: 2, y: 3 },
      skewing: { x: Math.PI / 6, y: 0 },
      rotation: Math.PI / 4,
    };
    const out = makeMatrix();
    matrixComposeInto(out, decomp);
    // T·R·S·K 직접 전개: a=cos·sx, b=sin·sx, c=cos·sx·kx−sin·sy, d=sin·sx·kx+cos·sy
    const cos = Math.cos(Math.PI / 4);
    const sin = Math.sin(Math.PI / 4);
    const kx = Math.tan(Math.PI / 6);
    expect(out.a).toBeCloseTo(cos * 2, 12);
    expect(out.b).toBeCloseTo(sin * 2, 12);
    expect(out.c).toBeCloseTo(cos * 2 * kx - sin * 3, 12);
    expect(out.d).toBeCloseTo(sin * 2 * kx + cos * 3, 12);
    expect(out.tx).toBe(10);
    expect(out.ty).toBe(20);
  });

  test('기존 compose 테스트 helper(T·R·S·K multiply)와 동일한 결과를 낸다', () => {
    const decomp: MatrixDecompositionWritable = {
      translation: { x: -5, y: 8 },
      scaling: { x: 1.5, y: -2.25 },
      skewing: { x: -Math.PI / 5, y: 0 },
      rotation: -Math.PI / 3,
    };
    const out = makeMatrix();
    matrixComposeInto(out, decomp);
    expectMatrixClose(out, compose(decomp), 12);
  });

  test('skewing.y는 합성식에 사용하지 않는다', () => {
    const base: MatrixDecompositionWritable = {
      translation: { x: 1, y: 2 },
      scaling: { x: 2, y: 3 },
      skewing: { x: 0.3, y: 0 },
      rotation: 0.5,
    };
    const withSkewY: MatrixDecompositionWritable = {
      translation: { x: 1, y: 2 },
      scaling: { x: 2, y: 3 },
      skewing: { x: 0.3, y: 999 },
      rotation: 0.5,
    };
    expect(matrixCompose(withSkewY)).toEqual(matrixCompose(base));
  });

  test('nested tuple decomposition input을 합성한다', () => {
    const out = makeMatrix();
    matrixComposeInto(out, {
      translation: [4, 5],
      scaling: [2, 3],
      skewing: [0, 0],
      rotation: 0,
    });
    expectMatrixClose(out, { a: 2, b: 0, c: 0, d: 3, tx: 4, ty: 5 });
  });
});

describe('matrixComposeInto - decompose round-trip', () => {
  const cases: ReadonlyArray<readonly [string, MatrixLike]> = [
    ['일반 affine', { a: 1.234, b: -0.567, c: 0.789, d: 2.345, tx: 10, ty: -20 }],
    ['reflection', { a: 1, b: 0, c: 0, d: -1, tx: 3, ty: 4 }],
    ['singular fallback (x-basis 0, rotation -π/2)', { a: 0, b: 0, c: 1, d: 0, tx: 5, ty: 6 }],
    ['singular fallback (x-basis 0, rotation 0)', { a: 0, b: 0, c: 0, d: 1, tx: 2, ty: 3 }],
    ['singular fallback (x-basis 0, rotation π)', { a: 0, b: 0, c: 0, d: -1, tx: 4, ty: 5 }],
    ['zero matrix', { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }],
    ['zero matrix + translation', { a: 0, b: 0, c: 0, d: 0, tx: 5, ty: 7 }],
  ];

  for (const [label, original] of cases) {
    test(`${label}을 decomposeInto → matrixCompose로 round-trip한다`, () => {
      const decomp = makeDecomp();
      decomposeInto(decomp, original);
      expectMatrixClose(matrixCompose(decomp), original, 10);
    });
  }

  test('tuple matrix input을 분해한 뒤 round-trip한다', () => {
    const original: MatrixLike = [2, 0, 0, 3, 4, 5];
    const decomp = makeDecomp();
    decomposeInto(decomp, original);
    expectMatrixClose(matrixCompose(decomp), original, 12);
  });
});

describe('matrixComposeInto - non-finite pass-through', () => {
  test('NaN rotation은 throw 없이 JS 산술 결과를 기록한다', () => {
    const out = makeMatrix();
    matrixComposeInto(out, {
      translation: { x: 1, y: 2 },
      scaling: { x: 2, y: 3 },
      skewing: { x: 0, y: 0 },
      rotation: Number.NaN,
    });
    // cos(NaN)/sin(NaN) = NaN → a/b/c/d = NaN. translation은 그대로.
    expect(Number.isNaN(out.a)).toBe(true);
    expect(Number.isNaN(out.b)).toBe(true);
    expect(out.tx).toBe(1);
    expect(out.ty).toBe(2);
  });

  test('Infinity skewing.x는 tan(Inf)=NaN을 통해 기록된다', () => {
    const out = makeMatrix();
    matrixComposeInto(out, {
      translation: { x: 0, y: 0 },
      scaling: { x: 2, y: 3 },
      skewing: { x: Number.POSITIVE_INFINITY, y: 0 },
      rotation: 0,
    });
    // kx = tan(Inf) = NaN. a/b는 skew 무관, c/d는 NaN.
    expect(out.a).toBeCloseTo(2, 12);
    expect(out.b).toBeCloseTo(0, 12);
    expect(Number.isNaN(out.c)).toBe(true);
    expect(Number.isNaN(out.d)).toBe(true);
  });

  test('-Infinity translation은 검증 없이 그대로 기록된다', () => {
    const out = makeMatrix();
    matrixComposeInto(out, {
      translation: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
      scaling: { x: 2, y: 3 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    });
    // tx/ty는 직접 pass-through, a/d는 유한 산술.
    expect(out.tx).toBe(Number.NEGATIVE_INFINITY);
    expect(out.ty).toBe(Number.NEGATIVE_INFINITY);
    expect(out.a).toBeCloseTo(2, 12);
    expect(out.d).toBeCloseTo(3, 12);
  });

  test('zero-degenerate scaling은 zero linear part로 합성된다', () => {
    const out = makeMatrix();
    matrixComposeInto(out, {
      translation: { x: 7, y: 8 },
      scaling: { x: 0, y: 0 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    });
    // sx=sy=0, kx=0 → a=b=c=d=0. translation만 유지.
    expect(out.a).toBe(0);
    expect(out.b).toBe(0);
    expect(out.c).toBe(0);
    expect(out.d).toBe(0);
    expect(out.tx).toBe(7);
    expect(out.ty).toBe(8);
  });
});

describe('matrixComposeInto - read-before-write aliasing', () => {
  test('out이 nested input object와 같은 비정상 aliasing에서도 안전하다', () => {
    // out과 translation이 같은 object. MatrixWritable과 XYWritable은 field가 겹치지 않지만
    // 모든 component를 local로 먼저 읽어 안전성을 보장한다.
    const shared = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, x: 5, y: 6 };
    const result = matrixComposeInto(shared, {
      translation: shared,
      scaling: { x: 2, y: 3 },
      skewing: { x: 0, y: 0 },
      rotation: 0,
    });
    expect(result).toBe(shared);
    expect(shared.a).toBeCloseTo(2, 12);
    expect(shared.d).toBeCloseTo(3, 12);
    expect(shared.tx).toBe(5);
    expect(shared.ty).toBe(6);
  });
});

// ─── decompose companion ──────────────────────────────────────────────────────

describe('decompose - companion', () => {
  test('plain decomposition object를 반환한다', () => {
    const result = decompose({ a: 2, b: 0, c: 0, d: 3, tx: 5, ty: 7 });
    expect(result.translation).toEqual({ x: 5, y: 7 });
    expect(result.rotation).toBe(0);
    expect(result.scaling.x).toBeCloseTo(2, 12);
    expect(result.scaling.y).toBeCloseTo(3, 12);
    expect(result.skewing).toEqual({ x: 0, y: 0 });
  });

  test('각 nested object는 새로 할당된다', () => {
    const r1 = decompose({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    const r2 = decompose({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(r1.translation).not.toBe(r2.translation);
    expect(r1.scaling).not.toBe(r2.scaling);
    expect(r1.skewing).not.toBe(r2.skewing);
  });
});
