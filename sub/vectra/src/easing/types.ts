/**
 * easing broad scalar shaping helper의 옵션 type.
 *
 * 각 옵션은 scalar shaping 함수의 곡선 모양을 제어한다.
 */

/**
 * `logistic`의 옵션.
 *
 * `steepness`는 중앙(`t = 0.5`) 기울기를 키운다. finite positive number(`> 0`)여야 한다.
 */
export interface LogisticOptions {
  /** S 곡선 기울기. finite positive (`> 0`). 기본 `10`. */
  readonly steepness?: number;
}

/**
 * `seat`의 옵션.
 *
 * `power`는 중앙 평탄도를 제어한다. `power > 1`이면 중앙 수평 접선(seat), `power === 1`이면 linear,
 * `0 < power < 1`이면 중앙이 가팔라진다. finite positive number(`> 0`)여야 한다.
 */
export interface SeatOptions {
  /** 곡선 power. finite positive (`> 0`). 기본 `2`. */
  readonly power?: number;
}

/**
 * `doubleSeat`의 옵션.
 *
 * `center`는 두 seat 조각을 잇는 breakpoint이며 `(center, 0.5)`를 지난다. `0 < center < 1`
 * exclusive여야 한다 (`0`/`1`은 division by zero). `power`는 `seat`과 동일한 의미다.
 */
export interface DoubleSeatOptions {
  /** breakpoint 위치. finite, `0 < center < 1`. 기본 `0.5`. */
  readonly center?: number;
  /** 곡선 power. finite positive (`> 0`). 기본 `2`. */
  readonly power?: number;
}

/**
 * `cliff`의 옵션.
 *
 * `threshold`는 전이 중심, `width`는 전이 폭이다. band 밖은 평탄(`0`/`1`)이고 band 안은 smoothstep
 * 연속 전이다. `width`는 finite positive number(`> 0`)여야 한다 (`0`이면 hard step).
 */
export interface CliffOptions {
  /** 전이 중심. finite number. 기본 `0.5`. */
  readonly threshold?: number;
  /** 전이 폭. finite positive (`> 0`). 기본 `0.1`. */
  readonly width?: number;
}
