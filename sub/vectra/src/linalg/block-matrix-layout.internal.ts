import type { MatLike } from './types';
import { assertFiniteMatrixEntries, extractMatrixShape } from './validate.internal';

export interface BlockMatrixLayout {
  readonly blockColumnCount: number;
  readonly blockRowCount: number;
  readonly columnWidths: number[];
  readonly rowHeights: number[];
  readonly totalColumns: number;
  readonly totalRows: number;
}

/**
 * block grid의 shape 호환성과 finite entry를 검증하고 결과 matrix layout을 계산한다.
 */
export function resolveBlockMatrixLayout(blocks: readonly (readonly MatLike[])[]): BlockMatrixLayout {
  const blockRowCount = blocks.length;
  if (blockRowCount === 0) {
    return {
      blockColumnCount: 0,
      blockRowCount,
      columnWidths: [],
      rowHeights: [],
      totalColumns: 0,
      totalRows: 0,
    };
  }

  const blockColumnCount = blocks[0].length;
  const columnWidths = new Array<number>(blockColumnCount);
  const rowHeights = new Array<number>(blockRowCount);

  for (let i = 0; i < blockRowCount; i++) {
    const row = blocks[i];
    if (row.length === 0) {
      throw new RangeError(`blocks[${i}] must have at least one block`);
    }
    if (row.length !== blockColumnCount) {
      throw new RangeError(`blocks[${i}].length (${row.length}) must equal blocks[0].length (${blockColumnCount})`);
    }
    let rowHeight = -1;
    for (let j = 0; j < blockColumnCount; j++) {
      const block = row[j];
      const blockName = `blocks[${i}][${j}]`;
      const shape = extractMatrixShape(block, blockName);
      assertFiniteMatrixEntries(block, shape, blockName);
      const [r, c] = shape;
      if (rowHeight === -1) {
        rowHeight = r;
      } else if (r !== rowHeight) {
        throw new RangeError(`${blockName} row count (${r}) must equal blocks[${i}][0] row count (${rowHeight})`);
      }
      if (i === 0) {
        columnWidths[j] = c;
      } else if (c !== columnWidths[j]) {
        throw new RangeError(
          `${blockName} column count (${c}) must equal blocks[0][${j}] column count (${columnWidths[j]})`
        );
      }
    }
    rowHeights[i] = rowHeight;
  }

  let totalRows = 0;
  for (let i = 0; i < blockRowCount; i++) {
    totalRows += rowHeights[i];
  }
  let totalColumns = 0;
  for (let j = 0; j < blockColumnCount; j++) {
    totalColumns += columnWidths[j];
  }
  if (!Number.isSafeInteger(totalRows) || !Number.isSafeInteger(totalColumns)) {
    throw new RangeError(`blockMatrix result shape [${totalRows}, ${totalColumns}] exceeds safe integer range`);
  }

  return {
    blockColumnCount,
    blockRowCount,
    columnWidths,
    rowHeights,
    totalColumns,
    totalRows,
  };
}

/**
 * 이미 검증된 block grid를 layout offset에 맞춰 temp matrix로 복사한다.
 */
export function copyBlocksToMatrix(
  blocks: readonly (readonly MatLike[])[],
  layout: BlockMatrixLayout,
  temp: number[][]
): void {
  let rowOffset = 0;
  for (let i = 0; i < layout.blockRowCount; i++) {
    const blockRow = blocks[i];
    const rowHeight = layout.rowHeights[i];
    let columnOffset = 0;
    for (let j = 0; j < layout.blockColumnCount; j++) {
      const block = blockRow[j];
      const columnWidth = layout.columnWidths[j];
      for (let r = 0; r < rowHeight; r++) {
        const srcRow = block[r];
        const destRow = temp[rowOffset + r];
        for (let c = 0; c < columnWidth; c++) {
          destRow[columnOffset + c] = srcRow[c];
        }
      }
      columnOffset += columnWidth;
    }
    rowOffset += rowHeight;
  }
}
