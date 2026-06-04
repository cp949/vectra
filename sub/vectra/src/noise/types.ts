/**
 * deterministic 2D scalar field 함수와 옵션 타입.
 *
 * `noise`는 같은 algorithm, coordinate, seed, options에서 같은 값을 반환하는 scalar field를
 * 담당한다. random draw나 distribution sampling은 `random` domain이 담당한다.
 */

/**
 * coordinate를 scalar field 값으로 매핑하는 deterministic 2D noise 함수.
 *
 * 같은 instance는 같은 `(x, y)`에서 항상 같은 값을 반환한다. 결과 범위는 algorithm별로
 * 고정되며 Perlin 계열은 `[-1, 1]`이다.
 */
export type Noise2 = (x: number, y: number) => number;

/**
 * deterministic 2D noise 공통 옵션.
 */
export interface Noise2Options {
  /**
   * field를 결정하는 seed. 같은 seed는 같은 field를 만든다.
   *
   * `number`는 finite여야 한다. `number` seed는 canonical 문자열 표현으로 hashing하므로
   * `42`와 `'42'`는 같은 field다. `string`은 deterministic하게 hashing된다. 생략하면 고정된
   * default seed를 사용한다. module-level mutable seed는 두지 않는다.
   */
  readonly seed?: number | string;
}

/**
 * fractional Brownian motion(octave 합성) 옵션.
 *
 * `Noise2Options`를 확장해 octave 합성 파라미터를 추가한다. 모든 옵션은 생략 가능하며,
 * 생략 시 문서와 test에 고정된 default를 사용한다.
 */
export interface Fbm2Options extends Noise2Options {
  /**
   * 합성할 octave 수. 양의 정수만 허용한다. 생략 시 `4`.
   */
  readonly octaves?: number;

  /**
   * octave마다 frequency를 곱하는 비율. finite positive number만 허용한다. 생략 시 `2`.
   */
  readonly lacunarity?: number;

  /**
   * octave마다 amplitude를 곱하는 비율. finite positive number만 허용한다. 생략 시 `0.5`.
   */
  readonly gain?: number;
}
