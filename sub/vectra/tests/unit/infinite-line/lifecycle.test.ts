/**
 * infinite-line lifecycle 단위 테스트.
 *
 * createInfiniteLine, infiniteLineFrom, copyInto, reverse(Into),
 * fromSegment(Into)의 생성·복사·역방향·segment 변환 정책을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/infinite-line/copy-into';
import { createInfiniteLine } from '../../../src/infinite-line/create-infinite-line';
import { fromSegment } from '../../../src/infinite-line/from-segment';
import { fromSegmentInto } from '../../../src/infinite-line/from-segment-into';
import { infiniteLineFrom } from '../../../src/infinite-line/infinite-line-from';
import { reverse } from '../../../src/infinite-line/reverse';
import { reverseInto } from '../../../src/infinite-line/reverse-into';
import type { InfiniteLineWritable } from '../../../src/types/flat-shapes.internal';

describe('infinite-line lifecycle - createInfiniteLine', () => {
  test('빈 인자로 ox, oy, dx, dy가 모두 0인 degenerate infinite-line을 만든다', () => {
    const line = createInfiniteLine();
    expect(line).toEqual({ ox: 0, oy: 0, dx: 0, dy: 0 });
  });
});

describe('infinite-line lifecycle - infiniteLineFrom', () => {
  test('무한 직선의 component를 복사한다', () => {
    const source = { ox: 1, oy: 2, dx: 3, dy: 4 };
    const line = infiniteLineFrom(source);
    expect(line).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
    // 새 object여야 한다
    expect(line).not.toBe(source);
  });
});

describe('infinite-line lifecycle - copyInto', () => {
  test('copyInto가 out reference를 반환하고 component를 복사한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = copyInto(out, { ox: 1, oy: 2, dx: 3, dy: 4 });
    expect(result).toBe(out);
    expect(out).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });

  test('copyInto는 out과 source가 같은 object여도 alias-safe하다', () => {
    const line: InfiniteLineWritable = { ox: 1, oy: 2, dx: 3, dy: 4 };
    copyInto(line, line);
    expect(line).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });
});

describe('infinite-line lifecycle - reverseInto / reverse', () => {
  test('reverseInto는 origin을 유지하고 direction을 부호 반전한다', () => {
    const out: InfiniteLineWritable = { ox: 0, oy: 0, dx: 0, dy: 0 };
    const result = reverseInto(out, { ox: 1, oy: 2, dx: 3, dy: 4 });
    expect(result).toBe(out);
    expect(out).toEqual({ ox: 1, oy: 2, dx: -3, dy: -4 });
  });

  test('reverseInto는 in-place alias 호출에서도 안전하다', () => {
    const line: InfiniteLineWritable = { ox: 1, oy: 2, dx: 3, dy: 4 };
    reverseInto(line, line);
    expect(line).toEqual({ ox: 1, oy: 2, dx: -3, dy: -4 });
  });

  test('reverse companion이 새 plain object를 반환한다', () => {
    const result = reverse({ ox: 0, oy: 0, dx: 1, dy: -1 });
    expect(result).toEqual({ ox: 0, oy: 0, dx: -1, dy: 1 });
  });
});

describe('infinite-line lifecycle - fromSegmentInto / fromSegment', () => {
  test('fromSegmentInto가 a를 origin, b - a를 direction으로 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromSegmentInto(out, { x1: 1, y1: 2, x2: 4, y2: 6 });
    expect(result).toBe(out);
    expect(out).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });

  test('zero-length segment은 degenerate infinite-line이 된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSegmentInto(out, { x1: 5, y1: 5, x2: 5, y2: 5 });
    expect(out).toEqual({ ox: 5, oy: 5, dx: 0, dy: 0 });
  });

  test('fromSegment companion이 새 plain object를 반환한다', () => {
    const result = fromSegment({ x1: 1, y1: 2, x2: 4, y2: 6 });
    expect(result).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });
});
