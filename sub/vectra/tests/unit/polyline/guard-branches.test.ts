/**
 * polyline 균등 샘플링과 단순화의 닫힌 경로 경계 테스트.
 *
 * 시작점과 끝점이 같은 닫힌 경로는 간격이 둘레 이상이면 시작점 하나만 남는다. 끝점을 중복해서
 * 넣지 않는다. 같은 이유로 단순화의 기준 chord 길이가 0이 되면 각 점까지의 거리로 판단한다.
 */

import { describe, expect, test } from 'vitest';
import { sampleUniformInto } from '../../../src/polyline/sample-uniform-into';
import { simplifyInto } from '../../../src/polyline/simplify-into';

const closedSquare = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 0, y: 0 },
];

describe('sampleUniformInto', () => {
  test('끝점이 시작점과 같은 경로는 간격이 둘레 이상이면 시작점 하나만 기록한다', () => {
    expect(sampleUniformInto([], closedSquare, 100)).toEqual([{ x: 0, y: 0 }]);
  });

  test('includeLast가 false이면 같은 경로에서도 시작점 하나만 기록한다', () => {
    expect(sampleUniformInto([], closedSquare, 100, { includeLast: false })).toEqual([{ x: 0, y: 0 }]);
  });
});

describe('simplifyInto', () => {
  test('시작점과 끝점이 같으면 그 점에서 떨어진 중간 점을 유지한다', () => {
    const out = simplifyInto(
      [],
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 0 },
      ],
      1
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
    ]);
  });

  test('시작점과 끝점이 같고 중간 점이 tolerance 안이면 중간 점을 버린다', () => {
    const out = simplifyInto(
      [],
      [
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
        { x: 0, y: 0 },
      ],
      1
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });
});
