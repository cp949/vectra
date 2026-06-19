/**
 * matrix covariance/correlation의 square buffer 할당, output commit helper.
 *
 * commit 도우미는 검증 단계와 commit 단계를 분리해 caller가 atomicity를 직접 보장할 수 있게 하고,
 * `out`을 fresh row 배열로 교체해 `out`과 `data`가 같은 nested array여도 aliasing 위험이 없게 한다.
 */

/**
 * `n x n` square matrix용 temp buffer를 fresh 배열로 할당한다.
 *
 * 각 row를 pre-allocate해 caller가 `temp[r][c] = value` 형태로 안전하게 write할 수 있게 한다.
 * caller는 모든 entry를 채운 뒤 `commitSymmetricMatrixInto`로 단일 commit한다.
 *
 * @param n matrix 한 변의 길이
 */
export function allocateSquareMatrixBuffer(n: number): number[][] {
  const buffer: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    buffer[r] = new Array<number>(n);
  }
  return buffer;
}

/**
 * 완성된 square symmetric matrix를 `out`에 commit한다.
 *
 * caller가 모든 validation/산술을 끝낸 뒤 단일 commit으로 호출한다. `out`을 새 row 배열로 교체해
 * `out`과 `data`가 같은 nested array여도 결과가 destroy되지 않도록 한다. 각 row entry의 `-0`은 `0`으로
 * canonicalize한다. `n === 0`이면 `out.length = 0`만 설정한다.
 *
 * @param out commit 대상 writable matrix
 * @param temp commit할 square matrix
 * @param n matrix 한 변의 길이
 */
export function commitSymmetricMatrixInto(out: number[][], temp: readonly (readonly number[])[], n: number): void {
  // out과 data가 같은 nested array일 수 있다. data row를 직접 덮어쓰지 않고 fresh row 배열을
  // 만들어 교체한다. 그래도 out 자체는 같은 외부 배열이라 length만 갱신한다.
  const fresh: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = temp[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      const value = src[c];
      row[c] = Object.is(value, -0) ? 0 : value;
    }
    fresh[r] = row;
  }
  out.length = 0;
  for (let r = 0; r < n; r++) {
    out.push(fresh[r]);
  }
}

/**
 * 완성된 rectangular matrix(`rows × cols`)를 `out`에 commit한다.
 *
 * caller가 모든 validation/산술을 끝낸 뒤 단일 commit으로 호출한다. `out`을 새 row 배열로 교체해
 * `out`과 `data`가 같은 nested array여도 결과가 destroy되지 않도록 한다. 각 row entry의 `-0`은 `0`으로
 * canonicalize한다. `rows === 0`이면 `out.length = 0`만 설정한다.
 *
 * @param out commit 대상 writable matrix
 * @param temp commit할 rectangular matrix
 * @param rows row 개수
 * @param cols 각 row의 길이
 */
export function commitRectangularMatrixInto(
  out: number[][],
  temp: readonly (readonly number[])[],
  rows: number,
  cols: number
): void {
  // out과 data가 같은 nested array일 수 있다. fresh row 배열로 교체해 aliasing 위험을 제거한다.
  const fresh: number[][] = new Array(rows);
  for (let r = 0; r < rows; r++) {
    const src = temp[r];
    const row = new Array<number>(cols);
    for (let c = 0; c < cols; c++) {
      const value = src[c];
      row[c] = Object.is(value, -0) ? 0 : value;
    }
    fresh[r] = row;
  }
  out.length = 0;
  for (let r = 0; r < rows; r++) {
    out.push(fresh[r]);
  }
}
