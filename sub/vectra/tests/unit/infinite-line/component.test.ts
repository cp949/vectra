/**
 * infinite-line component accessor 단위 테스트.
 *
 * origin(Into), direction(Into), pointAtT(Into)의 component 추출과 parametric
 * 평가 정책과 degenerate 입력 거동을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { direction } from '../../../src/infinite-line/direction';
import { directionInto } from '../../../src/infinite-line/direction-into';
import { infiniteLineMirrorLine } from '../../../src/infinite-line/infinite-line-mirror-line';
import { infiniteLineMirrorLineInto } from '../../../src/infinite-line/infinite-line-mirror-line-into';
import { origin } from '../../../src/infinite-line/origin';
import { originInto } from '../../../src/infinite-line/origin-into';
import { pointAtT } from '../../../src/infinite-line/point-at-t';
import { pointAtTInto } from '../../../src/infinite-line/point-at-t-into';
import type { InfiniteLineWritable, PointWritable } from '../../../src/types/flat-shapes.internal';

describe('infinite-line component - origin / originInto', () => {
  test('originInto가 out에 origin을 기록하고 out을 반환한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    const result = originInto(out, { ox: 7, oy: 8, dx: 1, dy: 0 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('origin companion이 새 plain object를 반환한다', () => {
    const point = origin({ ox: 7, oy: 8, dx: 1, dy: 0 });
    expect(point).toEqual({ x: 7, y: 8 });
  });
});

describe('infinite-line component - direction / directionInto', () => {
  test('directionInto가 out에 direction을 기록하고 out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = directionInto(out, { ox: 0, oy: 0, dx: 3, dy: 4 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('direction companion이 새 plain object를 반환한다', () => {
    const d = direction({ ox: 0, oy: 0, dx: 3, dy: 4 });
    expect(d).toEqual({ x: 3, y: 4 });
  });
});

describe('infinite-line component - pointAtT / pointAtTInto', () => {
  test('pointAtTInto는 origin + direction * t를 기록한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    const result = pointAtTInto(out, { ox: 1, oy: 2, dx: 3, dy: 4 }, 2);
    expect(result).toBe(out);
    expect(out).toEqual({ x: 7, y: 10 });
  });

  test('pointAtTInto는 음수 t에서도 clamp하지 않는다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    pointAtTInto(out, { ox: 0, oy: 0, dx: 2, dy: 0 }, -1);
    expect(out).toEqual({ x: -2, y: 0 });
  });

  test('pointAtTInto는 1 초과 t에서도 clamp하지 않는다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    pointAtTInto(out, { ox: 0, oy: 0, dx: 2, dy: 0 }, 5);
    expect(out).toEqual({ x: 10, y: 0 });
  });

  test('non-normalized direction에서도 parametric t를 그대로 적용한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    // direction = (10, 0)인 경우 t=0.5는 (5, 0)
    pointAtTInto(out, { ox: 0, oy: 0, dx: 10, dy: 0 }, 0.5);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('degenerate infinite-line의 pointAtTInto는 t에 무관하게 origin을 기록한다', () => {
    const out: PointWritable = { x: 99, y: 99 };
    pointAtTInto(out, { ox: 3, oy: 4, dx: 0, dy: 0 }, 100);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('pointAtT companion이 새 plain object를 반환한다', () => {
    const p = pointAtT({ ox: 1, oy: 2, dx: 3, dy: 4 }, 2);
    expect(p).toEqual({ x: 7, y: 10 });
  });
});

describe('infinite-line mirror - infiniteLineMirrorLineInto / infiniteLineMirrorLine', () => {
  /** 반사 결과를 기록할 무한 직선을 초기화한다. */
  function makeLine(): InfiniteLineWritable {
    return { ox: 0, oy: 0, dx: 0, dy: 0 };
  }

  test('x축 mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    const result = infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 1, dy: 1 }, { ox: 0, oy: 0, dx: 1, dy: 0 });
    expect(result).toBe(out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(-2);
    expect(out.dx).toBe(1);
    expect(out.dy).toBe(-1);
  });

  test('y축 mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 3, oy: 4, dx: 2, dy: -1 }, { ox: 0, oy: 0, dx: 0, dy: 1 });
    expect(out.ox).toBe(-3);
    expect(out.oy).toBe(4);
    expect(out.dx).toBe(-2);
    expect(out.dy).toBe(-1);
  });

  test('대각선 y=x mirror가 origin과 direction을 반사한다', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 2, oy: 5, dx: 3, dy: 1 }, { ox: 0, oy: 0, dx: 1, dy: 1 });
    expect(out.ox).toBe(5);
    expect(out.oy).toBe(2);
    expect(out.dx).toBe(1);
    expect(out.dy).toBe(3);
  });

  test('degenerate mirror는 origin 점 반사 + direction 부호 반전', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 3, oy: 4, dx: 2, dy: -1 }, { ox: 1, oy: 1, dx: 0, dy: 0 });
    expect(out.ox).toBe(-1);
    expect(out.oy).toBe(-2);
    expect(out.dx).toBe(-2);
    expect(out.dy).toBe(1);
  });

  test('degenerate line은 반사 후에도 direction (0,0)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 0, dy: 0 }, { ox: 0, oy: 0, dx: 1, dy: 0 });
    expect(out.dx).toBe(0);
    expect(out.dy).toBe(0);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(-2);
  });

  test('out === line aliasing에서도 정확히 갱신한다', () => {
    const out: InfiniteLineWritable = { ox: 1, oy: 2, dx: 1, dy: 1 };
    infiniteLineMirrorLineInto(out, out, { ox: 0, oy: 0, dx: 1, dy: 0 });
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(-2);
    expect(out.dx).toBe(1);
    expect(out.dy).toBe(-1);
  });

  test('out === mirror aliasing에서도 입력 mirror 좌표를 local read 후 갱신한다', () => {
    // mirror = x축, line origin (1,2) direction (1,1) → origin (1,-2), direction (1,-1)
    const out: InfiniteLineWritable = { ox: 0, oy: 0, dx: 1, dy: 0 };
    infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 1, dy: 1 }, out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(-2);
    expect(out.dx).toBe(1);
    expect(out.dy).toBe(-1);
  });

  test('companion이 새 plain object를 반환하고 source를 mutate하지 않는다', () => {
    const line = { ox: 1, oy: 2, dx: 1, dy: 1 };
    const mirror = { ox: 0, oy: 0, dx: 1, dy: 0 };
    const result = infiniteLineMirrorLine(line, mirror);
    expect(result).toEqual({ ox: 1, oy: -2, dx: 1, dy: -1 });
    expect(line).toEqual({ ox: 1, oy: 2, dx: 1, dy: 1 });
    expect(mirror).toEqual({ ox: 0, oy: 0, dx: 1, dy: 0 });
  });

  test('non-finite line.origin은 pass-through (origin.x = Infinity → 출력 2*fx-lox = Inf-Inf = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: Infinity, oy: 2, dx: 1, dy: 1 }, { ox: 0, oy: 0, dx: 1, dy: 0 });
    expect(Number.isFinite(out.ox)).toBe(false);
  });

  test('non-finite line.direction은 pass-through (direction.y = NaN → k = NaN → 출력 direction.x = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 1, dy: NaN }, { ox: 0, oy: 0, dx: 1, dy: 0 });
    expect(Number.isFinite(out.dx)).toBe(false);
  });

  test('non-finite mirror.origin은 degenerate 점 반사에서 pass-through (origin.x = -Infinity → 출력 2*mox-lox = -Infinity)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 2, dy: -1 }, { ox: -Infinity, oy: 0, dx: 0, dy: 0 });
    expect(Number.isFinite(out.ox)).toBe(false);
  });

  test('non-finite mirror.direction은 mLenSq를 오염시켜 pass-through (direction.x = Infinity → mLenSq = Inf → t = Inf/Inf = NaN → 출력 origin.x = NaN)', () => {
    const out = makeLine();
    infiniteLineMirrorLineInto(out, { ox: 1, oy: 2, dx: 1, dy: 1 }, { ox: 0, oy: 0, dx: Infinity, dy: 0 });
    expect(Number.isFinite(out.ox)).toBe(false);
  });
});
