import { describe, expect, test } from 'vitest';
import { area } from '../../../src/polygon/area';
import { boundsInto } from '../../../src/polygon/bounds-into';
import { centroidInto } from '../../../src/polygon/centroid-into';
import { edgeCount } from '../../../src/polygon/edge-count';
import { isClockwise } from '../../../src/polygon/is-clockwise';
import { isCounterClockwise } from '../../../src/polygon/is-counter-clockwise';
import { isEmpty } from '../../../src/polygon/is-empty';
import { perimeter } from '../../../src/polygon/perimeter';
import { pointCount } from '../../../src/polygon/point-count';
import { signedArea } from '../../../src/polygon/signed-area';
import type { BoundsWritable, PolygonLike, XYObjectWritable, XYWritable } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolygonLike = { points: [] };
const SINGLE: PolygonLike = { points: [{ x: 1, y: 2 }] };
const TWO_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ],
};

// 수학적 y-up 좌표계 기준 counter-clockwise 삼각형 → signedArea > 0
const CCW_TRI: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 3 },
  ],
};

// 수학적 y-up 좌표계 기준 clockwise 삼각형 → signedArea < 0
const CW_TRI: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 3 },
    { x: 4, y: 0 },
  ],
};

// 단위 정사각형 (CCW, area = 1)
const UNIT_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
};

// collinear points — zero area, structural non-empty
const COLLINEAR: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
};

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

