/**
 * finite-difference matrix output `out`이 `[n, n]` shape를 담을 capacity를 가졌는지 검증한다.
 *
 * `out.length >= n`이고 각 `out[r]`(`r < n`)가 array이며 `out[r].length >= n`이어야 한다.
 * 부족하면 `RangeError`를 던지고 `out`은 수정하지 않는다.
 * caller가 `binCount` validation을 통과한 뒤 commit 직전 단계에서 호출한다.
 *
 * @param out 검증할 matrix output storage
 * @param n 필요한 square shape의 한 변 길이. 비음의 safe integer.
 * @param name error message에 사용할 인자 이름
 */
export function assertSquareMatrixOutCapacity(out: number[][], n: number, name: string): void {
  if (out.length < n) {
    throw new RangeError(`${name} row count (${out.length}) is less than required rows (${n})`);
  }
  for (let r = 0; r < n; r++) {
    const row = out[r];
    if (!Array.isArray(row)) {
      throw new RangeError(`${name}[${r}] must be an array with capacity >= ${n}`);
    }
    if (row.length < n) {
      throw new RangeError(`${name}[${r}] capacity (${row.length}) is less than required columns (${n})`);
    }
  }
}

/**
 * temp square matrix를 `out`에 commit한다.
 *
 * caller가 입력 검증과 capacity 검증을 모두 끝낸 뒤 호출한다.
 * `out[r][c] = temp[r][c]`를 기록하고 `out.length`는 `n`으로, 각 row length는 `n`으로 truncate된다.
 * `temp`는 `out`과 다른 array 인스턴스여야 한다. aliasing 보호는 caller가 fresh storage를 만드는
 * 방식으로 보장한다.
 *
 * @param out 결과를 commit할 writable matrix
 * @param temp commit할 source matrix. shape는 `[n, n]`.
 * @param n commit할 square shape의 한 변 길이. 비음의 safe integer.
 */
export function commitSquareMatrixInto(out: number[][], temp: readonly (readonly number[])[], n: number): void {
  for (let r = 0; r < n; r++) {
    const outRow = out[r];
    const src = temp[r];
    for (let c = 0; c < n; c++) {
      outRow[c] = src[c];
    }
    outRow.length = n;
  }
  out.length = n;
}

/**
 * `[n, n]` finite-difference matrix를 row-by-row writer로 채워 `out`에 기록한다.
 *
 * caller는 `binCount`를 validation한 뒤 호출한다. 내부에서 `out` capacity를 검증하고, fresh
 * temp matrix를 zero로 채운 뒤 각 row에 대해 `writeRow(row, i, n)`을 호출해 active coefficient만
 * 덮어쓰게 한다. 모든 row 작성이 끝나면 `out`에 commit해 atomicity를 보장한다.
 * `writeRow`가 throw하면 `out`은 호출 전 상태 그대로 남는다.
 * `n === 0`이면 capacity 검증과 row 작성 없이 `out.length = 0`만 설정한다.
 *
 * @param out 결과를 기록할 writable matrix. `[n, n]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param n square matrix 한 변의 길이. 비음의 safe integer.
 * @param writeRow row 작성기. zero로 채워진 row의 active 위치에 coefficient를 기록한다.
 */
export function fillFiniteDifferenceMatrixInto(
  out: number[][],
  n: number,
  writeRow: (row: number[], i: number, n: number) => void
): void {
  if (n === 0) {
    out.length = 0;
    return;
  }
  assertSquareMatrixOutCapacity(out, n, 'out');

  const temp: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = 0;
    }
    writeRow(row, r, n);
    temp[r] = row;
  }

  commitSquareMatrixInto(out, temp, n);
}
