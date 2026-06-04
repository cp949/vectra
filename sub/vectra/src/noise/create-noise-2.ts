import { assertFiniteNoiseInput, normalizeSeed } from './options.internal';
import { perlinNoise2Kernel } from './perlin.internal';
import type { Noise2, Noise2Options } from './types';

/**
 * seed를 한 번 고정한 caller-owned `Noise2` 함수를 반환한다.
 *
 * 반환 함수는 `perlinNoise2(x, y, options)`와 같은 값을 같은 coordinate에서 반환한다. seed는
 * 생성 시점에 정규화되어 closure에 갇히고, 반환 함수는 module-level mutable state를 공유하지
 * 않는다. 서로 다른 호출이 만든 두 함수는 독립적이다. 기본 algorithm은 2D Perlin이며 이번
 * 범위에서 `type` 선택 옵션은 열지 않는다.
 *
 * numeric `seed`의 `NaN`, `Infinity`, `-Infinity`는 생성 시점에 `RangeError`. 반환 함수는
 * `x`, `y`의 non-finite 입력을 `RangeError`로 거부한다. random source를 소비하지 않는다.
 *
 * @param options seed를 담는 옵션. 생략하면 default seed를 사용한다.
 */
export function createNoise2(options?: Noise2Options): Noise2 {
  const seed = normalizeSeed(options?.seed);

  return (x: number, y: number): number => {
    assertFiniteNoiseInput(x, 'x');
    assertFiniteNoiseInput(y, 'y');

    return perlinNoise2Kernel(x, y, seed);
  };
}
