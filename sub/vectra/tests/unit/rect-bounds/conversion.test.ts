import { describe, expect, test } from 'vitest';
import { fromPointsInto as boundsFromPointsInto } from '../../../src/bounds/from-points-into';
import { fromRectInto } from '../../../src/bounds/from-rect-into';
import { toRectInto } from '../../../src/bounds/to-rect-into';
import { fromBoundsInto } from '../../../src/rect/from-bounds-into';
import { fromPointsInto as rectFromPointsInto } from '../../../src/rect/from-points-into';
import { toBoundsInto } from '../../../src/rect/to-bounds-into';
import type { BoundsWritable, RectWritable } from '../../../src/types';

function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

describe('bounds.fromRectInto', () => {
  test('정상 rect를 bounds로 변환한다', () => {
    const out = makeBounds();
    const result = fromRectInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
    expect(result).toBe(out);
  });

  // tuple/object 입력 처리 정책 대표: 전 방향 통틀어 이 한 곳에서만 검증
  test('tuple rect도 object rect와 동일하게 변환한다', () => {
    const out = makeBounds();
    fromRectInto(out, [1, 2, 4, 6]);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = makeBounds();
    fromRectInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out.min).toEqual({ x: 5, y: 0 });
    expect(out.max).toEqual({ x: 2, y: 4 });
  });
});

describe('bounds.toRectInto', () => {
  test('정상 bounds를 rect로 변환한다', () => {
    const out = makeRect();
    const result = toRectInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } });
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
  });

  test('inverted bounds(empty)를 변환한다 - 음수 width/height rect(empty)가 된다', () => {
    const out = makeRect();
    toRectInto(out, { min: { x: 5, y: 0 }, max: { x: 2, y: 4 } });
    expect(out).toEqual({ x: 5, y: 0, width: -3, height: 4 });
  });

  test('sentinel bounds를 변환한다 - Infinity 좌표 rect가 된다', () => {
    const out = makeRect();
    toRectInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(Infinity);
    expect(out.width).toBe(-Infinity);
    expect(out.height).toBe(-Infinity);
  });
});

describe('bounds.fromPointsInto', () => {
  test('빈 배열은 sentinel bounds를 기록한다', () => {
    const out = makeBounds();
    const result = boundsFromPointsInto(out, []);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
    expect(result).toBe(out);
  });

  test('단일 점은 point bounds를 기록한다 (min === max)', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [{ x: 3, y: 5 }]);
    expect(out.min).toEqual({ x: 3, y: 5 });
    expect(out.max).toEqual({ x: 3, y: 5 });
  });

  test('단일 tuple 점은 point bounds를 기록한다', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [[4, 7]]);
    expect(out.min).toEqual({ x: 4, y: 7 });
    expect(out.max).toEqual({ x: 4, y: 7 });
  });

  test('복수 object 점의 min/max extent를 기록한다', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [
      { x: 3, y: 1 },
      { x: 1, y: 5 },
      { x: 6, y: 2 },
    ]);
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 6, y: 5 });
  });

  test('복수 tuple 점의 min/max extent를 기록한다', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [
      [3, 1],
      [1, 5],
      [6, 2],
    ]);
    expect(out.min).toEqual({ x: 1, y: 1 });
    expect(out.max).toEqual({ x: 6, y: 5 });
  });

  test('object와 tuple 혼합 점 배열을 처리한다', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [{ x: 2, y: 8 }, [5, 3]]);
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 5, y: 8 });
  });

  test('같은 좌표의 두 점은 point bounds를 만든다', () => {
    const out = makeBounds();
    boundsFromPointsInto(out, [
      { x: 4, y: 4 },
      { x: 4, y: 4 },
    ]);
    expect(out.min).toEqual({ x: 4, y: 4 });
    expect(out.max).toEqual({ x: 4, y: 4 });
  });
});

describe('rect.fromBoundsInto', () => {
  test('정상 bounds를 rect로 변환한다', () => {
    const out = makeRect();
    const result = fromBoundsInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } });
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
  });

  test('inverted bounds(empty)를 변환한다 - 음수 width/height rect(empty)가 된다', () => {
    const out = makeRect();
    fromBoundsInto(out, { min: { x: 5, y: 5 }, max: { x: 2, y: 2 } });
    expect(out).toEqual({ x: 5, y: 5, width: -3, height: -3 });
  });

  test('sentinel bounds를 변환한다 - Infinity 좌표 rect가 된다', () => {
    const out = makeRect();
    fromBoundsInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(Infinity);
    expect(out.width).toBe(-Infinity);
    expect(out.height).toBe(-Infinity);
  });
});

describe('rect.toBoundsInto', () => {
  test('정상 rect를 bounds로 변환한다', () => {
    const out = makeBounds();
    const result = toBoundsInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
    expect(result).toBe(out);
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = makeBounds();
    toBoundsInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out.min).toEqual({ x: 5, y: 0 });
    expect(out.max).toEqual({ x: 2, y: 4 });
  });
});

describe('rect.fromPointsInto', () => {
  test('빈 배열은 (0, 0, 0, 0)을 기록한다', () => {
    const out = makeRect();
    const result = rectFromPointsInto(out, []);
    expect(out).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(result).toBe(out);
  });

  test('단일 점은 (p.x, p.y, 0, 0)을 기록한다 - degenerate empty rect', () => {
    const out = makeRect();
    rectFromPointsInto(out, [{ x: 3, y: 5 }]);
    expect(out).toEqual({ x: 3, y: 5, width: 0, height: 0 });
  });

  test('단일 tuple 점을 처리한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [[4, 7]]);
    expect(out).toEqual({ x: 4, y: 7, width: 0, height: 0 });
  });

  test('복수 object 점의 extent를 rect로 기록한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [
      { x: 3, y: 1 },
      { x: 1, y: 5 },
      { x: 6, y: 2 },
    ]);
    expect(out).toEqual({ x: 1, y: 1, width: 5, height: 4 });
  });

  test('복수 tuple 점의 extent를 rect로 기록한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [
      [3, 1],
      [1, 5],
      [6, 2],
    ]);
    expect(out).toEqual({ x: 1, y: 1, width: 5, height: 4 });
  });

  test('object와 tuple 혼합 점 배열을 처리한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [{ x: 2, y: 8 }, [5, 3]]);
    expect(out).toEqual({ x: 2, y: 3, width: 3, height: 5 });
  });

  test('같은 좌표의 두 점은 degenerate rect (0 크기)를 만든다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [
      { x: 4, y: 4 },
      { x: 4, y: 4 },
    ]);
    expect(out).toEqual({ x: 4, y: 4, width: 0, height: 0 });
  });
});
