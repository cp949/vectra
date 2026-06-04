import { describe, expect, test } from 'vitest';
import { intersectsEllipseInfiniteLine } from '../../../src/intersects/intersects-ellipse-infinite-line';
import { intersectsEllipseRay } from '../../../src/intersects/intersects-ellipse-ray';
import { intersectsEllipseSegment } from '../../../src/intersects/intersects-ellipse-segment';
import { singleIntersectionInfiniteLineEllipse } from '../../../src/intersects/single-intersection-infinite-line-ellipse';
import { singleIntersectionInfiniteLineEllipseInto } from '../../../src/intersects/single-intersection-infinite-line-ellipse-into';
import { singleIntersectionRayEllipse } from '../../../src/intersects/single-intersection-ray-ellipse';
import { singleIntersectionRayEllipseInto } from '../../../src/intersects/single-intersection-ray-ellipse-into';
import { singleIntersectionSegmentEllipse } from '../../../src/intersects/single-intersection-segment-ellipse';
import { singleIntersectionSegmentEllipseInto } from '../../../src/intersects/single-intersection-segment-ellipse-into';

// 테스트용 ellipse: center (0,0), rx=3, ry=2
// 경계: x ∈ [-3,3], y ∈ [-2,2]
const ellipse = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };

// ─── intersectsEllipseSegment ─────────────────────────────────────────────

