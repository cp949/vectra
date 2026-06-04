import type { XYInput, XYObjectWritable, XYWritable } from './xy.internal';

/** position + angle로 표현하는 structural 2D rigid pose object input. */
export interface Pose2ObjectLike {
  /** pose의 translation 위치 */
  readonly position: XYInput;

  /** local frame 회전각. 단위는 radian. */
  readonly angle: number;
}

/** tuple 형태의 structural 2D rigid pose input. */
export type Pose2Tuple = readonly [position: XYInput, angle: number];

/** position/angle object 또는 tuple로 표현하는 structural 2D rigid pose input. */
export type Pose2Like = Pose2ObjectLike | Pose2Tuple;

/** position/angle에 결과를 기록할 수 있는 structural 2D rigid pose output. */
export interface Pose2Writable<Position extends XYWritable = XYObjectWritable> {
  /** 기록 가능한 translation 위치 storage */
  position: Position;

  /** 기록 가능한 local frame 회전각. 단위는 radian. */
  angle: number;
}

/** `matrixToPose*`의 rigid 판정 옵션. */
export interface MatrixToPoseOptions {
  /**
   * matrix가 pure rigid(scale/skew/shear/reflection 없음)인지 판정할 허용 오차.
   *
   * column length는 `1`에, column dot product는 `0`에, determinant는 `1`에 이 값 이내로
   * 가까워야 rigid로 본다. 생략 시 `1e-9`. finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  epsilon?: number;
}

/** `poseDistance`의 translation/angular 결합 metric 옵션. */
export interface PoseDistanceOptions {
  /**
   * angular distance를 position 단위와 결합할 때 곱하는 가중치.
   *
   * `Math.hypot(positionDistance, angularDistance * angularWeight)`로 결합한다. radian angle 값을
   * position 거리 단위로 환산하는 scale이다. `0`이면 translation-only distance가 된다.
   *
   * 생략 시 `1`. finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  angularWeight?: number;
}

/** `poseApproxEquals`의 position/angle 분리 비교 옵션. */
export interface PoseApproxEqualsOptions {
  /**
   * position 비교 허용 오차. `Math.hypot(dx, dy) <= positionEpsilon`이면 position이 같다고 본다.
   *
   * 생략 시 `1e-9`. finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  positionEpsilon?: number;

  /**
   * angle 비교 허용 오차. shortest angular difference의 absolute value가 `<= angleEpsilon`이면
   * angle이 같다고 본다.
   *
   * 생략 시 `1e-9`. finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  angleEpsilon?: number;
}
