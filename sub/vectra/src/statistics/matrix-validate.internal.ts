/**
 * matrix covariance/correlation의 입력 검증 helper.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다.
 * `orientation: "columns"`는 row를 observation, column을 variable로 본다.
 * `orientation: "rows"`는 row를 variable, column을 observation으로 본다.
 */

/**
 * `orientation`이 `"columns"` 또는 `"rows"`인지 검증한다. 위반 시 `RangeError`.
 *
 * @param orientation 검증할 orientation 값
 * @param name error message에 사용할 인자 이름
 */
export function assertOrientation(orientation: unknown, name: string): asserts orientation is 'columns' | 'rows' {
  if (orientation !== 'columns' && orientation !== 'rows') {
    throw new RangeError(`${name} must be "columns" | "rows", got ${String(orientation)}`);
  }
}

/**
 * `data`가 row-major rectangular `readonly (readonly number[])[]`임을 검증하고 각 row의 column 수가
 * 동일함을 보장한다.
 *
 * top-level 또는 row가 array가 아니면 `TypeError`. row length가 같지 않으면 `RangeError`.
 * 빈 matrix(`[]`)는 `rowCount = 0`, `columnCount = 0`을 반환한다.
 *
 * @param data 검증할 matrix
 * @param name error message에 사용할 인자 이름
 * @returns `rowCount`, `columnCount`. `rowCount === 0`이면 `columnCount === 0`.
 */
export function assertRectangularMatrix(data: unknown, name: string): { rowCount: number; columnCount: number } {
  if (!Array.isArray(data)) {
    throw new TypeError(`${name} must be a readonly number[][], got ${typeof data}`);
  }
  const rowCount = data.length;
  if (rowCount === 0) {
    return { rowCount: 0, columnCount: 0 };
  }
  const firstRow = data[0];
  if (!Array.isArray(firstRow)) {
    throw new TypeError(`${name}[0] must be a readonly number[], got ${typeof firstRow}`);
  }
  const columnCount = firstRow.length;
  for (let r = 1; r < rowCount; r++) {
    const row = data[r];
    if (!Array.isArray(row)) {
      throw new TypeError(`${name}[${r}] must be a readonly number[], got ${typeof row}`);
    }
    if (row.length !== columnCount) {
      throw new RangeError(
        `${name} must be rectangular: ${name}[${r}].length (${row.length}) !== ${name}[0].length (${columnCount})`
      );
    }
  }
  return { rowCount, columnCount };
}
