/**
 * 평평한 triangle 입력 계약과 Into 출력 참조 및 반환 타입을 검증한다.
 */

import { expect, expectTypeOf, test } from 'vitest';
import { area } from '../../../src/triangle/area';
import { centroidInto } from '../../../src/triangle/centroid-into';
import { boundsInto } from '../../../src/triangle/bounds-into';
import { closestPointInto } from '../../../src/triangle/closest-point-into';
import { closestPointOnEdgeInto } from '../../../src/triangle/closest-point-on-edge-into';
import { barycentricInto } from '../../../src/triangle/barycentric-into';
import { pointFromBarycentricInto } from '../../../src/triangle/point-from-barycentric-into';
import { triangleFrom } from '../../../src/triangle/triangle-from';
import { copyInto } from '../../../src/triangle/copy-into';
import { buildEquilateralInto } from '../../../src/triangle/build-equilateral-into';
import { buildRightInto } from '../../../src/triangle/build-right-into';
import { fromCenterInto } from '../../../src/triangle/from-center-into';
import { fromCircleInto } from '../../../src/triangle/from-circle-into';
import { fromRectInto } from '../../../src/triangle/from-rect-into';
import { fromSegmentApexInto } from '../../../src/triangle/from-segment-apex-into';
import { fromSegmentHeightInto } from '../../../src/triangle/from-segment-height-into';
import type { Triangle, TriangleWritable } from '../../../src/types/flat-shapes.internal';

test('삼각형 면적과 무게중심은 평평한 꼭짓점 필드를 받는다', () => {
  expectTypeOf(area).parameter(0).toEqualTypeOf<Triangle>();
  expectTypeOf(centroidInto).parameter(1).toEqualTypeOf<Triangle>();
});

const triangle: Triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3 };
const point = { x: 1, y: 1 };

/** 호출자가 정의한 출력 클래스. */
class ExternalPoint {
  x = 0;
  y = 0;
  tag = 'keep';
}

/** 호출자가 정의한 출력 클래스. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'keep';
}

/** 호출자가 정의한 출력 클래스. */
class ExternalBarycentric {
  x = 0;
  y = 0;
  w = 0;
  tag = 'keep';
}

test('centroidInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = centroidInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('boundsInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('closestPointInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('closestPointOnEdgeInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointOnEdgeInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('barycentricInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBarycentric();
  const result = barycentricInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBarycentric | false>();
});

test('pointFromBarycentricInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = pointFromBarycentricInto(out, triangle, { x: 1, y: 0, w: 0 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('삼각형 복사는 평평한 꼭짓점 필드로 결과를 만든다', () => {
  expectTypeOf(triangleFrom).returns.toEqualTypeOf<TriangleWritable>();
});

/** 호출자가 정의한 출력 클래스. */
class ExternalTriangle {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  x3 = 0;
  y3 = 0;
  tag = 'keep';
}

test('copyInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = copyInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('buildEquilateralInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = buildEquilateralInto(out, point, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('buildRightInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = buildRightInto(out, point, 2, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromCenterInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromCenterInto(out, point, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromCircleInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromCircleInto(out, { cx: 0, cy: 0, r: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromRectInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromRectInto(out, { x: 0, y: 0, width: 2, height: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromSegmentApexInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromSegmentApexInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromSegmentHeightInto은 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromSegmentHeightInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle | false>();
});
