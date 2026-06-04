import type { GridCellLike, GridCellTuple, GridCellWritable, GridSpecLike, RectWritable } from '../types';
import { readX, readY } from './xy';

/** input이 tuple cell이면 true를 반환한다. */
function isGridCellTuple(cell: GridCellLike): cell is GridCellTuple {
  return Array.isArray(cell);
}

/**
 * GridCellLike input에서 column index를 읽는다.
 *
 * tuple input은 index 0을, object input은 col field를 읽는다.
 *
 * @param cell column index를 읽을 structural cell
 */
export function readGridCellCol(cell: GridCellLike): number {
  return isGridCellTuple(cell) ? cell[0] : cell.col;
}

/**
 * GridCellLike input에서 row index를 읽는다.
 *
 * tuple input은 index 1을, object input은 row field를 읽는다.
 *
 * @param cell row index를 읽을 structural cell
 */
export function readGridCellRow(cell: GridCellLike): number {
  return isGridCellTuple(cell) ? cell[1] : cell.row;
}

/**
 * GridSpecLike input에서 origin x 성분을 읽는다. origin이 없으면 0을 반환한다.
 *
 * @param spec origin을 읽을 structural grid spec
 */
export function readGridOriginX(spec: GridSpecLike): number {
  return spec.origin != null ? readX(spec.origin) : 0;
}

/**
 * GridSpecLike input에서 origin y 성분을 읽는다. origin이 없으면 0을 반환한다.
 *
 * @param spec origin을 읽을 structural grid spec
 */
export function readGridOriginY(spec: GridSpecLike): number {
  return spec.origin != null ? readY(spec.origin) : 0;
}

/**
 * GridSpecLike input에서 cell x size를 읽는다.
 *
 * `cellSize`가 number이면 그 값을, `XYInput`이면 x 성분을 읽는다.
 *
 * @param spec cell size를 읽을 structural grid spec
 */
export function readGridCellSizeX(spec: GridSpecLike): number {
  return typeof spec.cellSize === 'number' ? spec.cellSize : readX(spec.cellSize);
}

/**
 * GridSpecLike input에서 cell y size를 읽는다.
 *
 * `cellSize`가 number이면 그 값을, `XYInput`이면 y 성분을 읽는다.
 *
 * @param spec cell size를 읽을 structural grid spec
 */
export function readGridCellSizeY(spec: GridSpecLike): number {
  return typeof spec.cellSize === 'number' ? spec.cellSize : readY(spec.cellSize);
}

/**
 * cell size 두 성분이 positive finite number인지 검증한다.
 *
 * `0`, 음수, `NaN`, `Infinity`, `-Infinity`는 `RangeError`다. 모든 public grid helper가 같은
 * cellSize 정책을 공유하도록 이 helper를 통해 검증한다.
 *
 * @param sizeX 검증할 cell x size
 * @param sizeY 검증할 cell y size
 */
export function validateGridCellSize(sizeX: number, sizeY: number): void {
  if (!Number.isFinite(sizeX) || sizeX <= 0 || !Number.isFinite(sizeY) || sizeY <= 0) {
    throw new RangeError(
      `grid cellSize components must be positive finite numbers, got (${String(sizeX)}, ${String(sizeY)})`
    );
  }
}

/**
 * world point 또는 origin 두 성분이 finite인지 검증한다.
 *
 * `x` 또는 `y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. 모든 grid
 * coordinate helper가 같은 실패 정책을 operand에 적용하도록 이 helper를 통해 검증한다.
 *
 * @param x 검증할 x 성분
 * @param y 검증할 y 성분
 */
export function validateGridFinite(x: number, y: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new RangeError(`grid point and origin must have finite components, got (${String(x)}, ${String(y)})`);
  }
}

/**
 * cell col/row가 모두 integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float는 모두 `RangeError`다. cell coordinate를
 * world 좌표로 되돌리는 모든 grid helper가 같은 integer 정책을 공유하도록 이 helper를 통해
 * 검증한다.
 *
 * @param col 검증할 cell column index
 * @param row 검증할 cell row index
 */
export function validateGridCellInteger(col: number, row: number): void {
  if (!Number.isInteger(col) || !Number.isInteger(row)) {
    throw new RangeError(`grid cell col/row must be integers, got (${String(col)}, ${String(row)})`);
  }
}

