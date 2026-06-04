/**
 * infinite-line component accessor 단위 테스트.
 *
 * origin(Into), direction(Into), pointAtT(Into)의 component 추출과 parametric
 * 평가 정책, mutable tuple writable 처리, degenerate 입력 거동을 함께 다룬다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { direction } from '../../../src/infinite-line/direction';
import { directionInto } from '../../../src/infinite-line/direction-into';
import { infiniteLineMirrorLine } from '../../../src/infinite-line/infinite-line-mirror-line';
import { infiniteLineMirrorLineInto } from '../../../src/infinite-line/infinite-line-mirror-line-into';
import { origin } from '../../../src/infinite-line/origin';
import { originInto } from '../../../src/infinite-line/origin-into';
import { pointAtT } from '../../../src/infinite-line/point-at-t';
import { pointAtTInto } from '../../../src/infinite-line/point-at-t-into';
import type { InfiniteLineWritable, XYWritable } from '../../../src/types';

describe('infinite-line component - origin / originInto', () => {
  test('originInto가 out에 origin을 기록하고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = originInto(out, { origin: { x: 7, y: 8 }, direction: { x: 1, y: 0 } });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('originInto가 tuple infinite-line input을 읽는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    originInto(out, [
      [7, 8],
      [1, 0],
    ] as const);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('originInto가 mutable tuple writable에 기록한다', () => {
    const out: [number, number] = [0, 0];
    const result = originInto(out, { origin: { x: 3, y: 4 }, direction: { x: 1, y: 0 } });
    expect(result).toBe(out);
    expect(out).toEqual([3, 4]);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });

  test('origin companion이 새 plain object를 반환한다', () => {
    const point = origin({ origin: { x: 7, y: 8 }, direction: { x: 1, y: 0 } });
    expect(point).toEqual({ x: 7, y: 8 });
  });
});

describe('infinite-line component - direction / directionInto', () => {
  test('directionInto가 out에 direction을 기록하고 out을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = directionInto(out, { origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('directionInto가 tuple infinite-line input을 읽는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    directionInto(out, [
      [0, 0],
      [3, 4],
    ] as const);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('direction companion이 새 plain object를 반환한다', () => {
    const d = direction({ origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } });
    expect(d).toEqual({ x: 3, y: 4 });
  });
});

describe('infinite-line component - pointAtT / pointAtTInto', () => {
  test('pointAtTInto는 origin + direction * t를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = pointAtTInto(out, { origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } }, 2);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 10 });
  });

  test('pointAtTInto는 음수 t에서도 clamp하지 않는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 0, y: 0 }, direction: { x: 2, y: 0 } }, -1);
    expect(out).toEqual({ x: -2, y: 0 });
  });

  test('pointAtTInto는 1 초과 t에서도 clamp하지 않는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtTInto(out, { origin: { x: 0, y: 0 }, direction: { x: 2, y: 0 } }, 5);
    expect(out).toEqual({ x: 10, y: 0 });
  });

  test('non-normalized direction에서도 parametric t를 그대로 적용한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // direction = (10, 0)인 경우 t=0.5는 (5, 0)
    pointAtTInto(out, { origin: { x: 0, y: 0 }, direction: { x: 10, y: 0 } }, 0.5);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('degenerate infinite-line의 pointAtTInto는 t에 무관하게 origin을 기록한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    pointAtTInto(out, { origin: { x: 3, y: 4 }, direction: { x: 0, y: 0 } }, 100);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('tuple infinite-line input을 읽는다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtTInto(
      out,
      [
        [1, 2],
        [3, 4],
      ] as const,
      2
    );
    expect(out).toEqual({ x: 7, y: 10 });
  });

  test('pointAtT companion이 새 plain object를 반환한다', () => {
    const p = pointAtT({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } }, 2);
    expect(p).toEqual({ x: 7, y: 10 });
  });
});

describe('infinite-line mirror - infiniteLineMirrorLineInto / infiniteLineMirrorLine', () => {
  function makeLine(): InfiniteLineWritable {
    return { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
  }

  test('x축 mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    const result = infiniteLineMirrorLineInto(
      out,
      { origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 1, y: -2 });
    expect(out.direction).toEqual({ x: 1, y: -1 });
  });

  test('y축 mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 3, y: 4 }, direction: { x: 2, y: -1 } },
      { origin: { x: 0, y: 0 }, direction: { x: 0, y: 1 } }
    );
    expect(out.origin).toEqual({ x: -3, y: 4 });
    expect(out.direction).toEqual({ x: -2, y: -1 });
  });

  test('대각선 y=x mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 2, y: 5 }, direction: { x: 3, y: 1 } },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 1 } }
    );
    expect(out.origin).toEqual({ x: 5, y: 2 });
    expect(out.direction).toEqual({ x: 1, y: 3 });
  });

  test('degenerate mirror는 origin 점 반사 + direction 부호 반전', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 3, y: 4 }, direction: { x: 2, y: -1 } },
      { origin: { x: 1, y: 1 }, direction: { x: 0, y: 0 } }
    );
    expect(out.origin).toEqual({ x: -1, y: -2 });
    expect(out.direction).toEqual({ x: -2, y: 1 });
  });

  test('degenerate line은 반사 후에도 direction (0,0)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 1, y: 2 }, direction: { x: 0, y: 0 } },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(out.direction).toEqual({ x: 0, y: 0 });
    expect(out.origin).toEqual({ x: 1, y: -2 });
  });

  test('tuple infinite-line input을 읽는다', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      [
        [1, 2],
        [1, 1],
      ] as const,
      [
        [0, 0],
        [1, 0],
      ] as const
    );
    expect(out.origin).toEqual({ x: 1, y: -2 });
    expect(out.direction).toEqual({ x: 1, y: -1 });
  });

  test('out === line aliasing에서도 정확히 갱신한다', () => {
    const out: InfiniteLineWritable = { origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } };
    infiniteLineMirrorLineInto(out, out, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } });
    expect(out.origin).toEqual({ x: 1, y: -2 });
    expect(out.direction).toEqual({ x: 1, y: -1 });
  });

  test('out === mirror aliasing에서도 입력 mirror 좌표를 local read 후 갱신한다', () => {
    // mirror = x축, line origin (1,2) direction (1,1) → origin (1,-2), direction (1,-1)
    const out: InfiniteLineWritable = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    infiniteLineMirrorLineInto(out, { origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } }, out);
    expect(out.origin).toEqual({ x: 1, y: -2 });
    expect(out.direction).toEqual({ x: 1, y: -1 });
  });

  test('companion이 새 plain object를 반환하고 source를 mutate하지 않는다', () => {
    const line = { origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } };
    const mirror = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const result = infiniteLineMirrorLine(line, mirror);
    expect(result).toEqual({ origin: { x: 1, y: -2 }, direction: { x: 1, y: -1 } });
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } });
    expect(mirror).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } });
  });

  test('non-finite line.origin은 pass-through (origin.x = Infinity → 출력 2*fx-lox = Inf-Inf = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: Infinity, y: 2 }, direction: { x: 1, y: 1 } },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(Number.isFinite(out.origin.x)).toBe(false);
  });

  test('non-finite line.direction은 pass-through (direction.y = NaN → k = NaN → 출력 direction.x = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 1, y: 2 }, direction: { x: 1, y: NaN } },
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }
    );
    expect(Number.isFinite(out.direction.x)).toBe(false);
  });

  test('non-finite mirror.origin은 degenerate 점 반사에서 pass-through (origin.x = -Infinity → 출력 2*mox-lox = -Infinity)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 1, y: 2 }, direction: { x: 2, y: -1 } },
      { origin: { x: -Infinity, y: 0 }, direction: { x: 0, y: 0 } }
    );
    expect(Number.isFinite(out.origin.x)).toBe(false);
  });

  test('non-finite mirror.direction은 mLenSq를 오염시켜 pass-through (direction.x = Infinity → mLenSq = Inf → t = Inf/Inf = NaN → 출력 origin.x = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(
      out,
      { origin: { x: 1, y: 2 }, direction: { x: 1, y: 1 } },
      { origin: { x: 0, y: 0 }, direction: { x: Infinity, y: 0 } }
    );
    expect(Number.isFinite(out.origin.x)).toBe(false);
  });
});
