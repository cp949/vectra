import type { RandomSource } from './random';

/** seed 타입. number 또는 string을 허용한다. */
export type RandomSeed = number | string;

/**
 * 문자열을 32-bit unsigned integer로 변환하는 해시 함수.
 * cyrb53 변형 계열 — 빠르고 충돌이 적다.
 */
const hashString = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

/**
 * seed 값을 문자열로 정규화한다.
 * number seed는 finite 여부를 먼저 검사한다.
 */
const normalizeSeed = (seed: RandomSeed): string => {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed)) {
      throw new RangeError(`createRng: seed는 finite number여야 합니다. 받은 값: ${seed}`);
    }
    // number와 string seed가 같은 문자열로 충돌하지 않도록 prefix를 붙인다
    return `n:${seed}`;
  }
  return `s:${seed}`;
};

/**
 * seed로부터 4개의 32-bit 초기 상태를 생성한다.
 * 각 슬롯에 다른 suffix를 붙여 서로 독립적인 해시를 만든다.
 */
const seedState = (normalized: string): [number, number, number, number] => [
  hashString(`${normalized}:0`),
  hashString(`${normalized}:1`),
  hashString(`${normalized}:2`),
  hashString(`${normalized}:3`),
];

/**
 * seed를 받아 재현 가능한 난수 생성 함수를 반환한다.
 *
 * 같은 seed → 매번 동일한 sequence를 생성한다.
 * 알고리즘: sfc32 계열 32-bit state generator.
 *
 * @param seed - number 또는 string seed. number는 finite value만 허용한다.
 */
export const createRng = (seed: RandomSeed): RandomSource => {
  const normalized = normalizeSeed(seed);
  let [a, b, c, d] = seedState(normalized);

  return () => {
    // sfc32 한 스텝
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    const t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = ((c << 21) | (c >>> 11)) >>> 0;
    d = (d + 1) | 0;
    const result = (t + d) | 0;
    c = (c + result) | 0;
    // [0, 1) 범위로 변환
    return (result >>> 0) / 0x100000000;
  };
};