/**
 * 계산된 grid 좌표 두 성분이 finite인지 검증한다.
 *
 * 큰 cell index와 cell size 곱이 overflow해 `Infinity`가 되는 경우를 `RangeError`로 막는다.
 *
 * @param x 검증할 계산 결과 x 성분
 * @param y 검증할 계산 결과 y 성분
 */
export function validateGridComputedFinite(x: number, y: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new RangeError(`grid computed coordinate must be finite, got (${String(x)}, ${String(y)})`);
  }
}

/**
 * 계산된 grid cell range boundary가 safe integer인지 검증한다.
 *
 * collection helper는 각 cell을 순회하므로 `col++`/`row++`가 값을 바꿀 수 없는 unsafe integer
 * 범위를 허용하지 않는다.
 *
 * @param value 검증할 계산된 cell range boundary
 * @param label 오류 메시지에 쓸 값 이름
 */
export function validateGridComputedCellRange(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`grid computed ${label} must be a safe integer, got ${String(value)}`);
  }
}

/**
 * index/col/row 같은 grid index 값이 non-negative safe integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float, 음수, safe integer 범위를 벗어난 값은 모두
 * `RangeError`다. `Number.isSafeInteger`를 사용해 int32 coercion 없이 검증한다.
 *
 * @param value 검증할 index 값
 * @param label 오류 메시지에 쓸 값 이름
 */
export function validateGridNonNegativeIndex(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`grid ${label} must be a non-negative safe integer, got ${String(value)}`);
  }
}

/**
 * traversal/neighbor 대상 cell col/row가 safe integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float, safe integer 범위를 벗어난 값은 모두
 * `RangeError`다. cell을 순회하거나 offset을 더하는 helper는 `col++`/`col + 1`이 값을 바꿀 수
 * 없는 unsafe integer 범위를 허용하지 않으므로 이 helper로 검증한다.
 *
 * @param col 검증할 cell column index
 * @param row 검증할 cell row index
 */
export function validateGridCellSafeInteger(col: number, row: number): void {
  if (!Number.isSafeInteger(col) || !Number.isSafeInteger(row)) {
    throw new RangeError(`grid cell col/row must be safe integers, got (${String(col)}, ${String(row)})`);
  }
}

/**
 * columnCount가 positive safe integer인지 검증한다.
 *
 * `0`, 음수, non-integer, `NaN`, `Infinity`, safe integer 범위를 벗어난 값은 모두 `RangeError`다.
 *
 * @param columnCount 검증할 column 개수
 */
export function validateGridColumnCount(columnCount: number): void {
  if (!Number.isSafeInteger(columnCount) || columnCount <= 0) {
    throw new RangeError(`grid columnCount must be a positive safe integer, got ${String(columnCount)}`);
  }
}

/**
 * cell col이 row-major grid의 column 범위 안에 있는지 검증한다.
 *
 * `col >= columnCount`이면 같은 flat index를 만드는 다른 row의 cell과 충돌하므로 `RangeError`다.
 *
 * @param col 검증할 cell column index
 * @param columnCount grid 한 row의 column 개수
 */
export function validateGridColumnRange(col: number, columnCount: number): void {
  if (col >= columnCount) {
    throw new RangeError(`grid cell col must be less than columnCount, got ${String(col)} >= ${String(columnCount)}`);
  }
}

/**
 * rect region 입력 4 성분이 모두 finite인지 검증한다.
 *
 * `x`, `y`, `width`, `height` 중 하나라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이면
 * `RangeError`다. rect 기반 grid collection helper가 같은 finite 정책을 공유하도록 이 helper를
 * 통해 검증한다.
 *
 * @param x 검증할 rect 왼쪽 x 좌표
 * @param y 검증할 rect 위쪽 y 좌표
 * @param width 검증할 rect 너비
 * @param height 검증할 rect 높이
 */
export function validateGridRectFinite(x: number, y: number, width: number, height: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    throw new RangeError(
      `grid rect components must be finite, got (${String(x)}, ${String(y)}, ${String(width)}, ${String(height)})`
    );
  }
}

/**
 * grid collection 길이가 안전한 array length 범위 안인지 검증한다.
 *
 * 큰 region과 작은 cell이 만드는 cell 개수가 safe integer가 아니거나 JS array 최대 길이
 * `0xffffffff`를 넘으면 `RangeError`다. 거대한 allocation 시도를 미리 막는다.
 *
 * @param count 검증할 collection cell 개수
 */
export function validateGridCollectionCount(count: number): void {
  if (!Number.isSafeInteger(count) || count < 0 || count > 0xffffffff) {
    throw new RangeError(
      `grid collection length must be a safe array length within 0..${0xffffffff}, got ${String(count)}`
    );
  }
}

