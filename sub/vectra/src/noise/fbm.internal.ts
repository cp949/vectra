/**
 * fractional Brownian motion(octave 합성) helper.
 *
 * base Perlin kernel을 octave마다 frequency/amplitude를 바꿔 누적한다. fbm과 ridged fbm이
 * 같은 합성 logic을 공유하도록 internal helper로 둔다. public leaf끼리 직접 import하지 않는다.
 */

import { assertPositiveIntegerNoiseOption, assertPositiveNoiseOption, normalizeSeed } from './options.internal';
import { perlinNoise2Kernel } from './perlin.internal';
import type { Fbm2Options } from './types';

export const DEFAULT_FBM2_OCTAVES = 4;
export const DEFAULT_FBM2_LACUNARITY = 2;
export const DEFAULT_FBM2_GAIN = 0.5;

export interface ResolvedFbm2Params {
  readonly octaves: number;
  readonly lacunarity: number;
  readonly gain: number;
  readonly seed: number;
}

/**
 * `Fbm2Options`를 default와 합쳐 검증된 octave 합성 파라미터로 정규화한다.
 *
 * `octaves`는 양의 정수, `lacunarity`/`gain`은 finite positive number여야 한다. 위반 시
 * `RangeError`. numeric `seed`의 non-finite도 `RangeError`. seed는 uint32로 정규화한다.
 *
 * @param options 정규화할 fbm 옵션. 생략 시 모두 default.
 */
export function resolveFbm2Params(options?: Fbm2Options): ResolvedFbm2Params {
  const octaves = options?.octaves ?? DEFAULT_FBM2_OCTAVES;
  assertPositiveIntegerNoiseOption(octaves, 'octaves');

  const lacunarity = options?.lacunarity ?? DEFAULT_FBM2_LACUNARITY;
  assertPositiveNoiseOption(lacunarity, 'lacunarity');

  const gain = options?.gain ?? DEFAULT_FBM2_GAIN;
  assertPositiveNoiseOption(gain, 'gain');

  return { octaves, lacunarity, gain, seed: normalizeSeed(options?.seed) };
}

/**
 * octave를 합성한 noise 값을 `[-1, 1]`로 반환한다.
 *
 * standard fbm은 base noise를 amplitude 가중 합으로 누적하고 총 amplitude로 normalize한다.
 * ridged는 octave마다 `1 - |base|`를 누적해 `[0, 1]`로 합성한 뒤 `[-1, 1]`로 매핑한다. 각
 * octave는 같은 seed에서 frequency만 `lacunarity` 배로 키운다. frequency/amplitude overflow로
 * 중간 계산이 non-finite가 되면 `RangeError`. caller가 `x`, `y`, `params`의 계약을 책임진다.
 *
 * @param x 평가할 x coordinate. finite로 가정한다.
 * @param y 평가할 y coordinate. finite로 가정한다.
 * @param params 검증된 octave 합성 파라미터
 * @param ridged true면 ridge transform을 적용한다.
 */
export function fbm2Kernel(x: number, y: number, params: ResolvedFbm2Params, ridged: boolean): number {
  const { octaves, lacunarity, gain, seed } = params;
  let frequency = 1;
  let amplitude = 1;
  let sum = 0;
  let totalAmplitude = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const base = perlinNoise2Kernel(x * frequency, y * frequency, seed);
    const contribution = ridged ? 1 - Math.abs(base) : base;

    sum += contribution * amplitude;
    totalAmplitude += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  // totalAmplitude는 amplitude=1부터 누적하므로 항상 >= 1이라 0 나눗셈이 없다.
  const normalized = sum / totalAmplitude;
  // ridged는 [0, 1] 합성이므로 [-1, 1]로 매핑한다.
  return finalizeNoiseValue(ridged ? normalized * 2 - 1 : normalized);
}

// 합성 결과를 [-1, 1]로 마감한다. overflow로 non-finite면 RangeError, -0은 +0으로 canonicalize.
function finalizeNoiseValue(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`noise result must be a finite number, got ${String(value)}`);
  }
  if (value <= -1) {
    return -1;
  }
  if (value >= 1) {
    return 1;
  }
  return value === 0 ? 0 : value;
}
