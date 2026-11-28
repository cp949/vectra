/** 타원과 선분·반직선·직선의 교차 판정과 단일 교점을 확인한다. */
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
const ellipse = { cx: 0, cy: 0, rx: 3, ry: 2 };

// ─── intersectsEllipseSegment ─────────────────────────────────────────────

describe('intersectsEllipseSegment', () => {
  test('miss: ellipse 밖을 지나는 line은 false를 반환한다', () => {
    // y=3인 수평선 — ellipse 상단 y=2보다 높음
    const line = { x1: -4, y1: 3, x2: 4, y2: 3 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(false);
  });

  test('tangent: ellipse에 접하는 line은 true를 반환한다', () => {
    // y=2인 수평선 → 상단에 접함 (접점: 0, 2)
    const line = { x1: -4, y1: 2, x2: 4, y2: 2 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('2-point crossing: ellipse를 관통하는 line은 true를 반환한다', () => {
    const line = { x1: -4, y1: 0, x2: 4, y2: 0 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('segment가 ellipse 내부에 완전히 포함: true를 반환한다', () => {
    // 짧은 segment, 완전히 disk 내부
    const line = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate segment((x1, y1) = (x2, y2)): 그 점이 ellipse 내부이면 true를 반환한다', () => {
    const line = { x1: 0, y1: 0, x2: 0, y2: 0 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate segment((x1, y1) = (x2, y2)): 그 점이 ellipse 외부이면 false를 반환한다', () => {
    const line = { x1: 10, y1: 10, x2: 10, y2: 10 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(false);
  });

  test('empty ellipse (rx=0): false를 반환한다', () => {
    const line = { x1: -4, y1: 0, x2: 4, y2: 0 };
    expect(intersectsEllipseSegment({ cx: 0, cy: 0, rx: 0, ry: 2 }, line)).toBe(false);
  });

  test('empty ellipse (ry<=0): false를 반환한다', () => {
    const line = { x1: -4, y1: 0, x2: 4, y2: 0 };
    expect(intersectsEllipseSegment({ cx: 0, cy: 0, rx: 3, ry: -1 }, line)).toBe(false);
  });
});

// ─── singleIntersectionSegmentEllipseInto ──────────────────────────────────

describe('singleIntersectionSegmentEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // y=2 수평선 → 접점 (0,2)
    const line = { x1: -4, y1: 2, x2: 4, y2: 2 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: -4, y1: 0, x2: 4, y2: 0 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: -4, y1: 3, x2: 4, y2: 3 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('segment 내부 포함(contained): false를 반환하고 out 미수정', () => {
    // 짧은 segment가 완전히 ellipse 내부 — exit 없음
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('1-point only (한쪽 endpoint만 ellipse 교차): true + 기록', () => {
    // line이 ellipse를 한 점에서만 통과: a가 ellipse 외부, b가 경계에 걸침
    // x=-3 vertical 접선 위에 있는 line: a=(-4,0), b=(-3,0)
    // t=1에서 교점 (-3,0)
    const out = { x: 0, y: 0 };
    const line = { x1: -4, y1: 0, x2: -3, y2: 0 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(-3);
    expect(out.y).toBeCloseTo(0);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: -4, y1: 2, x2: 4, y2: 2 };
    expect(singleIntersectionSegmentEllipseInto(out, line, { cx: 0, cy: 0, rx: 0, ry: 2 })).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate line: false를 반환한다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 0, x2: 0, y2: 0 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionSegmentEllipse (allocating companion) ───────────────

describe('singleIntersectionSegmentEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const line = { x1: -4, y1: 2, x2: 4, y2: 2 };
    const result = singleIntersectionSegmentEllipse(line, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const line = { x1: -4, y1: 0, x2: 4, y2: 0 };
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const line = { x1: -4, y1: 3, x2: 4, y2: 3 };
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });

  test('1-point only: {x,y} object를 반환한다', () => {
    const line = { x1: -4, y1: 0, x2: -3, y2: 0 };
    const result = singleIntersectionSegmentEllipse(line, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(-3);
    expect(result?.y).toBeCloseTo(0);
  });
});

// ─── intersectsEllipseRay ────────────────────────────────────────────────────

describe('intersectsEllipseRay', () => {
  test('ray 시작점 (ox, oy)가 ellipse 내부: true를 반환한다', () => {
    const ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray가 ellipse를 향함: true를 반환한다', () => {
    const ray = { ox: -10, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray가 반대 방향: false를 반환한다', () => {
    const ray = { ox: -10, oy: 0, dx: -1, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(false);
  });

  test('ray가 tangent: true를 반환한다', () => {
    // origin (-4, 2), dir (1,0) → y=2 수평 접선
    const ray = { ox: -4, oy: 2, dx: 1, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('empty ellipse: false를 반환한다', () => {
    const ray = { ox: -10, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseRay({ cx: 0, cy: 0, rx: 3, ry: 0 }, ray)).toBe(false);
  });

  test('degenerate ray(dx = dy = 0): 시작점 (ox, oy)가 내부이면 true를 반환한다', () => {
    const ray = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('degenerate ray(dx = dy = 0): 시작점 (ox, oy)가 외부이면 false를 반환한다', () => {
    const ray = { ox: 10, oy: 10, dx: 0, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(false);
  });
});

// ─── singleIntersectionRayEllipseInto ─────────────────────────────────────────

describe('singleIntersectionRayEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const ray = { ox: -4, oy: 2, dx: 1, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: -10, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('ray 시작점 (ox, oy)가 내부 — exit point를 기록하고 true를 반환한다', () => {
    // origin (0,0) 내부, dir (1,0) → exit at (3,0)
    const out = { x: 0, y: 0 };
    const ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(3);
    expect(out.y).toBeCloseTo(0);
  });

  test('miss (반대 방향): false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: -10, oy: 0, dx: -1, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: -4, oy: 2, dx: 1, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, { cx: 0, cy: 0, rx: 0, ry: 2 })).toBe(false);
    expect(out.x).toBe(99);
  });

  test('degenerate ray: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const ray = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(singleIntersectionRayEllipseInto(out, ray, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionRayEllipse (allocating companion) ──────────────────────

describe('singleIntersectionRayEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const ray = { ox: -4, oy: 2, dx: 1, dy: 0 };
    const result = singleIntersectionRayEllipse(ray, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const ray = { ox: -10, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionRayEllipse(ray, ellipse)).toBeUndefined();
  });

  test('ray 시작점 (ox, oy)가 내부일 때 exit point object를 반환한다', () => {
    const ray = { ox: 0, oy: 0, dx: 1, dy: 0 };
    const result = singleIntersectionRayEllipse(ray, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(3);
    expect(result?.y).toBeCloseTo(0);
  });

  test('miss: undefined를 반환한다', () => {
    const ray = { ox: -10, oy: 0, dx: -1, dy: 0 };
    expect(singleIntersectionRayEllipse(ray, ellipse)).toBeUndefined();
  });
});

// ─── intersectsEllipseInfiniteLine ───────────────────────────────────────────

describe('intersectsEllipseInfiniteLine', () => {
  test('infinite-line이 ellipse를 관통하면 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('infinite-line이 ellipse 밖을 지나면 false를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(false);
  });

  test('infinite-line이 ellipse에 접하면 true를 반환한다', () => {
    // y=2 수평선 → 상단 접선
    const infLine = { ox: 0, oy: 2, dx: 1, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('empty ellipse: false를 반환한다', () => {
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseInfiniteLine({ cx: 0, cy: 0, rx: 3, ry: 0 }, infLine)).toBe(false);
  });

  test('degenerate infinite-line(dx = dy = 0): 기준점 (ox, oy)가 내부이면 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 0, dx: 0, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });

  test('degenerate infinite-line(dx = dy = 0): 기준점 (ox, oy)가 ellipse 밖이면 false를 반환한다', () => {
    // direction=0, origin (10, 10) — ellipse 외부
    const infLine = { ox: 10, oy: 10, dx: 0, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(false);
  });
});

// ─── singleIntersectionInfiniteLineEllipseInto ────────────────────────────────

describe('singleIntersectionInfiniteLineEllipseInto', () => {
  test('tangent: 접점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    const infLine = { ox: 0, oy: 2, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(2);
  });

  test('2-point crossing: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, ellipse)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('empty ellipse: false를 반환하고 out 미수정', () => {
    const out = { x: 99, y: 99 };
    const infLine = { ox: 0, oy: 2, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipseInto(out, infLine, { cx: 0, cy: 0, rx: 0, ry: 2 })).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── singleIntersectionInfiniteLineEllipse (allocating companion) ─────────────

describe('singleIntersectionInfiniteLineEllipse', () => {
  test('tangent: 접점 object를 반환한다', () => {
    const infLine = { ox: 0, oy: 2, dx: 1, dy: 0 };
    const result = singleIntersectionInfiniteLineEllipse(infLine, ellipse);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0);
    expect(result?.y).toBeCloseTo(2);
  });

  test('2-point crossing: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 0, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipse(infLine, ellipse)).toBeUndefined();
  });

  test('miss: undefined를 반환한다', () => {
    const infLine = { ox: 0, oy: 3, dx: 1, dy: 0 };
    expect(singleIntersectionInfiniteLineEllipse(infLine, ellipse)).toBeUndefined();
  });
});

// ─── closed disk boundary consistency (S10-RM-028) ────────────────────────────
// line-family × ellipse boolean relation은 closed disk 판정이다. range가 ellipse
// 경계 위 점을 포함하면 true다. degenerate direction의 origin-on-boundary(c=0)와
// non-degenerate contained fallback이 같은 closed disk 정책을 따르는지 고정한다.

describe('intersectsEllipseSegment closed disk boundary', () => {
  test('segment 끝점 (x1, y1)이 경계 위면 true를 반환한다', () => {
    // (x1, y1)=(3,0) 우측 vertex(경계), (x2, y2)=(0,0) 내부 — t=0에서 경계 접촉
    const line = { x1: 3, y1: 0, x2: 0, y2: 0 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('두 endpoint가 모두 경계 위(chord)면 true를 반환한다', () => {
    const line = { x1: -3, y1: 0, x2: 3, y2: 0 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('degenerate segment((x1, y1) = (x2, y2))가 경계 위면 true를 반환한다', () => {
    // (x1, y1) = (x2, y2) = (0,2) 상단 vertex(경계) — degenerate direction, c=0 → closed disk
    const line = { x1: 0, y1: 2, x2: 0, y2: 2 };
    expect(intersectsEllipseSegment(ellipse, line)).toBe(true);
  });

  test('끝점 (x1, y1)이 경계 위이고 방향이 near-tangent여도 true를 반환한다', () => {
    // unit circle 경계 (1,0) → c=0. dir이 거의 접선이라 접점 t가 epsilon band에서 range 밖으로
    // 밀려도 (x1, y1)이 closed disk이므로 tangent 분기 fallback이 true를 보장한다.
    const unit = { cx: 0, cy: 0, rx: 1, ry: 1 };
    const line = { x1: 1, y1: 0, x2: 1 + 5e-10, y2: 1 };
    expect(intersectsEllipseSegment(unit, line)).toBe(true);
  });
});

describe('intersectsEllipseRay closed disk boundary', () => {
  test('ray 시작점 (ox, oy)가 경계 위에서 바깥을 향해도 true를 반환한다', () => {
    // origin=(3,0) 경계, dir=(1,0) 바깥 방향 — t=0 경계 접촉만 존재
    const ray = { ox: 3, oy: 0, dx: 1, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('degenerate ray(dx = dy = 0)의 시작점 (ox, oy)가 경계 위면 true를 반환한다', () => {
    const ray = { ox: 0, oy: 2, dx: 0, dy: 0 };
    expect(intersectsEllipseRay(ellipse, ray)).toBe(true);
  });

  test('ray 시작점 (ox, oy)가 경계 위이고 방향이 near-tangent여도 true를 반환한다', () => {
    // origin (1,0)은 closed disk 경계. near-tangent dir로 접점 t가 range 밖이어도 boundary touch.
    const unit = { cx: 0, cy: 0, rx: 1, ry: 1 };
    const ray = { ox: 1, oy: 0, dx: 5e-10, dy: 1 };
    expect(intersectsEllipseRay(unit, ray)).toBe(true);
  });
});

describe('intersectsEllipseInfiniteLine closed disk boundary', () => {
  test('degenerate infinite-line(dx = dy = 0)의 기준점 (ox, oy)가 경계 위면 true를 반환한다', () => {
    const infLine = { ox: 0, oy: 2, dx: 0, dy: 0 };
    expect(intersectsEllipseInfiniteLine(ellipse, infLine)).toBe(true);
  });
});

describe('single-intersection helper는 contained interior에서 boundary fallback을 노출하지 않는다', () => {
  test('내부 포함 segment는 single helper에서 false/undefined다', () => {
    const out = { x: 99, y: 99 };
    const line = { x1: 0, y1: 0, x2: 0.5, y2: 0 };
    expect(singleIntersectionSegmentEllipseInto(out, line, ellipse)).toBe(false);
    expect(out.x).toBe(99);
    expect(singleIntersectionSegmentEllipse(line, ellipse)).toBeUndefined();
  });
});
