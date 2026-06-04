import { beforeEach, describe, expect, test } from 'vitest';
import { intersectsRectInfiniteLine } from '../../../src/intersects/intersects-rect-infinite-line';
import { intersectsRectRay } from '../../../src/intersects/intersects-rect-ray';
import { intersectsRectSegment } from '../../../src/intersects/intersects-rect-segment';
import { singleIntersectionInfiniteLineRect } from '../../../src/intersects/single-intersection-infinite-line-rect';
import { singleIntersectionInfiniteLineRectInto } from '../../../src/intersects/single-intersection-infinite-line-rect-into';
import { singleIntersectionRayRect } from '../../../src/intersects/single-intersection-ray-rect';
import { singleIntersectionRayRectInto } from '../../../src/intersects/single-intersection-ray-rect-into';
import { singleIntersectionSegmentRect } from '../../../src/intersects/single-intersection-segment-rect';
import { singleIntersectionSegmentRectInto } from '../../../src/intersects/single-intersection-segment-rect-into';
import type { XYObjectWritable } from '../../../src/types';

// rect: { x: 1, y: 1, width: 4, height: 4 } → 4변: (1,1)→(5,1), (5,1)→(5,5), (5,5)→(1,5), (1,5)→(1,1)

describe('intersectsRectSegment', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  describe('miss', () => {
    test('rect 밖에서 교차하지 않는 선은 false를 반환한다', () => {
      // x=0인 수직선, rect left가 x=1 → miss
      const line = { a: { x: 0, y: 0 }, b: { x: 0, y: 5 } };
      expect(intersectsRectSegment(rect, line)).toBe(false);
    });

    test('empty rect (width=0)는 false를 반환한다', () => {
      const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
      expect(intersectsRectSegment({ x: 0, y: 0, width: 0, height: 4 }, line)).toBe(false);
    });

    test('empty rect (height=0)는 false를 반환한다', () => {
      const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
      expect(intersectsRectSegment({ x: 0, y: 0, width: 4, height: 0 }, line)).toBe(false);
    });

    test('empty rect (width 음수)는 false를 반환한다', () => {
      const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
      expect(intersectsRectSegment({ x: 0, y: 0, width: -1, height: 4 }, line)).toBe(false);
    });
  });

  describe('single side hit', () => {
    test('left side를 한 번 관통하는 선은 true를 반환한다', () => {
      // (0,3)→(2,3): left side (x=1)을 관통
      const line = { a: { x: 0, y: 3 }, b: { x: 2, y: 3 } };
      expect(intersectsRectSegment(rect, line)).toBe(true);
    });
  });

  describe('corner touch', () => {
    test('top-left corner를 정확히 통과하는 선은 true를 반환한다', () => {
      // (0,0)→(2,2): corner (1,1)을 통과
      const line = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } };
      expect(intersectsRectSegment(rect, line)).toBe(true);
    });
  });

  describe('through-rect 2-side hit', () => {
    test('rect를 관통하는 선은 true를 반환한다', () => {
      const line = { a: { x: 0, y: 3 }, b: { x: 10, y: 3 } };
      expect(intersectsRectSegment(rect, line)).toBe(true);
    });
  });
});

describe('singleIntersectionSegmentRectInto', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };
  let out: XYObjectWritable;

  beforeEach(() => {
    out = { x: 0, y: 0 };
  });

  describe('miss', () => {
    test('교점 없을 때 false를 반환하고 out을 수정하지 않는다', () => {
      const o = { x: 99, y: 99 };
      const line = { a: { x: 0, y: 0 }, b: { x: 0, y: 5 } };
      expect(singleIntersectionSegmentRectInto(o, line, rect)).toBe(false);
      expect(o.x).toBe(99);
      expect(o.y).toBe(99);
    });
  });

  describe('single side hit', () => {
    test('left side hit 시 교점을 기록하고 true를 반환한다', () => {
      const o = { x: 0, y: 0 };
      // (0,3)→(2,3) hits left at (1,3)
      const line = { a: { x: 0, y: 3 }, b: { x: 2, y: 3 } };
      expect(singleIntersectionSegmentRectInto(o, line, rect)).toBe(true);
      expect(o.x).toBeCloseTo(1);
      expect(o.y).toBeCloseTo(3);
    });
  });

  describe('2-side hit (through-rect)', () => {
    test('2개 side를 관통할 때 false를 반환하고 out을 수정하지 않는다', () => {
      const o = { x: 99, y: 99 };
      const line = { a: { x: 0, y: 3 }, b: { x: 10, y: 3 } };
      expect(singleIntersectionSegmentRectInto(o, line, rect)).toBe(false);
      expect(o.x).toBe(99);
    });
  });

  describe('corner touch (single point)', () => {
    test('corner 통과 시 교점을 기록하고 true를 반환한다', () => {
      // (0,0)→(2,2) hits top-left corner (1,1)
      // top side와 left side 모두 (1,1)을 보고하지만 같은 점이므로 dup 처리
      const o = { x: 0, y: 0 };
      const line = { a: { x: 0, y: 0 }, b: { x: 2, y: 2 } };
      const result = singleIntersectionSegmentRectInto(o, line, rect);
      expect(result).toBe(true);
      expect(o.x).toBeCloseTo(1);
      expect(o.y).toBeCloseTo(1);
    });
  });

  // beforeEach 참조를 강제하기 위한 dummy
  test('beforeEach에서 초기화된 out은 { x: 0, y: 0 }이다', () => {
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
  });
});

