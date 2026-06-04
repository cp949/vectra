import { describe, expect, expectTypeOf, test } from 'vitest';
import { closestPointInto } from '../../../src/segment/closest-point-into';
import { containsPoint } from '../../../src/segment/contains-point';
import { distanceToPoint } from '../../../src/segment/distance-to-point';
import { distanceToPointSq } from '../../../src/segment/distance-to-point-sq';
import { projectPointInto } from '../../../src/segment/project-point-into';
import { projectionT } from '../../../src/segment/projection-t';
import type { XYWritable } from '../../../src/types';

describe('segment projection - projectionT (unclamped t)', () => {
  test('horizontal segment 중점 위 point의 t는 0.5이다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: 2, y: 0 })).toBe(0.5);
  });

  test('segment 시작점의 t는 0이다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: 0, y: 0 })).toBe(0);
  });

  test('segment 끝점의 t는 1이다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: 4, y: 0 })).toBe(1);
  });

  test('segment 앞 point는 t < 0을 반환한다 (unclamped)', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: -1, y: 0 })).toBe(-0.25);
  });

  test('segment 뒤 point는 t > 1을 반환한다 (unclamped)', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: 5, y: 0 })).toBe(1.25);
  });

  test('segment에 수직 방향 offset은 t에 영향을 주지 않는다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(projectionT(seg, { x: 2, y: 5 })).toBe(0.5);
  });

  test('diagonal segment에서 unclamped t를 계산한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // dot((3,0), (3,4)) = 9, lenSq = 25 → t = 9/25
    expect(projectionT(seg, { x: 3, y: 0 })).toBeCloseTo(0.36, 10);
  });

  test('tuple endpoint를 가진 segment에서 t를 계산한다', () => {
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    expect(projectionT(seg, [2, 0])).toBe(0.5);
  });

  test('zero-length segment의 projectionT는 0을 반환한다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    expect(projectionT(seg, { x: 10, y: 20 })).toBe(0);
  });
});

describe('segment projection - projectPointInto (unclamped point)', () => {
  test('segment 위 수직 offset point의 projection은 선 위 수선의 발이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = projectPointInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('segment 앞 point의 projection은 clamp되지 않는다 (t < 0)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    projectPointInto(out, seg, { x: -2, y: 0 });
    expect(out).toEqual({ x: -2, y: 0 });
  });

  test('segment 뒤 point의 projection은 clamp되지 않는다 (t > 1)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    projectPointInto(out, seg, { x: 6, y: 0 });
    expect(out).toEqual({ x: 6, y: 0 });
  });

  test('diagonal segment에서 unclamped projection point를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // t = 9/25, closest = (9/25*3, 9/25*4) = (1.08, 1.44)
    projectPointInto(out, seg, { x: 3, y: 0 });
    expect(out.x).toBeCloseTo(1.08, 10);
    expect(out.y).toBeCloseTo(1.44, 10);
  });

  test('zero-length segment의 projectPointInto는 segment.a를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    projectPointInto(out, seg, { x: 10, y: 20 });
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('tuple endpoint를 가진 segment에서 unclamped projection을 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    projectPointInto(out, seg, [2, 3]);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('mutable tuple out에 projection 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = projectPointInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(0);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('segment projection - closestPointInto (clamped t)', () => {
  test('segment 내부 위 수선의 발은 projectPointInto와 같다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = closestPointInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('segment 앞 point의 closest는 segment.a로 clamp된다 (t=0)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    closestPointInto(out, seg, { x: -2, y: 0 });
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('segment 뒤 point의 closest는 segment.b로 clamp된다 (t=1)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    closestPointInto(out, seg, { x: 6, y: 0 });
    expect(out).toEqual({ x: 4, y: 0 });
  });

  test('diagonal segment에서 closest point가 t=[0,1] 범위 안에 있다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // t = 9/25 ∈ [0,1] → clamp 없음, closest = (1.08, 1.44)
    closestPointInto(out, seg, { x: 3, y: 0 });
    expect(out.x).toBeCloseTo(1.08, 10);
    expect(out.y).toBeCloseTo(1.44, 10);
  });

  test('t > 1인 point의 closest는 segment.b에 clamp된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // point=(6,8): t = (6*3 + 8*4)/25 = (18+32)/25 = 50/25 = 2 → clamp to 1 → b=(3,4)
    closestPointInto(out, seg, { x: 6, y: 8 });
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('zero-length segment의 closestPointInto는 segment.a를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    closestPointInto(out, seg, { x: 10, y: 20 });
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('tuple endpoint를 가진 segment에서 closest point를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    closestPointInto(out, seg, [2, 5]);
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('mutable tuple out에 closest point를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    const result = closestPointInto(out, seg, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(0);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('segment distance - distanceToPointSq', () => {
  test('segment 위 point의 distance squared는 0이다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(distanceToPointSq(seg, { x: 2, y: 0 })).toBe(0);
  });

  test('segment interior closest case: 수직 방향 거리 제곱을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // closest = (2,0), dist sq = 9
    expect(distanceToPointSq(seg, { x: 2, y: 3 })).toBe(9);
  });

  test('endpoint closest case: t < 0이면 a까지의 거리 제곱을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // t = -0.5 → clamp to 0, closest = (0,0), dist sq = 4
    expect(distanceToPointSq(seg, { x: -2, y: 0 })).toBe(4);
  });

  test('endpoint closest case: t > 1이면 b까지의 거리 제곱을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // t = 1.5 → clamp to 1, closest = (4,0), dist sq = 4
    expect(distanceToPointSq(seg, { x: 6, y: 0 })).toBe(4);
  });

  test('diagonal segment에서 거리 제곱을 계산한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // t = 9/25, closest=(1.08,1.44), dist sq ≈ 5.76
    expect(distanceToPointSq(seg, { x: 3, y: 0 })).toBeCloseTo(5.76, 10);
  });

  test('zero-length segment는 point와 a 사이 거리 제곱을 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    // dist sq = 9 + 16 = 25
    expect(distanceToPointSq(seg, { x: 3, y: 4 })).toBe(25);
  });

  test('tuple endpoint를 가진 segment에서 거리 제곱을 계산한다', () => {
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    expect(distanceToPointSq(seg, [2, 3])).toBe(9);
  });
});

