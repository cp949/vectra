/**
 * deterministic 2D Perlin gradient noise kernel.
 *
 * lattice corner gradient는 integer coordinate와 seed의 hash로 결정한다. permutation table
 * 대신 hash 기반 gradient를 써서 module-level mutable state 없이 seed별 field를 만든다.
 * 이 kernel과 hash/gradient 정책은 public determinism contract이므로 변경 시 breaking change다.
 * lattice index는 int32로 hashing하므로 `|floor(x)| >= 2^31` 영역은 `2^32` 주기로 aliasing한다.
 * 일반 좌표 범위 밖이며 결과는 여전히 deterministic하다.
 */

const TWO_PI = Math.PI * 2;

// uint32 도메인 정규화 상수(2^32).
const UINT32_SCALE = 4294967296;

/**
 * seed를 가진 2D Perlin noise 값을 `[-1, 1]`로 반환한다.
 *
 * integer lattice point에서는 항상 `0`이다(Perlin gradient noise의 성질). unit gradient에서
 * 이론적 최대 `|value|`는 `sqrt(2)/2`이므로 `sqrt(2)`를 곱해 `[-1, 1]`로 정규화하고, float
 * rounding으로 경계를 넘는 값은 clamp한다. 결과 `-0`은 `0`으로 canonicalize한다. caller가
 * `x`, `y`, `seed`의 finite 계약을 책임진다.
 *
 * @param x 평가할 x coordinate. finite로 가정한다.
 * @param y 평가할 y coordinate. finite로 가정한다.
 * @param seed 정규화된 uint32 seed
 */
export function perlinNoise2Kernel(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  // lattice cell 내부의 fractional offset.
  const fx = x - x0;
  const fy = y - y0;

  const n00 = gradientDot(x0, y0, fx, fy, seed);
  const n10 = gradientDot(x1, y0, fx - 1, fy, seed);
  const n01 = gradientDot(x0, y1, fx, fy - 1, seed);
  const n11 = gradientDot(x1, y1, fx - 1, fy - 1, seed);

  const u = fade(fx);
  const v = fade(fy);

  const nx0 = lerp(n00, n10, u);
  const nx1 = lerp(n01, n11, u);
  const value = lerp(nx0, nx1, v) * Math.SQRT2;

  if (value <= -1) {
    return -1;
  }
  if (value >= 1) {
    return 1;
  }
  // -0 결과를 +0으로 canonicalize한다.
  return value === 0 ? 0 : value;
}

// quintic fade. 1차/2차 도함수가 lattice 경계에서 0이라 cell 간 이음매가 매끄럽다.
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(start: number, end: number, t: number): number {
  return start + t * (end - start);
}

// lattice corner의 unit gradient와 corner→sample offset의 내적.
function gradientDot(ix: number, iy: number, dx: number, dy: number, seed: number): number {
  const angle = (hashCoords(ix, iy, seed) / UINT32_SCALE) * TWO_PI;
  return Math.cos(angle) * dx + Math.sin(angle) * dy;
}

// integer coordinate와 seed를 uint32 hash로 섞는다. avalanche를 위해 multiply-xorshift 혼합.
function hashCoords(ix: number, iy: number, seed: number): number {
  let hash = seed | 0;
  hash = Math.imul(hash ^ (ix | 0), 0x27d4eb2f);
  hash = Math.imul(hash ^ (iy | 0), 0x165667b1);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return hash >>> 0;
}
