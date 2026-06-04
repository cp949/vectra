import { describe, expect, test } from 'vitest';
import { tangentAngles } from '../../../src/circle/tangent-angles';
import { tangentAnglesInto } from '../../../src/circle/tangent-angles-into';
import { tangentPointsFromExternal } from '../../../src/circle/tangent-points-from-external';
import { tangentPointsFromExternalInto } from '../../../src/circle/tangent-points-from-external-into';

const circleA = { center: { x: 0, y: 0 }, radius: 1 };
const circleB = { center: { x: 5, y: 0 }, radius: 1 };
const externalPt = { x: 10, y: 0 };

describe('circle.tangentAngles — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, circleA, circleB);
    expect(tangentAngles(circleA, circleB)).toEqual(out);
  });

  test('분리된 두 원에서 2개 각도를 반환한다', () => {
    expect(tangentAngles(circleA, circleB)).toHaveLength(2);
  });

  test('새 배열을 반환한다', () => {
    const result1 = tangentAngles(circleA, circleB);
    const result2 = tangentAngles(circleA, circleB);
    expect(result1).not.toBe(result2);
  });

  test('inner tangent도 지원한다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, circleA, circleB, true);
    expect(tangentAngles(circleA, circleB, true)).toEqual(out);
  });

  test('접선이 없으면 undefined가 아닌 빈 배열을 반환한다', () => {
    // 한 원이 다른 원 내부에 포함
    const inner = { center: { x: 0, y: 0 }, radius: 0.5 };
    const outer = { center: { x: 0, y: 0 }, radius: 2 };
    const result = tangentAngles(inner, outer);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });

  test('invalid circle(radius <= 0)에서 빈 배열을 반환한다', () => {
    const zero = { center: { x: 0, y: 0 }, radius: 0 };
    expect(tangentAngles(zero, circleB)).toEqual([]);
  });
});

describe('circle.tangentPointsFromExternal — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    tangentPointsFromExternalInto(out, circleA, externalPt);
    expect(tangentPointsFromExternal(circleA, externalPt)).toEqual(out);
  });

  test('외부 점에서 2개 접선점을 반환한다', () => {
    expect(tangentPointsFromExternal(circleA, externalPt)).toHaveLength(2);
  });

  test('새 배열을 반환한다', () => {
    const result1 = tangentPointsFromExternal(circleA, externalPt);
    const result2 = tangentPointsFromExternal(circleA, externalPt);
    expect(result1).not.toBe(result2);
  });

  test('원 내부 점에서 undefined가 아닌 빈 배열을 반환한다', () => {
    const inside = { x: 0, y: 0 };
    const result = tangentPointsFromExternal(circleA, inside);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });

  test('경계 위 점에서 1개 접선점을 반환한다', () => {
    const onEdge = { x: 1, y: 0 };
    expect(tangentPointsFromExternal(circleA, onEdge)).toHaveLength(1);
  });

  test('empty circle(radius <= 0)에서 빈 배열을 반환한다', () => {
    const empty = { center: { x: 0, y: 0 }, radius: 0 };
    expect(tangentPointsFromExternal(empty, externalPt)).toEqual([]);
  });
});
