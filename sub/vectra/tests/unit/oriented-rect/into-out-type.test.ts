/** 회전 사각형 Into 함수의 외부 출력 타입과 꼭짓점 배열 계약을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto, cornersInto, fromRectInto } from '../../../src/oriented-rect';
import type { PointWritable } from '../../../src/types/flat-shapes.internal';

/** 사용자 코드의 경계 상자 출력 클래스다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

/** 사용자 코드의 회전 사각형 출력 클래스다. */
class ExternalRect {
  cx = 0;
  cy = 0;
  width = 0;
  height = 0;
  angle = 0;
  label = 'rect';
}

/** 꼭짓점 배열의 좁은 원소 타입을 검사할 점 클래스다. */
class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

test('fromRectInto와 boundsInto는 외부 출력 타입과 참조를 보존한다', () => {
  const rect = new ExternalRect();
  const bounds = new ExternalBounds();
  const rectResult = fromRectInto(rect, { x: 0, y: 0, width: 4, height: 2 }, 0);
  const boundsResult = boundsInto(bounds, rect);
  expectTypeOf(rectResult).toEqualTypeOf<ExternalRect>();
  expectTypeOf(boundsResult).toEqualTypeOf<ExternalBounds>();
  expect(rectResult).toBe(rect);
  expect(boundsResult).toBe(bounds);
});

test('cornersInto는 배열 참조를 보존하고 원소 타입을 PointWritable로 고정한다', () => {
  const out: ExternalPoint[] = [];
  const result = cornersInto(out, { cx: 0, cy: 0, width: 4, height: 2, angle: 0 });
  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(result).toHaveLength(4);
  expect(result[0]).not.toBeInstanceOf(ExternalPoint);
});
