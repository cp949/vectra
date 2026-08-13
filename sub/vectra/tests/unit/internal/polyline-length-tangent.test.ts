/**
 * polylineVertexTangentInto / polylineSegmentTangentAtLengthInto의 분기 경계를 고정하는
 * characterization test. tangent/normal/frame-at-length 등 leaf를 통해 간접 검증되지만,
 * endpoint 단일-edge tangent, zero-length adjacent edge skip, segment boundary 선택 규칙,
 * NaN 전파는 직접 exercise된 적이 없다.
 */

import { describe, expect, test } from 'vitest';
import {
  polylineSegmentTangentAtLengthInto,
  polylineVertexTangentInto,
} from '../../../src/internal/polyline-length-tangent.internal';
import type { XYObjectWritable } from '../../../src/types';

const SENTINEL_X = 9999;
const SENTINEL_Y = -7777;

function makeOut(): XYObjectWritable {
  return { x: SENTINEL_X, y: SENTINEL_Y };
}

describe('polylineVertexTangentInto', () => {
  const bend = [
    [0, 0],
    [4, 0],
    [4, 4],
  ] as const;

  test('시작점(index 0)은 다음 edge 방향만 사용한다', () => {
    const out = makeOut();
    expect(polylineVertexTangentInto(out, bend, 0)).toBe(true);
    expect(out).toEqual({ x: 1, y: 0 });
  });

  test('끝점(마지막 index)은 이전 edge 방향만 사용한다', () => {
    const out = makeOut();
    expect(polylineVertexTangentInto(out, bend, 2)).toBe(true);
    expect(out).toEqual({ x: 0, y: 1 });
  });

  test('중간 vertex는 인접 두 edge 방향의 정규화된 평균이다', () => {
    const out = makeOut();
    expect(polylineVertexTangentInto(out, bend, 1)).toBe(true);
    expect(out.x).toBeCloseTo(Math.SQRT1_2, 12);
    expect(out.y).toBeCloseTo(Math.SQRT1_2, 12);
  });

  test('zero-length adjacent edge는 무시하고 유효한 edge만 평균한다', () => {
    const repeatedStart = [
      [0, 0],
      [0, 0],
      [4, 0],
    ] as const;
    const out = makeOut();
    expect(polylineVertexTangentInto(out, repeatedStart, 1)).toBe(true);
    expect(out).toEqual({ x: 1, y: 0 });
  });

  test('유효한 인접 edge가 하나도 없으면 false를 반환하고 out을 수정하지 않는다', () => {
    const allZero = [
      [0, 0],
      [0, 0],
    ] as const;
    const out = makeOut();
    expect(polylineVertexTangentInto(out, allZero, 0)).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});

describe('polylineSegmentTangentAtLengthInto', () => {
  const threeSegments = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
  ] as const;

  test('두 번째 이후 segment boundary에 정확히 걸리면 앞쪽(먼저 끝나는) segment 방향을 사용한다', () => {
    const out = makeOut();
    expect(polylineSegmentTangentAtLengthInto(out, threeSegments, 4)).toBe(true);
    expect(out).toEqual({ x: 0, y: 1 });
  });

  test('length가 0 이하이면 첫 non-zero segment 방향을 사용한다', () => {
    const out = makeOut();
    expect(polylineSegmentTangentAtLengthInto(out, threeSegments, 0)).toBe(true);
    expect(out).toEqual({ x: 1, y: 0 });
  });

  test('length가 totalLength 이상이면 마지막 non-zero segment 방향을 사용한다', () => {
    const out = makeOut();
    expect(polylineSegmentTangentAtLengthInto(out, threeSegments, 6)).toBe(true);
    expect(out).toEqual({ x: -1, y: 0 });
  });

  test('length가 NaN이면 NaN tangent를 기록하고 true를 반환한다', () => {
    const out = makeOut();
    expect(polylineSegmentTangentAtLengthInto(out, threeSegments, Number.NaN)).toBe(true);
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });

  test('total length가 0인 repeated-point points는 false를 반환하고 out을 수정하지 않는다', () => {
    const zeroLength = [
      [1, 1],
      [1, 1],
    ] as const;
    const out = makeOut();
    expect(polylineSegmentTangentAtLengthInto(out, zeroLength, 0)).toBe(false);
    expect(out).toEqual({ x: SENTINEL_X, y: SENTINEL_Y });
  });
});
