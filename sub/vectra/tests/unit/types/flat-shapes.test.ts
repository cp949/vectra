/**
 * ADR 0010의 평평한 도형 입력과 쓰기 가능한 출력의 타입 계약을 확인한다.
 * 타입 검사는 tsc에서 수행한다.
 */
import { expectTypeOf, test } from 'vitest';
import type {
  Circle,
  CircleWritable,
  Curve,
  Point,
  PointWritable,
  Polygon,
  PolygonWritable,
  Polyline,
  PolylineWritable,
  Pose2,
} from '../../../src/types/flat-shapes.internal';

test('좌표와 도형 입력은 읽기 전용 필드를 사용한다', () => {
  expectTypeOf<Point>().toEqualTypeOf<{ readonly x: number; readonly y: number }>();
  expectTypeOf<Circle>().toEqualTypeOf<{ readonly cx: number; readonly cy: number; readonly r: number }>();
  expectTypeOf<Pose2>().not.toExtend<Point>();
  expectTypeOf<CircleWritable>().toEqualTypeOf<{ cx: number; cy: number; r: number }>();
});

test('다각형과 폴리라인은 서로 다른 점 목록을 사용한다', () => {
  expectTypeOf<Polygon>().toEqualTypeOf<readonly number[]>();
  expectTypeOf<Polyline>().toEqualTypeOf<readonly Point[]>();
  expectTypeOf<PolygonWritable>().toEqualTypeOf<number[]>();
  expectTypeOf<PolylineWritable>().toEqualTypeOf<PointWritable[]>();
});

test('삼차 곡선만 네 번째 제어점 좌표를 요구한다', () => {
  expectTypeOf<Extract<Curve, { kind: 'cubic' }>>().toHaveProperty('x3');
  expectTypeOf<Extract<Curve, { kind: 'quadratic' }>>().not.toHaveProperty('x3');
});
