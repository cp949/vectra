/** 타원 Into 함수가 외부 출력 객체의 구체 타입과 참조를 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import {
  boundsInto,
  closestPointInto,
  copyInto,
  expandByInto,
  fociInto,
  fromBoundsInto,
  fromCircleInto,
  fromFociInto,
  fromRectInto,
  normalAtInto,
  pointAtAngleInto,
  pointAtTurnInto,
  pointsInto,
  projectPointInto,
} from '../../../src/ellipse';
import type { PointWritable } from '../../../src/types/flat-shapes.internal';

class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

class ExternalEllipse {
  cx = 0;
  cy = 0;
  rx = 0;
  ry = 0;
  label = 'ellipse';
}

class ExternalSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  label = 'segment';
}

const ellipse = { cx: 1, cy: 2, rx: 5, ry: 3 };

test('boundsInto는 외부 bounds 타입과 참조를 보존한다', () => {
  const out = new ExternalBounds();
  const result = boundsInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
  expect(result).toBe(out);
});

test('closestPointInto는 외부 점 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const result = closestPointInto(out, ellipse, { x: 10, y: 2 });
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
  expect(result).toBe(out);
});

test('copyInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = copyInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('expandByInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = expandByInto(out, ellipse, 1);
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('fociInto는 외부 선분 타입과 참조를 보존한다', () => {
  const out = new ExternalSegment();
  const result = fociInto(out, ellipse);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment>();
  expect(result).toBe(out);
});

test('fromBoundsInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = fromBoundsInto(out, { minX: -2, minY: -1, maxX: 2, maxY: 1 });
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('fromCircleInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = fromCircleInto(out, { cx: 1, cy: 2, r: 3 });
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('fromFociInto는 실패 반환과 외부 타원 타입을 보존한다', () => {
  const out = new ExternalEllipse();
  const result = fromFociInto(out, { x: -3, y: 0 }, { x: 3, y: 0 }, 10);
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse | false>();
  expect(result).toBe(out);
});

test('fromRectInto는 외부 타원 타입과 참조를 보존한다', () => {
  const out = new ExternalEllipse();
  const result = fromRectInto(out, { x: 0, y: 0, width: 4, height: 2 });
  expectTypeOf(result).toEqualTypeOf<ExternalEllipse>();
  expect(result).toBe(out);
});

test('각도, 회전 비율, 법선 및 투영 Into는 외부 점 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const angle = pointAtAngleInto(out, ellipse, 0);
  const turn = pointAtTurnInto(out, ellipse, 0.25);
  const normal = normalAtInto(out, ellipse, 0);
  const projected = projectPointInto(out, ellipse, { x: 10, y: 2 });
  expectTypeOf(angle).toEqualTypeOf<ExternalPoint>();
  expectTypeOf(turn).toEqualTypeOf<ExternalPoint>();
  expectTypeOf(normal).toEqualTypeOf<ExternalPoint>();
  expectTypeOf(projected).toEqualTypeOf<ExternalPoint>();
  for (const result of [angle, turn, normal, projected]) expect(result).toBe(out);
});

test('pointsInto는 배열 참조를 보존하고 원소 타입을 PointWritable로 고정한다', () => {
  const out: ExternalPoint[] = [];
  const result = pointsInto(out, ellipse, { segments: 4, startAngle: 0, clockwise: true });
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(result).toHaveLength(4);
  expect(result[0]).not.toBeInstanceOf(ExternalPoint);
});
