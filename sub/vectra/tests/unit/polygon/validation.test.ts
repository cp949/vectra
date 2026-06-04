import { describe, expect, test } from 'vitest';
import { isSelfIntersecting } from '../../../src/polygon/is-self-intersecting';
import { isSimple } from '../../../src/polygon/is-simple';
import type { PolygonLike, XYInput } from '../../../src/types';

// S10-RM-010 polygon lightweight validation helpers.
// 정책 출처: _works/S10-RM-010/.../TASK-01-surface-policy.md.

// ─────────────────────────────────────────────────────────────────────────────
// 공통 fixture
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PolygonLike = { points: [] };
const SINGLE: PolygonLike = { points: [{ x: 1, y: 2 }] };
const TWO_PT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ],
};

// 삼각형: non-adjacent edge pair가 없으므로 self-intersection 불가
const TRIANGLE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 3 },
  ],
};

// 4×4 정사각형 (CCW). 첫 edge와 마지막 edge가 (0,0)을 공유하지만 인접 edge다.
const SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ],
};

// 같은 정사각형을 bare point array로 전달 (object shape가 아닌 입력 경로)
const SQUARE_BARE: readonly XYInput[] = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 4 },
  { x: 0, y: 4 },
];

// 볼록 오각형 (n=5): wrap-around 인접 edge 처리 확인
const PENTAGON: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 5, y: 3 },
    { x: 2, y: 5 },
    { x: -1, y: 3 },
  ],
};

// bowtie: non-adjacent edge가 (2,2)에서 교차
const BOWTIE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 4 },
    { x: 4, y: 0 },
    { x: 0, y: 4 },
  ],
};

// figure-eight: (2,2) vertex를 두 번 방문해 non-adjacent edge가 한 점에서 닿는다
const SHARED_VERTEX: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 2, y: 2 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 2, y: 2 },
    { x: 0, y: 4 },
  ],
};

// non-adjacent collinear overlap: edge 1 (0,0)→(4,0)과 edge 4 (2,0)→(6,0)이 y=0에서 겹친다
const COLLINEAR_OVERLAP: PolygonLike = {
  points: [
    { x: 0, y: 3 },
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 3 },
    { x: 2, y: 0 },
    { x: 6, y: 0 },
  ],
};

// consecutive repeated point: (4,0)이 연속 중복되어 zero-length edge를 만든다
const REPEATED_POINT: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 4 },
  ],
};

// explicit-closed 삼각형: 첫 vertex (0,0)을 끝에 다시 넣었다. ring은 implicit closed다.
const EXPLICIT_CLOSED_TRIANGLE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 3 },
    { x: 0, y: 0 },
  ],
};

// 3개 vertex지만 zero-length edge를 가진 degenerate triangle
const THREE_POINT_REPEATED: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 0 },
  ],
};

// 3개 vertex지만 implicit close edge가 zero-length가 되는 explicit-closed line
const THREE_POINT_EXPLICIT_CLOSED: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 0 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// isSelfIntersecting
// ─────────────────────────────────────────────────────────────────────────────

