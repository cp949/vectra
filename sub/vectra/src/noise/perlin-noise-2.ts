import { assertFiniteNoiseInput, normalizeSeed } from './options.internal';
import { perlinNoise2Kernel } from './perlin.internal';
import type { Noise2Options } from './types';

/**
 * seed를 가진 2D Perlin noise 값을 `[-1, 1]`로 반환한다.
 *
 * 같은 seed, coordinate는 호출 순서와 무관하게 항상 같은 값을 반환한다. integer lattice
 * point에서는 항상 `0`이다. seed가 다르면 fractional coordinate에서 다른 field가 된다.
 * `x`, `y`, numeric `seed`의 `NaN`, `Infinity`, `-Infinity`는 `RangeError`. string seed는
 * deterministic하게 hashing한다. seed/hash 정책은 public determinism contract이므로 변경 시
 * breaking change다. random source를 소비하지 않는다.
 *
 * @param x 평가할 x coordinate
 * @param y 평가할 y coordinate
 * @param options seed를 담는 옵션. 생략하면 default seed를 사용한다.
 */
export function perlinNoise2(x: number, y: number, options?: Noise2Options): number {
  assertFiniteNoiseInput(x, 'x');
  assertFiniteNoiseInput(y, 'y');

  return perlinNoise2Kernel(x, y, normalizeSeed(options?.seed));
}
