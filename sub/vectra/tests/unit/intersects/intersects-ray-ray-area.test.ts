import { describe, expect, test } from 'vitest';
import { intersectsRayRay } from '../../../src/intersects/intersects-ray-ray';
import { rayFrom } from '../../../src/ray/ray-from';

const rayRight = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
const rayUp = rayFrom({ x: 0, y: 0 }, { x: 0, y: 1 });
const rayRight2 = rayFrom({ x: 2, y: 1 }, { x: 1, y: 0 });
const rayLeft = rayFrom({ x: 0, y: 0 }, { x: -1, y: 0 });
const degA = rayFrom({ x: 1, y: 0 }, { x: 0, y: 0 });
const degB = rayFrom({ x: 1, y: 0 }, { x: 0, y: 0 });
const degC = rayFrom({ x: 5, y: 5 }, { x: 0, y: 0 });

describe('intersectsRay', () => {
  test('forward-forward crossing → true', () => {
    // rayRight: (0,0)→+x, rayUp: (0,0)→+y — 이 두 ray는 (0,0)에서 만난다 (t=0, u=0)
    expect(intersectsRayRay(rayRight, rayUp)).toBe(true);
  });

  test('두 ray가 앞에서 교차하는 경우 → true', () => {
    // a: (0,1)→+x, b: (1,0)→+y — 교점 (1,1), t=1, u=1
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 0, y: 1 });
    expect(intersectsRayRay(a, b)).toBe(true);
  });

  test('backward candidate (t<0) → false', () => {
    // a: (2,0)→+x, b: (0,1)→+y — b가 x=0에서 올라가므로 a 기준 t<0
    const a = rayFrom({ x: 2, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 0, y: 1 }, { x: 0, y: 1 });
    expect(intersectsRayRay(a, b)).toBe(false);
  });

  test('backward candidate (u<0) → false', () => {
    // a: (0,1)→+x, b: (1,0)→-y — u<0 (b backward)
    const a = rayFrom({ x: 0, y: 1 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 0, y: -1 });
    expect(intersectsRayRay(a, b)).toBe(false);
  });

  test('endpoint touch (t=0 또는 u=0) → true', () => {
    // a의 origin에서 b ray가 시작 — t=0
    const a = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 0, y: -1 }, { x: 0, y: 1 }); // b가 (0,0)을 지남, u=1
    expect(intersectsRayRay(a, b)).toBe(true);
  });

  test('parallel disjoint → false', () => {
    // rayRight(y=0)와 rayRight2(y=1) — 같은 방향, 다른 직선
    expect(intersectsRayRay(rayRight, rayRight2)).toBe(false);
  });

  test('collinear overlap (같은 방향, b가 앞) → true', () => {
    // a: (0,0)→+x, b: (3,0)→+x — a 위에 b.origin이 있고 tB=3>=0
    const a = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 3, y: 0 }, { x: 1, y: 0 });
    expect(intersectsRayRay(a, b)).toBe(true);
  });

  test('collinear overlap (반대 방향, 서로 마주보는) → true', () => {
    // a: (0,0)→+x, b: (5,0)→-x — tB=5>=0 → true
    const a = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });
    const b = rayFrom({ x: 5, y: 0 }, { x: -1, y: 0 });
    expect(intersectsRayRay(a, b)).toBe(true);
  });

  test('collinear no overlap (반대 방향, 등을 맞댄) → false', () => {
    // a: (0,0)→-x, b: (1,0)→+x — a는 왼쪽, b는 오른쪽으로 벌어짐
    // tB = b.origin 기준 a의 dir에 따른 파라미터: q=(1,0), dir=(-1,0), aLenSq=1
    // tB = (1*(-1)+0*0)/1 = -1 < 0
    // uA = (-1*1 - 0*0)/1 = -1 < 0
    // → false
    const a = rayFrom({ x: 0, y: 0 }, { x: -1, y: 0 });
    const b = rayFrom({ x: 1, y: 0 }, { x: 1, y: 0 });
    expect(intersectsRayRay(a, b)).toBe(false);
  });

  test('degenerate a, b ray 위 → true', () => {
    // degA origin=(1,0), rayRight origin=(0,0) dir=(1,0) — t=1>=0, dist=0
    expect(intersectsRayRay(degA, rayRight)).toBe(true);
  });

  test('degenerate a, b ray backward → false', () => {
    // degA origin=(1,0), rayLeft dir=(-1,0) from (0,0)
    // px=1-0=1, py=0, t=(1*(-1)+0*0)/1 = -1 < 0 → false
    expect(intersectsRayRay(degA, rayLeft)).toBe(false);
  });

  test('양쪽 degenerate — origin 일치 → true', () => {
    expect(intersectsRayRay(degA, degB)).toBe(true);
  });

  test('양쪽 degenerate — origin 불일치 → false', () => {
    expect(intersectsRayRay(degA, degC)).toBe(false);
  });
});
