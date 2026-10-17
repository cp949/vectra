/**
 * 행렬·분해 입력의 구조 가드를 확인하는 테스트.
 * 행이 배열이 아닌 입력, 빈 행렬에 대한 행 연산, 분해 객체의 모양 위반이
 * 각각 어떤 RangeError 메시지로 거부되는지 본다.
 * 메시지 정규식으로 어느 가드가 던졌는지까지 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { addRowToRow } from '../../../src/linalg/add-row-to-row';
import { addScalarMultipleOfRowToRow } from '../../../src/linalg/add-scalar-multiple-of-row-to-row';
import { chainProduct } from '../../../src/linalg/chain-product';
import { exchangeRows } from '../../../src/linalg/exchange-rows';
import { fromColumns } from '../../../src/linalg/from-columns';
import { multiplyRowByScalar } from '../../../src/linalg/multiply-row-by-scalar';
import { shape } from '../../../src/linalg/shape';
import { solveWithQrDecomposition } from '../../../src/linalg/solve-with-qr-decomposition';
import type { QRDecomposition } from '../../../src/linalg/types';

/** 타입을 어긴 입력을 넘길 때 쓴다. 가드가 런타임에서 거부하는지만 본다. */
function bad<T>(value: unknown): T {
  return value as T;
}

describe('행이 배열이 아닌 행렬', () => {
  test('shape는 첫 행이 배열이 아니면 RangeError를 던진다', () => {
    expect(() => shape(bad([1, 2]))).toThrow(/^matrix\[0\] must be an array$/);
  });

  test('shape는 둘째 행이 배열이 아니면 RangeError를 던진다', () => {
    expect(() => shape(bad([[1, 2], 3]))).toThrow(/^matrix\[1\] must be an array$/);
  });

  test('fromColumns는 첫 열이 배열이 아니면 RangeError를 던진다', () => {
    expect(() => fromColumns(bad([1, 2]))).toThrow(/^columns\[0\] must be an array$/);
  });

  test('fromColumns는 둘째 열이 배열이 아니면 RangeError를 던진다', () => {
    expect(() => fromColumns(bad([[1], 2]))).toThrow(/^columns\[1\] must be an array$/);
  });
});

describe('chainProduct의 결과 shape 추정', () => {
  test('첫 행렬이 배열이 아니면 그 행렬의 행이 배열이 아니라는 RangeError를 던진다', () => {
    expect(() => chainProduct(bad([5]))).toThrow(/^matrices\[0\]\[0\] must be an array$/);
  });

  test('마지막 행렬이 비어 있으면 앞 행렬의 열 수와 맞지 않는다는 RangeError를 던진다', () => {
    expect(() => chainProduct(bad([[[1]], []]))).toThrow(
      /^matrices\[0\] columns \(1\) must equal matrices\[1\] rows \(0\)$/
    );
  });

  test('마지막 행렬의 첫 행이 배열이 아니면 RangeError를 던진다', () => {
    expect(() => chainProduct(bad([[[1]], [5]]))).toThrow(/^matrices\[1\]\[0\] must be an array$/);
  });
});

describe('빈 행렬에 대한 행 연산', () => {
  test('addRowToRow는 행이 없으면 범위 RangeError를 던진다', () => {
    expect(() => addRowToRow([], 0, 1)).toThrow(/^targetRow must be an integer in \[0, 0\), got 0$/);
  });

  test('addScalarMultipleOfRowToRow는 행이 없으면 범위 RangeError를 던진다', () => {
    expect(() => addScalarMultipleOfRowToRow([], 0, 1, 2)).toThrow(/^targetRow must be an integer in \[0, 0\), got 0$/);
  });

  test('exchangeRows는 행이 없으면 범위 RangeError를 던진다', () => {
    expect(() => exchangeRows([], 0, 1)).toThrow(/^first must be an integer in \[0, 0\), got 0$/);
  });

  test('multiplyRowByScalar는 행이 없으면 범위 RangeError를 던진다', () => {
    expect(() => multiplyRowByScalar([], 0, 2)).toThrow(/^rowIndex must be an integer in \[0, 0\), got 0$/);
  });

  test('행 연산은 첫 행이 배열이 아니면 그 행이 배열이 아니라는 RangeError를 던진다', () => {
    expect(() => addRowToRow(bad([5]), 0, 0)).toThrow(/^matrix\[0\] must be an array$/);
  });
});

describe('solveWithQrDecomposition의 분해 모양 가드', () => {
  test('upper의 첫 행이 배열이 아니면 RangeError를 던진다', () => {
    const dec = bad<QRDecomposition>({ orthogonal: [[1]], upper: [5], rank: 1 });
    expect(() => solveWithQrDecomposition(dec, [1])).toThrow(/^decomposition\.upper\[0\] must be an array$/);
  });

  test('upper의 첫 행이 비어 있으면 한쪽만 0인 shape를 지원하지 않는다는 RangeError를 던진다', () => {
    const dec: QRDecomposition = { orthogonal: [[1]], upper: [[]], rank: 1 };
    expect(() => solveWithQrDecomposition(dec, [1])).toThrow(/one-sided zero shape \[1, 0\] is not supported$/);
  });

  test('upper의 둘째 행이 배열이 아니면 RangeError를 던진다', () => {
    const dec = bad<QRDecomposition>({
      orthogonal: [
        [1, 0],
        [0, 1],
      ],
      upper: [[1, 0], 5],
      rank: 2,
    });
    expect(() => solveWithQrDecomposition(dec, [1, 2])).toThrow(/^decomposition\.upper\[1\] must be an array$/);
  });

  test('orthogonal의 행이 배열이 아니면 RangeError를 던진다', () => {
    const dec = bad<QRDecomposition>({ orthogonal: [5], upper: [[1]], rank: 1 });
    expect(() => solveWithQrDecomposition(dec, [1])).toThrow(/^decomposition\.orthogonal\[0\] must be an array$/);
  });
});
