/**
 * matrix array serialization 단위 테스트.
 *
 * 검증: fromArray6Into / fromArray6 / toArray6Into / toArray6 /
 * fromArray9Into / fromArray9 / toArray9Into / toArray9 의
 * 정상 동작, column-major index 매핑, round-trip, 반환값.
 */

import { describe, expect, test } from 'vitest';
import { fromArray6 } from '../../../src/matrix/from-array-6';
import { fromArray6Into } from '../../../src/matrix/from-array-6-into';
import { fromArray9 } from '../../../src/matrix/from-array-9';
import { fromArray9Into } from '../../../src/matrix/from-array-9-into';
import { toArray6 } from '../../../src/matrix/to-array-6';
import { toArray6Into } from '../../../src/matrix/to-array-6-into';
import { toArray9 } from '../../../src/matrix/to-array-9';
import { toArray9Into } from '../../../src/matrix/to-array-9-into';

/** 테스트용 MatrixWritable 생성 helper */
function makeMatrix() {
  return { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
}

// ─── fromArray6Into ───────────────────────────────────────────────────────────

describe('matrix serialization - fromArray6Into', () => {
  test('identity array를 identity matrix로 기록한다', () => {
    const out = makeMatrix();
    const result = fromArray6Into(out, [1, 0, 0, 1, 0, 0]);
    expect(result.a).toBe(1);
    expect(result.b).toBe(0);
    expect(result.c).toBe(0);
    expect(result.d).toBe(1);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });

  test('일반 값을 올바른 component에 기록한다', () => {
    const out = makeMatrix();
    fromArray6Into(out, [2, 3, 4, 5, 6, 7]);
    expect(out.a).toBe(2);
    expect(out.b).toBe(3);
    expect(out.c).toBe(4);
    expect(out.d).toBe(5);
    expect(out.tx).toBe(6);
    expect(out.ty).toBe(7);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(fromArray6Into(out, [1, 0, 0, 1, 0, 0])).toBe(out);
  });

  test('subclass 확장 타입도 반환한다', () => {
    const out = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'fa6' };
    const result = fromArray6Into(out, [1, 0, 0, 1, 0, 0]);
    expect(result).toBe(out);
    expect(result.tag).toBe('fa6');
  });

  test('NaN은 pass through한다', () => {
    const out = makeMatrix();
    fromArray6Into(out, [NaN, 0, 0, 1, 0, 0]);
    expect(Number.isNaN(out.a)).toBe(true);
  });

  test('Infinity / -Infinity는 pass through한다', () => {
    const out = makeMatrix();
    fromArray6Into(out, [Infinity, -Infinity, 0, 1, 0, 0]);
    expect(out.a).toBe(Infinity);
    expect(out.b).toBe(-Infinity);
  });

  test('zero matrix array를 그대로 기록한다 (det=0 degenerate)', () => {
    const out = makeMatrix();
    fromArray6Into(out, [0, 0, 0, 0, 0, 0]);
    expect(out.a).toBe(0);
    expect(out.b).toBe(0);
    expect(out.c).toBe(0);
    expect(out.d).toBe(0);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });
});

// ─── fromArray6 ──────────────────────────────────────────────────────────────

describe('matrix serialization - fromArray6', () => {
  test('새 object로 matrix를 반환한다', () => {
    const result = fromArray6([2, 3, 4, 5, 6, 7]);
    expect(result.a).toBe(2);
    expect(result.b).toBe(3);
    expect(result.c).toBe(4);
    expect(result.d).toBe(5);
    expect(result.tx).toBe(6);
    expect(result.ty).toBe(7);
  });

  test('identity array로 identity matrix를 반환한다', () => {
    const result = fromArray6([1, 0, 0, 1, 0, 0]);
    expect(result.a).toBe(1);
    expect(result.b).toBe(0);
    expect(result.c).toBe(0);
    expect(result.d).toBe(1);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });
});

// ─── toArray6Into ─────────────────────────────────────────────────────────────

