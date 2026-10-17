/**
 * polygon과 bounds·rect의 교차 판정에서 모서리 포함 검사와 edge 교차 검사를 확인하는 테스트.
 * 모서리를 하나씩 감싸는 작은 polygon과, 모서리·vertex 포함 없이 edge만 교차하는 polygon을 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPolygonBounds } from '../../../src/intersects/intersects-polygon-bounds';
import { intersectsPolygonRect } from '../../../src/intersects/intersects-polygon-rect';

const bounds = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
const rect = { x: 0, y: 0, width: 10, height: 10 };

/**
 * (cx, cy)를 중심으로 한 변 4인 정사각형 polygon을 만든다.
 * 한 모서리만 감싸고 나머지 모서리는 포함하지 않는 위치에서 쓴다.
 */
function squareAround(cx: number, cy: number) {
  return [
    { x: cx - 2, y: cy - 2 },
    { x: cx + 2, y: cy - 2 },
    { x: cx + 2, y: cy + 2 },
    { x: cx - 2, y: cy + 2 },
  ];
}

// 폭이 좁고 긴 띠. bounds·rect의 어떤 모서리도 감싸지 않고 어떤 vertex도 안에 없지만 edge가 가로지른다.
const crossingBand = [
  { x: -5, y: 4 },
  { x: 15, y: 4 },
  { x: 15, y: 6 },
  { x: -5, y: 6 },
];

describe('intersectsPolygonBounds', () => {
  test('(maxX, minY) 모서리만 감싸는 polygon이면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(squareAround(10, 0), bounds)).toBe(true);
  });

  test('(maxX, maxY) 모서리만 감싸는 polygon이면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(squareAround(10, 10), bounds)).toBe(true);
  });

  test('(minX, maxY) 모서리만 감싸는 polygon이면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(squareAround(0, 10), bounds)).toBe(true);
  });

  test('모서리와 vertex 포함 없이 edge만 교차하면 true를 반환한다', () => {
    expect(intersectsPolygonBounds(crossingBand, bounds)).toBe(true);
  });
});

describe('intersectsPolygonRect', () => {
  test('(x+width, y) 모서리만 감싸는 polygon이면 true를 반환한다', () => {
    expect(intersectsPolygonRect(squareAround(10, 0), rect)).toBe(true);
  });

  test('(x, y+height) 모서리만 감싸는 polygon이면 true를 반환한다', () => {
    expect(intersectsPolygonRect(squareAround(0, 10), rect)).toBe(true);
  });

  test('모서리와 vertex 포함 없이 edge만 교차하면 true를 반환한다', () => {
    expect(intersectsPolygonRect(crossingBand, rect)).toBe(true);
  });
});
