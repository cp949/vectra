/**
 * infinite-line lifecycle 단위 테스트.
 *
 * createInfiniteLine, infiniteLineFrom overload, copyInto, reverse(Into),
 * fromSegment(Into)의 생성·복사·역방향·segment 변환 정책을 함께 다룬다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { copyInto } from '../../../src/infinite-line/copy-into';
import { createInfiniteLine } from '../../../src/infinite-line/create-infinite-line';
import { fromSegment } from '../../../src/infinite-line/from-segment';
import { fromSegmentInto } from '../../../src/infinite-line/from-segment-into';
import { infiniteLineFrom } from '../../../src/infinite-line/infinite-line-from';
import { reverse } from '../../../src/infinite-line/reverse';
import { reverseInto } from '../../../src/infinite-line/reverse-into';
import type { InfiniteLineWritable } from '../../../src/types';

describe('infinite-line lifecycle - createInfiniteLine', () => {
  test('빈 인자로 origin/direction이 (0,0)인 degenerate infinite-line을 만든다', () => {
    const line = createInfiniteLine();
    expect(line).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } });
  });
});

describe('infinite-line lifecycle - infiniteLineFrom overload', () => {
  test('object component로 새 plain object를 만든다', () => {
    const line = infiniteLineFrom({ x: 1, y: 2 }, { x: 3, y: 4 });
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('tuple component로 새 plain object를 만든다', () => {
    const line = infiniteLineFrom([1, 2], [3, 4]);
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('InfiniteLineObjectLike source로부터 component를 복사한다', () => {
    const source = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    const line = infiniteLineFrom(source);
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    // 새 object여야 한다
    expect(line).not.toBe(source);
    expect(line.origin).not.toBe(source.origin);
    expect(line.direction).not.toBe(source.direction);
  });

  test('InfiniteLineTuple source로부터 component를 복사한다', () => {
    const source = [
      [1, 2],
      [3, 4],
    ] as const;
    const line = infiniteLineFrom(source);
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });
});

describe('infinite-line lifecycle - copyInto / infiniteLineFrom', () => {
  test('copyInto가 out reference를 반환하고 component를 복사한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = copyInto(out, { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    expect(result).toBe(out);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('copyInto가 component 인자를 그대로 복사한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    copyInto(out, { x: 5, y: 6 }, [7, 8]);
    expect(out).toEqual({ origin: { x: 5, y: 6 }, direction: { x: 7, y: 8 } });
  });

  test('copyInto가 tuple component를 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    copyInto(out, [
      [1, 2],
      [3, 4],
    ] as const);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('copyInto는 out과 source가 같은 object여도 alias-safe하다', () => {
    const line: InfiniteLineWritable = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    copyInto(line, line);
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('copyInto는 mutable tuple writable nested type을 보존한다', () => {
    const out = { origin: [0, 0] as [number, number], direction: [0, 0] as [number, number] };
    const result = copyInto(out, { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    expect(result).toBe(out);
    expect(out.origin).toEqual([1, 2]);
    expect(out.direction).toEqual([3, 4]);
    expectTypeOf(result.origin).toEqualTypeOf<[number, number]>();
  });

  test('infiniteLineFrom companion이 InfiniteLineLike source를 plain object로 복사한다', () => {
    const line = infiniteLineFrom({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('infiniteLineFrom companion이 component 인자를 plain object로 복사한다', () => {
    const line = infiniteLineFrom({ x: 5, y: 6 }, [7, 8]);
    expect(line).toEqual({ origin: { x: 5, y: 6 }, direction: { x: 7, y: 8 } });
  });
});

describe('infinite-line lifecycle - reverseInto / reverse', () => {
  test('reverseInto는 origin을 유지하고 direction을 부호 반전한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = reverseInto(out, { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
    expect(result).toBe(out);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: -3, y: -4 } });
  });

  test('reverseInto는 in-place alias 호출에서도 안전하다', () => {
    const line: InfiniteLineWritable = { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } };
    reverseInto(line, line);
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: -3, y: -4 } });
  });

  test('reverseInto는 tuple input도 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    reverseInto(out, [
      [1, 2],
      [3, 4],
    ] as const);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: -3, y: -4 } });
  });

  test('reverse companion이 새 plain object를 반환한다', () => {
    const result = reverse({ origin: { x: 0, y: 0 }, direction: { x: 1, y: -1 } });
    expect(result).toEqual({ origin: { x: 0, y: 0 }, direction: { x: -1, y: 1 } });
  });
});

describe('infinite-line lifecycle - fromSegmentInto / fromSegment', () => {
  test('fromSegmentInto가 a를 origin, b - a를 direction으로 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromSegmentInto(out, { a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
    expect(result).toBe(out);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('fromSegmentInto는 tuple segment input도 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSegmentInto(out, [
      [0, 0],
      [3, 4],
    ] as const);
    expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } });
  });

  test('zero-length segment은 degenerate infinite-line이 된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSegmentInto(out, { a: { x: 5, y: 5 }, b: { x: 5, y: 5 } });
    expect(out).toEqual({ origin: { x: 5, y: 5 }, direction: { x: 0, y: 0 } });
  });

  test('fromSegment companion이 새 plain object를 반환한다', () => {
    const result = fromSegment({ a: { x: 1, y: 2 }, b: { x: 4, y: 6 } });
    expect(result).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });
});
