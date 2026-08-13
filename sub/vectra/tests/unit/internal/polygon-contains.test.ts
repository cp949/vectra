/**
 * polygonContainsPoint와 segmentsIntersect의 분기 경계를 고정하는 characterization test.
 *
 * 두 함수는 지금까지 43개 leaf를 통해서만 간접 검증됐다.
 * 여기서는 ray-casting lower-left rule, boundary epsilon threshold,
 * segmentsIntersect의 parallel/collinear 분기를 직접 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { polygonContainsPoint, segmentsIntersect } from '../../../src/internal/polygon-contains.internal';

describe('polygonContainsPoint', () => {
  const square = [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ] as const;

  test('내부 점은 true다', () => {
    expect(polygonContainsPoint(square, 2, 2, 0)).toBe(true);
  });

  test('외부 점은 false다', () => {
    expect(polygonContainsPoint(square, 5, 5, 0)).toBe(false);
  });

  test('boundary 위 점은 epsilon=0에서도 true다(closed boundary 정책)', () => {
    expect(polygonContainsPoint(square, 4, 2, 0)).toBe(true);
  });

  test('boundary에서 epsilon 밖의 점은 false다', () => {
    expect(polygonContainsPoint(square, 4.05, 2, 0)).toBe(false);
  });

  test('boundary에서 epsilon 안의 점은 true다', () => {
    expect(polygonContainsPoint(square, 4.05, 2, 0.1)).toBe(true);
  });

  test('lower-left rule: vertex가 scanline과 같은 y일 때 인접 두 edge의 crossing이 상쇄되어 정확한 parity를 유지한다', () => {
    // V자 notch pentagon: notch vertex (2,2)가 local minimum이고, query point의 py(2)와 같은 y다.
    // A-B, B-C 두 edge가 모두 crossing 후보로 잡히지만 두 flip이 상쇄되고, 나머지 edge(C-D)의
    // 단일 flip만 반영되어 최종 결과가 true(내부)로 확정된다.
    const notchPentagon = [
      [0, 4],
      [2, 2],
      [4, 4],
      [4, 0],
      [0, 0],
    ] as const;
    expect(polygonContainsPoint(notchPentagon, 1, 2, 0)).toBe(true);
  });

  test('lower-left rule: 정점을 관통하는 edge에서 <=/< 연산자 선택이 결과를 가른다', () => {
    // (6,2) 정점이 scanline(py=2)을 관통하는 non-extremum 정점이다. 이 fixture는 컨트롤러가
    // <=를 <로 바꾼 mutation을 실제 실행해 결과가 true→false로 바뀌는 것을 확인한 뒤 추가했다.
    const passThroughVertex = [
      [0, 0],
      [4, 0],
      [6, 2],
      [4, 4],
      [0, 4],
    ] as const;
    expect(polygonContainsPoint(passThroughVertex, 1, 2, 0)).toBe(true);
  });
});

describe('segmentsIntersect', () => {
  test('일반 교차(t, u ∈ [0,1])는 true다', () => {
    expect(segmentsIntersect(0, 0, 4, 4, 0, 4, 4, 0)).toBe(true);
  });

  test('평행하지만 collinear가 아니면 false다', () => {
    expect(segmentsIntersect(0, 0, 4, 0, 0, 1, 4, 1)).toBe(false);
  });

  test('collinear이고 구간이 겹치면 true다', () => {
    expect(segmentsIntersect(0, 0, 4, 0, 2, 0, 6, 0)).toBe(true);
  });

  test('collinear이지만 구간이 겹치지 않으면 false다', () => {
    expect(segmentsIntersect(0, 0, 2, 0, 3, 0, 5, 0)).toBe(false);
  });

  test('endpoint가 맞닿으면 true다', () => {
    expect(segmentsIntersect(0, 0, 2, 2, 2, 2, 4, 0)).toBe(true);
  });

  test('segment A가 degenerate point면 collinear 분기에서 false다', () => {
    expect(segmentsIntersect(1, 1, 1, 1, 0, 0, 2, 2)).toBe(false);
  });
});
