/**
 * interpolation deterministic simulation helper의 public result/option type.
 *
 * `criticallyDamped`, `springLerp`는 caller-side output 다형성이 없는 fixed plain result를 반환하므로
 * `Into`/companion 대상이 아니다. result/option type만 노출한다.
 */

/**
 * spring/damped motion helper가 반환하는 다음 scalar state.
 *
 * `value`는 다음 위치, `velocity`는 다음 속도(value unit per dt unit)다.
 */
export interface SpringMotionResult {
  value: number;
  velocity: number;
}

/**
 * `criticallyDamped`의 옵션.
 *
 * `angularFrequency`는 수렴 속도를 제어한다. finite positive number(`> 0`)여야 한다.
 */
export interface CriticallyDampedOptions {
  /** 각진동수. finite positive (`> 0`). 기본 `12`. */
  angularFrequency?: number;
}

/**
 * `springLerp`의 옵션.
 *
 * `angularFrequency`는 수렴 속도, `dampingRatio`는 감쇠 정도를 제어한다. `dampingRatio < 1`은
 * underdamped(진동), `=== 1`은 critically damped, `> 1`은 overdamped, `=== 0`은 undamped 진동이다.
 */
export interface SpringLerpOptions {
  /** 각진동수. finite positive (`> 0`). 기본 `12`. */
  angularFrequency?: number;
  /** 감쇠비. finite, `>= 0`. 기본 `1`. */
  dampingRatio?: number;
}
