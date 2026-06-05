/**
 * segmentSegmentDetail 입력 형식과 반환 reference 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';

describe('segmentSegmentDetail — 입력 형식과 reference', () => {
  test('tuple 입력과 object 입력은 같은 결과를 반환한다', () => {
    const aObj = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const bObj = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    const aTuple = [
      [0, 0],
      [10, 10],
    ] as const;
    const bTuple = [
      [0, 10],
      [10, 0],
    ] as const;
    expect(segmentSegmentDetail(aTuple, bTuple)).toEqual(segmentSegmentDetail(aObj, bObj));
  });
});
