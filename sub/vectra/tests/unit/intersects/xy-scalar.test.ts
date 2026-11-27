/**
 * intersects의 `*XY` 스칼라 함수가 구조체 입력 함수와 같은 값을 내는지 확인하는 테스트.
 *
 * `*XY` 함수는 같은 계산을 좌표 숫자로 받는다. 결과는 근사가 아니라 `Object.is`로 같아야 한다.
 * 일반 위치 난수 입력과 경계 입력(평행, 끝점 접촉, tMin, 퇴화 도형, non-finite)을 함께 본다.
 *
 * 대상 함수:
 *  - raySegmentHitTXY          ↔ raySegmentHitT
 *  - rayCircleHitTXY           ↔ rayCircleHitT
 *  - intersectsCircleCircleXY  ↔ intersectsCircleCircle
 */
import { describe, expect, test } from 'vitest';
import { intersectsCircleCircle } from '../../../src/intersects/intersects-circle-circle';
import { intersectsCircleCircleXY } from '../../../src/intersects/intersects-circle-circle-xy';
import { rayCircleHitT } from '../../../src/intersects/ray-circle-hit-t';
import { rayCircleHitTXY } from '../../../src/intersects/ray-circle-hit-t-xy';
import { raySegmentHitT } from '../../../src/intersects/ray-segment-hit-t';
import { raySegmentHitTXY } from '../../../src/intersects/ray-segment-hit-t-xy';
import { createRng } from '../../../src/random/create-rng';

const CASES = 4000;

/** 경계 입력에 섞어 넣는 특수 값. 일반 숫자 사이에 non-finite와 0을 끼워 넣는다. */
const SPECIAL = [0, -0, 1, -1, Number.NaN, Infinity, -Infinity, 1e-300, 1e300];

/** [min, max) 구간의 난수를 반환한다. */
function range(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

/**
 * 좌표 하나를 만든다. 대부분 일반 위치이고 일부는 특수 값이다.
 * 특수 값 비율을 낮게 두어 hit이 나는 일반 입력도 충분히 남긴다.
 */
function coord(rng: () => number): number {
  return rng() < 0.05 ? SPECIAL[Math.floor(rng() * SPECIAL.length)] : range(rng, -20, 20);
}

describe('raySegmentHitTXY — raySegmentHitT와 같은 값', () => {
  test('난수 입력 4000개에서 tMin과 epsilon을 바꿔도 Object.is로 같다', () => {
    const rng = createRng('ray-segment-hit-t-xy');
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const [ox, oy, dx, dy] = [coord(rng), coord(rng), coord(rng), coord(rng)];
      const [ax, ay, bx, by] = [coord(rng), coord(rng), coord(rng), coord(rng)];
      const tMin = rng() < 0.5 ? 0 : range(rng, -1, 2);
      const epsilon = rng() < 0.5 ? undefined : range(rng, 0, 0.1);
      const expected = raySegmentHitT([ox, oy, dx, dy], { a: { x: ax, y: ay }, b: [bx, by] }, tMin, epsilon);

      expect(Object.is(raySegmentHitTXY(ox, oy, dx, dy, ax, ay, bx, by, tMin, epsilon), expected)).toBe(true);
      if (expected < Infinity) hits++;
    }
    expect(hits).toBeGreaterThan(CASES * 0.1);
  });

  test('tMin과 epsilon을 생략하면 raySegmentHitT의 기본값과 같다', () => {
    expect(raySegmentHitTXY(0, 0, 1, 0, 2, -1, 2, 1)).toBe(
      raySegmentHitT(
        [0, 0, 1, 0],
        [
          [2, -1],
          [2, 1],
        ]
      )
    );
    expect(raySegmentHitTXY(0, 0, 1, 0, 2, -1, 2, 1)).toBe(2);
  });

  test('끝점 접촉은 hit이고 평행이면 Infinity다', () => {
    expect(raySegmentHitTXY(0, 0, 1, 0, 3, 0, 3, 5)).toBe(3);
    expect(raySegmentHitTXY(0, 0, 1, 0, 0, 1, 5, 1)).toBe(Infinity);
    expect(raySegmentHitTXY(0, 0, 1, 0, 1, 0, 5, 0)).toBe(Infinity);
  });

  test('tMin보다 앞의 교점은 Infinity다', () => {
    expect(raySegmentHitTXY(0, 0, 1, 0, 2, -1, 2, 1, 2)).toBe(2);
    expect(raySegmentHitTXY(0, 0, 1, 0, 2, -1, 2, 1, 2.5)).toBe(Infinity);
  });
});

