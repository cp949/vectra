/** `matrixToPose*`의 rigid 판정 옵션. 옵션을 생략하면 `epsilon`은 `1e-9`다. */
export interface MatrixToPoseOptions {
  /**
   * matrix가 pure rigid(scale/skew/shear/reflection 없음)인지 판정할 허용 오차.
   *
   * column length는 `1`에, column dot product는 `0`에, determinant는 `1`에 이 값 이내로
   * 가까워야 rigid로 본다. finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  epsilon: number;
}

/** `poseDistance`의 translation/angular 결합 metric 옵션. 옵션을 생략하면 `angularWeight`는 `1`이다. */
export interface PoseDistanceOptions {
  /**
   * angular distance를 position 단위와 결합할 때 곱하는 가중치.
   *
   * `hypot(positionDistance, angularDistance * angularWeight)`로 결합한다. radian angle 값을
   * position 거리 단위로 환산하는 scale이다. `0`이면 translation-only distance가 된다.
   *
   * finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  angularWeight: number;
}

/** `poseApproxEquals`의 position/angle 분리 비교 옵션. 옵션을 생략하면 두 허용 오차는 각각 `1e-9`다. */
export interface PoseApproxEqualsOptions {
  /**
   * position 비교 허용 오차. `hypot(dx, dy) <= positionEpsilon`이면 position이 같다고 본다.
   *
   * finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  positionEpsilon: number;

  /**
   * angle 비교 허용 오차. shortest angular difference의 absolute value가 `<= angleEpsilon`이면
   * angle이 같다고 본다.
   *
   * finite이고 `>= 0`이어야 하며 위반 시 `RangeError`.
   */
  angleEpsilon: number;
}
