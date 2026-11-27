/** 광선 생성, 좌표 조회와 점 관계의 수치 계약을 검증한다. */
import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/ray/closest-point';
import { closestPointInto } from '../../../src/ray/closest-point-into';
import { containsPoint } from '../../../src/ray/contains-point';
import { copyInto } from '../../../src/ray/copy-into';
import { createRay } from '../../../src/ray/create-ray';
import { direction } from '../../../src/ray/direction';
import { directionInto } from '../../../src/ray/direction-into';
import { distanceToPoint } from '../../../src/ray/distance-to-point';
import { distanceToPointSq } from '../../../src/ray/distance-to-point-sq';
import { fromAngle } from '../../../src/ray/from-angle';
import { fromAngleInto } from '../../../src/ray/from-angle-into';
import { fromSegment } from '../../../src/ray/from-segment';
import { fromSegmentInto } from '../../../src/ray/from-segment-into';
import { isDegenerate } from '../../../src/ray/is-degenerate';
import { origin } from '../../../src/ray/origin';
import { originInto } from '../../../src/ray/origin-into';
import { pointAtT } from '../../../src/ray/point-at-t';
import { pointAtTInto } from '../../../src/ray/point-at-t-into';
import { projectPoint } from '../../../src/ray/project-point';
import { projectPointInto } from '../../../src/ray/project-point-into';
import { projectionT } from '../../../src/ray/projection-t';
import { rayFrom } from '../../../src/ray/ray-from';
import { reverse } from '../../../src/ray/reverse';
import { reverseInto } from '../../../src/ray/reverse-into';
import type { RayLike, RayWritable } from '../../../src/types';
import type { Ray, RayWritable as FlatRayWritable } from '../../../src/types/flat-shapes.internal';

describe('광선 시작점 읽기', () => {
  test('object RayLike에서 origin을 읽는다', () => {
    const ray: RayLike = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    const out = origin(ray);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('tuple RayLike에서 origin을 읽는다', () => {
    const ray: RayLike = [1, 2, 3, 4];
    const out = origin(ray);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('XYInput tuple origin을 읽는다', () => {
    const ray: RayLike = { origin: [5, 6] as const, direction: [7, 8] as const };
    const out = origin(ray);
    expect(out).toEqual({ x: 5, y: 6 });
  });
});

describe('createRay', () => {
  test('인수 없이 호출하면 zero ray writable을 만든다', () => {
    const r = createRay();
    expect(r).toEqual({ ox: 0, oy: 0, dx: 0, dy: 0 });
  });
});

describe('copyInto', () => {
  test('object Ray를 out에 복사하고 out reference를 반환한다', () => {
    const out: FlatRayWritable = { ox: 0, oy: 0, dx: 0, dy: 0 };
    const ray: Ray = { ox: 1, oy: 2, dx: 3, dy: 4 };
    const result = copyInto(out, ray);
    expect(result).toBe(out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(2);
    expect(out.dx).toBe(3);
    expect(out.dy).toBe(4);
  });
});

describe('rayFrom (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const ray: Ray = { ox: 1, oy: 2, dx: 3, dy: 4 };
    const result = rayFrom(ray);
    expect(result).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });
});

describe('reverseInto', () => {
  test('direction 부호를 반전하고 origin은 유지한다', () => {
    const out: RayWritable = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    const ray: RayLike = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    const result = reverseInto(out, ray);
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 1, y: 2 });
    expect(out.direction).toEqual({ x: -3, y: -4 });
  });

  test('alias-safe: out과 ray가 같아도 올바르게 반전한다', () => {
    const out: RayWritable = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    reverseInto(out, out);
    expect(out.origin).toEqual({ x: 1, y: 2 });
    expect(out.direction).toEqual({ x: -3, y: -4 });
  });
});

describe('reverse (companion)', () => {
  test('plain object를 반환한다', () => {
    const result = reverse({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    expect(result).toEqual({ origin: { x: 1, y: 2 }, direction: { x: -3, y: -4 } });
  });
});

describe('fromSegmentInto', () => {
  test('segment object를 origin=a, direction=b-a로 변환한다', () => {
    const out: FlatRayWritable = { ox: 0, oy: 0, dx: 0, dy: 0 };
    const result = fromSegmentInto(out, { x1: 1, y1: 2, x2: 4, y2: 6 });
    expect(result).toBe(out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(2);
    expect(out.dx).toBe(3);
    expect(out.dy).toBe(4);
  });
});

describe('fromSegment (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromSegment({ x1: 1, y1: 0, x2: 4, y2: 0 });
    expect(result).toEqual({ ox: 1, oy: 0, dx: 3, dy: 0 });
  });
});

