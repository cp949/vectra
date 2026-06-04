import type { XYLike, XYObjectWritable, XYWritable } from '../types';

/** point-to-primitive fitting helper가 공유하는 옵션. */
export interface FitOptions {
  /**
   * rank/singularity/degenerate 판정 tolerance. 미지정 시 `1e-9`.
   *
   * input finite 검증에는 사용하지 않는다. NaN/Infinity/음수는 `RangeError`.
   */
  readonly epsilon?: number;
}

/**
 * point cloud의 2D principal axis pair.
 *
 * `primary`는 큰 variance axis, `secondary`는 직교 axis다. 두 축 모두 unit length이고 첫 strict
 * non-zero component가 양수가 되도록 sign이 canonicalize되어 있다. 두 축은 독립적으로 canonicalize되므로
 * `(primary, secondary)` 쌍의 handedness는 입력에 따라 달라질 수 있다(고정 좌표계 보장 없음).
 */
export interface PrincipalDirections {
  /** 큰 variance를 갖는 principal axis. unit length. */
  readonly primary: XYLike;

  /** `primary`에 직교하는 secondary axis. unit length. */
  readonly secondary: XYLike;
}

/**
 * `principalDirectionsInto`가 결과를 기록할 writable principal axis pair.
 *
 * `primary`/`secondary`는 caller가 제공한 좌표 storage다. 성공 시에만 두 storage에 unit-length axis를
 * 기록한다.
 */
export interface PrincipalDirectionsWritable<
  Primary extends XYWritable = XYObjectWritable,
  Secondary extends XYWritable = XYObjectWritable,
> {
  /** 큰 variance axis를 기록할 writable 좌표 storage. */
  primary: Primary;

  /** secondary axis를 기록할 writable 좌표 storage. */
  secondary: Secondary;
}
