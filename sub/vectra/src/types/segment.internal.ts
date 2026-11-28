import type { SegmentWritable } from './flat-shapes.internal';

/**
 * 단일 segment를 `t` 기준으로 나눈 left/right segment를 기록할 수 있는 multi-output writable.
 *
 * `left.x2`·`left.y2`와 `right.x1`·`right.y1`은 같은 분할점 좌표를 갖는다.
 * 두 출력 선분의 구체 타입을 보존한다.
 */
export interface SegmentSplitWritable<
  Left extends SegmentWritable = SegmentWritable,
  Right extends SegmentWritable = SegmentWritable,
> {
  /** 분할 결과 앞쪽 선분. 원본 시작점에서 분할점까지다. */
  left: Left;

  /** 분할 결과 뒤쪽 선분. 분할점에서 원본 끝점까지다. */
  right: Right;
}

/** allocating companion `split`이 반환하는 plain object 분할 결과. */
export type SegmentSplit = SegmentSplitWritable;

/** 선분 균등 분할 옵션. 옵션을 생략하면 두 구간으로 나눈다. */
export interface SegmentSubdivideOptions {
  /** 균등 분할 개수. 양의 정수만 허용. */
  count: number;
}

/**
 * segment endpoint marker geometry 생성 옵션.
 *
 * 모든 필드는 필수다. 옵션 객체를 생략하면 `{ type: 'arrow', at: 'end', length: 10, width: 8 }`을 쓴다.
 */
export interface SegmentMarkerOptions {
  /** marker 모양. `arrow`는 chevron 3점, `tick`은 perpendicular 2점. */
  type: 'arrow' | 'tick';

  /** marker를 둘 endpoint. `both`는 start/end marker point를 모두 생성한다. */
  at: 'end' | 'start' | 'both';

  /** arrow barb 깊이이자 tick perpendicular 전체 길이. finite positive만 허용. */
  length: number;

  /** arrow barb 좌우 spread 전체 폭. finite positive만 허용. */
  width: number;
}
