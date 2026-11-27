/**
 * SVG 도형 변환의 점 목록 입력과 PathCommand 배열 출력 계약을 검증한다.
 */

import { expect, expectTypeOf, test } from 'vitest';
import { shapeToPathCommandsInto } from '../../../src/svg-path/shape-to-path-commands-into';
import type { Polygon, Polyline } from '../../../src/types/flat-shapes.internal';
import type { PathCommand, SvgPolygonShapeLike, SvgPolylineShapeLike } from '../../../src/types/index';

test('SVG 다각형은 교차 배치한 좌표를 받고 SVG 폴리라인은 점 객체를 받는다', () => {
  expectTypeOf<SvgPolygonShapeLike['points']>().toEqualTypeOf<Polygon>();
  expectTypeOf<SvgPolylineShapeLike['points']>().toEqualTypeOf<Polyline>();
});

test('shapeToPathCommandsInto는 PathCommand 배열 타입과 출력 참조를 유지한다', () => {
  const out: PathCommand[] = [];
  const result = shapeToPathCommandsInto(out, { kind: 'line', x1: 0, y1: 1, x2: 2, y2: 3 });

  expectTypeOf(result).toEqualTypeOf<PathCommand[]>();
  expect(result).toBe(out);
});
