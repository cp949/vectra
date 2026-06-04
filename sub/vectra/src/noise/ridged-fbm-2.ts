import { fbm2Kernel, resolveFbm2Params } from './fbm.internal';
import { assertFiniteNoiseInput } from './options.internal';
import type { Fbm2Options } from './types';

/**
 * ridge transform을 적용한 fractional Brownian motion 값을 `[-1, 1]`로 반환한다.
 *
 * octave마다 `1 - |base noise|`를 amplitude 가중 합으로 누적해 `[0, 1]`로 합성한 뒤 `[-1, 1]`로
 * 매핑한다. `octaves: 1`이면 ridge 변환만 적용한 `(1 - |base|) * 2 - 1`이라 일반적으로 base
 * Perlin noise와 다른 field다. default는 `octaves: 4`, `lacunarity: 2`, `gain: 0.5`. seed
 * determinism은 `perlinNoise2`와 같다.
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
export function ridgedFbm2(x: number, y: number, options?: Fbm2Options): number {
  assertFiniteNoiseInput(x, 'x');
  assertFiniteNoiseInput(y, 'y');

  return fbm2Kernel(x, y, resolveFbm2Params(options), true);
}
