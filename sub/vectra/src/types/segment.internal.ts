import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural segment input. */
export type SegmentTuple = readonly [a: XYInput, b: XYInput];

/** 두 endpoint로 표현하는 structural segment object input. */
export interface SegmentObjectLike {
  /** segment 시작점 */
  readonly a: XYInput;

  /** segment 끝점 */
  readonly b: XYInput;
}

/** 두 endpoint로 표현하는 structural segment input. */
export type SegmentLike = SegmentObjectLike | SegmentTuple;

/** 두 writable endpoint에 결과를 기록할 수 있는 structural segment output. */
export interface SegmentWritable<A extends XYWritable = XYObjectWritable, B extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 segment 시작점 */
  a: A;

  /** 기록 가능한 segment 끝점 */
  b: B;
}

/**
 * 단일 segment를 `t` 기준으로 나눈 left/right segment를 기록할 수 있는 multi-output writable.
 *
 * `left.b`와 `right.a`는 같은 분할점 좌표를 갖는다(같은 object reference일 필요는 없다).
 * 각 endpoint storage의 writable shape를 generic으로 보존한다.
 */
export interface SegmentSplitWritable<
  Left extends SegmentWritable<XYWritable, XYWritable> = SegmentWritable,
  Right extends SegmentWritable<XYWritable, XYWritable> = SegmentWritable,
> {
  /** 분할 결과 앞쪽 segment `a -> p` */
  left: Left;

  /** 분할 결과 뒤쪽 segment `p -> b` */
  right: Right;
}

/** allocating companion `split`이 반환하는 plain object 분할 결과. */
export type SegmentSplit = SegmentSplitWritable;

/** segment를 count 기준 균등 N분할하는 옵션. */
export interface SegmentSubdivideOptions {
  /** 균등 분할 개수. positive integer만 허용. 기본값 `2`. */
  count?: number;
}

/** segment endpoint marker geometry 생성 옵션. */
export interface SegmentMarkerOptions {
  /** marker 모양. `arrow`는 chevron 3점, `tick`은 perpendicular 2점. 기본값 `arrow`. */
  type?: 'arrow' | 'tick';

  /** marker를 둘 endpoint. 기본값 `end`. `both`는 start/end marker point를 모두 생성한다. */
  at?: 'end' | 'start' | 'both';

  /** arrow barb 깊이이자 tick perpendicular 전체 길이. finite positive만 허용. 기본값 `10`. */
  length?: number;

  /** arrow barb 좌우 spread 전체 폭. finite positive만 허용. 기본값 `8`. */
  width?: number;
}
