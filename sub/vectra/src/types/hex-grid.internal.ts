import type { XYInput } from './xy.internal';

/** tuple 형태의 structural axial hex coordinate input. */
export type HexAxialTuple = readonly [q: number, r: number];

/** tuple 형태의 structural cube hex coordinate input. `q + r + s === 0` invariant를 가진다. */
export type HexCubeTuple = readonly [q: number, r: number, s: number];

/** tuple 형태의 structural offset hex coordinate input. */
export type HexOffsetTuple = readonly [col: number, row: number];

/** q/r object 또는 tuple로 표현하는 structural axial hex coordinate input. */
export type HexAxialLike = { readonly q: number; readonly r: number } | HexAxialTuple;

/**
 * q/r/s object 또는 tuple로 표현하는 structural cube hex coordinate input.
 *
 * cube coordinate는 `q + r + s === 0` invariant를 가진다.
 */
export type HexCubeLike = { readonly q: number; readonly r: number; readonly s: number } | HexCubeTuple;

/** col/row object 또는 tuple로 표현하는 structural offset hex coordinate input. */
export type HexOffsetLike = { readonly col: number; readonly row: number } | HexOffsetTuple;

/** q/r에 결과를 기록할 수 있는 structural axial hex coordinate output. */
export interface HexAxialWritable {
  /** 기록 가능한 axial q 성분 */
  q: number;

  /** 기록 가능한 axial r 성분 */
  r: number;
}

/** q/r/s에 결과를 기록할 수 있는 structural cube hex coordinate output. */
export interface HexCubeWritable {
  /** 기록 가능한 cube q 성분 */
  q: number;

  /** 기록 가능한 cube r 성분 */
  r: number;

  /** 기록 가능한 cube s 성분 */
  s: number;
}

/** col/row에 결과를 기록할 수 있는 structural offset hex coordinate output. */
export interface HexOffsetWritable {
  /** 기록 가능한 offset column index */
  col: number;

  /** 기록 가능한 offset row index */
  row: number;
}

/** hex pixel layout의 hexagon orientation. 생략하면 `"pointy"`다. */
export type HexOrientation = 'pointy' | 'flat';

/** offset coordinate가 axial coordinate를 어떻게 shove하는지 정의하는 layout convention. default가 없다. */
export type HexOffsetLayout = 'odd-r' | 'even-r' | 'odd-q' | 'even-q';

/** axial hex coordinate를 world pixel로 옮기는 layout spec input. */
export interface HexLayoutLike {
  /** layout origin world 좌표. 생략하면 `(0, 0)`이다. */
  readonly origin?: XYInput;

  /** hexagon size. positive finite number여야 한다. */
  readonly size: number;

  /** hexagon orientation. 생략하면 `"pointy"`다. */
  readonly orientation?: HexOrientation;
}