describe('fromAngleInto', () => {
  test('0 radian은 +x 방향이다', () => {
    const out: FlatRayWritable = { ox: 0, oy: 0, dx: 0, dy: 0 };
    const result = fromAngleInto(out, { x: 1, y: 2 }, 0);
    expect(result).toBe(out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(2);
    expect(out.dx).toBeCloseTo(1, 10);
    expect(out.dy).toBeCloseTo(0, 10);
  });

  test('Math.PI / 2 radian은 +y 방향이다', () => {
    const out: FlatRayWritable = { ox: 0, oy: 0, dx: 0, dy: 0 };
    fromAngleInto(out, { x: 0, y: 0 }, Math.PI / 2);
    expect(out.dx).toBeCloseTo(0, 10);
    expect(out.dy).toBeCloseTo(1, 10);
  });
});

describe('fromAngle (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromAngle({ x: 5, y: 3 }, 0);
    expect(result.ox).toBe(5);
    expect(result.oy).toBe(3);
    expect(result.dx).toBeCloseTo(1, 10);
    expect(result.dy).toBeCloseTo(0, 10);
  });
});

describe('originInto / origin', () => {
  test('originInto가 out reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = originInto(out, { origin: { x: 3, y: 4 }, direction: { x: 1, y: 0 } });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('origin companion이 새 plain object를 반환한다', () => {
    const result = origin([5, 6, 1, 0]);
    expect(result).toEqual({ x: 5, y: 6 });
  });
});

describe('directionInto / direction', () => {
  test('directionInto가 out reference를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = directionInto(out, { ox: 0, oy: 0, dx: 7, dy: 8 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('direction companion이 새 plain object를 반환한다', () => {
    const result = direction({ ox: 0, oy: 0, dx: 3, dy: 4 });
    expect(result).toEqual({ x: 3, y: 4 });
  });
});

describe('pointAtTInto', () => {
  test('t=0이면 origin을 반환한다', () => {
    const out = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 1, y: 2 }, direction: { x: 1, y: 0 } }, 0);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('t=2이면 origin + 2*direction 위치다', () => {
    const out = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 1 } }, 2);
    expect(out).toEqual({ x: 2, y: 2 });
  });

  test('t=-1이면 backward supporting line 위치를 기록한다 (clamp 없음)', () => {
    const out = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, -1);
    expect(out).toEqual({ x: -1, y: 0 });
  });

  test('degenerate ray에서는 origin을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } }, 5);
    expect(out).toEqual({ x: 3, y: 4 });
  });
});

describe('pointAtT (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = pointAtT({ origin: { x: 1, y: 2 }, direction: { x: 1, y: 0 } }, 3);
    expect(result).toEqual({ x: 4, y: 2 });
  });
});

describe('projectionT', () => {
  test('supporting infinite-line 기준 unclamped t를 반환한다 (backward point)', () => {
    // origin=(0,0), direction=(1,0), point=(-3,0) → t=-3 (unclamped)
    const ray: RayLike = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(projectionT(ray, { x: -3, y: 0 })).toBeCloseTo(-3, 10);
  });

  test('forward point t 계산', () => {
    const ray: RayLike = [0, 0, 1, 0];
    expect(projectionT(ray, { x: 5, y: 0 })).toBeCloseTo(5, 10);
  });

  test('degenerate ray에서 0을 반환한다', () => {
    const ray: RayLike = { origin: { x: 1, y: 2 }, direction: { x: 0, y: 0 } };
    expect(projectionT(ray, { x: 3, y: 4 })).toBe(0);
  });

  test('non-unit direction에서도 올바른 t를 반환한다', () => {
    // origin=(0,0), direction=(2,0), point=(4,0) → t=1 (dot/lenSq = 8/4 = 2, but t=dot/lenSq)
    // px=4, py=0, dot=(4*2+0*0)=8, lenSq=4, t=2
    const ray: RayLike = { origin: { x: 0, y: 0 }, direction: { x: 2, y: 0 } };
    expect(projectionT(ray, { x: 4, y: 0 })).toBeCloseTo(2, 10);
  });
});

describe('projectPointInto (unclamped)', () => {
  test('backward point도 supporting infinite-line 위 수선의 발을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const ray: RayLike = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    projectPointInto(out, ray, { x: -3, y: 2 });
    // supporting line 위 foot: (-3, 0)
    expect(out).toEqual({ x: -3, y: 0 });
  });

  test('degenerate ray에서 origin을 기록한다', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, { origin: { x: 5, y: 6 }, direction: { x: 0, y: 0 } }, { x: 10, y: 10 });
    expect(out).toEqual({ x: 5, y: 6 });
  });
});

describe('projectPoint (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = projectPoint({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, { x: 3, y: 4 });
    expect(result).toEqual({ x: 3, y: 0 });
  });
});

