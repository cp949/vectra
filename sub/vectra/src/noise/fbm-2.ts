import { fbm2Kernel, resolveFbm2Params } from './fbm.internal';
import { assertFiniteNoiseInput } from './options.internal';
import type { Fbm2Options } from './types';

/**
 * Perlin octave를 합성한 fractional Brownian motion 값을 `[-1, 1]`로 반환한다.
 *
 * base noise를 amplitude 가중 합으로 누적하고 총 amplitude로 normalize한다. default는
 * `octaves: 4`, `lacunarity: 2`, `gain: 0.5`. `octaves: 1`은 base Perlin noise와 같은 값이다.
 * seed determinism은 `perlinNoise2`와 같다.
 *
 * `octaves`는 양의 정수, `lacunarity`/`gain`은 finite positive number여야 한다. 위반 시
 * `RangeError`. `x`, `y`, numeric `seed`의 `NaN`, `Infinity`, `-Infinity`는 `RangeError`.
 * 극단적으로 큰 `x`/`y`/`lacunarity`/`gain`/`octaves`로 중간 계산이 non-finite가 되면
 * `RangeError`. random source를 소비하지 않는다.
 *
 * @param x 평가할 x coordinate
 * @param y 평가할 y coordinate
 * @param options seed와 octave 합성 옵션. 생략하면 default를 사용한다.
 */
export function fbm2(x: number, y: number, options?: Fbm2Options): number {
  assertFiniteNoiseInput(x, 'x');
  assertFiniteNoiseInput(y, 'y');

  return fbm2Kernel(x, y, resolveFbm2Params(options), false);
}