/**
 * bounds corner 4 성분이 모두 finite인지 검증한다.
 *
 * min/max corner의 `x` 또는 `y`가 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다.
 * bounds 기반 grid collection helper가 같은 finite 정책을 공유하도록 이 helper를 통해 검증한다.
 *
 * @param minX 검증할 min corner x 좌표
 * @param minY 검증할 min corner y 좌표
 * @param maxX 검증할 max corner x 좌표
 * @param maxY 검증할 max corner y 좌표
 */
export function validateGridBoundsFinite(minX: number, minY: number, maxX: number, maxY: number): void {
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    throw new RangeError(
      `grid bounds components must be finite, got min (${String(minX)}, ${String(minY)}) max (${String(maxX)}, ${String(maxY)})`
    );
  }
}

/**
 * rows/cols 같은 분할 개수가 positive safe integer인지 검증한다.
 *
 * `0`, 음수, non-integer, `NaN`, `Infinity`, safe integer 범위를 벗어난 값은 모두 `RangeError`다.
 *
 * @param value 검증할 분할 개수
 * @param label 오류 메시지에 쓸 값 이름
 */
export function validateGridSplitCount(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`grid ${label} must be a positive safe integer, got ${String(value)}`);
  }
}

/**
 * x/y edge 배열에서 row-major rect collection을 out에 commit하고 out을 반환한다.
 *
 * `out`을 비운 뒤 row 오름차순, 각 row에서 col 오름차순으로 `{ x, y, width, height }` plain
 * object를 push한다. rect 개수는 `(xEdges.length - 1) * (yEdges.length - 1)`이다. caller가 미리
 * edge 배열 finite 여부와 collection capacity를 검증한 뒤 호출한다.
 *
 * @param out rect collection을 기록할 writable array
 * @param xEdges x축 cell 경계. 길이는 col 개수 + 1
 * @param yEdges y축 cell 경계. 길이는 row 개수 + 1
 */
export function commitGridRectGrid(
  out: RectWritable[],
  xEdges: readonly number[],
  yEdges: readonly number[]
): RectWritable[] {
  out.length = 0;
  for (let r = 0; r + 1 < yEdges.length; r++) {
    const y = yEdges[r];
    const height = yEdges[r + 1] - y;
    for (let c = 0; c + 1 < xEdges.length; c++) {
      const x = xEdges[c];
      out.push({ x, y, width: xEdges[c + 1] - x, height });
    }
  }
  return out;
}

/**
 * center cell에 offset 목록을 적용한 neighbor cell collection을 out에 commit하고 out을 반환한다.
 *
 * offset 순서가 곧 neighbor 출력 순서다. 먼저 모든 neighbor 결과 col/row가 safe integer인지
 * 검증하고, 하나라도 safe integer 범위를 벗어나면 out을 수정하지 않고 `RangeError`를 던진다.
 * 검증을 통과하면 out을 비운 뒤 offset 순서대로 `{ col, row }` plain object를 push한다. caller가
 * center col/row를 safe integer로 미리 검증한 뒤 호출한다.
 *
 * @param out neighbor collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param col center cell column index
 * @param row center cell row index
 * @param offsets neighbor 출력 순서대로 적용할 `[dCol, dRow]` offset 목록
 */
export function commitGridNeighbors(
  out: GridCellWritable[],
  col: number,
  row: number,
  offsets: readonly (readonly [number, number])[]
): GridCellWritable[] {
  for (const offset of offsets) {
    const neighborCol = col + offset[0];
    const neighborRow = row + offset[1];
    if (!Number.isSafeInteger(neighborCol) || !Number.isSafeInteger(neighborRow)) {
      throw new RangeError(
        `grid neighbor cell col/row must be safe integers, got (${String(neighborCol)}, ${String(neighborRow)})`
      );
    }
  }
  out.length = 0;
  for (const offset of offsets) {
    out.push({ col: col + offset[0], row: row + offset[1] });
  }
  return out;
}

/**
 * GridCellWritable에 col/row를 기록하고 out을 반환한다.
 *
 * @param out cell coordinate를 기록할 writable output
 * @param col 기록할 column index
 * @param row 기록할 row index
 */
export function writeGridCell<Out extends GridCellWritable>(out: Out, col: number, row: number): Out {
  out.col = col;
  out.row = row;
  return out;
}
