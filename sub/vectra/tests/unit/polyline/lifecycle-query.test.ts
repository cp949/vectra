import { describe, expect, test } from 'vitest';
import { boundsInto } from '../../../src/polyline/bounds-into';
import { hasSegments } from '../../../src/polyline/has-segments';
import { length } from '../../../src/polyline/length';
import { monotonicAxis } from '../../../src/polyline/monotonic-axis';
import { pointAtIndexInto } from '../../../src/polyline/point-at-index-into';
import { segmentAtInto } from '../../../src/polyline/segment-at-into';
import { segmentCount } from '../../../src/polyline/segment-count';
import type { BoundsWritable, PolylineLike, SegmentWritable, XYWritable } from '../../../src/types';

const EMPTY: PolylineLike = { points: [] };
const SINGLE: PolylineLike = { points: [{ x: 1, y: 2 }] };
const TWO_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
  ],
};

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

function makeSegment(): SegmentWritable {
  return { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// hasSegments
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline query - hasSegments', () => {
  test('빈 polyline은 false를 반환한다', () => {
    expect(hasSegments(EMPTY)).toBe(false);
  });

  test('단일 point polyline은 false를 반환한다', () => {
    expect(hasSegments(SINGLE)).toBe(false);
  });

  test('2점 polyline은 true를 반환한다', () => {
    expect(hasSegments(TWO_PT)).toBe(true);
  });

  test('점 배열 자체를 polyline input으로 받는다', () => {
    expect(hasSegments([])).toBe(false);
    expect(hasSegments([{ x: 1, y: 2 }])).toBe(false);
    expect(
      hasSegments([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentCount
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline query - segmentCount', () => {
  test('빈 polyline은 0을 반환한다', () => {
    expect(segmentCount(EMPTY)).toBe(0);
  });

  test('단일 point polyline은 0을 반환한다', () => {
    expect(segmentCount(SINGLE)).toBe(0);
  });

  test('2점 polyline은 1을 반환한다', () => {
    expect(segmentCount(TWO_PT)).toBe(1);
  });

  test('3점 polyline은 2를 반환한다', () => {
    const tri: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    expect(segmentCount(tri)).toBe(2);
  });

  test('점 배열 자체의 segment 개수를 계산한다', () => {
    expect(
      segmentCount([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ])
    ).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// length
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline query - length', () => {
  test('빈 polyline은 0을 반환한다', () => {
    expect(length(EMPTY)).toBe(0);
  });

  test('단일 point polyline은 0을 반환한다', () => {
    expect(length(SINGLE)).toBe(0);
  });

  test('3-4-5 직각삼각형 두 점의 길이는 5이다', () => {
    expect(length(TWO_PT)).toBe(5);
  });

  test('repeated point가 있으면 해당 segment 기여는 0이다', () => {
    const repeating: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
    };
    expect(length(repeating)).toBe(5);
  });

  test('세 점 경로의 길이를 합산한다', () => {
    // (0,0)→(3,4)→(6,8): 5 + 5 = 10
    const three: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 6, y: 8 },
      ],
    };
    expect(length(three)).toBe(10);
  });

  test('tuple point 입력을 지원한다', () => {
    expect(
      length({
        points: [
          [0, 0],
          [3, 4],
        ],
      })
    ).toBe(5);
  });

  test('object/tuple mixed point 입력을 지원한다', () => {
    expect(length({ points: [{ x: 0, y: 0 }, [3, 4]] })).toBe(5);
  });

  test('점 배열 자체의 길이를 계산한다', () => {
    expect(length([{ x: 0, y: 0 }, [3, 4]])).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// monotonicAxis
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline query - monotonicAxis', () => {
  test('빈 polyline은 both를 반환한다', () => {
    expect(monotonicAxis(EMPTY)).toBe('both');
  });

  test('단일 point polyline은 both를 반환한다', () => {
    expect(monotonicAxis(SINGLE)).toBe('both');
  });

  test('단일 segment(2점) polyline은 both를 반환한다', () => {
    expect(monotonicAxis(TWO_PT)).toBe('both');
  });

  test('단일 segment에서 strict delta 0 축만 탈락한다', () => {
    // x delta 1(>0), y delta 0 → strict에서 y만 탈락 → 'x'
    expect(
      monotonicAxis(
        {
          points: [
            [0, 0],
            [1, 0],
          ],
        },
        { strict: true }
      )
    ).toBe('x');
  });

  test('단일 segment에서 두 축 delta 0이면 strict는 none을 반환한다', () => {
    // 동일 좌표 2점 → 두 축 delta 0 → strict에서 둘 다 탈락 → 'none'
    expect(
      monotonicAxis(
        {
          points: [
            [0, 0],
            [0, 0],
          ],
        },
        { strict: true }
      )
    ).toBe('none');
    // non-strict는 delta 0 허용 → both
    expect(
      monotonicAxis({
        points: [
          [0, 0],
          [0, 0],
        ],
      })
    ).toBe('both');
  });

  test('x만 단조이고 y가 섞이면 x를 반환한다', () => {
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 5 },
        { x: 2, y: 1 },
        { x: 3, y: 9 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('x');
  });

  test('y만 단조이고 x가 섞이면 y를 반환한다', () => {
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 10 },
        { x: 5, y: 8 },
        { x: 1, y: 6 },
        { x: 9, y: 2 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('y');
  });

  test('대각선 증가는 both를 반환한다', () => {
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('both');
  });

  test('두 축 모두 방향이 뒤집히면 none을 반환한다', () => {
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 2, y: 2 },
        { x: 1, y: 1 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('none');
  });

  test('non-strict는 repeated 좌표 축을 단조로 유지한다', () => {
    // x는 모두 0(delta 0), y는 증가
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('both');
  });

  test('strict는 repeated 좌표 축을 탈락시킨다', () => {
    // x delta 0 → strict에서 x 탈락, y는 strict 증가 유지
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    };
    expect(monotonicAxis(poly, { strict: true })).toBe('y');
  });

  test('strict는 두 축에 delta 0가 있으면 none을 반환한다', () => {
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
    };
    // non-strict: 두 축 delta가 모두 >= 0 → both
    expect(monotonicAxis(poly)).toBe('both');
    // strict: 두 축 모두 delta 0 존재 → none
    expect(monotonicAxis(poly, { strict: true })).toBe('none');
  });

  test('tuple point 입력을 지원한다', () => {
    expect(
      monotonicAxis({
        points: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      })
    ).toBe('both');
  });

  test('object/tuple mixed point 입력을 지원한다', () => {
    expect(monotonicAxis({ points: [{ x: 0, y: 0 }, [1, 5], [2, 1]] })).toBe('x');
  });

  test('점 배열 자체를 polyline input으로 받는다', () => {
    expect(
      monotonicAxis([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ])
    ).toBe('both');
  });

  test('NaN 좌표가 있는 축은 단조에서 탈락한다', () => {
    // x에 NaN → x delta가 NaN → x 탈락, y는 증가 유지
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: Number.NaN, y: 1 },
        { x: 2, y: 2 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('y');
  });

  test('Infinity delta는 증가 방향으로 본다', () => {
    // x: 0 → 1 → Infinity, delta 1, Infinity 모두 >= 0 → x 단조
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 0 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('both');
  });

  test('-Infinity delta는 감소 방향으로 본다', () => {
    // x: 0 → -1 → -Infinity, delta -1, -Infinity 모두 <= 0 → x 단조
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: Number.NEGATIVE_INFINITY, y: 0 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('both');
  });

  test('Infinity - Infinity delta는 NaN이므로 해당 축이 탈락한다', () => {
    // x: 0 → Infinity → Infinity, 두 번째 delta가 Infinity - Infinity = NaN → x 탈락
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 1 },
        { x: Number.POSITIVE_INFINITY, y: 2 },
      ],
    };
    expect(monotonicAxis(poly)).toBe('y');
  });

  test('signed-zero(-0) delta는 +0과 동일하게 취급한다', () => {
    // x: 0 → -0, delta (-0) - 0 = -0 → non-strict는 >=0·<=0 모두 true로 유지
    const poly: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: -0, y: 0 },
      ],
    };
    // non-strict: -0 delta는 양축 모두 단조 유지 → both
    expect(monotonicAxis(poly)).toBe('both');
    // strict: -0 delta는 >0·<0 모두 false → 양축 탈락 → none
    expect(monotonicAxis(poly, { strict: true })).toBe('none');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// boundsInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline output - boundsInto', () => {
  test('빈 polyline은 sentinel bounds(min=Inf, max=-Inf)를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, EMPTY);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('단일 point polyline은 min === max인 bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { points: [{ x: 3, y: 7 }] });
    expect(out.min).toEqual({ x: 3, y: 7 });
    expect(out.max).toEqual({ x: 3, y: 7 });
  });

  test('복수 point의 bounds를 올바르게 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, {
      points: [
        { x: 1, y: 5 },
        { x: 4, y: 2 },
        { x: -1, y: 3 },
      ],
    });
    expect(out.min).toEqual({ x: -1, y: 2 });
    expect(out.max).toEqual({ x: 4, y: 5 });
  });

  test('tuple point 입력을 지원한다', () => {
    const out = makeBounds();
    boundsInto(out, {
      points: [
        [1, 2],
        [5, 6],
      ],
    });
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('object/tuple mixed point 입력을 지원한다', () => {
    const out = makeBounds();
    boundsInto(out, { points: [{ x: 1, y: 2 }, [5, 6]] });
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('점 배열 자체의 bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, [{ x: -1, y: 2 }, [3, -4]]);
    expect(out.min).toEqual({ x: -1, y: -4 });
    expect(out.max).toEqual({ x: 3, y: 2 });
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = boundsInto(out, TWO_PT);
    expect(result).toBe(out);
  });

  test('out.min과 out.max object reference를 mutation한다', () => {
    const minPt: XYWritable = { x: 99, y: 99 };
    const maxPt: XYWritable = { x: 99, y: 99 };
    const out: BoundsWritable = { min: minPt, max: maxPt };
    boundsInto(out, {
      points: [
        { x: 1, y: 2 },
        { x: 5, y: 6 },
      ],
    });
    expect(out.min).toBe(minPt);
    expect(out.max).toBe(maxPt);
    expect(minPt).toEqual({ x: 1, y: 2 });
    expect(maxPt).toEqual({ x: 5, y: 6 });
  });

  test('tuple min/max out에 기록한다', () => {
    const out = { min: [0, 0] as [number, number], max: [0, 0] as [number, number] };
    boundsInto(out, {
      points: [
        { x: 1, y: 2 },
        { x: 5, y: 6 },
      ],
    });
    expect(out.min[0]).toBe(1);
    expect(out.min[1]).toBe(2);
    expect(out.max[0]).toBe(5);
    expect(out.max[1]).toBe(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// segmentAtInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline output - segmentAtInto', () => {
  test('빈 polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, EMPTY, 0)).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('단일 point polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, SINGLE, 0)).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('valid index 0은 segment를 기록하고 true를 반환한다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, TWO_PT, 0)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 3, y: 4 });
  });

  test('3점 polyline에서 index 0 segment를 기록한다', () => {
    const out = makeSegment();
    const tri: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    expect(segmentAtInto(out, tri, 0)).toBe(true);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 1, y: 0 });
  });

  test('3점 polyline에서 index 1 segment를 기록한다', () => {
    const out = makeSegment();
    const tri: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    expect(segmentAtInto(out, tri, 1)).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 0 });
    expect(out.b).toEqual({ x: 2, y: 0 });
  });

  test('음수 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, TWO_PT, -1)).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('index >= segmentCount는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeSegment();
    // TWO_PT segmentCount=1, index 1은 유효 범위 밖
    expect(segmentAtInto(out, TWO_PT, 1)).toBe(false);
    expect(out.a).toEqual({ x: 0, y: 0 });
    expect(out.b).toEqual({ x: 0, y: 0 });
  });

  test('tuple point input polyline에서 segment를 기록한다', () => {
    const out = makeSegment();
    expect(
      segmentAtInto(
        out,
        {
          points: [
            [1, 2],
            [3, 4],
          ],
        },
        0
      )
    ).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 3, y: 4 });
  });

  test('mixed point input polyline에서 segment를 기록한다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, { points: [{ x: 1, y: 2 }, [3, 4]] }, 0)).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 3, y: 4 });
  });

  test('점 배열 자체에서 segment를 기록한다', () => {
    const out = makeSegment();
    expect(segmentAtInto(out, [{ x: 1, y: 2 }, [3, 4]], 0)).toBe(true);
    expect(out.a).toEqual({ x: 1, y: 2 });
    expect(out.b).toEqual({ x: 3, y: 4 });
  });

  test('tuple a/b out에 기록한다', () => {
    const out: SegmentWritable<[number, number], [number, number]> = {
      a: [0, 0],
      b: [0, 0],
    };
    expect(
      segmentAtInto(
        out,
        {
          points: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
          ],
        },
        0
      )
    ).toBe(true);
    expect(out.a[0]).toBe(1);
    expect(out.a[1]).toBe(2);
    expect(out.b[0]).toBe(3);
    expect(out.b[1]).toBe(4);
  });

  test('out.a가 points[1]과 alias되어도 올바른 segment를 기록한다', () => {
    // out.a가 polyline의 두 번째 point와 같은 object일 때 aliasing 안전성 검증
    const ptA: XYWritable = { x: 0, y: 0 };
    const ptB: XYWritable = { x: 3, y: 4 };
    const poly: PolylineLike = { points: [ptA, ptB] };
    const out: SegmentWritable<XYWritable, XYWritable> = { a: ptB, b: { x: 99, y: 99 } };
    expect(segmentAtInto(out, poly, 0)).toBe(true);
    // out.a(=ptB)에는 ptA 좌표가 기록된다
    expect(out.a).toEqual({ x: 0, y: 0 });
    // out.b에는 원래 ptB 좌표(snapshot 후 기록)가 들어야 한다
    expect(out.b).toEqual({ x: 3, y: 4 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pointAtIndexInto
// ─────────────────────────────────────────────────────────────────────────────

describe('polyline output - pointAtIndexInto', () => {
  test('빈 polyline은 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, EMPTY, 0)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('valid index 0은 첫 번째 point를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, SINGLE, 0)).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('valid index 1은 두 번째 point를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, TWO_PT, 1)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('음수 index는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, TWO_PT, -1)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('index >= points.length는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    // TWO_PT has 2 points, index 2 is out of range
    expect(pointAtIndexInto(out, TWO_PT, 2)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('tuple input point를 object out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, { points: [[5, 6]] }, 0)).toBe(true);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('점 배열 자체에서 index point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, [{ x: 1, y: 2 }, [5, 6]], 1)).toBe(true);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('tuple out에 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(pointAtIndexInto(out, { points: [{ x: 7, y: 8 }] }, 0)).toBe(true);
    expect(out[0]).toBe(7);
    expect(out[1]).toBe(8);
  });

  test('외부 Point class에 기록한다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}
    }
    const p = new Point(0, 0);
    expect(pointAtIndexInto(p, { points: [{ x: 5, y: 10 }] }, 0)).toBe(true);
    expect(p.x).toBe(5);
    expect(p.y).toBe(10);
  });
});
