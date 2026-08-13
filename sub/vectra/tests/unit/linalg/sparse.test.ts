/**
 * linalg sparse conversion helper unit test.
 *
 * vectorSparseEntries(Into) / vectorFromSparseEntries(Into) — vector ↔ sparse 표현 변환.
 * matrixSparseEntries(Into) / matrixFromSparseEntries(Into) — matrix ↔ sparse 표현 변환.
 *
 * exact zero 제거, epsilon threshold, non-finite reject, invalid index/coordinate,
 * duplicate entry reject, output capacity 부족 시 out 미수정, ragged/one-sided zero shape 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { matrixFromSparseEntries } from '../../../src/linalg/matrix-from-sparse-entries';
import { matrixFromSparseEntriesInto } from '../../../src/linalg/matrix-from-sparse-entries-into';
import { matrixSparseEntries } from '../../../src/linalg/matrix-sparse-entries';
import { matrixSparseEntriesInto } from '../../../src/linalg/matrix-sparse-entries-into';
import type { SparseMatrixEntry, SparseVectorEntry } from '../../../src/linalg/types';
import { vectorFromSparseEntries } from '../../../src/linalg/vector-from-sparse-entries';
import { vectorFromSparseEntriesInto } from '../../../src/linalg/vector-from-sparse-entries-into';
import { vectorSparseEntries } from '../../../src/linalg/vector-sparse-entries';
import { vectorSparseEntriesInto } from '../../../src/linalg/vector-sparse-entries-into';

// ---------------------------------------------------------------------------
// vectorSparseEntriesInto / vectorSparseEntries
// ---------------------------------------------------------------------------

describe('vectorSparseEntriesInto — sparse 추출 (Into)', () => {
  test('exact zero entry는 sparse 결과에서 제거한다', () => {
    const out: SparseVectorEntry[] = [];
    const result = vectorSparseEntriesInto(out, [0, 3, 0, -1, 0]);
    expect(result).toBe(out);
    expect(out).toEqual([
      { index: 1, value: 3 },
      { index: 3, value: -1 },
    ]);
  });

  test('빈 vector는 빈 sparse entry 배열을 반환한다', () => {
    const out: SparseVectorEntry[] = [];
    vectorSparseEntriesInto(out, []);
    expect(out).toEqual([]);
  });

  test('out에 잔존 entry가 있어도 호출 전 비워 입력 vector entry로 덮어쓴다', () => {
    const out: SparseVectorEntry[] = [
      { index: 99, value: 99 },
      { index: 7, value: 7 },
    ];
    vectorSparseEntriesInto(out, [0, 5]);
    expect(out).toEqual([{ index: 1, value: 5 }]);
  });

  test('options.epsilon 이하 값은 zero로 취급한다', () => {
    const out: SparseVectorEntry[] = [];
    vectorSparseEntriesInto(out, [1e-7, 1e-9, -1e-7, 1], { epsilon: 1e-6 });
    expect(out).toEqual([{ index: 3, value: 1 }]);
  });

  test('epsilon 경계는 strict >: |value| === epsilon은 제거한다', () => {
    const out: SparseVectorEntry[] = [];
    vectorSparseEntriesInto(out, [0.5, -0.5, 0.6], { epsilon: 0.5 });
    expect(out).toEqual([{ index: 2, value: 0.6 }]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: SparseVectorEntry[] = [{ index: 0, value: 0 }];
    expect(() => vectorSparseEntriesInto(out, [1, Number.NaN, 3])).toThrow(RangeError);
    expect(() => vectorSparseEntriesInto(out, [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(out).toEqual([{ index: 0, value: 0 }]);
  });

  test('epsilon이 음수면 RangeError', () => {
    const out: SparseVectorEntry[] = [];
    expect(() => vectorSparseEntriesInto(out, [1, 2], { epsilon: -1 })).toThrow(RangeError);
  });

  test('epsilon이 NaN/Infinity면 RangeError', () => {
    const out: SparseVectorEntry[] = [];
    expect(() => vectorSparseEntriesInto(out, [1, 2], { epsilon: Number.NaN })).toThrow(RangeError);
    expect(() => vectorSparseEntriesInto(out, [1, 2], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});

describe('vectorSparseEntries — sparse 추출 (companion)', () => {
  test('새 SparseVectorEntry 배열을 반환한다', () => {
    const r = vectorSparseEntries([0, 0, 7]);
    expect(r).toEqual([{ index: 2, value: 7 }]);
  });

  test('빈 vector는 빈 배열을 반환한다', () => {
    expect(vectorSparseEntries([])).toEqual([]);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => vectorSparseEntries([Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// vectorFromSparseEntriesInto / vectorFromSparseEntries
// ---------------------------------------------------------------------------

describe('vectorFromSparseEntriesInto — sparse 재구성 (Into)', () => {
  test('정상 entry는 dimension 크기의 dense vector로 재구성한다', () => {
    const out: number[] = [0, 0, 0, 0, 0];
    const result = vectorFromSparseEntriesInto(out, 5, [
      { index: 1, value: 3 },
      { index: 4, value: -2 },
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([0, 3, 0, 0, -2]);
  });

  test('dimension이 0이면 빈 vector를 반환한다', () => {
    const out: number[] = [];
    vectorFromSparseEntriesInto(out, 0, []);
    expect(out).toEqual([]);
  });

  test('empty entries는 dimension 크기의 zero vector를 반환한다', () => {
    const out: number[] = new Array(4);
    vectorFromSparseEntriesInto(out, 4, []);
    expect(out).toEqual([0, 0, 0, 0]);
  });

  test('out에 기존 값이 있어도 zero-fill 후 entry를 기록한다', () => {
    const out = [9, 9, 9];
    vectorFromSparseEntriesInto(out, 3, [{ index: 1, value: 5 }]);
    expect(out).toEqual([0, 5, 0]);
  });

  test('out.length가 dimension보다 크면 dimension으로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    vectorFromSparseEntriesInto(out, 3, [{ index: 0, value: 1 }]);
    expect(out).toEqual([1, 0, 0]);
  });

  test('out 길이가 dimension보다 작으면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() => vectorFromSparseEntriesInto(out, 3, [{ index: 0, value: 1 }])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test.each([-1, 0.5, 3, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'invalid index %s는 RangeError를 던지고 out을 수정하지 않는다',
    (idx) => {
      const out = [9, 9, 9];
      expect(() => vectorFromSparseEntriesInto(out, 3, [{ index: idx, value: 1 }])).toThrow(RangeError);
      expect(out).toEqual([9, 9, 9]);
    }
  );

  test('duplicate index는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9, 9];
    expect(() =>
      vectorFromSparseEntriesInto(out, 3, [
        { index: 1, value: 5 },
        { index: 1, value: 7 },
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test('non-finite entry value는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9, 9];
    expect(() => vectorFromSparseEntriesInto(out, 3, [{ index: 0, value: Number.NaN }])).toThrow(RangeError);
    expect(() => vectorFromSparseEntriesInto(out, 3, [{ index: 0, value: Number.POSITIVE_INFINITY }])).toThrow(
      RangeError
    );
    expect(out).toEqual([9, 9, 9]);
  });

  test('dimension이 음수/비정수/NaN이면 RangeError', () => {
    const out: number[] = [0, 0, 0];
    expect(() => vectorFromSparseEntriesInto(out, -1, [])).toThrow(RangeError);
    expect(() => vectorFromSparseEntriesInto(out, 1.5, [])).toThrow(RangeError);
    expect(() => vectorFromSparseEntriesInto(out, Number.NaN, [])).toThrow(RangeError);
  });

  test('entry 검증 실패 후 capacity 검증 실패와 무관하게 out 미수정', () => {
    // capacity 부족 + invalid index가 동시에 있어도 out은 호출 전 상태 유지
    const out = [9];
    expect(() => vectorFromSparseEntriesInto(out, 5, [{ index: 9, value: 1 }])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });
});

describe('vectorFromSparseEntries — sparse 재구성 (companion)', () => {
  test('새 number[] 배열을 반환한다', () => {
    const r = vectorFromSparseEntries(3, [{ index: 1, value: 5 }]);
    expect(r).toEqual([0, 5, 0]);
  });

  test('dimension 0은 빈 배열을 반환한다', () => {
    expect(vectorFromSparseEntries(0, [])).toEqual([]);
  });

  test('duplicate index는 RangeError', () => {
    expect(() =>
      vectorFromSparseEntries(3, [
        { index: 0, value: 1 },
        { index: 0, value: 2 },
      ])
    ).toThrow(RangeError);
  });

  test('invalid dimension은 RangeError', () => {
    expect(() => vectorFromSparseEntries(-1, [])).toThrow(RangeError);
    expect(() => vectorFromSparseEntries(0.5, [])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// matrixSparseEntriesInto / matrixSparseEntries
// ---------------------------------------------------------------------------

describe('matrixSparseEntriesInto — matrix sparse 추출 (Into)', () => {
  test('rectangular matrix에서 non-zero entry를 row-major로 push한다', () => {
    const out: SparseMatrixEntry[] = [];
    const result = matrixSparseEntriesInto(out, [
      [0, 2, 0],
      [3, 0, -1],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([
      { row: 0, column: 1, value: 2 },
      { row: 1, column: 0, value: 3 },
      { row: 1, column: 2, value: -1 },
    ]);
  });

  test('빈 matrix `[]`는 shape `[0, 0]`로 취급해 빈 결과를 반환한다', () => {
    const out: SparseMatrixEntry[] = [{ row: 9, column: 9, value: 9 }];
    matrixSparseEntriesInto(out, []);
    expect(out).toEqual([]);
  });

  test('ragged matrix는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: SparseMatrixEntry[] = [{ row: 0, column: 0, value: 0 }];
    expect(() =>
      matrixSparseEntriesInto(out, [
        [1, 2],
        [3, 4, 5],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([{ row: 0, column: 0, value: 0 }]);
  });

  test('one-sided zero shape `[[]]`은 RangeError', () => {
    const out: SparseMatrixEntry[] = [];
    expect(() => matrixSparseEntriesInto(out, [[]])).toThrow(RangeError);
  });

  test('epsilon threshold: |value| <= epsilon은 제거한다', () => {
    const out: SparseMatrixEntry[] = [];
    matrixSparseEntriesInto(
      out,
      [
        [1e-7, 0.5],
        [-1e-7, 1],
      ],
      { epsilon: 1e-6 }
    );
    expect(out).toEqual([
      { row: 0, column: 1, value: 0.5 },
      { row: 1, column: 1, value: 1 },
    ]);
  });

  test('epsilon 경계 strict >: |value| === epsilon은 제거한다', () => {
    const out: SparseMatrixEntry[] = [];
    matrixSparseEntriesInto(out, [[0.5, -0.5, 0.6]], { epsilon: 0.5 });
    expect(out).toEqual([{ row: 0, column: 2, value: 0.6 }]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: SparseMatrixEntry[] = [{ row: 0, column: 0, value: 0 }];
    expect(() =>
      matrixSparseEntriesInto(out, [
        [1, 2],
        [Number.NaN, 4],
      ])
    ).toThrow(RangeError);
    expect(out).toEqual([{ row: 0, column: 0, value: 0 }]);
  });

  test('epsilon이 음수/NaN/Infinity면 RangeError', () => {
    const out: SparseMatrixEntry[] = [];
    expect(() => matrixSparseEntriesInto(out, [[1]], { epsilon: -1 })).toThrow(RangeError);
    expect(() => matrixSparseEntriesInto(out, [[1]], { epsilon: Number.NaN })).toThrow(RangeError);
    expect(() => matrixSparseEntriesInto(out, [[1]], { epsilon: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });
});

describe('matrixSparseEntries — matrix sparse 추출 (companion)', () => {
  test('새 SparseMatrixEntry 배열을 반환한다', () => {
    const r = matrixSparseEntries([
      [0, 0],
      [0, 7],
    ]);
    expect(r).toEqual([{ row: 1, column: 1, value: 7 }]);
  });

  test('빈 matrix는 빈 배열을 반환한다', () => {
    expect(matrixSparseEntries([])).toEqual([]);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => matrixSparseEntries([[1], [1, 2]])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// matrixFromSparseEntriesInto / matrixFromSparseEntries
// ---------------------------------------------------------------------------

describe('matrixFromSparseEntriesInto — matrix sparse 재구성 (Into)', () => {
  /**
   * shape에 맞는 zero-filled out matrix를 만든다.
   * 각 테스트는 직접 sentinel을 채워 미수정 단언을 한다.
   */
  function makeOut(rows: number, columns: number, fill = 0): number[][] {
    const out: number[][] = new Array(rows);
    for (let r = 0; r < rows; r++) {
      out[r] = new Array(columns).fill(fill);
    }
    return out;
  }

  test('정상 entry는 shape에 맞는 dense matrix로 재구성한다', () => {
    const out = makeOut(2, 3);
    const result = matrixFromSparseEntriesInto(
      out,
      [2, 3],
      [
        { row: 0, column: 1, value: 5 },
        { row: 1, column: 2, value: -7 },
      ]
    );
    expect(result).toBe(out);
    expect(out).toEqual([
      [0, 5, 0],
      [0, 0, -7],
    ]);
  });

  test('shape `[0, 0]`은 빈 결과', () => {
    const out: number[][] = [];
    matrixFromSparseEntriesInto(out, [0, 0], []);
    expect(out).toEqual([]);
  });

  test('out에 기존 값이 있어도 zero-fill 후 entry를 기록한다', () => {
    const out = makeOut(2, 2, 9);
    matrixFromSparseEntriesInto(out, [2, 2], [{ row: 1, column: 0, value: 4 }]);
    expect(out).toEqual([
      [0, 0],
      [4, 0],
    ]);
  });

  test('out row 개수가 shape rows보다 크면 rows로 truncate, row capacity가 크면 columns로 truncate', () => {
    const out: number[][] = [
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9],
    ];
    matrixFromSparseEntriesInto(out, [2, 3], [{ row: 0, column: 0, value: 1 }]);
    expect(out).toEqual([
      [1, 0, 0],
      [0, 0, 0],
    ]);
  });

  test('out row 개수가 shape rows보다 작으면 RangeError + out 미수정', () => {
    const out: number[][] = [[9, 9]];
    expect(() => matrixFromSparseEntriesInto(out, [2, 2], [{ row: 0, column: 0, value: 1 }])).toThrow(RangeError);
    expect(out).toEqual([[9, 9]]);
  });

  test('out row capacity가 shape columns보다 작으면 RangeError + out 미수정', () => {
    const out: number[][] = [[9, 9, 9], [9]];
    expect(() => matrixFromSparseEntriesInto(out, [2, 3], [{ row: 0, column: 0, value: 1 }])).toThrow(RangeError);
    expect(out).toEqual([[9, 9, 9], [9]]);
  });

  test('out row가 array가 아니면 RangeError + out 미수정', () => {
    const out = [[9, 9], 'not-array' as unknown as number[]];
    expect(() => matrixFromSparseEntriesInto(out, [2, 2], [{ row: 0, column: 0, value: 1 }])).toThrow(RangeError);
    expect(out[0]).toEqual([9, 9]);
    expect(out[1]).toBe('not-array');
  });

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'invalid row %s는 RangeError + out 미수정',
    (row) => {
      const out = makeOut(2, 2, 9);
      expect(() => matrixFromSparseEntriesInto(out, [2, 2], [{ row, column: 0, value: 1 }])).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'invalid column %s는 RangeError + out 미수정',
    (column) => {
      const out = makeOut(2, 2, 9);
      expect(() => matrixFromSparseEntriesInto(out, [2, 2], [{ row: 0, column, value: 1 }])).toThrow(RangeError);
      expect(out).toEqual([
        [9, 9],
        [9, 9],
      ]);
    }
  );

  test('duplicate (row, column) 좌표는 RangeError + out 미수정', () => {
    const out = makeOut(2, 2, 9);
    expect(() =>
      matrixFromSparseEntriesInto(
        out,
        [2, 2],
        [
          { row: 0, column: 1, value: 5 },
          { row: 0, column: 1, value: 7 },
        ]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('non-finite entry value는 RangeError + out 미수정', () => {
    const out = makeOut(2, 2, 9);
    expect(() => matrixFromSparseEntriesInto(out, [2, 2], [{ row: 0, column: 0, value: Number.NaN }])).toThrow(
      RangeError
    );
    expect(out).toEqual([
      [9, 9],
      [9, 9],
    ]);
  });

  test('one-sided zero shape `[2, 0]` / `[0, 3]`은 RangeError', () => {
    const out: number[][] = [];
    expect(() => matrixFromSparseEntriesInto(out, [2, 0], [])).toThrow(RangeError);
    expect(() => matrixFromSparseEntriesInto(out, [0, 3], [])).toThrow(RangeError);
  });

  test('shape 원소가 음수/비정수/NaN이면 RangeError', () => {
    const out: number[][] = [];
    expect(() => matrixFromSparseEntriesInto(out, [-1, 2], [])).toThrow(RangeError);
    expect(() => matrixFromSparseEntriesInto(out, [2, 1.5], [])).toThrow(RangeError);
    expect(() => matrixFromSparseEntriesInto(out, [Number.NaN, 2], [])).toThrow(RangeError);
  });

  test('빈 entries + 정상 shape는 zero matrix를 반환한다', () => {
    const out = makeOut(2, 2, 9);
    matrixFromSparseEntriesInto(out, [2, 2], []);
    expect(out).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });
});

describe('matrixFromSparseEntries — matrix sparse 재구성 (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    const r = matrixFromSparseEntries([2, 2], [{ row: 1, column: 1, value: 4 }]);
    expect(r).toEqual([
      [0, 0],
      [0, 4],
    ]);
  });

  test('shape `[0, 0]`은 빈 배열을 반환한다', () => {
    expect(matrixFromSparseEntries([0, 0], [])).toEqual([]);
  });

  test('duplicate coordinate는 RangeError', () => {
    expect(() =>
      matrixFromSparseEntries(
        [2, 2],
        [
          { row: 0, column: 0, value: 1 },
          { row: 0, column: 0, value: 2 },
        ]
      )
    ).toThrow(RangeError);
  });

  test('one-sided zero shape는 RangeError', () => {
    expect(() => matrixFromSparseEntries([2, 0], [])).toThrow(RangeError);
    expect(() => matrixFromSparseEntries([0, 3], [])).toThrow(RangeError);
  });

  test('invalid row/column은 RangeError', () => {
    expect(() => matrixFromSparseEntries([2, 2], [{ row: 1.5, column: 0, value: 1 }])).toThrow(RangeError);
    expect(() => matrixFromSparseEntries([2, 2], [{ row: 0, column: 2, value: 1 }])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// round-trip
// ---------------------------------------------------------------------------

describe('sparse round-trip 정합성', () => {
  test('vector dense → sparse → dense는 원본과 같다', () => {
    const dense = [0, 3, 0, -1, 5, 0];
    const sparse = vectorSparseEntries(dense);
    const reconstructed = vectorFromSparseEntries(dense.length, sparse);
    expect(reconstructed).toEqual(dense);
  });

  test('matrix dense → sparse → dense는 원본과 같다', () => {
    const dense = [
      [0, 2, 0],
      [3, 0, 0],
      [0, 0, -1],
    ];
    const sparse = matrixSparseEntries(dense);
    const reconstructed = matrixFromSparseEntries([3, 3], sparse);
    expect(reconstructed).toEqual(dense);
  });
});
