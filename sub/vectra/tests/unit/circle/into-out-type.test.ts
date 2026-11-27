/** 원 API의 평평한 입력과 Into 출력 타입 보존을 검증한다. */

import { expect, expectTypeOf, test } from 'vitest';
import {
  area,
  boundsInto,
  closestPointInto,
  copyInto,
  expandByInto,
  externalTangentsInto,
  fromBoundsInto,
  fromThreePointsInto,
  internalTangentsInto,
  pointAtAngleInto,
  pointAtTurnInto,
  scaleInto,
  translateInto,
  shrinkByInto,
  tangentPointsFromExternalInto,
} from '../../../src/circle';
import type { Circle, Point, PointWritable, SegmentWritable } from '../../../src/types/flat-shapes.internal';

/** 도형 함수 외부에서 정의한 원 출력의 예시다. */
class ExternalCircle {
  cx = 0;
  cy = 0;
  r = 0;
  readonly label = 'circle';
}

/** 도형 함수 외부에서 정의한 점 출력의 예시다. */
class ExternalPoint {
  x = 0;
  y = 0;

  /** 점을 x축으로 옮기고 같은 참조를 반환한다. */
  translateX(dx: number): this {
    this.x += dx;
    return this;
  }
}

/** 도형 함수 외부에서 정의한 경계 상자 출력의 예시다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  readonly label = 'bounds';
}

/** 도형 함수 외부에서 정의한 선분 출력의 예시다. */
class ExternalSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  readonly label = 'segment';
}

const circle = { cx: 2, cy: 3, r: 4 };

test('area는 평평한 원을 받는다', () => {
  expectTypeOf(area).parameter(0).toEqualTypeOf<Circle>();
});

test('boundsInto는 외부 경계 상자의 참조와 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, circle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('closestPointInto는 외부 점의 참조와 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointInto(out, circle, { x: 10, y: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  const translated = result.translateX(1);
  expect(translated).toBe(out);
  expectTypeOf(translated).toEqualTypeOf<ExternalPoint>();
});

test('copyInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = copyInto(out, circle);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('expandByInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = expandByInto(out, circle, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('fromBoundsInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = fromBoundsInto(out, { minX: 0, minY: 0, maxX: 8, maxY: 6 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('shrinkByInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = shrinkByInto(out, circle, 1);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('fromThreePointsInto는 평평한 점을 받는다', () => {
  expectTypeOf(fromThreePointsInto).parameter(1).toEqualTypeOf<Point>();
});

test('fromThreePointsInto는 성공 시 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = fromThreePointsInto(out, { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle | false>();
});

test('pointAtAngleInto는 외부 점의 참조와 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = pointAtAngleInto(out, circle, 0);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('pointAtTurnInto는 외부 점의 참조와 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = pointAtTurnInto(out, circle, 0.25);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('scaleInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = scaleInto(out, circle, 2);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('translateInto는 외부 원의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = translateInto(out, circle, { x: 1, y: 2 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});

test('접선 Into는 새 선분을 추가하므로 원소 타입을 SegmentWritable로 고정한다', () => {
  const a = { cx: 0, cy: 0, r: 1 };
  const b = { cx: 5, cy: 0, r: 1 };
  const externalOut: ExternalSegment[] = [];
  const internalOut: ExternalSegment[] = [];
  const external = externalTangentsInto(externalOut, a, b);
  const internal = internalTangentsInto(internalOut, a, b);

  expectTypeOf(external).toEqualTypeOf<SegmentWritable[]>();
  expectTypeOf(internal).toEqualTypeOf<SegmentWritable[]>();
  expect(external).toBe(externalOut);
  expect(internal).toBe(internalOut);
  expect(external).toHaveLength(2);
  expect(internal).toHaveLength(2);
  expect(external[0]).not.toBeInstanceOf(ExternalSegment);
  expect(internal[0]).not.toBeInstanceOf(ExternalSegment);
});

test('tangentPointsFromExternalInto는 새 점을 추가하므로 원소 타입을 PointWritable로 고정한다', () => {
  const out: ExternalPoint[] = [];
  const result = tangentPointsFromExternalInto(out, circle, { x: 20, y: 3 });

  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(result).toHaveLength(2);
  expect(result[0]).not.toBeInstanceOf(ExternalPoint);
});
