/** 사각형과 경계 상자의 변환 및 점 배열의 범위 계산을 시험한다. */

import { describe, expect, test } from 'vitest';
import { createBounds } from '../../../src/bounds/create-bounds';
import { fromPointsInto as boundsFromPointsInto } from '../../../src/bounds/from-points-into';
import { fromRectInto } from '../../../src/bounds/from-rect-into';
import { toRectInto } from '../../../src/bounds/to-rect-into';
import { fromBoundsInto } from '../../../src/rect/from-bounds-into';
import { fromPointsInto as rectFromPointsInto } from '../../../src/rect/from-points-into';
import { toBoundsInto } from '../../../src/rect/to-bounds-into';
import type { RectWritable } from '../../../src/types';

/** 변환 결과를 기록할 사각형 객체를 만든다. */
function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

describe('bounds.fromRectInto', () => {
  test('정상 rect를 bounds로 변환한다', () => {
    const out = createBounds();
    const result = fromRectInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(out).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 8 });
    expect(result).toBe(out);
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = createBounds();
    fromRectInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out).toEqual({ minX: 5, minY: 0, maxX: 2, maxY: 4 });
  });
});

describe('bounds.toRectInto', () => {
  test('정상 bounds를 rect로 변환한다', () => {
    const out = makeRect();
    const result = toRectInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 8 });
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
  });

  test('inverted bounds(empty)를 변환한다 - 음수 width/height rect(empty)가 된다', () => {
    const out = makeRect();
    toRectInto(out, { minX: 5, minY: 0, maxX: 2, maxY: 4 });
    expect(out).toEqual({ x: 5, y: 0, width: -3, height: 4 });
  });

  test('sentinel bounds를 변환한다 - Infinity 좌표 rect가 된다', () => {
    const out = makeRect();
    toRectInto(out, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(Infinity);
    expect(out.width).toBe(-Infinity);
    expect(out.height).toBe(-Infinity);
  });
});

describe('bounds.fromPointsInto', () => {
  test('빈 배열은 sentinel bounds를 기록한다', () => {
    const out = createBounds();
    const result = boundsFromPointsInto(out, []);
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    expect(result).toBe(out);
  });

  test('단일 점은 point bounds를 기록한다 (min === max)', () => {
    const out = createBounds();
    boundsFromPointsInto(out, [{ x: 3, y: 5 }]);
    expect(out).toEqual({ minX: 3, minY: 5, maxX: 3, maxY: 5 });
  });

  test('복수 object 점의 min/max extent를 기록한다', () => {
    const out = createBounds();
    boundsFromPointsInto(out, [
      { x: 3, y: 1 },
      { x: 1, y: 5 },
      { x: 6, y: 2 },
    ]);
    expect(out).toEqual({ minX: 1, minY: 1, maxX: 6, maxY: 5 });
  });

  test('같은 좌표의 두 점은 point bounds를 만든다', () => {
    const out = createBounds();
    boundsFromPointsInto(out, [
      { x: 4, y: 4 },
      { x: 4, y: 4 },
    ]);
    expect(out).toEqual({ minX: 4, minY: 4, maxX: 4, maxY: 4 });
  });
});

describe('rect.fromBoundsInto', () => {
  test('정상 bounds를 rect로 변환한다', () => {
    const out = makeRect();
    const result = fromBoundsInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 8 });
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
  });

  test('inverted bounds(empty)를 변환한다 - 음수 width/height rect(empty)가 된다', () => {
    const out = makeRect();
    fromBoundsInto(out, { minX: 5, minY: 5, maxX: 2, maxY: 2 });
    expect(out).toEqual({ x: 5, y: 5, width: -3, height: -3 });
  });

  test('sentinel bounds를 변환한다 - Infinity 좌표 rect가 된다', () => {
    const out = makeRect();
    fromBoundsInto(out, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(Infinity);
    expect(out.width).toBe(-Infinity);
    expect(out.height).toBe(-Infinity);
  });
});

describe('rect.toBoundsInto', () => {
  test('정상 rect를 bounds로 변환한다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const result = toBoundsInto(out, { x: 1, y: 2, width: 4, height: 6 });
    expect(out).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 8 });
    expect(result).toBe(out);
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    toBoundsInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out).toEqual({ minX: 5, minY: 0, maxX: 2, maxY: 4 });
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

  test('복수 object 점의 extent를 rect로 기록한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [
      { x: 3, y: 1 },
      { x: 1, y: 5 },
      { x: 6, y: 2 },
    ]);
    expect(out).toEqual({ x: 1, y: 1, width: 5, height: 4 });
  });

  test('x와 y의 최솟값이 서로 다른 점에 있어도 각 축을 계산한다', () => {
    const out = makeRect();
    rectFromPointsInto(out, [
      { x: 2, y: 8 },
      { x: 5, y: 3 },
    ]);
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
