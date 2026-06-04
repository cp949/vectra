import type { XYInput } from './xy.internal';

/** tuple 형태의 structural integer cell coordinate input. */
export type GridCellTuple = readonly [col: number, row: number];

/** col/row로 표현하는 structural integer cell coordinate object input. */
export interface GridCellObjectLike {
  /** cell column index */
  readonly col: number;

  /** cell row index */
  readonly row: number;
}

/** col/row object 또는 tuple로 표현하는 structural integer cell coordinate input. */
export type GridCellLike = GridCellObjectLike | GridCellTuple;

/** col/row에 결과를 기록할 수 있는 structural integer cell coordinate output. */
export interface GridCellWritable {
  /** 기록 가능한 cell column index */
  col: number;

  /** 기록 가능한 cell row index */
  row: number;
}

/** grid 좌표계를 정의하는 structural spec input. */
export interface GridSpecLike {
  /** grid origin world 좌표. 생략하면 `(0, 0)`이다. */
  readonly origin?: XYInput;

  /** cell 크기. number이면 square cell, `XYInput`이면 축별 rectangular cell이다. 각 성분은 positive finite여야 한다. */
  readonly cellSize: XYInput | number;
}
