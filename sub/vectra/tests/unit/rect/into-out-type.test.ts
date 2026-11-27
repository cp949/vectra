/** 사각형 Into 함수의 입력 타입과 출력 참조 보존을 시험한다. */

import { expect, expectTypeOf, test } from 'vitest';
import { bottomLeftInto } from '../../../src/rect/bottom-left-into';
import { bottomRightInto } from '../../../src/rect/bottom-right-into';
import { centerInto } from '../../../src/rect/center-into';
import { clampPointInto } from '../../../src/rect/clamp-point-into';
import { copyInto } from '../../../src/rect/copy-into';
import { cornersInto } from '../../../src/rect/corners-into';
import { denormalizePointInto } from '../../../src/rect/denormalize-point-into';
import { expandToIncludePointInto } from '../../../src/rect/expand-to-include-point-into';
import { expandToIncludeRectInto } from '../../../src/rect/expand-to-include-rect-into';
import { fitInsideInto } from '../../../src/rect/fit-inside-into';
import { fitOutsideInto } from '../../../src/rect/fit-outside-into';
import { fromBoundsInto } from '../../../src/rect/from-bounds-into';
import { fromCenterInto } from '../../../src/rect/from-center-into';
import { fromPointsInto } from '../../../src/rect/from-points-into';
import { halvesInto } from '../../../src/rect/halves-into';
import { inflateInto } from '../../../src/rect/inflate-into';
import { normalizePointInto } from '../../../src/rect/normalize-point-into';
import { perimeterPointInto } from '../../../src/rect/perimeter-point-into';
import { perimeterPointsInto } from '../../../src/rect/perimeter-points-into';
import type { PointWritable, Rect } from '../../../src/types/flat-shapes.internal';

/** 점 좌표에 호출자 상태를 덧붙인 출력 객체다. */
class OutputPoint {
  x = 0;
  y = 0;
  label = 'point';
}

/** 사각형 필드에 호출자 상태를 덧붙인 출력 객체다. */
class OutputRect {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  label = 'rect';
}

/** 점 배열을 재사용하면서 호출자 상태를 보관한다. */
class PointBuffer extends Array<PointWritable> {
  label = 'points';
}

const rect = { x: 0, y: 0, width: 8, height: 6 };
const point = { x: 0.5, y: 0.5 };

test('bottomLeftInto는 사각형 객체를 받는다', () => {
  expectTypeOf(bottomLeftInto).parameter(1).toEqualTypeOf<Rect>();
});

test('점 Into 함수는 출력 객체의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const bottomLeft = bottomLeftInto(out, rect);
  const bottomRight = bottomRightInto(out, rect);
  const center = centerInto(out, rect);
  const clamped = clampPointInto(out, rect, point);
  const denormalized = denormalizePointInto(out, rect, point);

  expectTypeOf(bottomLeft).toEqualTypeOf<OutputPoint>();
  expectTypeOf(bottomRight).toEqualTypeOf<OutputPoint>();
  expectTypeOf(center).toEqualTypeOf<OutputPoint>();
  expectTypeOf(clamped).toEqualTypeOf<OutputPoint>();
  expectTypeOf(denormalized).toEqualTypeOf<OutputPoint>();
  expect(bottomLeft).toBe(out);
  expect(bottomRight).toBe(out);
  expect(center).toBe(out);
  expect(clamped).toBe(out);
  expect(denormalized).toBe(out);
});

test('사각형 Into 함수는 출력 객체의 구체 타입과 참조를 보존한다', () => {
  const out = new OutputRect();
  const copied = copyInto(out, rect);
  const expandedByPoint = expandToIncludePointInto(out, rect, point);
  const expandedByRect = expandToIncludeRectInto(out, rect, rect);

  expectTypeOf(copied).toEqualTypeOf<OutputRect>();
  expectTypeOf(expandedByPoint).toEqualTypeOf<OutputRect>();
  expectTypeOf(expandedByRect).toEqualTypeOf<OutputRect>();
  expect(copied).toBe(out);
  expect(expandedByPoint).toBe(out);
  expect(expandedByRect).toBe(out);
});

test('cornersInto는 출력 배열의 구체 타입과 참조를 보존한다', () => {
  const out = new PointBuffer();
  const result = cornersInto(out, rect);

  expectTypeOf(result).toEqualTypeOf<PointBuffer>();
  expect(result).toBe(out);
});

test('fitInsideInto는 사각형 객체를 받는다', () => {
  expectTypeOf(fitInsideInto).parameter(1).toEqualTypeOf<Rect>();
});

/** 두 사각형과 호출자 상태를 담는 분할 출력 객체다. */
class HalvesOutput {
  first = new OutputRect();
  second = new OutputRect();
  label = 'halves';
}

test('맞춤, 변환, 팽창 Into 함수는 사각형 출력 타입과 참조를 보존한다', () => {
  const out = new OutputRect();
  const results = [
    fitInsideInto(out, rect, rect),
    fitOutsideInto(out, rect, rect),
    fromBoundsInto(out, { minX: 0, minY: 0, maxX: 8, maxY: 6 }),
    fromCenterInto(out, point, point),
    fromPointsInto(out, [point]),
    inflateInto(out, rect, 1),
  ];

  expectTypeOf(results).toEqualTypeOf<OutputRect[]>();
  for (const result of results) {
    expect(result).toBe(out);
  }
});

test('halvesInto는 분할 출력 객체의 타입과 참조를 보존한다', () => {
  const out = new HalvesOutput();
  const result = halvesInto(out, rect);

  expectTypeOf(result).toEqualTypeOf<HalvesOutput>();
  expect(result).toBe(out);
});

test('정규화와 둘레 점 Into 함수는 점 출력 타입과 참조를 보존한다', () => {
  const out = new OutputPoint();
  const normalized = normalizePointInto(out, rect, point);
  const sampled = perimeterPointInto(out, rect, 0.25);

  expectTypeOf(normalized).toEqualTypeOf<OutputPoint>();
  expectTypeOf(sampled).toEqualTypeOf<OutputPoint>();
  expect(normalized).toBe(out);
  expect(sampled).toBe(out);
});

test('perimeterPointsInto는 출력 배열의 타입과 참조를 보존한다', () => {
  const out = new PointBuffer();
  const result = perimeterPointsInto(out, rect, { count: 4 });

  expectTypeOf(result).toEqualTypeOf<PointBuffer>();
  expect(result).toBe(out);
});
