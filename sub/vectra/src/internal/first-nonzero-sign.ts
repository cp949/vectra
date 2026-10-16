/**
 * 첫 strict non-zero entry의 부호를 반환한다.
 *
 * 첫 non-zero가 음수이면 `-1`, 그 외에는 `1`이다. 모든 entry가 `0`/`-0`이면 `1`이다.
 * `NaN`은 `!== 0`이므로 첫 non-zero로 보고 `1`을 반환한다.
 *
 * caller는 이 부호를 곱해 "첫 non-zero가 양수" 규약을 적용한다. 뒤집기와 cleanup은 caller가 소유한다.
 *
 * @param values 부호를 찾을 vector
 */
export function firstNonZeroSign(values: ArrayLike<number>): 1 | -1 {
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v !== 0) {
      return v < 0 ? -1 : 1;
    }
  }
  return 1;
}

/**
 * matrix의 `col`번째 column에서 `0..n-1`행을 훑어 첫 strict non-zero entry의 부호를 반환한다.
 *
 * 규칙은 `firstNonZeroSign`과 같다. column을 복사하지 않으려고 따로 둔다.
 * caller는 `matrix.length >= n`, 각 row 길이 `> col`을 보장한다.
 *
 * @param matrix column을 읽을 matrix
 * @param col 읽을 column index
 * @param n 훑을 row 수
 */
export function firstNonZeroSignOfColumn(matrix: readonly (readonly number[])[], col: number, n: number): 1 | -1 {
  for (let r = 0; r < n; r++) {
    const v = matrix[r][col];
    if (v !== 0) {
      return v < 0 ? -1 : 1;
    }
  }
  return 1;
}
