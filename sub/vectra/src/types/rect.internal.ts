/** tuple 형태의 structural rect input. */
export type RectTuple = readonly [x: number, y: number, width: number, height: number];

/** x/y/width/height로 표현하는 structural rect object input. */
export interface RectObjectLike {
  /** rect 왼쪽 x 좌표 */
  readonly x: number;

  /** rect 위쪽 y 좌표 */
  readonly y: number;

  /** rect 너비 */
  readonly width: number;

  /** rect 높이 */
  readonly height: number;
}

/** x/y/width/height object 또는 tuple로 표현하는 structural rect input. */
export type RectLike = RectObjectLike | RectTuple;

/** x/y/width/height에 결과를 기록할 수 있는 structural rect output. */
export interface RectWritable {
  /** 기록 가능한 rect 왼쪽 x 좌표 */
  x: number;

  /** 기록 가능한 rect 위쪽 y 좌표 */
  y: number;

  /** 기록 가능한 rect 너비 */
  width: number;

  /** 기록 가능한 rect 높이 */
  height: number;
}

/**
 * `rectAlignTo*`의 정렬 기준 anchor. horizontal(`left`/`center`/`right`)과
 * vertical(`top`/`center`/`bottom`)을 조합한 9개 string literal이다.
 */
export type RectAlignAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/** `rectAlignTo*`의 정렬 옵션. */
export interface RectAlignOptions {
  /** target과 container의 같은 anchor point를 일치시킨다. 생략 시 `'center'`. */
  anchor?: RectAlignAnchor;
}