describe('singleIntersectionSegmentRect (allocating companion)', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('교점 없을 때 undefined를 반환한다', () => {
    const line = { a: { x: 0, y: 0 }, b: { x: 0, y: 5 } };
    expect(singleIntersectionSegmentRect(line, rect)).toBeUndefined();
  });

  test('single side hit 시 교점 object를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 2, y: 3 } };
    const result = singleIntersectionSegmentRect(line, rect);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(1);
    expect(result?.y).toBeCloseTo(3);
  });

  test('2-side hit 시 undefined를 반환한다', () => {
    const line = { a: { x: 0, y: 3 }, b: { x: 10, y: 3 } };
    expect(singleIntersectionSegmentRect(line, rect)).toBeUndefined();
  });
});

describe('intersectsRectRay', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('rect를 향하는 ray는 true를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsRectRay(rect, ray)).toBe(true);
  });

  test('rect에서 멀어지는 방향 ray는 false를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } };
    expect(intersectsRectRay(rect, ray)).toBe(false);
  });

  test('empty rect는 false를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsRectRay({ x: 0, y: 0, width: 0, height: 4 }, ray)).toBe(false);
  });
});

describe('intersectsRectInfiniteLine', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('rect를 관통하는 infinite-line은 true를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsRectInfiniteLine(rect, infLine)).toBe(true);
  });

  test('rect 밖을 지나는 수평 infinite-line은 false를 반환한다', () => {
    // y=0인 수평선 → rect top이 y=1 → miss
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(intersectsRectInfiniteLine(rect, infLine)).toBe(false);
  });

  test('empty rect는 false를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(intersectsRectInfiniteLine({ x: 0, y: 0, width: -1, height: 4 }, infLine)).toBe(false);
  });
});

describe('singleIntersectionRayRectInto', () => {
  // rect: TL(1,1) TR(5,1) BR(5,5) BL(1,5)
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('rect 내부에서 한 side만 exit — 교점을 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    // origin (2,3) 내부, dir (0,-1) → top side (y=1) 에서 exit at (2,1)
    const ray = { origin: { x: 2, y: 3 }, direction: { x: 0, y: -1 } };
    expect(singleIntersectionRayRectInto(out, ray, rect)).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(1);
  });

  test('2-side hit 시 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    // origin (0,3) dir (1,0): left at (1,3), right at (5,3) → 2 distinct hits
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayRectInto(out, ray, rect)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss 시 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const ray = { origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } };
    expect(singleIntersectionRayRectInto(out, ray, rect)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionRayRect (allocating companion)', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('miss 시 undefined를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } };
    expect(singleIntersectionRayRect(ray, rect)).toBeUndefined();
  });

  test('rect 내부에서 exit — 교점 object를 반환한다', () => {
    // origin (2,3) 내부, dir (0,-1) → top side exit at (2,1)
    const ray = { origin: { x: 2, y: 3 }, direction: { x: 0, y: -1 } };
    const result = singleIntersectionRayRect(ray, rect);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2);
    expect(result?.y).toBeCloseTo(1);
  });

  test('empty rect는 undefined를 반환한다', () => {
    const ray = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionRayRect(ray, { x: 0, y: 0, width: 0, height: 4 })).toBeUndefined();
  });
});

describe('singleIntersectionInfiniteLineRectInto', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('2-side hit 시 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineRectInto(out, infLine, rect)).toBe(false);
    expect(out.x).toBe(99);
  });

  test('miss 시 false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineRectInto(out, infLine, rect)).toBe(false);
    expect(out.x).toBe(99);
  });
});

describe('singleIntersectionInfiniteLineRect (allocating companion)', () => {
  const rect = { x: 1, y: 1, width: 4, height: 4 };

  test('2-side hit 시 undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineRect(infLine, rect)).toBeUndefined();
  });

  test('miss 시 undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineRect(infLine, rect)).toBeUndefined();
  });

  test('empty rect는 undefined를 반환한다', () => {
    const infLine = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
    expect(singleIntersectionInfiniteLineRect(infLine, { x: 0, y: 0, width: 0, height: 4 })).toBeUndefined();
  });
});
