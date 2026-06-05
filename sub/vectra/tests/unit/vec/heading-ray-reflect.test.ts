import { describe, expect, test } from 'vitest';
import { heading } from '../../../src/vec/heading';
import { headingSegment } from '../../../src/vec/heading-segment';
import { pointOnRay } from '../../../src/vec/point-on-ray';
import { pointOnRayInto } from '../../../src/vec/point-on-ray-into';
import { projectOnInto } from '../../../src/vec/project-on-into';
import { reflectAcrossNormalInto } from '../../../src/vec/reflect-across-normal-into';

describe('heading — point의 각도 계산', () => {
  test('양의 x축 방향은 0을 반환한다', () => {
    expect(heading({ x: 1, y: 0 })).toBeCloseTo(0);
  });

  test('양의 y축 방향은 π/2를 반환한다', () => {
    expect(heading({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  test('음의 x축 방향은 π를 반환한다', () => {
    expect(heading({ x: -1, y: 0 })).toBeCloseTo(Math.PI);
  });

  test('tuple input을 받는다', () => {
    expect(heading([1, 0])).toBeCloseTo(0);
  });

  test('range가 (-π, π]이다', () => {
    const angle = heading({ x: -1, y: -0.0001 });
    expect(angle).toBeGreaterThan(-Math.PI);
    expect(angle).toBeLessThanOrEqual(Math.PI);
  });
});

describe('headingSegment — segment 방향 각도 계산', () => {
  test('오른쪽 방향 segment는 0을 반환한다', () => {
    expect(headingSegment({ x: 0, y: 0 }, { x: 5, y: 0 })).toBeCloseTo(0);
  });

  test('위쪽 방향 segment는 π/2를 반환한다', () => {
    expect(headingSegment({ x: 0, y: 0 }, { x: 0, y: 3 })).toBeCloseTo(Math.PI / 2);
  });

  test('zero-length segment는 0을 반환한다', () => {
    expect(headingSegment({ x: 2, y: 3 }, { x: 2, y: 3 })).toBe(0);
  });

  test('tuple input을 받는다', () => {
    expect(headingSegment([0, 0], [1, 0])).toBeCloseTo(0);
  });
});

describe('pointOnRayInto — ray 위 점 계산 (Into 버전)', () => {
  test('origin + normalize(direction) * distance 위치를 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointOnRayInto(out, { x: 0, y: 0 }, { x: 2, y: 0 }, 5);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('zero-length direction이면 out을 수정하지 않고 false를 반환한다', () => {
    const out = { x: 7, y: 7 };
    const result = pointOnRayInto(out, { x: 0, y: 0 }, { x: 0, y: 0 }, 5);

    expect(result).toBe(false);
    expect(out.x).toBe(7);
    expect(out.y).toBe(7);
  });

  test('대각선 방향으로 올바르게 계산한다', () => {
    const out = { x: 0, y: 0 };
    pointOnRayInto(out, { x: 1, y: 1 }, { x: 1, y: 1 }, Math.sqrt(2));

    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(2);
  });
});

describe('pointOnRay — ray 위 점 계산 (allocating companion)', () => {
  test('zero-length direction이면 undefined를 반환한다', () => {
    expect(pointOnRay({ x: 0, y: 0 }, { x: 0, y: 0 }, 5)).toBeUndefined();
  });
});

describe('projectOnInto — direction으로 vector 투영 (Into 버전)', () => {
  test('x축 unit vector로 투영하면 x성분만 남는다', () => {
    const out = { x: 0, y: 0 };
    const result = projectOnInto(out, { x: 3, y: 4 }, { x: 1, y: 0 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('y축 unit vector로 투영하면 y성분만 남는다', () => {
    const out = { x: 0, y: 0 };
    projectOnInto(out, { x: 3, y: 4 }, { x: 0, y: 1 });

    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(4);
  });

  test('대각선 단위벡터로 투영한다', () => {
    const out = { x: 0, y: 0 };
    const dir = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
    projectOnInto(out, { x: 2, y: 2 }, dir);

    // dot(2,2, 1/√2, 1/√2) = 4/√2 = 2√2
    // result = 2√2 * (1/√2, 1/√2) = (2, 2)
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(2);
  });
});

describe('reflectAcrossNormalInto — normal에 대한 벡터 반사 (Into 버전)', () => {
  test('y축 법선(수평 표면)에서 반사한다', () => {
    const out = { x: 0, y: 0 };
    // 아래로 향하는 벡터를 수평 법선으로 반사
    const result = reflectAcrossNormalInto(out, { x: 1, y: -1 }, { x: 0, y: 1 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('x축 법선(수직 표면)에서 반사한다', () => {
    const out = { x: 0, y: 0 };
    reflectAcrossNormalInto(out, { x: -1, y: 1 }, { x: 1, y: 0 });

    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });

  test('법선과 평행한 벡터는 반전된다', () => {
    const out = { x: 0, y: 0 };
    reflectAcrossNormalInto(out, { x: 0, y: -3 }, { x: 0, y: 1 });

    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(3);
  });
});