describe('intersectsEllipseSegment', () => {
  test('miss: ellipse 밖을 지나는 line은 false를 반환한다', () => {
    // y=3인 수평선 — ellipse 상단 y=2보다 높음
    const line = { a: { x: -4, y: 3 }, b: { x: 4, y: 3 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(false);
  });

  test('tangent: ellipse에 접하는 line은 true를 반환한다', () => {
    // y=2인 수평선 → 상단에 접함 (접점: 0, 2)
    const line = { a: { x: -4, y: 2 }, b: { x: 4, y: 2 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('2-point crossing: ellipse를 관통하는 line은 true를 반환한다', () => {
    const line = { a: { x: -4, y: 0 }, b: { x: 4, y: 0 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('segment가 ellipse 내부에 완전히 포함: true를 반환한다', () => {
    // 짧은 segment, 완전히 disk 내부
    const line = { a: { x: 0, y: 0 }, b: { x: 0.5, y: 0 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate line (a===b): origin이 ellipse 내부이면 true를 반환한다', () => {
    const line = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate line (a===b): origin이 ellipse 외부이면 false를 반환한다', () => {
    const line = { a: { x: 10, y: 10 }, b: { x: 10, y: 10 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(false);
  });

  test('empty ellipse (radiusX=0): false를 반환한다', () => {
    const line = { a: { x: -4, y: 0 }, b: { x: 4, y: 0 } };
    expect(intersectsEllipseSegment({ center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 }, line)).toBe(false);
  });

  test('empty ellipse (radiusY<=0): false를 반환한다', () => {
    const line = { a: { x: -4, y: 0 }, b: { x: 4, y: 0 } };
    expect(intersectsEllipseSegment({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: -1 }, line)).toBe(false);
  });

  test('tuple shorthand 입력 동작한다', () => {
    // line tuple: [[x1,y1],[x2,y2]], ellipse tuple: [{x,y},rx,ry]
    const line: [[number, number], [number, number]] = [
      [-4, 0],
      [4, 0],
    ];
    const ell: [{ x: number; y: number }, number, number] = [{ x: 0, y: 0 }, 3, 2];
    expect(intersectsEllipseSegment(ell, line)).toBe(true);
  });
});

// ─── singleIntersectionSegmentEllipseInto ──────────────────────────────────

describe('singleIntersectionSegmentEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // y=2 수평선 → 접점 (0,2)
    const line = { a: { x: -4, y: 2 }, b: { x: 4, y: 2 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: -4, y: 0 }, b: { x: 4, y: 0 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: -4, y: 3 }, b: { x: 4, y: 3 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('segment 내부 포함(contained): false를 반환하고 out 미수정', () => {
    // 짧은 segment가 완전히 ellipse 내부 — exit 없음
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 0 }, b: { x: 0.5, y: 0 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('1-point only (한쪽 endpoint만 ellipse 교차): true + 기록', () => {
    // line이 ellipse를 한 점에서만 통과: a가 ellipse 외부, b가 경계에 걸침
    // x=-3 vertical 접선 위에 있는 line: a=(-4,0), b=(-3,0)
    // t=1에서 교점 (-3,0)
    const out = { x: 0, y: 0 };
    const line = { a: { x: -4, y: 0 }, b: { x: -3, y: 0 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(-3);
    expect(out.y).toBeCloseTo(0);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: -4, y: 2 }, b: { x: 4, y: 2 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 })).toBe(
      false
    );
    expect(out.x).toBe(99);
  });

  test('degenerate line: false를 반환한다', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionSegmentEllipse (allocating companion) ───────────────

describe('singleIntersectionSegmentEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const line = { a: { x: -4, y: 2 }, b: { x: 4, y: 2 } };
    const result = singleIntersectionSegmentEllipse(line, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const line = { a: { x: -4, y: 0 }, b: { x: 4, y: 0 } };
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const line = { a: { x: -4, y: 3 }, b: { x: 4, y: 3 } };
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });

  test('1-point only: {x,y} object를 반환한다', () => {
    const line = { a: { x: -4, y: 0 }, b: { x: -3, y: 0 } };
    const result = singleIntersectionSegmentEllipse(line, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(-3);
    expect(result?.y).toBeCloseTo(0);
  });
});

// ─── intersectsEllipseRay ────────────────────────────────────────────────────

describe('intersectsEllipseRay', () => {
  test('ray origin이 ellipse 내부: true를 반환한다', () => {
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray가 ellipse를 향함: true를 반환한다', () => {
    const ray = { origin: { x: -10, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray가 반대 방향: false를 반환한다', () => {
    const ray = { origin: { x: -10, y: 0 }, direction: { x: -1, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(false);
  });

  test('ray가 tangent: true를 반환한다', () => {
    // origin (-4, 2), dir (1,0) → y=2 수평 접선
    const ray = { origin: { x: -4, y: 2 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('empty ellipse: false를 반환한다', () => {
    const ray = { origin: { x: -10, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseRay({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 0 }, ray)).toBe(false);
  });

  test('degenerate ray (direction=0): origin이 내부이면 true를 반환한다', () => {
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('degenerate ray (direction=0): origin이 외부이면 false를 반환한다', () => {
    const ray = { origin: { x: 10, y: 10 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(false);
  });

  test('tuple shorthand 입력 동작한다', () => {
    // ray tuple: [ox, oy, dx, dy], ellipse tuple: [center, radiusX, radiusY]
    const ray: readonly [number, number, number, number] = [-10, 0, 1, 0];
    const ell: readonly [{ x: number; y: number }, number, number] = [{ x: 0, y: 0 }, 3, 2];
    expect(intersectsEllipseRay(ell, ray)).toBe(true);
  });
});

// ─── singleIntersectionRayEllipseInto ─────────────────────────────────────────

describe('singleIntersectionRayEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ray = { origin: { x: -4, y: 2 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { origin: { x: -10, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('ray origin이 내부 — exit point를 기록하고 true를 반환한다', () => {
    // origin (0,0) 내부, dir (1,0) → exit at (3,0)
    const out = { x: 0, y: 0 };
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('miss (반대 방향): false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { origin: { x: -10, y: 0 }, direction: { x: -1, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { origin: { x: -4, y: 2 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 })).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate ray: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionRayEllipse (allocating companion) ──────────────────────

describe('singleIntersectionRayEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const ray = { origin: { x: -4, y: 2 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionRayEllipse(ray, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const ray = { origin: { x: -10, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayEllipse(ray, ellipse)).toBeUndefined();
  });

  test('ray origin 내부 exit: exit point object를 반환한다', () => {
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionRayEllipse(ray, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(0);
  });

  test('miss: undefined를 반환한다', () => {
    const ray = { origin: { x: -10, y: 0 }, direction: { x: -1, y: 0 } };
    expect(singleIntersectionRayEllipse(ray, ellipse)).toBeUndefined();
  });
});

// ─── intersectsEllipseInfiniteLine ───────────────────────────────────────────

describe('intersectsEllipseInfiniteLine', () => {
  test('infinite-line이 ellipse를 관통하면 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('infinite-line이 ellipse 밖을 지나면 false를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(false);
  });

  test('infinite-line이 ellipse에 접하면 true를 반환한다', () => {
    // y=2 수평선 → 상단 접선
    const infLine = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('empty ellipse: false를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseInfiniteLine({ center: { x: 0, y: 0 }, radiusX: 3, radiusY: 0 }, infLine)).toBe(false);
  });

  test('degenerate infinite-line (direction=0): origin이 내부이면 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('degenerate infinite-line (direction=0): origin이 ellipse 밖이면 false를 반환한다', () => {
    // direction=0, origin (10, 10) — ellipse 외부
    const infLine = { origin: { x: 10, y: 10 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(false);
  });

  test('tuple shorthand 입력 동작한다', () => {
    // infinite-line tuple: [{origin},{direction}]
    const infLine: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });
});

// ─── singleIntersectionInfiniteLineEllipseInto ────────────────────────────────

describe('singleIntersectionInfiniteLineEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const infLine = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
    expect(
      singleIntersectionInfiniteLineEllipseInto(out, infLine, { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 })
    ).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionInfiniteLineEllipse (allocating companion) ─────────────

describe('singleIntersectionInfiniteLineEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
    const result = singleIntersectionInfiniteLineEllipse(infLine, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineEllipse(infLine, ellipse)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineEllipse(infLine, ellipse)).toBeUndefined();
  });
});

// ─── closed disk boundary consistency (S10-RM-028) ────────────────────────────
// line-family × ellipse boolean relation은 closed disk 판정이다. range가 ellipse
// 경계 위 점을 포함하면 true다. degenerate direction의 origin-on-boundary(c=0)와
// non-degenerate contained fallback이 같은 closed disk 정책을 따르는지 고정한다.

describe('intersectsEllipseSegment closed disk boundary', () => {
  test('segment endpoint가 경계 위(origin on boundary)면 true를 반환한다', () => {
    // a=(3,0) 우측 vertex(경계), b=(0,0) 내부 — t=0에서 경계 접촉
    const line = { a: { x: 3, y: 0 }, b: { x: 0, y: 0 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('두 endpoint가 모두 경계 위(chord)면 true를 반환한다', () => {
    const line = { a: { x: -3, y: 0 }, b: { x: 3, y: 0 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate segment(a===b)가 경계 위면 true를 반환한다', () => {
    // a=b=(0,2) 상단 vertex(경계) — degenerate direction, c=0 → closed disk
    const line = { a: { x: 0, y: 2 }, b: { x: 0, y: 2 } };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('origin이 경계 위이고 방향이 near-tangent여도 true를 반환한다', () => {
    // unit circle 경계 (1,0) → c=0. dir이 거의 접선이라 접점 t가 epsilon band에서 range 밖으로
    // 밀려도 origin이 closed disk이므로 tangent 분기 fallback이 true를 보장한다.
    const unit = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 };
    const line = { a: { x: 1, y: 0 }, b: { x: 1 + 5e-10, y: 1 } };
    expect(intersectsEllipseSegment(unit, line)).toBe(true);
  });
});

describe('intersectsEllipseRay closed disk boundary', () => {
  test('ray origin이 경계 위에서 바깥을 향해도 true를 반환한다', () => {
    // origin=(3,0) 경계, dir=(1,0) 바깥 방향 — t=0 경계 접촉만 존재
    const ray = { origin: { x: 3, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('degenerate ray(direction=0) origin이 경계 위면 true를 반환한다', () => {
    const ray = { origin: { x: 0, y: 2 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray origin이 경계 위이고 방향이 near-tangent여도 true를 반환한다', () => {
    // origin (1,0)은 closed disk 경계. near-tangent dir로 접점 t가 range 밖이어도 boundary touch.
    const unit = { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 };
    const ray = { origin: { x: 1, y: 0 }, direction: { x: 5e-10, y: 1 } };
    expect(intersectsEllipseRay(unit, ray)).toBe(true);
  });
});

describe('intersectsEllipseInfiniteLine closed disk boundary', () => {
  test('degenerate infinite-line(direction=0) origin이 경계 위면 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 2 }, direction: { x: 0, y: 0 } };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });
});

describe('single-intersection helper는 contained interior에서 boundary fallback을 노출하지 않는다', () => {
  test('내부 포함 segment는 single helper에서 false/undefined다', () => {
    const out = { x: 99, y: 99 };
    const line = { a: { x: 0, y: 0 }, b: { x: 0.5, y: 0 } };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });
});
