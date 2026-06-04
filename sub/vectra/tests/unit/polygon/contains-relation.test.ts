import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/polygon/contains-point';

import type { PolygonLike } from '../../../src/types';

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

// 수학적 y-up 좌표계 기준 counter-clockwise 3-4-5 삼각형
// points: (0,0) → (4,0) → (0,3)
const CCW_TRI: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 3 },
  ],
};

// 단위 정사각형 (CCW), (0,0)→(1,0)→(1,1)→(0,1)
const UNIT_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
};

// 크기 4×4 정사각형 (CCW)
const SQUARE_4: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ],
};

// empty polygon
const EMPTY: PolygonLike = { points: [] };

// 2점 degenerate
const TWO_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ],
};

// collinear zero-area
const COLLINEAR: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 4, y: 0 },
  ],
};

// self-intersecting (나비 모양 — 두 삼각형이 교차)
// (0,0)→(4,4)→(4,0)→(0,4) → 명시적 deterministic fixture
const BOWTIE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 4 },
    { x: 4, y: 0 },
    { x: 0, y: 4 },
  ],
};

// tiny polygon — 매우 작은 면적
const TINY_TRI: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1e-10, y: 0 },
    { x: 0, y: 1e-10 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// containsPoint
// ─────────────────────────────────────────────────────────────────────────────

describe('polygon - containsPoint', () => {
  // interior
  test('삼각형 내부 점은 true를 반환한다', () => {
    // (1,0.5)는 CCW_TRI 내부
    expect(containsPoint(CCW_TRI, { x: 1, y: 0.5 })).toBe(true);
  });

  test('단위 정사각형 내부 점은 true를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBe(true);
  });

  test('bare point array로 containment와 relation 함수를 호출한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;

    expect(containsPoint(points, { x: 1, y: 1 })).toBe(true);
  });

  // exterior
  test('삼각형 외부 점은 false를 반환한다', () => {
    expect(containsPoint(CCW_TRI, { x: 3, y: 3 })).toBe(false);
  });

  test('단위 정사각형 외부 점은 false를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 2, y: 0.5 })).toBe(false);
  });

  // boundary (edge 위)
  test('삼각형 하단 edge 위 점은 true를 반환한다', () => {
    // edge (0,0)→(4,0), 중점 (2,0)
    expect(containsPoint(CCW_TRI, { x: 2, y: 0 })).toBe(true);
  });

  test('삼각형 vertex 위 점은 true를 반환한다', () => {
    expect(containsPoint(CCW_TRI, { x: 0, y: 0 })).toBe(true);
  });

  test('삼각형 (4,0) vertex는 true를 반환한다', () => {
    expect(containsPoint(CCW_TRI, { x: 4, y: 0 })).toBe(true);
  });

  test('삼각형 (0,3) vertex는 true를 반환한다', () => {
    expect(containsPoint(CCW_TRI, { x: 0, y: 3 })).toBe(true);
  });

  test('단위 정사각형 left edge 위 점은 true를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 0, y: 0.5 })).toBe(true);
  });

  test('단위 정사각형 right edge 위 점은 true를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 1, y: 0.5 })).toBe(true);
  });

  test('단위 정사각형 top edge 위 점은 true를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 0.5, y: 1 })).toBe(true);
  });

  test('단위 정사각형 bottom edge 위 점은 true를 반환한다', () => {
    expect(containsPoint(UNIT_SQUARE, { x: 0.5, y: 0 })).toBe(true);
  });

  // epsilon
  test('epsilon=0일 때 edge 바로 밖 점은 false를 반환한다', () => {
    // (2, -1e-12) — 하단 edge 바로 아래
    expect(containsPoint(CCW_TRI, { x: 2, y: -1e-12 }, 0)).toBe(false);
  });

  test('epsilon 이하 거리 점은 boundary로 포함한다', () => {
    // (2, -0.1) — 하단 edge까지 거리 0.1, epsilon=0.2 → 포함
    expect(containsPoint(CCW_TRI, { x: 2, y: -0.1 }, 0.2)).toBe(true);
  });

  test('epsilon이 충분하지 않으면 false를 반환한다', () => {
    // (2, -0.1) — 거리 0.1, epsilon=0.05 → 미포함
    expect(containsPoint(CCW_TRI, { x: 2, y: -0.1 }, 0.05)).toBe(false);
  });

  // empty / degenerate
  test('empty polygon은 false를 반환한다', () => {
    expect(containsPoint(EMPTY, { x: 0, y: 0 })).toBe(false);
  });

  test('2점 polygon은 false를 반환한다', () => {
    expect(containsPoint(TWO_PT, { x: 2, y: 0 })).toBe(false);
  });

  test('collinear zero-area polygon은 false를 반환한다', () => {
    // interior ray casting이 0을 돌려줌 — false
    // 단, edge 위 점은 epsilon 체크로 true 가능
    expect(containsPoint(COLLINEAR, { x: 1, y: 1 })).toBe(false);
  });

  test('collinear zero-area polygon에서 edge 위 점은 epsilon=0에서도 true를 반환한다', () => {
    // (2, 0)은 edge (0,0)→(2,0) 위
    expect(containsPoint(COLLINEAR, { x: 2, y: 0 })).toBe(true);
  });

  // horizontal edge & vertex crossing (double-count 방지 fixture)
  test('horizontal edge 아래 point는 false를 반환한다', () => {
    // UNIT_SQUARE: (0,0)→(1,0) horizontal bottom edge
    // (0.5, -0.5)는 외부
    expect(containsPoint(UNIT_SQUARE, { x: 0.5, y: -0.5 })).toBe(false);
  });

  test('horizontal edge 위쪽 방향으로 ray가 지나갈 때 double-count가 없다', () => {
    // (0.5, 0.5) UNIT_SQUARE 내부 — ray casting 정확성 검증
    expect(containsPoint(UNIT_SQUARE, { x: 0.5, y: 0.5 })).toBe(true);
  });

  test('vertex를 지나는 ray에서 double-count가 없다', () => {
    // CCW_TRI vertex (4,0)과 수평인 y=0 위 ray — (1,0)은 edge 위라 true
    // (5,0)은 외부 → false
    expect(containsPoint(CCW_TRI, { x: 5, y: 0 })).toBe(false);
  });

  test('삼각형 빗변 위 점은 true를 반환한다', () => {
    // hypotenuse: (4,0)→(0,3), 중점 = (2, 1.5)
    expect(containsPoint(CCW_TRI, { x: 2, y: 1.5 })).toBe(true);
  });

  // self-intersecting deterministic
  test('BOWTIE polygon의 self-intersection 중심점은 두 edge 교점이라 boundary로 true를 반환한다', () => {
    // self-intersecting polygon은 repair하지 않는다.
    // (2,2)는 edge (0,0)→(4,4)와 edge (4,0)→(0,4)가 교차하는 지점이라 boundary check에서 true가 된다.
    expect(containsPoint(BOWTIE, { x: 2, y: 2 })).toBe(true);
  });

  test('BOWTIE polygon 좌측 삼각형 내부 점은 ray casting으로 deterministic하게 true를 반환한다', () => {
    // 좌측 삼각형 vertices (0,0)-(0,4)-(2,2) 내부 (1, 2)
    expect(containsPoint(BOWTIE, { x: 1, y: 2 })).toBe(true);
  });

  test('BOWTIE polygon 상단 외부 점은 ray casting으로 deterministic하게 false를 반환한다', () => {
    // (2, 3)은 좌측 삼각형 위쪽 경계 (0,4)→(2,2) 바깥
    expect(containsPoint(BOWTIE, { x: 2, y: 3 })).toBe(false);
  });

  // tiny polygon
  test('tiny polygon 내부 점은 true를 반환한다', () => {
    expect(containsPoint(TINY_TRI, { x: 1e-11, y: 1e-11 })).toBe(true);
  });

  // tuple input
  test('tuple point input을 지원한다', () => {
    expect(containsPoint(UNIT_SQUARE, [0.5, 0.5] as const)).toBe(true);
  });

  test('tuple point polygon + tuple point input을 지원한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [4, 0],
        [0, 3],
      ] as const,
    };
    expect(containsPoint(poly, [1, 0.5] as const)).toBe(true);
  });
});
