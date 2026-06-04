import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** tuple 형태의 structural ellipse input. */
export type EllipseTuple = readonly [center: XYInput, radiusX: number, radiusY: number];

/** 중심점과 x/y 반지름으로 표현하는 structural ellipse object input. */
export interface EllipseObjectLike {
  /** ellipse 중심점 */
  readonly center: XYInput;

  /** x축 반지름 */
  readonly radiusX: number;

  /** y축 반지름 */
  readonly radiusY: number;
}

/** 중심점과 x/y 반지름으로 표현하는 structural ellipse input. */
export type EllipseLike = EllipseTuple | EllipseObjectLike;

/** writable 중심점과 x/y 반지름에 결과를 기록할 수 있는 structural ellipse output. */
export interface EllipseWritable<Center extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 ellipse 중심점 */
  center: Center;

  /** 기록 가능한 x축 반지름 */
  radiusX: number;

  /** 기록 가능한 y축 반지름 */
  radiusY: number;
}

/**
 * tuple 형태의 structural rotated ellipse input.
 *
 * `rotation`은 radian이며 standard CCW(`+x` → `+y`)이다. normalization을 적용하지 않는다.
 */
export type RotatedEllipseTuple = readonly [center: XYInput, radiusX: number, radiusY: number, rotation: number];

/**
 * 중심점, x/y 반지름, rotation으로 표현하는 structural rotated ellipse object input.
 *
 * boundary point는 `center + R(rotation)·(radiusX·cosθ, radiusY·sinθ)`로 정의한다.
 * `radiusX` semi-axis가 `rotation` 방향, `radiusY` semi-axis가 `rotation + π/2` 방향을 가리킨다.
 */
export interface RotatedEllipseObjectLike {
  /** ellipse 중심점 */
  readonly center: XYInput;

  /** local x축 반지름 */
  readonly radiusX: number;

  /** local y축 반지름 */
  readonly radiusY: number;

  /** local x축 semi-axis의 회전각. radian, standard CCW. normalization 미적용. */
  readonly rotation: number;
}

/** 중심점, x/y 반지름, rotation으로 표현하는 structural rotated ellipse input. */
export type RotatedEllipseLike = RotatedEllipseTuple | RotatedEllipseObjectLike;

/** writable 중심점, x/y 반지름, rotation에 결과를 기록할 수 있는 structural rotated ellipse output. */
export interface RotatedEllipseWritable<Center extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 ellipse 중심점 */
  center: Center;

  /** 기록 가능한 local x축 반지름 */
  radiusX: number;

  /** 기록 가능한 local y축 반지름 */
  radiusY: number;

  /** 기록 가능한 local x축 semi-axis의 회전각. radian, standard CCW. */
  rotation: number;
}
