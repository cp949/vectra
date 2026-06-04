import { describe, expect, test } from 'vitest';
import { tangentAnglesInto } from '../../../src/circle/tangent-angles-into';
import { tangentPointsFromExternalInto } from '../../../src/circle/tangent-points-from-external-into';

const circleA = { center: { x: 0, y: 0 }, radius: 1 };
const circleB = { center: { x: 5, y: 0 }, radius: 1 };

describe('tangentAnglesInto — 두 원의 접선 각도 계산', () => {
  test('분리된 두 원에 대해 outer tangent 각도 2개를 반환한다', () => {
    const out: number[] = [];
    const result = tangentAnglesInto(out, circleA, circleB);

    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    for (const angle of out) {
      expect(Number.isFinite(angle)).toBe(true);
    }
  });

  test('분리된 두 원에 대해 inner tangent 각도 2개를 반환한다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, circleA, circleB, true);

    expect(out).toHaveLength(2);
  });

  test('한 원이 다른 원을 완전 포함할 때 outer tangent는 없다', () => {
    const big = { center: { x: 0, y: 0 }, radius: 10 };
    const small = { center: { x: 1, y: 0 }, radius: 1 };
    const out: number[] = [];
    tangentAnglesInto(out, big, small);

    expect(out).toHaveLength(0);
  });

  test('겹치는 두 원은 inner tangent가 없다', () => {
    const c1 = { center: { x: 0, y: 0 }, radius: 3 };
    const c2 = { center: { x: 2, y: 0 }, radius: 3 };
    const out: number[] = [];
    tangentAnglesInto(out, c1, c2, true);

    expect(out).toHaveLength(0);
  });

  test('중심이 같은 원은 빈 배열을 반환한다', () => {
    const c1 = { center: { x: 0, y: 0 }, radius: 1 };
    const c2 = { center: { x: 0, y: 0 }, radius: 2 };
    const out: number[] = [];
    tangentAnglesInto(out, c1, c2);

    expect(out).toHaveLength(0);
  });

  test('empty circle이 포함되면 빈 배열을 반환한다', () => {
    const out = [1];
    tangentAnglesInto(out, { center: { x: 0, y: 0 }, radius: 0 }, circleB);

    expect(out).toHaveLength(0);
  });

  test('외접한 두 원의 inner tangent는 중복 각도를 남기지 않는다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, { center: { x: 0, y: 0 }, radius: 2 }, { center: { x: 5, y: 0 }, radius: 3 }, true);

    expect(out).toHaveLength(1);
    expect(out[0]).toBeCloseTo(0);
  });

  test('내접한 두 원의 outer tangent는 중복 각도를 남기지 않는다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, { center: { x: 0, y: 0 }, radius: 5 }, { center: { x: 2, y: 0 }, radius: 3 });

    expect(out).toHaveLength(1);
    expect(out[0]).toBeCloseTo(0);
  });

  test('반대 방향 내접 outer tangent도 modulo 중복 각도를 남기지 않는다', () => {
    const out: number[] = [];
    tangentAnglesInto(out, { center: { x: 0, y: 0 }, radius: 3 }, { center: { x: 2, y: 0 }, radius: 5 });

    expect(out).toHaveLength(1);
    expect(Math.abs(out[0] as number)).toBeCloseTo(Math.PI);
  });
});

describe('tangentPointsFromExternalInto — 외부 점에서 원 접선점 계산', () => {
  const circle = { center: { x: 0, y: 0 }, radius: 1 };

  test('외부 점에서 접선점 2개를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = tangentPointsFromExternalInto(out, circle, { x: 3, y: 0 });

    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    // 각 접선점은 원 위에 있어야 한다
    for (const p of out) {
      const distSq = p.x ** 2 + p.y ** 2;
      expect(distSq).toBeCloseTo(1);
    }
  });

  test('원 내부 점이면 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    tangentPointsFromExternalInto(out, circle, { x: 0, y: 0 });

    expect(out).toHaveLength(0);
  });

  test('empty circle(radius <= 0)이면 빈 배열을 반환한다', () => {
    const empty = { center: { x: 0, y: 0 }, radius: 0 };
    const out: { x: number; y: number }[] = [];
    tangentPointsFromExternalInto(out, empty, { x: 5, y: 0 });

    expect(out).toHaveLength(0);
  });

  test('외부 접선점은 원과 외부 점 사이의 선분에 수직이다', () => {
    const out: { x: number; y: number }[] = [];
    tangentPointsFromExternalInto(out, circle, { x: 3, y: 0 });

    for (const p of out) {
      // 접선점에서 외부 점까지의 벡터가 원 반지름과 수직이어야 한다
      const tx = 3 - p.x;
      const ty = 0 - p.y;
      const rx = p.x;
      const ry = p.y;
      const dot = tx * rx + ty * ry;
      expect(Math.abs(dot)).toBeCloseTo(0, 5);
    }
  });
});
