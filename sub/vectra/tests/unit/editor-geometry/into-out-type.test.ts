/** 편집 도형 Into가 외부 출력 객체의 참조와 반환 타입을 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import {
  connectorLineInto,
  constrainDragInto,
  constrainDrawingBoundsInto,
  constrainResizeInto,
  pixelAlignInto,
  snapPointToGridInto,
} from '../../../src/editor-geometry';
import type { Bounds, Point } from '../../../src/types/flat-shapes.internal';

const point = { x: 1, y: 2 };
const bounds = { minX: 0, minY: 0, maxX: 4, maxY: 6 };

/** 드래그와 스냅 결과를 받을 외부 점 객체. */
class ExternalPoint {
  x = 0;
  y = 0;
  tag = 'point';
}

/** 사각형을 그릴 때 경계를 기록할 외부 객체. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'bounds';
}

/** 연결선을 기록할 외부 선분 객체. */
class ExternalSegment {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  tag = 'segment';
}

/** 크기 제약 결과를 기록할 외부 객체. */
class ExternalSize {
  width = 0;
  height = 0;
  tag = 'size';
}

test('connectorLineInto는 경계를 읽고 외부 선분 타입을 보존한다', () => {
  expectTypeOf(connectorLineInto).parameter(1).toEqualTypeOf<Bounds>();
  const out = new ExternalSegment();
  const result = connectorLineInto(out, bounds, bounds);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalSegment>();
});

test('constrainDragInto는 외부 점 타입을 보존한다', () => {
  expectTypeOf(constrainDragInto).parameter(1).toEqualTypeOf<Point>();
  const out = new ExternalPoint();
  const result = constrainDragInto(out, point, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('constrainDrawingBoundsInto는 외부 경계 타입을 보존한다', () => {
  const out = new ExternalBounds();
  const result = constrainDrawingBoundsInto(out, point, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('constrainResizeInto는 외부 크기 타입을 보존한다', () => {
  const out = new ExternalSize();
  const result = constrainResizeInto(out, { width: 1, height: 1 }, { width: 2, height: 2 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalSize>();
});

test('pixelAlignInto는 외부 점 타입을 보존한다', () => {
  const out = new ExternalPoint();
  const result = pixelAlignInto(out, point);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});

test('snapPointToGridInto는 축별 간격을 받고 외부 점 타입을 보존한다', () => {
  expectTypeOf(snapPointToGridInto).parameter(2).toEqualTypeOf<Point>();
  const out = new ExternalPoint();
  const result = snapPointToGridInto(out, point, { x: 2, y: 3 });
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalPoint>();
});
