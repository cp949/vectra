/** 경계 상자 Into 함수의 입력 타입과 출력 참조 보존을 시험한다. */

import { expect, expectTypeOf, test } from 'vitest';
import { centerInto } from '../../../src/bounds/center-into';
import { copyInto } from '../../../src/bounds/copy-into';
import { cornersInto } from '../../../src/bounds/corners-into';
import { createBounds } from '../../../src/bounds/create-bounds';
import { emptyInto } from '../../../src/bounds/empty-into';
import { expandByInto } from '../../../src/bounds/expand-by-into';
import { expandBySidesInto } from '../../../src/bounds/expand-by-sides-into';
import { expandToIncludeBoundsInto } from '../../../src/bounds/expand-to-include-bounds-into';
import { expandToIncludePointInto } from '../../../src/bounds/expand-to-include-point-into';
import { fromCenterInto } from '../../../src/bounds/from-center-into';
import { fromPointsInto } from '../../../src/bounds/from-points-into';
import { fromRectInto } from '../../../src/bounds/from-rect-into';
import type { Bounds, BoundsPadding, BoundsWritable, PointWritable } from '../../../src/types/flat-shapes.internal';

test('centerInto는 평평한 경계 상자를 받는다', () => {
  expectTypeOf(centerInto).parameter(1).toEqualTypeOf<Bounds>();
});

test('expandBySidesInto는 네 방향 필드가 모두 필수인 padding을 받는다', () => {
  expectTypeOf(expandBySidesInto).parameter(2).toEqualTypeOf<BoundsPadding>();
  expectTypeOf<BoundsPadding>().toEqualTypeOf<{
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  }>();
});

/** 네 경계 좌표와 호출자 상태를 담는 출력 객체다. */
class OutputBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

/** 점 좌표와 호출자 상태를 담는 출력 객체다. */
class OutputPoint {
  x = 0;
  y = 0;
  label = 'point';
}

const bounds = { minX: 0, minY: 0, maxX: 4, maxY: 6 };
const point = { x: 1, y: 2 };

test('createBounds는 네 좌표가 0인 경계 상자를 만든다', () => {
  const result = createBounds();

  expectTypeOf(result).toEqualTypeOf<BoundsWritable>();
  expect(result).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
});

test('centerInto는 점 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const result = centerInto(out, bounds);

  expectTypeOf(result).toEqualTypeOf<OutputPoint>();
  expect(result).toBe(out);
});

test('cornersInto는 새 점을 추가하므로 원소 타입을 PointWritable로 고정한다', () => {
  const out: OutputPoint[] = [];
  const result = cornersInto(out, bounds);

  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(result).toHaveLength(4);
  expect(result[0]).not.toBeInstanceOf(OutputPoint);
});

test('복사와 초기화, 확장 Into 함수는 경계 상자 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputBounds();
  const results = [
    copyInto(out, bounds),
    emptyInto(out),
    expandByInto(out, bounds, 1),
    expandBySidesInto(out, bounds, { top: 0, right: 0, bottom: 0, left: 1 }),
    expandToIncludeBoundsInto(out, bounds, bounds),
    expandToIncludePointInto(out, bounds, point),
  ];

  expectTypeOf(results).toEqualTypeOf<OutputBounds[]>();
  for (const result of results) {
    expect(result).toBe(out);
  }
});

test('변환 Into 함수는 경계 상자 출력의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputBounds();
  const results = [
    fromCenterInto(out, point, point),
    fromPointsInto(out, [point]),
    fromRectInto(out, { x: 0, y: 0, width: 4, height: 6 }),
  ];

  expectTypeOf(results).toEqualTypeOf<OutputBounds[]>();
  for (const result of results) {
    expect(result).toBe(out);
  }
});
