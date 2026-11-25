// createRng 상태를 int32로 유지하는 구현이 uint32 기준 구현과 출력이 비트 단위로 같은지 고정한다
import { describe, expect, test } from 'vitest';
import { createRng, type RandomSeed } from '../../../src/random/create-rng';

/** 기준 구현의 문자열 해시. 상태 초기화는 uint32로 시작한다. */
function referenceHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * 상태를 매 스텝 uint32(`>>>= 0`)로 정규화하던 이전 구현이다.
 * 새 구현의 출력을 비교하는 기준으로만 쓴다.
 */
function createReferenceRng(seed: RandomSeed): () => number {
  const normalized = typeof seed === 'number' ? `n:${seed}` : `s:${seed}`;
  let a = referenceHash(`${normalized}:0`);
  let b = referenceHash(`${normalized}:1`);
  let c = referenceHash(`${normalized}:2`);
  let d = referenceHash(`${normalized}:3`);

  return () => {
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
    return (result >>> 0) / 0x100000000;
  };
}

const STEPS = 1_000_000;

describe('createRng — uint32 기준 구현과의 출력 동일성', () => {
  const seeds: RandomSeed[] = [0, 1, 42, -7, 1.5, 2 ** 31, 2 ** 32 + 5, 1e10, '', 'a', 'hello', '한글 seed'];

  test.each(seeds)('seed %j: 100만 개 출력이 기준 구현과 비트 단위로 같다', (seed) => {
    const actual = createRng(seed);
    const expected = createReferenceRng(seed);

    let firstMismatch = -1;
    for (let i = 0; i < STEPS; i++) {
      // 같은 정수 → 같은 double이므로 Object.is로 비트 동일성을 본다
      if (!Object.is(actual(), expected())) {
        firstMismatch = i;
        break;
      }
    }

    expect(firstMismatch).toBe(-1);
  });

  // 기준 구현으로 미리 뽑은 값. 기준 구현과 함께 고정해 둘이 같이 어긋나는 일을 막는다.
  test('number seed 1의 앞 5개 값이 고정값과 같다', () => {
    const rng = createRng(1);

    expect(Array.from({ length: 5 }, () => rng())).toEqual([
      0.1793076058384031, 0.9193069757893682, 0.17562096659094095, 0.5507414995227009, 0.043751465156674385,
    ]);
  });

  test('string seed "vectra"의 앞 5개 값이 고정값과 같다', () => {
    const rng = createRng('vectra');

    expect(Array.from({ length: 5 }, () => rng())).toEqual([
      0.5828226506710052, 0.44209539354778826, 0.7096739776898175, 0.5793452484067529, 0.638129165628925,
    ]);
  });
});
