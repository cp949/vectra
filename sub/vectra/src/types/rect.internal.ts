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
