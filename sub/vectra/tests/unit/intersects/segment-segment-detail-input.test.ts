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

  test('반환 point object는 입력 point object와 다른 reference다', () => {
    const shared = { x: 5, y: 5 };
    const a = { a: { x: 0, y: 0 }, b: shared };
    const b = { a: shared, b: { x: 10, y: 0 } };
    const result = segmentSegmentDetail(a, b);
    expect(result.kind).toBe('point');
    if (result.kind !== 'point') return;
    expect(result.point).toEqual({ x: 5, y: 5 });
    expect(result.point).not.toBe(shared);
  });

  test('매 호출은 새 result object를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } };
    const first = segmentSegmentDetail(a, b);
    const second = segmentSegmentDetail(a, b);
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  test('overlap 분기의 start/end는 입력 point object와 다른 reference다', () => {
    const sharedStart = { x: 5, y: 0 };
    const sharedEnd = { x: 10, y: 0 };
    const a = { a: { x: 0, y: 0 }, b: sharedEnd };
    const b = { a: sharedStart, b: { x: 15, y: 0 } };
    const result = segmentSegmentDetail(a, b);
    expect(result.kind).toBe('overlap');
    if (result.kind !== 'overlap') return;
    expect(result.start).toEqual({ x: 5, y: 0 });
    expect(result.end).toEqual({ x: 10, y: 0 });
    expect(result.start).not.toBe(sharedStart);
    expect(result.end).not.toBe(sharedEnd);
  });

  test('overlap과 none 분기도 tuple 입력과 object 입력이 같은 결과를 반환한다', () => {
    const aObj = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const bOverlapObj = { a: { x: 5, y: 0 }, b: { x: 15, y: 0 } };
    const bNoneObj = { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } };
    const aTuple = [
      [0, 0],
      [10, 0],
    ] as const;
    const bOverlapTuple = [
      [5, 0],
      [15, 0],
    ] as const;
    const bNoneTuple = [
      [0, 1],
      [10, 1],
    ] as const;
    expect(segmentSegmentDetail(aTuple, bOverlapTuple)).toEqual(segmentSegmentDetail(aObj, bOverlapObj));
    expect(segmentSegmentDetail(aTuple, bNoneTuple)).toEqual(segmentSegmentDetail(aObj, bNoneObj));
  });
});
