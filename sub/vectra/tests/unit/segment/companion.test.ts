/** 중점, 이동과 단일 교점의 할당형 결과를 검증한다. */
import { describe, expect, test } from 'vitest';
import { midpoint } from '../../../src/segment/midpoint';
import { singleIntersection } from '../../../src/segment/single-intersection';
import { translate } from '../../../src/segment/translate';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 끝점 좌표에서 선분을 만든다. */
function makeLine(ax = 0, ay = 0, bx = 4, by = 0): SegmentWritable {
  return { x1: ax, y1: ay, x2: bx, y2: by };
}

// companion 함수가 public convenience API로서 정상값을 새 object로 반환하는지
// 대표 예제로만 확인한다. Into 동등성과 segment 도메인 정책은 Into/leaf 테스트가 담당한다.

describe('segment companion - midpoint', () => {
  test('중점을 새 object로 반환한다', () => {
    const result = midpoint({ x1: 0, y1: 0, x2: 4, y2: 4 });

    expect(result).toEqual({ x: 2, y: 2 });
  });
});

describe('segment companion - translate', () => {
  test('endpoint를 offset만큼 이동한 새 plain object를 반환한다', () => {
    const result = translate(makeLine(0, 0, 4, 0), { x: 1, y: 2 });

    expect(result).toEqual({ x1: 1, y1: 2, x2: 5, y2: 2 });
  });
});

describe('segment companion - singleIntersection', () => {
  test('두 segment이 교차하면 교점을 새 object로 반환한다', () => {
    const result = singleIntersection(makeLine(0, 0, 4, 0), makeLine(2, -2, 2, 2));

    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(2, 10);
    expect(result?.y).toBeCloseTo(0, 10);
  });
});