describe('closestPointInto (t clamped to [0, ∞))', () => {
  test('backward point는 origin에 고정된다', () => {
    const out = { x: 0, y: 0 };
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    closestPointInto(out, ray, { x: -3, y: 0 });
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('forward point는 수선의 발을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    closestPointInto(out, ray, { x: 5, y: 3 });
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('degenerate ray에서 origin을 반환한다', () => {
    const out = { x: 0, y: 0 };
    closestPointInto(out, { ox: 2, oy: 3, dx: 0, dy: 0 }, { x: 10, y: 10 });
    expect(out).toEqual({ x: 2, y: 3 });
  });
});

describe('closestPoint (companion)', () => {
  test('새 plain object를 반환한다', () => {
    const result = closestPoint({ ox: 0, oy: 0, dx: 1, dy: 0 }, { x: -5, y: 0 });
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('distanceToPointSq', () => {
  test('backward point의 거리 제곱은 origin까지의 거리 제곱이다', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    // point=(-3, 4) → closest=(0,0) → distSq=9+16=25
    expect(distanceToPointSq(ray, { x: -3, y: 4 })).toBeCloseTo(25, 10);
  });

  test('forward side off-line point의 거리 제곱', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    // point=(5, 3) → closest=(5,0) → distSq=9
    expect(distanceToPointSq(ray, { x: 5, y: 3 })).toBeCloseTo(9, 10);
  });

  test('degenerate ray에서 origin-point 거리 제곱을 반환한다', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(distanceToPointSq(ray, { x: 3, y: 4 })).toBeCloseTo(25, 10);
  });
});

describe('distanceToPoint', () => {
  test('backward point의 거리는 origin까지의 거리다', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(distanceToPoint(ray, { x: -3, y: 4 })).toBeCloseTo(5, 10);
  });

  test('forward side 거리', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(distanceToPoint(ray, { x: 5, y: 3 })).toBeCloseTo(3, 10);
  });

  test('degenerate ray에서 origin-point 거리를 반환한다', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(distanceToPoint(ray, { x: 3, y: 4 })).toBeCloseTo(5, 10);
  });
});

describe('containsPoint', () => {
  test('forward side 위에 있으면 true', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(containsPoint(ray, { x: 5, y: 0 })).toBe(true);
  });

  test('backward side는 false', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(containsPoint(ray, { x: -1, y: 0 })).toBe(false);
  });

  test('supporting line 위지만 off-forward는 false (off-line)', () => {
    const ray: Ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(containsPoint(ray, { x: 5, y: 1 })).toBe(false);
  });

  test('origin 위에 있으면 true (t=0)', () => {
    const ray: Ray = { ox: 1, oy: 2, dx: 0, dy: 1 };
    expect(containsPoint(ray, { x: 1, y: 2 })).toBe(true);
  });

  test('degenerate ray: origin과 일치하면 true', () => {
    const ray: Ray = { ox: 3, oy: 4, dx: 0, dy: 0 };
    expect(containsPoint(ray, { x: 3, y: 4 })).toBe(true);
  });

  test('degenerate ray: origin과 다르면 false', () => {
    const ray: Ray = { ox: 3, oy: 4, dx: 0, dy: 0 };
    expect(containsPoint(ray, { x: 3.1, y: 4 })).toBe(false);
  });
});

describe('isDegenerate', () => {
  test('direction이 (0, 0)이면 true', () => {
    expect(isDegenerate({ origin: { x: 1, y: 2 }, direction: { x: 0, y: 0 } })).toBe(true);
  });

  test('direction이 있으면 false', () => {
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } })).toBe(false);
  });

  test('tuple ray: direction이 (0, 0)이면 true', () => {
    expect(isDegenerate([0, 0, 0, 0])).toBe(true);
  });

  test('tuple ray: direction이 있으면 false', () => {
    expect(isDegenerate([0, 0, 1, 0])).toBe(false);
  });

  test('epsilon보다 작은 direction은 degenerate', () => {
    expect(isDegenerate({ origin: { x: 0, y: 0 }, direction: { x: 1e-10, y: 0 } })).toBe(true);
  });
});

describe('degenerate ray 통합 동작', () => {
  const legacyRay: RayLike = { origin: { x: 2, y: 3 }, direction: { x: 0, y: 0 } };
  const degRay: Ray = { ox: 2, oy: 3, dx: 0, dy: 0 };

  test('projectionT → 0', () => {
    expect(projectionT(legacyRay, { x: 10, y: 20 })).toBe(0);
  });

  test('pointAtTInto → origin 기록', () => {
    const out = { x: 0, y: 0 };
    pointAtTInto(out, legacyRay, 99);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('projectPointInto → origin 기록', () => {
    const out = { x: 0, y: 0 };
    projectPointInto(out, legacyRay, { x: 100, y: 200 });
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('closestPointInto → origin 기록', () => {
    const out = { x: 0, y: 0 };
    closestPointInto(out, degRay, { x: 100, y: 200 });
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('distanceToPoint → origin-point 거리로 환원', () => {
    // point=(2+3, 3+4)=(5,7), 거리=sqrt(9+16)=5
    expect(distanceToPoint(degRay, { x: 5, y: 7 })).toBeCloseTo(5, 10);
  });

  test('distanceToPointSq → origin-point 거리 제곱으로 환원', () => {
    expect(distanceToPointSq(degRay, { x: 5, y: 7 })).toBeCloseTo(25, 10);
  });

  test('containsPoint → point containment으로 환원', () => {
    expect(containsPoint(degRay, { x: 2, y: 3 })).toBe(true);
    // 기본 epsilon=1e-9보다 충분히 먼 거리 (1e-8)
    expect(containsPoint(degRay, { x: 2 + 1e-8, y: 3 })).toBe(false);
  });
});