describe('isSelfIntersecting', () => {
  test('empty/degenerate polygon은 non-adjacent edge pair가 없어 false다', () => {
    expect(isSelfIntersecting(EMPTY)).toBe(false);
    expect(isSelfIntersecting(SINGLE)).toBe(false);
    expect(isSelfIntersecting(TWO_PT)).toBe(false);
  });

  test('삼각형은 non-adjacent edge pair가 없어 false다', () => {
    expect(isSelfIntersecting(TRIANGLE)).toBe(false);
  });

  test('3개 vertex의 zero-length edge는 non-adjacent edge pair가 없어 false다', () => {
    expect(isSelfIntersecting(THREE_POINT_REPEATED)).toBe(false);
    expect(isSelfIntersecting(THREE_POINT_EXPLICIT_CLOSED)).toBe(false);
  });

  test('simple 사각형/오각형은 false다', () => {
    expect(isSelfIntersecting(SQUARE)).toBe(false);
    expect(isSelfIntersecting(PENTAGON)).toBe(false);
  });

  test('bare point array 입력도 동일하게 판정한다', () => {
    expect(isSelfIntersecting(SQUARE_BARE)).toBe(false);
  });

  test('bowtie crossing은 true다', () => {
    expect(isSelfIntersecting(BOWTIE)).toBe(true);
  });

  test('non-adjacent shared vertex(접촉)는 true다', () => {
    expect(isSelfIntersecting(SHARED_VERTEX)).toBe(true);
  });

  test('non-adjacent collinear overlap은 true다', () => {
    expect(isSelfIntersecting(COLLINEAR_OVERLAP)).toBe(true);
  });

  test('consecutive repeated point는 true다 (normalize 없음)', () => {
    expect(isSelfIntersecting(REPEATED_POINT)).toBe(true);
  });

  test('explicit-closed 입력은 true다 (ring은 implicit closed)', () => {
    expect(isSelfIntersecting(EXPLICIT_CLOSED_TRIANGLE)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isSimple
// ─────────────────────────────────────────────────────────────────────────────

describe('isSimple', () => {
  test('structural empty polygon(pointCount < 3)은 false다', () => {
    expect(isSimple(EMPTY)).toBe(false);
    expect(isSimple(SINGLE)).toBe(false);
    expect(isSimple(TWO_PT)).toBe(false);
  });

  test('삼각형/사각형/오각형은 true다', () => {
    expect(isSimple(TRIANGLE)).toBe(true);
    expect(isSimple(SQUARE)).toBe(true);
    expect(isSimple(PENTAGON)).toBe(true);
  });

  test('bare point array 입력도 동일하게 판정한다', () => {
    expect(isSimple(SQUARE_BARE)).toBe(true);
  });

  test('self-intersecting polygon은 false다', () => {
    expect(isSimple(BOWTIE)).toBe(false);
    expect(isSimple(SHARED_VERTEX)).toBe(false);
    expect(isSimple(COLLINEAR_OVERLAP)).toBe(false);
  });

  test('repeated point / explicit-closed 입력은 false다', () => {
    expect(isSimple(REPEATED_POINT)).toBe(false);
    expect(isSimple(EXPLICIT_CLOSED_TRIANGLE)).toBe(false);
  });

  test('3개 vertex라도 zero-length edge가 있으면 false다', () => {
    expect(isSimple(THREE_POINT_REPEATED)).toBe(false);
    expect(isSimple(THREE_POINT_EXPLICIT_CLOSED)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// epsilon 정책
// ─────────────────────────────────────────────────────────────────────────────

describe('isSelfIntersecting epsilon', () => {
  test('exact crossing/touch는 epsilon 0에서도 검출한다', () => {
    expect(isSelfIntersecting(BOWTIE, 0)).toBe(true);
    expect(isSelfIntersecting(REPEATED_POINT, 0)).toBe(true);
  });

  test('default/작은 epsilon에서 simple 사각형은 false다', () => {
    expect(isSelfIntersecting(SQUARE, 0)).toBe(false);
    expect(isSelfIntersecting(SQUARE, 1)).toBe(false);
  });

  test('epsilon이 마주보는 edge 간 거리(4) 이상이면 near-parallel edge를 overlap으로 합친다', () => {
    // 4×4 사각형의 마주보는 edge는 4만큼 떨어져 있다.
    expect(isSelfIntersecting(SQUARE, 4)).toBe(true);
  });

  test('epsilon은 isSimple에도 동일하게 적용된다', () => {
    expect(isSimple(SQUARE, 1)).toBe(true);
    expect(isSimple(SQUARE, 4)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// epsilon 절대 임계값 정책 (normalize 안 됨, scale 의존) — intersectsSegmentSegment와 동일
// ─────────────────────────────────────────────────────────────────────────────

describe('epsilon absolute cross threshold', () => {
  // 같은 모양의 bowtie를 scale만 다르게 둔다. cross = 2 * s^2 이므로 작은 좌표 scale에서
  // |cross| <= default epsilon(1e-9)이 되어 실제 교차도 parallel로 합쳐진다.
  const unitBowtie: PolygonLike = {
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  };
  const smallBowtie: PolygonLike = {
    points: [
      { x: 0, y: 0 },
      { x: 1e-5, y: 1e-5 },
      { x: 1e-5, y: 0 },
      { x: 0, y: 1e-5 },
    ],
  };

  test('scale 1 bowtie는 교차를 검출한다', () => {
    expect(isSelfIntersecting(unitBowtie)).toBe(true);
    expect(isSimple(unitBowtie)).toBe(false);
  });

  test('매우 작은 scale bowtie는 default epsilon에서 under-report된다 (절대 임계값)', () => {
    expect(isSelfIntersecting(smallBowtie)).toBe(false);
    expect(isSimple(smallBowtie)).toBe(true);
  });

  test('작은 scale에서도 epsilon을 줄이면 교차를 검출한다', () => {
    expect(isSelfIntersecting(smallBowtie, 1e-12)).toBe(true);
    expect(isSimple(smallBowtie, 1e-12)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isSimple zero-length gate는 caller epsilon(cross 단위)과 분리된다
// ─────────────────────────────────────────────────────────────────────────────

describe('isSimple zero-length gate epsilon 분리', () => {
  // n=3 이라 self-intersection 불가, zero-length edge 없음. 큰 epsilon을 줘도 정상 triangle은
  // simple이다. zero-length 판정은 고정 DEFAULT_EPSILON 길이 임계값을 쓰기 때문이다.
  const shortEdgeTriangle: PolygonLike = {
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 100 },
    ],
  };

  test('큰 cross epsilon이 짧은 edge를 zero-length로 오판하지 않는다', () => {
    expect(isSimple(shortEdgeTriangle, 2)).toBe(true);
    expect(isSimple(shortEdgeTriangle, 100)).toBe(true);
  });

  // 고정 1e-9 길이 임계값은 caller epsilon을 작게 줘도 유지된다(양성 방향).
  // edge 길이 1e-10(lenSq 1e-20 <= 1e-18)인 n=4 polygon은 작은 caller epsilon에서도 zero-length로 잡힌다.
  const tinyEdgeQuad: PolygonLike = {
    points: [
      { x: 0, y: 0 },
      { x: 1e-10, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
    ],
  };

  test('작은 caller epsilon에서도 고정 1e-9 길이 임계값이 zero-length를 잡는다', () => {
    expect(isSimple(tinyEdgeQuad, 1e-12)).toBe(false);
    expect(isSimple(tinyEdgeQuad)).toBe(false);
  });
});
