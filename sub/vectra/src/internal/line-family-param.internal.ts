/**
 * line-family cross-domain relation 계산용 internal parametric shape.
 */

/**
 * parametric range 종류.
 *
 * - `finite`: t in [0, 1] - segment
 * - `ray`:    t in [0, +Infinity) - ray
 * - `inf`:    t in (-Infinity, +Infinity) - infinite-line
 */
export type LineFamilyRangeKind = 'finite' | 'ray' | 'inf';

/**
 * line-family shape를 cross-domain 계산용 내부 parametric record로 정규화한 표현.
 *
 * public Like 타입을 직접 받지 않고 number 좌표/성분으로 정규화한 상태이다.
 * 변환 helper(`segmentToLineFamilyParam` 등)는 degenerate 체크를 수행하지 않으며,
 * degenerate 처리 책임은 `lineFamilyIntersects` / `lineFamilyIntersectionPoint`에 있다.
 */
export interface LineFamilyParam {
  /** origin x 좌표 */
  ox: number;

  /** origin y 좌표 */
  oy: number;

  /** direction x 성분 */
  dx: number;

  /** direction y 성분 */
  dy: number;

  /** range kind */
  kind: LineFamilyRangeKind;
}
