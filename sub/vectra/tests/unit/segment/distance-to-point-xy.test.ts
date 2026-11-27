/**
 * `segment/distanceToPointXY`가 `segment/distanceToPoint`와 같은 값을 내는지 확인하는 테스트.
 *
 * 두 함수는 같은 식을 따로 둔다. 결과는 `Object.is`로 같아야 한다.
 * 일반 위치 난수 입력과 경계 입력(길이 0 segment, 끝점 바깥 투영, non-finite)을 함께 본다.
 */
import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { distanceToPoint } from '../../../src/segment/distance-to-point';
import { distanceToPointXY } from '../../../src/segment/distance-to-point-xy';

const CASES = 4000;

/** 경계 입력에 섞어 넣는 특수 값. 일반 숫자 사이에 non-finite와 0을 끼워 넣는다. */
const SPECIAL = [0, -0, 1, -1, Number.NaN, Infinity, -Infinity, 1e-300, 1e300];

/**
 * 좌표 하나를 만든다. 대부분 일반 위치이고 일부는 특수 값이다.
 * 같은 끝점 두 개가 나오는 길이 0 segment도 특수 값 0을 통해 섞인다.
 */
function coord(rng: () => number): number {
  return rng() < 0.05 ? SPECIAL[Math.floor(rng() * SPECIAL.length)] : -20 + 40 * rng();
}

describe('distanceToPointXY — distanceToPoint와 같은 값', () => {
  test('난수 입력 4000개에서 Object.is로 같다', () => {
    const rng = createRng('segment-distance-to-point-xy');

    for (let i = 0; i < CASES; i++) {
      const [ax, ay, bx, by, px, py] = [coord(rng), coord(rng), coord(rng), coord(rng), coord(rng), coord(rng)];
      const expected = distanceToPoint({ a: { x: ax, y: ay }, b: [bx, by] }, { x: px, y: py });

      expect(Object.is(distanceToPointXY(ax, ay, bx, by, px, py), expected)).toBe(true);
    }
  });

  test('투영이 segment 안이면 수직 거리, 밖이면 가까운 끝점까지 거리다', () => {
    expect(distanceToPointXY(0, 0, 10, 0, 5, 3)).toBe(3);
    expect(distanceToPointXY(0, 0, 10, 0, 13, 4)).toBe(5);
    expect(distanceToPointXY(0, 0, 10, 0, -3, -4)).toBe(5);
  });

  test('길이 0 segment는 끝점까지 거리다', () => {
    expect(distanceToPointXY(1, 1, 1, 1, 4, 5)).toBe(5);
  });
});