describe('segment distance - distanceToPoint', () => {
  test('segment 위 point의 distance는 0이다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(distanceToPoint(seg, { x: 2, y: 0 })).toBe(0);
  });

  test('segment interior closest case: 수직 방향 거리를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(distanceToPoint(seg, { x: 2, y: 3 })).toBe(3);
  });

  test('endpoint closest case (t < 0): a까지의 거리를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // closest = (0,0), dist = sqrt(4) = 2
    expect(distanceToPoint(seg, { x: -2, y: 0 })).toBe(2);
  });

  test('endpoint closest case (t > 1): b까지의 거리를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // t = 1.5 → clamp to 1, closest = (4,0), dist = 2
    expect(distanceToPoint(seg, { x: 6, y: 0 })).toBe(2);
  });

  test('diagonal segment에서 3-4-5 비율의 거리를 계산한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 3, y: 4 } };
    // t = 9/25, closest=(1.08,1.44), dist = sqrt(5.76) ≈ 2.4
    expect(distanceToPoint(seg, { x: 3, y: 0 })).toBeCloseTo(2.4, 10);
  });

  test('zero-length segment는 point와 a 사이 거리를 반환한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(distanceToPoint(seg, { x: 3, y: 4 })).toBe(5);
  });

  test('tuple endpoint를 가진 segment에서 거리를 계산한다', () => {
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    expect(distanceToPoint(seg, [2, 3])).toBe(3);
  });
});

describe('segment containment - containsPoint', () => {
  test('segment 위 정확한 interior point를 포함한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(containsPoint(seg, { x: 2, y: 0 })).toBe(true);
  });

  test('segment 시작 endpoint를 포함한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(containsPoint(seg, { x: 0, y: 0 })).toBe(true);
  });

  test('segment 끝 endpoint를 포함한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(containsPoint(seg, { x: 4, y: 0 })).toBe(true);
  });

  test('기본 epsilon 안 point를 포함한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // dist = 1e-10, dist sq = 1e-20 <= (1e-9)^2: true
    expect(containsPoint(seg, { x: 2, y: 1e-10 })).toBe(true);
  });

  test('기본 epsilon 정확한 경계(dist = epsilon)에서 포함한다 (<=)', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // dist = 1e-9 = DEFAULT_EPSILON → dist² = 1e-9 * 1e-9 = epsilon * epsilon → true (<=)
    expect(containsPoint(seg, { x: 2, y: 1e-9 })).toBe(true);
    // dist = 2e-9 > epsilon → dist² = 4 * epsilon² > epsilon² → false
    expect(containsPoint(seg, { x: 2, y: 2e-9 })).toBe(false);
  });

  test('기본 epsilon 밖 point를 포함하지 않는다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    expect(containsPoint(seg, { x: 2, y: 1 })).toBe(false);
  });

  test('명시 epsilon 경계에서 포함 여부를 올바르게 판별한다', () => {
    const seg = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } };
    // dist = 0.5, epsilon = 0.5 → dist sq = 0.25 <= 0.25: true
    expect(containsPoint(seg, { x: 2, y: 0.5 }, 0.5)).toBe(true);
    // dist = 0.5, epsilon = 0.4 → dist sq = 0.25 > 0.16: false
    expect(containsPoint(seg, { x: 2, y: 0.5 }, 0.4)).toBe(false);
  });

  test('zero-length segment에서 a와 같은 point를 포함한다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    expect(containsPoint(seg, { x: 3, y: 4 })).toBe(true);
  });

  test('zero-length segment에서 기본 epsilon 안 point를 포함한다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    // dist = 1e-10, dist sq = 1e-20 <= 1e-18: true
    expect(containsPoint(seg, { x: 3, y: 4 + 1e-10 })).toBe(true);
  });

  test('zero-length segment에서 기본 epsilon 밖 point를 포함하지 않는다', () => {
    const seg = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    expect(containsPoint(seg, { x: 3, y: 5 })).toBe(false);
  });

  test('tuple endpoint를 가진 segment에서도 동작한다', () => {
    const seg = { a: [0, 0] as const, b: [4, 0] as const };
    expect(containsPoint(seg, [2, 0])).toBe(true);
    expect(containsPoint(seg, [2, 1])).toBe(false);
  });
});
