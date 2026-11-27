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
import { sideAt } from '../../../src/triangle/side-at';
import { copyInto } from '../../../src/triangle/copy-into';
import { buildEquilateralInto } from '../../../src/triangle/build-equilateral-into';
import { buildRightInto } from '../../../src/triangle/build-right-into';
import { fromCenterInto } from '../../../src/triangle/from-center-into';
import { fromCircleInto } from '../../../src/triangle/from-circle-into';
import { fromRectInto } from '../../../src/triangle/from-rect-into';
import { fromSegmentApexInto } from '../../../src/triangle/from-segment-apex-into';
import { fromSegmentHeightInto } from '../../../src/triangle/from-segment-height-into';
import { circumcircle } from '../../../src/triangle/circumcircle';
import { altitudeInto } from '../../../src/triangle/altitude-into';
import { eulerLineInto } from '../../../src/triangle/euler-line-into';
import { circumcenterInto } from '../../../src/triangle/circumcenter-into';
import { incenterInto } from '../../../src/triangle/incenter-into';
import { orthocenterInto } from '../../../src/triangle/orthocenter-into';
import { circumcircleInto } from '../../../src/triangle/circumcircle-into';
import { incircleInto } from '../../../src/triangle/incircle-into';
import { ninePointCircleInto } from '../../../src/triangle/nine-point-circle-into';
import { excentersInto } from '../../../src/triangle/excenters-into';
import { excirclesInto } from '../../../src/triangle/excircles-into';
import { medialTriangleInto } from '../../../src/triangle/medial-triangle-into';
import { medianInto } from '../../../src/triangle/median-into';
import { mediansInto } from '../../../src/triangle/medians-into';
import { interiorAnglesInto } from '../../../src/triangle/interior-angles-into';
import type {
  SegmentWritable,
  Triangle,
  TriangleWritable,
  PointWritable,
  CircleWritable,
} from '../../../src/types/flat-shapes.internal';

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

test('centroidInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = centroidInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('boundsInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('closestPointInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('closestPointOnEdgeInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointOnEdgeInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('barycentricInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalBarycentric();
  const result = barycentricInto(out, triangle, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBarycentric | false>();
});

test('pointFromBarycentricInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
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

test('copyInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = copyInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('buildEquilateralInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = buildEquilateralInto(out, point, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('buildRightInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = buildRightInto(out, point, 2, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromCenterInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromCenterInto(out, point, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromCircleInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromCircleInto(out, { cx: 0, cy: 0, r: 1 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromRectInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromRectInto(out, { x: 0, y: 0, width: 2, height: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromSegmentApexInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromSegmentApexInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('fromSegmentHeightInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = fromSegmentHeightInto(out, { x1: 0, y1: 0, x2: 4, y2: 0 }, 3);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle | false>();
});

test('외접원은 평평한 원을 반환한다', () => {
  expectTypeOf(circumcircle).returns.toEqualTypeOf<CircleWritable | undefined>();
});

/** 호출자가 정의한 출력 클래스. */
class ExternalSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  tag = 'keep';
}

/** 호출자가 정의한 출력 클래스. */
class ExternalCircle {
  cx = 0;
  cy = 0;
  r = 0;
  tag = 'keep';
}

test('altitudeInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalSegment();
  const result = altitudeInto(out, triangle, 0);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment | false>();
});

test('eulerLineInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalSegment();
  const result = eulerLineInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment | false>();
});

test('circumcenterInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = circumcenterInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint | false>();
});

test('incenterInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = incenterInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint | false>();
});

test('orthocenterInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = orthocenterInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint | false>();
});

test('circumcircleInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = circumcircleInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle | false>();
});

test('incircleInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = incircleInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle | false>();
});

test('ninePointCircleInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = ninePointCircleInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle | false>();
});

test('excentersInto는 같은 출력 배열을 반환한다', () => {
  const out: PointWritable[] = [];
  const result = excentersInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
});

test('excirclesInto는 같은 출력 배열을 반환한다', () => {
  const out: CircleWritable[] = [];
  const result = excirclesInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<CircleWritable[]>();
});

test('맞은편 변은 평평한 선분을 반환한다', () => {
  expectTypeOf(sideAt).returns.toEqualTypeOf<SegmentWritable | undefined>();
});

/** 호출자가 정의한 출력 클래스. */
class ExternalMedians {
  a = new ExternalSegment();
  b = new ExternalSegment();
  c = new ExternalSegment();
  tag = 'keep';
}

test('medialTriangleInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalTriangle();
  const result = medialTriangleInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalTriangle>();
});

test('medianInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalSegment();
  const result = medianInto(out, triangle, 'a');
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment | false>();
});

test('mediansInto는 외부 클래스의 참조와 반환 타입을 보존한다', () => {
  const out = new ExternalMedians();
  const result = mediansInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalMedians>();
});

test('interiorAnglesInto는 같은 출력 배열을 반환한다', () => {
  const out: number[] = [];
  const result = interiorAnglesInto(out, triangle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<number[]>();
});
