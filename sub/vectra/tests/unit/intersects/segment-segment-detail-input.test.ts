/**
 * 읽기 전용 선분 입력과 상세 교차 결과의 참조 독립성을 검증한다.
 */

import { expect, test } from 'vitest';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';

test('읽기 전용 선분 쌍은 호출마다 새 교점을 반환한다', () => {
  const a = Object.freeze({ x1: 0, y1: 0, x2: 10, y2: 10 });
  const b = Object.freeze({ x1: 0, y1: 10, x2: 10, y2: 0 });
  const first = segmentSegmentDetail(a, b);
  const second = segmentSegmentDetail(a, b);

  expect(first).toEqual({ kind: 'point', point: { x: 5, y: 5 }, tA: 0.5, tB: 0.5 });
  expect(second).toEqual(first);
  if (first.kind === 'point' && second.kind === 'point') {
    expect(second.point).not.toBe(first.point);
  }
});