describe('matrix serialization - toArray6Into', () => {
  test('identity matrix를 [1,0,0,1,0,0]으로 기록한다', () => {
    const out: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    const result = toArray6Into(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(1);
    expect(result[4]).toBe(0);
    expect(result[5]).toBe(0);
  });

  test('일반 값을 올바른 index에 기록한다', () => {
    const out: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    toArray6Into(out, { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expect(out[2]).toBe(4);
    expect(out[3]).toBe(5);
    expect(out[4]).toBe(6);
    expect(out[5]).toBe(7);
  });

  test('out을 반환한다', () => {
    const out: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    expect(toArray6Into(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(out);
  });

  test('tuple MatrixLike input을 처리한다', () => {
    const out: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    toArray6Into(out, [2, 3, 4, 5, 6, 7]);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expect(out[2]).toBe(4);
    expect(out[3]).toBe(5);
    expect(out[4]).toBe(6);
    expect(out[5]).toBe(7);
  });

  test('zero matrix를 그대로 기록한다', () => {
    const out: [number, number, number, number, number, number] = [9, 9, 9, 9, 9, 9];
    toArray6Into(out, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
    expect(out[3]).toBe(0);
    expect(out[4]).toBe(0);
    expect(out[5]).toBe(0);
  });

  test('Infinity component를 pass through한다', () => {
    const out: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
    toArray6Into(out, { a: Infinity, b: -Infinity, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out[0]).toBe(Infinity);
    expect(out[1]).toBe(-Infinity);
  });
});

// ─── toArray6 ────────────────────────────────────────────────────────────────

describe('matrix serialization - toArray6', () => {
  test('새 6-element tuple로 반환한다', () => {
    const result = toArray6({ a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
    expect(result[2]).toBe(4);
    expect(result[3]).toBe(5);
    expect(result[4]).toBe(6);
    expect(result[5]).toBe(7);
  });
});

// ─── fromArray6 + toArray6 round-trip ────────────────────────────────────────

describe('matrix serialization - array6 round-trip', () => {
  test('fromArray6 → toArray6 round-trip', () => {
    const original: [number, number, number, number, number, number] = [2, 3, 4, 5, 6, 7];
    const matrix = fromArray6(original);
    const result = toArray6(matrix);
    expect(result[0]).toBe(original[0]);
    expect(result[1]).toBe(original[1]);
    expect(result[2]).toBe(original[2]);
    expect(result[3]).toBe(original[3]);
    expect(result[4]).toBe(original[4]);
    expect(result[5]).toBe(original[5]);
  });
});

// ─── fromArray9Into ───────────────────────────────────────────────────────────

describe('matrix serialization - fromArray9Into', () => {
  test('column-major identity array를 identity matrix로 기록한다', () => {
    const out = makeMatrix();
    // column-major identity: [1,0,0, 0,1,0, 0,0,1]
    fromArray9Into(out, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(out.a).toBe(1);
    expect(out.b).toBe(0);
    expect(out.c).toBe(0);
    expect(out.d).toBe(1);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });

  test('column-major index 매핑을 올바르게 적용한다 (arr[0]=a, arr[3]=c, arr[6]=tx)', () => {
    const out = makeMatrix();
    // column-major: [a, b, 0, c, d, 0, tx, ty, 1]
    fromArray9Into(out, [2, 3, 0, 4, 5, 0, 6, 7, 1]);
    expect(out.a).toBe(2);
    expect(out.b).toBe(3);
    expect(out.c).toBe(4);
    expect(out.d).toBe(5);
    expect(out.tx).toBe(6);
    expect(out.ty).toBe(7);
  });

  test('index 2, 5, 8은 무시한다 (다른 값이어도 결과 동일)', () => {
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    fromArray9Into(out1, [2, 3, 0, 4, 5, 0, 6, 7, 1]);
    // index 2, 5, 8을 99로 변경해도 동일한 결과
    fromArray9Into(out2, [2, 3, 99, 4, 5, 99, 6, 7, 99]);
    expect(out1.a).toBe(out2.a);
    expect(out1.b).toBe(out2.b);
    expect(out1.c).toBe(out2.c);
    expect(out1.d).toBe(out2.d);
    expect(out1.tx).toBe(out2.tx);
    expect(out1.ty).toBe(out2.ty);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(fromArray9Into(out, [1, 0, 0, 0, 1, 0, 0, 0, 1])).toBe(out);
  });

  test('subclass 확장 타입도 반환한다', () => {
    const out = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'fa9' };
    const result = fromArray9Into(out, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(result).toBe(out);
    expect(result.tag).toBe('fa9');
  });

  test('NaN은 pass through한다', () => {
    const out = makeMatrix();
    fromArray9Into(out, [NaN, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(Number.isNaN(out.a)).toBe(true);
  });

  test('Infinity / -Infinity는 pass through한다', () => {
    const out = makeMatrix();
    fromArray9Into(out, [Infinity, -Infinity, 0, 0, 1, 0, 0, 0, 1]);
    expect(out.a).toBe(Infinity);
    expect(out.b).toBe(-Infinity);
  });

  test('zero matrix array를 그대로 기록한다 (det=0 degenerate)', () => {
    const out = makeMatrix();
    fromArray9Into(out, [0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(out.a).toBe(0);
    expect(out.b).toBe(0);
    expect(out.c).toBe(0);
    expect(out.d).toBe(0);
    expect(out.tx).toBe(0);
    expect(out.ty).toBe(0);
  });
});

// ─── fromArray9 ──────────────────────────────────────────────────────────────

describe('matrix serialization - fromArray9', () => {
  test('새 object로 matrix를 반환한다', () => {
    const result = fromArray9([2, 3, 0, 4, 5, 0, 6, 7, 1]);
    expect(result.a).toBe(2);
    expect(result.b).toBe(3);
    expect(result.c).toBe(4);
    expect(result.d).toBe(5);
    expect(result.tx).toBe(6);
    expect(result.ty).toBe(7);
  });
});

// ─── toArray9Into ─────────────────────────────────────────────────────────────

describe('matrix serialization - toArray9Into', () => {
  test('identity matrix를 column-major identity array로 기록한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    toArray9Into(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0); // last row
    expect(out[3]).toBe(0);
    expect(out[4]).toBe(1);
    expect(out[5]).toBe(0); // last row
    expect(out[6]).toBe(0);
    expect(out[7]).toBe(0);
    expect(out[8]).toBe(1); // last row
  });

  test('6-component를 column-major 9-element로 기록하고 index 2=0, 5=0, 8=1을 고정한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [9, 9, 9, 9, 9, 9, 9, 9, 9];
    toArray9Into(out, { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expect(out[2]).toBe(0); // last row 고정
    expect(out[3]).toBe(4);
    expect(out[4]).toBe(5);
    expect(out[5]).toBe(0); // last row 고정
    expect(out[6]).toBe(6);
    expect(out[7]).toBe(7);
    expect(out[8]).toBe(1); // last row 고정
  });

  test('out을 반환한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(toArray9Into(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(out);
  });

  test('tuple MatrixLike input을 처리한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    toArray9Into(out, [2, 3, 4, 5, 6, 7]);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
    expect(out[3]).toBe(4);
    expect(out[4]).toBe(5);
    expect(out[6]).toBe(6);
    expect(out[7]).toBe(7);
  });

  test('zero matrix를 column-major zero+last row로 기록한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [9, 9, 9, 9, 9, 9, 9, 9, 9];
    toArray9Into(out, { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
    expect(out[3]).toBe(0);
    expect(out[4]).toBe(0);
    expect(out[5]).toBe(0);
    expect(out[6]).toBe(0);
    expect(out[7]).toBe(0);
    expect(out[8]).toBe(1);
  });

  test('Infinity component를 pass through한다', () => {
    const out: [number, number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    toArray9Into(out, { a: Infinity, b: -Infinity, c: 0, d: 1, tx: 0, ty: 0 });
    expect(out[0]).toBe(Infinity);
    expect(out[1]).toBe(-Infinity);
    expect(out[8]).toBe(1);
  });
});

// ─── toArray9 ────────────────────────────────────────────────────────────────

describe('matrix serialization - toArray9', () => {
  test('새 9-element tuple로 반환한다', () => {
    const result = toArray9({ a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 });
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
    expect(result[5]).toBe(0);
    expect(result[6]).toBe(6);
    expect(result[7]).toBe(7);
    expect(result[8]).toBe(1);
  });
});

// ─── fromArray9 + toArray9 round-trip ────────────────────────────────────────

describe('matrix serialization - array9 round-trip', () => {
  test('fromArray9 → toArray9 round-trip', () => {
    // column-major: [a, b, 0, c, d, 0, tx, ty, 1]
    const original: [number, number, number, number, number, number, number, number, number] = [
      2, 3, 0, 4, 5, 0, 6, 7, 1,
    ];
    const matrix = fromArray9(original);
    const result = toArray9(matrix);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
    expect(result[2]).toBe(0);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
    expect(result[5]).toBe(0);
    expect(result[6]).toBe(6);
    expect(result[7]).toBe(7);
    expect(result[8]).toBe(1);
  });
});
