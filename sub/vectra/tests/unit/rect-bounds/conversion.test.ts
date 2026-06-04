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

  test('tuple rect를 bounds로 변환한다', () => {
    const out = makeBounds();
    fromRectInto(out, [1, 2, 4, 6]);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
  });

  test('원점 rect를 변환한다', () => {
    const out = makeBounds();
    fromRectInto(out, { x: 0, y: 0, width: 10, height: 5 });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 10, y: 5 });
  });

  test('zero-width rect(line rect, empty)를 변환한다 - line bounds(비-empty)가 된다', () => {
    const out = makeBounds();
    fromRectInto(out, { x: 2, y: 3, width: 0, height: 5 });
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 2, y: 8 });
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = makeBounds();
    fromRectInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out.min).toEqual({ x: 5, y: 0 });
    expect(out.max).toEqual({ x: 2, y: 4 });
  });

  test('aliasing: out과 rect 참조가 달라도 안전하다', () => {
    const out = makeBounds();
    const rect = { x: 1, y: 2, width: 8, height: 6 };
    fromRectInto(out, rect);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 9, y: 8 });
    expect(rect).toEqual({ x: 1, y: 2, width: 8, height: 6 });
  });
});

describe('bounds.toRectInto', () => {
  test('정상 bounds를 rect로 변환한다', () => {
    const out = makeRect();
    const result = toRectInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } });
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
    expect(result).toBe(out);
  });

  test('tuple min/max bounds를 변환한다', () => {
    const out = makeRect();
    toRectInto(out, { min: [0, 0], max: [10, 5] });
    expect(out).toEqual({ x: 0, y: 0, width: 10, height: 5 });
  });

  test('object min, tuple max 혼합 bounds를 변환한다', () => {
    const out = makeRect();
    toRectInto(out, { min: { x: 2, y: 3 }, max: [8, 9] });
    expect(out).toEqual({ x: 2, y: 3, width: 6, height: 6 });
  });

  test('line bounds(비-empty)를 변환한다 - zero-width rect(empty)가 된다', () => {
    const out = makeRect();
    toRectInto(out, { min: { x: 2, y: 3 }, max: { x: 2, y: 8 } });
    expect(out).toEqual({ x: 2, y: 3, width: 0, height: 5 });
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

  test('aliasing: out과 bounds를 읽기 전에 쓰지 않는다', () => {
    const out = makeRect();
    const src = { min: { x: 3, y: 4 }, max: { x: 7, y: 9 } };
    toRectInto(out, src);
    expect(out).toEqual({ x: 3, y: 4, width: 4, height: 5 });
    expect(src.min).toEqual({ x: 3, y: 4 });
    expect(src.max).toEqual({ x: 7, y: 9 });
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

  test('tuple min/max bounds를 변환한다', () => {
    const out = makeRect();
    fromBoundsInto(out, { min: [0, 0], max: [10, 5] });
    expect(out).toEqual({ x: 0, y: 0, width: 10, height: 5 });
  });

  test('line bounds(비-empty)를 변환한다 - zero-width rect(empty)가 된다', () => {
    const out = makeRect();
    fromBoundsInto(out, { min: { x: 3, y: 0 }, max: { x: 3, y: 6 } });
    expect(out).toEqual({ x: 3, y: 0, width: 0, height: 6 });
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

  test('aliasing: source bounds를 mutate하지 않는다', () => {
    const out = makeRect();
    const src = { min: { x: 2, y: 3 }, max: { x: 8, y: 9 } };
    fromBoundsInto(out, src);
    expect(src.min).toEqual({ x: 2, y: 3 });
    expect(src.max).toEqual({ x: 8, y: 9 });
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

  test('tuple rect를 bounds로 변환한다', () => {
    const out = makeBounds();
    toBoundsInto(out, [1, 2, 4, 6]);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
  });

  test('원점 rect를 변환한다', () => {
    const out = makeBounds();
    toBoundsInto(out, { x: 0, y: 0, width: 10, height: 5 });
    expect(out.min).toEqual({ x: 0, y: 0 });
    expect(out.max).toEqual({ x: 10, y: 5 });
  });

  test('zero-width rect(empty)를 변환한다 - line bounds(비-empty)가 된다', () => {
    const out = makeBounds();
    toBoundsInto(out, { x: 2, y: 3, width: 0, height: 5 });
    expect(out.min).toEqual({ x: 2, y: 3 });
    expect(out.max).toEqual({ x: 2, y: 8 });
  });

  test('음수 width rect(empty)를 변환한다 - inverted bounds(empty)가 된다', () => {
    const out = makeBounds();
    toBoundsInto(out, { x: 5, y: 0, width: -3, height: 4 });
    expect(out.min).toEqual({ x: 5, y: 0 });
    expect(out.max).toEqual({ x: 2, y: 4 });
  });

  test('aliasing: out이 rect와 다른 객체라도 안전하다', () => {
    const out = makeBounds();
    const rect = { x: 3, y: 4, width: 6, height: 8 };
    toBoundsInto(out, rect);
    expect(out.min).toEqual({ x: 3, y: 4 });
    expect(out.max).toEqual({ x: 9, y: 12 });
    expect(rect).toEqual({ x: 3, y: 4, width: 6, height: 8 });
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

describe('라운드트립 검증', () => {
  test('bounds → toRectInto → toBoundsInto는 원래 bounds와 동일하다 (정상 case)', () => {
    const src = { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } };
    const rect = makeRect();
    toRectInto(rect, src);
    const out = makeBounds();
    toBoundsInto(out, rect);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 8 });
  });

  test('rect → toBoundsInto → fromBoundsInto는 원래 rect와 동일하다 (정상 case)', () => {
    const src = { x: 1, y: 2, width: 4, height: 6 };
    const bounds = makeBounds();
    toBoundsInto(bounds, src);
    const out = makeRect();
    fromBoundsInto(out, bounds);
    expect(out).toEqual({ x: 1, y: 2, width: 4, height: 6 });
  });

  test('bounds.fromRectInto와 rect.toBoundsInto는 동일한 결과를 생성한다', () => {
    const rect = { x: 2, y: 3, width: 8, height: 6 };
    const out1 = makeBounds();
    const out2 = makeBounds();
    fromRectInto(out1, rect);
    toBoundsInto(out2, rect);
    expect(out1.min).toEqual(out2.min);
    expect(out1.max).toEqual(out2.max);
  });

  test('bounds.toRectInto와 rect.fromBoundsInto는 동일한 결과를 생성한다', () => {
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } };
    const out1 = makeRect();
    const out2 = makeRect();
    toRectInto(out1, bounds);
    fromBoundsInto(out2, bounds);
    expect(out1).toEqual(out2);
  });
});