function makePoint(): XYObjectWritable {
  return { x: 0, y: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// isEmpty
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon query - isEmpty', () => {
  test('빈 polygon(0점)은 true를 반환한다', () => {
    expect(isEmpty(EMPTY)).toBe(true);
  });

  test('단일 point polygon(1점)은 true를 반환한다', () => {
    expect(isEmpty(SINGLE)).toBe(true);
  });

  test('2점 polygon은 true를 반환한다', () => {
    expect(isEmpty(TWO_PT)).toBe(true);
  });

  test('3점 삼각형은 false를 반환한다', () => {
    expect(isEmpty(CCW_TRI)).toBe(false);
  });

  test('collinear 3점 polygon은 structural empty가 아니므로 false를 반환한다', () => {
    expect(isEmpty(COLLINEAR)).toBe(false);
  });

  test('bare point array도 단일 닫힌 polygon ring으로 해석한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;

    expect(pointCount(points)).toBe(3);
    expect(edgeCount(points)).toBe(3);
    expect(isEmpty(points)).toBe(false);
    expect(area(points)).toBe(6);
  });

  test('3점 미만 bare point array는 structural empty polygon으로 유지한다', () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty([{ x: 1, y: 2 }])).toBe(true);
    expect(
      isEmpty([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ])
    ).toBe(true);
    expect(
      area([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ])
    ).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pointCount
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon query - pointCount', () => {
  test('빈 polygon은 0을 반환한다', () => {
    expect(pointCount(EMPTY)).toBe(0);
  });

  test('단일 point polygon은 1을 반환한다', () => {
    expect(pointCount(SINGLE)).toBe(1);
  });

  test('2점 polygon은 2를 반환한다', () => {
    expect(pointCount(TWO_PT)).toBe(2);
  });

  test('삼각형은 3을 반환한다', () => {
    expect(pointCount(CCW_TRI)).toBe(3);
  });

  test('사각형은 4를 반환한다', () => {
    expect(pointCount(UNIT_SQUARE)).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// edgeCount
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon query - edgeCount', () => {
  test('빈 polygon(0점)은 0을 반환한다', () => {
    expect(edgeCount(EMPTY)).toBe(0);
  });

  test('단일 point polygon(1점)은 0을 반환한다', () => {
    expect(edgeCount(SINGLE)).toBe(0);
  });

  test('2점 polygon은 2를 반환한다 — 닫힌 edge 포함', () => {
    // edge: 0→1, 1→0 (닫힘) = 2
    expect(edgeCount(TWO_PT)).toBe(2);
  });

  test('삼각형은 3을 반환한다', () => {
    expect(edgeCount(CCW_TRI)).toBe(3);
  });

  test('사각형은 4를 반환한다', () => {
    expect(edgeCount(UNIT_SQUARE)).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// signedArea
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon measurement - signedArea', () => {
  test('빈 polygon은 0을 반환한다', () => {
    expect(signedArea(EMPTY)).toBe(0);
  });

  test('단일 point polygon은 0을 반환한다', () => {
    expect(signedArea(SINGLE)).toBe(0);
  });

  test('2점 polygon은 0을 반환한다', () => {
    expect(signedArea(TWO_PT)).toBe(0);
  });

  test('CCW 삼각형의 signedArea는 양수이다 — shoelace 결과 검증', () => {
    // CCW_TRI: (0,0),(4,0),(0,3) → 2A = (0*0 - 4*0) + (4*3 - 0*0) + (0*0 - 0*3) = 12 → A = 6
    expect(signedArea(CCW_TRI)).toBeCloseTo(6, 10);
  });

  test('CW 삼각형의 signedArea는 음수이다', () => {
    // CW_TRI: (0,0),(0,3),(4,0) → 2A = -(12) → A = -6
    expect(signedArea(CW_TRI)).toBeCloseTo(-6, 10);
  });

  test('단위 정사각형 signedArea는 1이다 (CCW)', () => {
    expect(signedArea(UNIT_SQUARE)).toBeCloseTo(1, 10);
  });

  test('collinear polygon의 signedArea는 0이다', () => {
    expect(signedArea(COLLINEAR)).toBe(0);
  });

  test('tuple point 입력을 지원한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ],
    };
    expect(signedArea(poly)).toBeCloseTo(6, 10);
  });

  test('object/tuple mixed point 입력을 지원한다', () => {
    const poly: PolygonLike = {
      points: [{ x: 0, y: 0 }, [4, 0], { x: 0, y: 3 }],
    };
    expect(signedArea(poly)).toBeCloseTo(6, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// area
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon measurement - area', () => {
  test('빈 polygon은 0을 반환한다', () => {
    expect(area(EMPTY)).toBe(0);
  });

  test('2점 polygon은 0을 반환한다', () => {
    expect(area(TWO_PT)).toBe(0);
  });

  test('CCW 삼각형 area는 6이다', () => {
    expect(area(CCW_TRI)).toBeCloseTo(6, 10);
  });

  test('CW 삼각형 area도 양수 6이다 — 절댓값', () => {
    expect(area(CW_TRI)).toBeCloseTo(6, 10);
  });

  test('단위 정사각형 area는 1이다', () => {
    expect(area(UNIT_SQUARE)).toBeCloseTo(1, 10);
  });

  test('collinear polygon의 area는 0이다', () => {
    expect(area(COLLINEAR)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// perimeter
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon measurement - perimeter', () => {
  test('빈 polygon은 0을 반환한다', () => {
    expect(perimeter(EMPTY)).toBe(0);
  });

  test('단일 point polygon은 0을 반환한다', () => {
    expect(perimeter(SINGLE)).toBe(0);
  });

  test('2점 polygon은 0을 반환한다', () => {
    expect(perimeter(TWO_PT)).toBe(0);
  });

  test('3-4-5 직각삼각형의 둘레는 12이다 — 닫힌 edge 포함', () => {
    // (0,0)→(4,0): 4, (4,0)→(0,3): 5, (0,3)→(0,0): 3
    // CCW_TRI: (0,0),(4,0),(0,3)
    expect(perimeter(CCW_TRI)).toBeCloseTo(12, 10);
  });

  test('단위 정사각형 둘레는 4이다', () => {
    expect(perimeter(UNIT_SQUARE)).toBeCloseTo(4, 10);
  });

  test('repeated point가 있으면 해당 edge 기여는 0이다', () => {
    // (0,0),(0,0),(1,0) → (0,0)→(0,0): 0, (0,0)→(1,0): 1, (1,0)→(0,0): 1 = 2
    const poly: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
    expect(perimeter(poly)).toBeCloseTo(2, 10);
  });

  test('tuple point 입력을 지원한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ],
    };
    expect(perimeter(poly)).toBeCloseTo(12, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isClockwise / isCounterClockwise
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon query - orientation', () => {
  test('빈 polygon은 isClockwise가 false이다', () => {
    expect(isClockwise(EMPTY)).toBe(false);
  });

  test('빈 polygon은 isCounterClockwise가 false이다', () => {
    expect(isCounterClockwise(EMPTY)).toBe(false);
  });

  test('2점 polygon은 orientation이 둘 다 false이다', () => {
    expect(isClockwise(TWO_PT)).toBe(false);
    expect(isCounterClockwise(TWO_PT)).toBe(false);
  });

  test('CCW 삼각형은 isCounterClockwise가 true이다', () => {
    expect(isCounterClockwise(CCW_TRI)).toBe(true);
  });

  test('CCW 삼각형은 isClockwise가 false이다', () => {
    expect(isClockwise(CCW_TRI)).toBe(false);
  });

  test('CW 삼각형은 isClockwise가 true이다', () => {
    expect(isClockwise(CW_TRI)).toBe(true);
  });

  test('CW 삼각형은 isCounterClockwise가 false이다', () => {
    expect(isCounterClockwise(CW_TRI)).toBe(false);
  });

  test('collinear zero-area polygon은 orientation이 둘 다 false이다', () => {
    expect(isClockwise(COLLINEAR)).toBe(false);
    expect(isCounterClockwise(COLLINEAR)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// boundsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - boundsInto', () => {
  test('빈 polygon(0점)은 sentinel bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, EMPTY);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('단일 point polygon은 min === max인 bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, SINGLE);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 1, y: 2 });
  });

  test('2점 polygon은 두 점의 bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, TWO_PT);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 3, y: 4 });
  });

  test('삼각형 bounds를 올바르게 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, CCW_TRI);
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 4, y: 3 });
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = boundsInto(out, CCW_TRI);
    expect(result).toBe(out);
  });

  test('out.min/out.max object reference를 mutation한다', () => {
    const minPt: XYWritable = { x: 99, y: 99 };
    const maxPt: XYWritable = { x: 99, y: 99 };
    const out: BoundsWritable = { min: minPt, max: maxPt };
    boundsInto(out, CCW_TRI);
    expect(out.min).toBe(minPt);
    expect(out.max).toBe(maxPt);
    expect(minPt).toEqual({ x: 0, y: 0 });
    expect(maxPt).toEqual({ x: 4, y: 3 });
  });

  test('tuple min/max out에 기록한다', () => {
    const out = { min: [0, 0] as [number, number], max: [0, 0] as [number, number] };
    boundsInto(out, CCW_TRI);
    expect(out.min[0]).toBe(0);
    expect(out.min[1]).toBe(0);
    expect(out.max[0]).toBe(4);
    expect(out.max[1]).toBe(3);
  });

  test('tuple point 입력을 지원한다', () => {
    const out = makeBounds();
    boundsInto(out, {
      points: [
        [1, 2],
        [5, 6],
        [3, 0],
      ],
    });
    expect(out.min).toEqual({ x: 1, y: 0 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// centroidInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon output - centroidInto', () => {
  test('빈 polygon(0점)은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint();
    const sentinel = { x: 0, y: 0 };
    Object.assign(out, sentinel);
    const result = centroidInto(out, EMPTY);
    expect(result).toBe(false);
    expect(out).toEqual(sentinel);
  });

  test('단일 point polygon은 해당 점을 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(centroidInto(out, SINGLE)).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('2점 polygon은 두 점의 중점을 기록하고 true를 반환한다', () => {
    const out = makePoint();
    expect(centroidInto(out, TWO_PT)).toBe(true);
    // (0,0) + (3,4) / 2 = (1.5, 2)
    expect(out).toEqual({ x: 1.5, y: 2 });
  });

  test('CCW 삼각형의 centroid를 기록하고 true를 반환한다', () => {
    const out = makePoint();
    // 3-4-5 삼각형: (0+4+0)/3=4/3, (0+0+3)/3=1
    expect(centroidInto(out, CCW_TRI)).toBe(true);
    expect(out.x).toBeCloseTo(4 / 3, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('단위 정사각형 centroid는 (0.5, 0.5)이다', () => {
    const out = makePoint();
    expect(centroidInto(out, UNIT_SQUARE)).toBe(true);
    expect(out.x).toBeCloseTo(0.5, 10);
    expect(out.y).toBeCloseTo(0.5, 10);
  });

  test('zero-area collinear polygon은 arithmetic mean fallback으로 centroid를 기록하고 true를 반환한다', () => {
    const out = makePoint();
    // COLLINEAR: (0,0),(1,0),(2,0) → mean = (1, 0)
    expect(centroidInto(out, COLLINEAR)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(centroidInto(out, CCW_TRI)).toBe(true);
    expect(out[0]).toBeCloseTo(4 / 3, 10);
    expect(out[1]).toBeCloseTo(1, 10);
  });

  test('외부 Point class에 기록한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }
    const p = new Point(0, 0);
    expect(centroidInto(p, UNIT_SQUARE)).toBe(true);
    expect(p.x).toBeCloseTo(0.5, 10);
    expect(p.y).toBeCloseTo(0.5, 10);
  });

  test('repeated point polygon은 deterministic result를 반환한다', () => {
    // (0,0),(0,0),(1,0) — repeated first point
    const poly: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
    const out = makePoint();
    // signedArea === 0 → arithmetic mean fallback: (0+0+1)/3=1/3, (0+0+0)/3=0
    expect(centroidInto(out, poly)).toBe(true);
    expect(out.x).toBeCloseTo(1 / 3, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});