describe('rayCircleHitTXY — rayCircleHitT와 같은 값', () => {
  test('난수 입력 4000개에서 tMin과 epsilon을 바꿔도 Object.is로 같다', () => {
    const rng = createRng('ray-circle-hit-t-xy');
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const [ox, oy, dx, dy] = [coord(rng), coord(rng), coord(rng), coord(rng)];
      const [cx, cy] = [coord(rng), coord(rng)];
      const radius = rng() < 0.05 ? SPECIAL[Math.floor(rng() * SPECIAL.length)] : range(rng, 2, 15);
      const tMin = rng() < 0.5 ? 0 : range(rng, -1, 2);
      const epsilon = rng() < 0.5 ? undefined : range(rng, 0, 0.1);
      const expected = rayCircleHitT(
        { origin: { x: ox, y: oy }, direction: [dx, dy] },
        { center: { x: cx, y: cy }, radius },
        tMin,
        epsilon
      );

      expect(Object.is(rayCircleHitTXY(ox, oy, dx, dy, cx, cy, radius, tMin, epsilon), expected)).toBe(true);
      if (expected < Infinity) hits++;
    }
    expect(hits).toBeGreaterThan(CASES * 0.1);
  });

  test('tMin과 epsilon을 생략하면 rayCircleHitT의 기본값과 같다', () => {
    expect(rayCircleHitTXY(-5, 0, 1, 0, 0, 0, 2)).toBe(rayCircleHitT([-5, 0, 1, 0], [[0, 0], 2]));
    expect(rayCircleHitTXY(-5, 0, 1, 0, 0, 0, 2)).toBe(3);
  });

  test('origin이 안쪽이면 exit 교점이고 반지름이 0 이하이면 Infinity다', () => {
    expect(rayCircleHitTXY(0, 0, 1, 0, 0, 0, 2)).toBe(2);
    expect(rayCircleHitTXY(-5, 0, 1, 0, 0, 0, 0)).toBe(Infinity);
    expect(rayCircleHitTXY(-5, 0, 1, 0, 0, 0, -1)).toBe(Infinity);
  });
});

describe('intersectsCircleCircleXY — intersectsCircleCircle과 같은 값', () => {
  test('난수 입력 4000개에서 같은 boolean을 반환한다', () => {
    const rng = createRng('intersects-circle-circle-xy');
    let hits = 0;

    for (let i = 0; i < CASES; i++) {
      const [ax, ay, bx, by] = [coord(rng), coord(rng), coord(rng), coord(rng)];
      const ar = rng() < 0.05 ? SPECIAL[Math.floor(rng() * SPECIAL.length)] : range(rng, 0, 15);
      const br = rng() < 0.05 ? SPECIAL[Math.floor(rng() * SPECIAL.length)] : range(rng, 0, 15);
      const expected = intersectsCircleCircle({ center: { x: ax, y: ay }, radius: ar }, [[bx, by], br]);

      expect(intersectsCircleCircleXY(ax, ay, ar, bx, by, br)).toBe(expected);
      if (expected) hits++;
    }
    expect(hits).toBeGreaterThan(CASES * 0.1);
    expect(hits).toBeLessThan(CASES * 0.95);
  });

  test('외접은 교차이고 반지름이 0 이하이면 false다', () => {
    expect(intersectsCircleCircleXY(0, 0, 1, 2, 0, 1)).toBe(true);
    expect(intersectsCircleCircleXY(0, 0, 1, 2.000001, 0, 1)).toBe(false);
    expect(intersectsCircleCircleXY(0, 0, 0, 0, 0, 1)).toBe(false);
    expect(intersectsCircleCircleXY(0, 0, 1, 0, 0, -1)).toBe(false);
  });
});
