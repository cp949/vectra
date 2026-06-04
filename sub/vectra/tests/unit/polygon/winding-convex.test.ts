/**
 * polygon light query unit test.
 *
 * `polygonWindingNumber`(signed fill-rule scalar)와 `isConvex`(light boolean)의
 * inside/outside/boundary, CW/CCW sign, repeated/collinear/tiny/self-intersecting 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { isConvex } from '../../../src/polygon/is-convex';
import { polygonWindingNumber } from '../../../src/polygon/polygon-winding-number';
import type { PolygonLike } from '../../../src/types';

// 수학적 y-up CCW 사각형 (0,0)→(4,0)→(4,4)→(0,4)
const CCW_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ],
};

// 위 사각형의 reverse — CW (0,0)→(0,4)→(4,4)→(4,0)
const CW_SQUARE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 4 },
    { x: 4, y: 4 },
    { x: 4, y: 0 },
  ],
};

// self-intersecting bow-tie (0,0)→(4,4)→(4,0)→(0,4)
const BOW_TIE: PolygonLike = {
  points: [
    { x: 0, y: 0 },
    { x: 4, y: 4 },
    { x: 4, y: 0 },
    { x: 0, y: 4 },
  ],
};

describe('polygon light query - polygonWindingNumber', () => {
  test('empty polygon은 0이다', () => {
    expect(polygonWindingNumber({ points: [] }, { x: 0, y: 0 })).toBe(0);
  });

  test('1점 polygon은 0이다', () => {
    expect(polygonWindingNumber({ points: [{ x: 1, y: 1 }] }, { x: 1, y: 1 })).toBe(0);
  });

  test('2점 polygon은 0이다', () => {
    expect(
      polygonWindingNumber(
        {
          points: [
            { x: 0, y: 0 },
            { x: 4, y: 0 },
          ],
        },
        { x: 2, y: 0 }
      )
    ).toBe(0);
  });

  test('CCW 사각형 내부는 1이다', () => {
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 2 })).toBe(1);
  });

  test('CW 사각형 내부는 -1이다', () => {
    expect(polygonWindingNumber(CW_SQUARE, { x: 2, y: 2 })).toBe(-1);
  });

  test('외부 point는 0이다', () => {
    expect(polygonWindingNumber(CCW_SQUARE, { x: 10, y: 2 })).toBe(0);
  });

  test('edge 위 boundary point는 0이다', () => {
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 0 })).toBe(0);
  });

  test('vertex 위 boundary point는 0이다', () => {
    expect(polygonWindingNumber(CCW_SQUARE, { x: 0, y: 0 })).toBe(0);
  });

  test('epsilon이 boundary proximity를 확장한다', () => {
    // edge에서 0.4 떨어진 외부 point. epsilon 0이면 외부 winding(여기선 0), epsilon 0.5면 boundary(0)
    const justOutside = { x: -0.4, y: 2 };
    expect(polygonWindingNumber(CCW_SQUARE, justOutside, 0)).toBe(0);
    expect(polygonWindingNumber(CCW_SQUARE, justOutside, 0.5)).toBe(0);
  });

  test('epsilon이 내부 point를 boundary로 끌어와 0으로 만든다', () => {
    const justInside = { x: 0.3, y: 2 };
    expect(polygonWindingNumber(CCW_SQUARE, justInside, 0)).toBe(1);
    expect(polygonWindingNumber(CCW_SQUARE, justInside, 0.5)).toBe(0);
  });

  test('tuple point input과 object point input이 같은 결과를 낸다', () => {
    expect(polygonWindingNumber(CCW_SQUARE, [2, 2])).toBe(1);
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 2 })).toBe(1);
  });

  test('bare point array polygon input을 읽는다', () => {
    expect(
      polygonWindingNumber(
        [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 4 },
          { x: 0, y: 4 },
        ],
        { x: 2, y: 2 }
      )
    ).toBe(1);
  });

  test('self-intersecting bow-tie는 deterministic winding 결과를 고정한다', () => {
    // 두 lobe는 교차로 인해 반대 부호 winding을 갖는다.
    // 좌측 lobe 내부 (1,2): +1
    expect(polygonWindingNumber(BOW_TIE, { x: 1, y: 2 })).toBe(1);
    // 우측 lobe 내부 (3,2): -1
    expect(polygonWindingNumber(BOW_TIE, { x: 3, y: 2 })).toBe(-1);
  });

  test('NaN epsilon은 runtime validation 없이 JS 비교 결과를 따른다(boundary 미적용)', () => {
    // dist <= NaN은 항상 false이므로 boundary로 빠지지 않고 winding을 계산한다.
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 2 }, Number.NaN)).toBe(1);
  });

  test('negative epsilon은 boundary를 좁혀 edge 위 point도 winding을 계산한다', () => {
    // edge 위 point는 dist 0. 0 <= -1은 false이므로 boundary 미적용, 표준 알고리즘 결과를 따른다.
    expect(polygonWindingNumber(CCW_SQUARE, { x: 4, y: 2 }, -1)).toBe(0);
  });

  test('±Infinity epsilon은 runtime validation 없이 JS 비교 결과를 따른다', () => {
    // +Infinity epsilon: dist <= Infinity가 항상 참이라 내부 point도 boundary로 빠져 0.
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 2 }, Number.POSITIVE_INFINITY)).toBe(0);
    // -Infinity epsilon: dist <= -Infinity가 항상 거짓이라 boundary 미적용, 표준 winding(1).
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: 2 }, Number.NEGATIVE_INFINITY)).toBe(1);
  });

  test('vertex y와 같은 수평선이 concave polygon 내부를 지나도 double-count하지 않는다', () => {
    // L-shape (CCW). 수평선 y=2가 vertex (4,2),(2,2)를 지난다.
    const L_SHAPE: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 4 },
        { x: 0, y: 4 },
      ],
    };
    expect(polygonWindingNumber(L_SHAPE, { x: 1, y: 2 })).toBe(1);
    expect(polygonWindingNumber(L_SHAPE, { x: 5, y: 2 })).toBe(0);
  });

  test('point 좌표 non-finite는 finite validation 없이 JS 산술 결과(0)를 따른다', () => {
    // NaN px → cross가 NaN이라 어떤 crossing도 증가하지 않는다. throw 없음.
    expect(polygonWindingNumber(CCW_SQUARE, { x: Number.NaN, y: 2 })).toBe(0);
    // ±Infinity py → ay <= py가 항상 참, by > py가 항상 거짓이라 crossing 없음.
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: Number.POSITIVE_INFINITY })).toBe(0);
    expect(polygonWindingNumber(CCW_SQUARE, { x: 2, y: Number.NEGATIVE_INFINITY })).toBe(0);
  });

  test('vertex 좌표 non-finite도 throw 없이 deterministic 결과를 낸다', () => {
    const INF_VERTEX: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 4 },
        { x: 0, y: 4 },
      ],
    };
    expect(() => polygonWindingNumber(INF_VERTEX, { x: 1, y: 2 })).not.toThrow();
    expect(Number.isInteger(polygonWindingNumber(INF_VERTEX, { x: 1, y: 2 }))).toBe(true);
  });
});

describe('polygon light query - isConvex', () => {
  test('triangle은 true다', () => {
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 0, y: 3 },
        ],
      })
    ).toBe(true);
  });

  test('axis-aligned rectangle은 true다', () => {
    expect(isConvex(CCW_SQUARE)).toBe(true);
  });

  test('CW orientation도 true다', () => {
    expect(isConvex(CW_SQUARE)).toBe(true);
  });

  test('concave arrow polygon은 false다', () => {
    // 화살촉 모양: (0,0)→(4,2)→(0,4)→(1,2) — (1,2)가 안쪽으로 들어간 reflex vertex
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 4, y: 2 },
          { x: 0, y: 4 },
          { x: 1, y: 2 },
        ],
      })
    ).toBe(false);
  });

  test('structural empty(< 3)는 false다', () => {
    expect(isConvex({ points: [] })).toBe(false);
    expect(isConvex({ points: [{ x: 0, y: 0 }] })).toBe(false);
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      })
    ).toBe(false);
  });

  test('collinear-only zero-area polygon은 false다', () => {
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      })
    ).toBe(false);
  });

  test('consecutive repeated point가 만드는 zero-length edge는 false다', () => {
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 4 },
        ],
      })
    ).toBe(false);
  });

  test('collinear intermediate vertex가 섞인 rectangle-like polygon은 true다', () => {
    // (0,0)→(2,0)→(4,0)→(4,4)→(0,4): (2,0)이 collinear turn
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 4 },
          { x: 0, y: 4 },
        ],
      })
    ).toBe(true);
  });

  test('self-intersecting bow-tie는 false로 고정한다', () => {
    expect(isConvex(BOW_TIE)).toBe(false);
  });

  test('NaN epsilon은 runtime validation 없이 JS 비교 결과를 따른다', () => {
    // Math.abs(cross) <= NaN은 항상 false이므로 모든 turn이 sign 판단에 포함된다.
    expect(isConvex(CCW_SQUARE, Number.NaN)).toBe(true);
  });

  test('±Infinity epsilon은 runtime validation 없이 JS 비교 결과를 따른다', () => {
    // +Infinity epsilon: Math.abs(cross) <= Infinity가 항상 참이라 모든 turn이 collinear로 제외돼
    // non-zero turn이 없으므로 false.
    expect(isConvex(CCW_SQUARE, Number.POSITIVE_INFINITY)).toBe(false);
    // -Infinity epsilon: Math.abs(cross) <= -Infinity가 항상 거짓이라 모든 turn이 포함돼 convex면 true.
    expect(isConvex(CCW_SQUARE, Number.NEGATIVE_INFINITY)).toBe(true);
  });

  test('큰 좌표 scale에서도 절대 epsilon(1e-9) 기준으로 convex를 판정한다', () => {
    // cross가 거대해져 1e-9 collinear gate가 사실상 무력화되지만 same-sign이면 true.
    expect(
      isConvex({
        points: [
          { x: 0, y: 0 },
          { x: 1e8, y: 0 },
          { x: 1e8, y: 1e8 },
          { x: 0, y: 1e8 },
        ],
      })
    ).toBe(true);
  });

  test('vertex 좌표 non-finite는 finite validation 없이 throw 없이 boolean을 반환한다', () => {
    const NAN_VERTEX: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: Number.NaN, y: 4 },
      ],
    };
    expect(() => isConvex(NAN_VERTEX)).not.toThrow();
    expect(typeof isConvex(NAN_VERTEX)).toBe('boolean');
  });

  test.each([
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('vertex 좌표가 %s여도 throw 없이 deterministic boolean을 반환한다', (coord) => {
    const INF_VERTEX: PolygonLike = {
      points: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: coord, y: 4 },
        { x: 0, y: 4 },
      ],
    };
    expect(() => isConvex(INF_VERTEX)).not.toThrow();
    expect(typeof isConvex(INF_VERTEX)).toBe('boolean');
    expect(isConvex(INF_VERTEX)).toBe(isConvex(INF_VERTEX));
  });
});
