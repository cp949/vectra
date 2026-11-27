/** 피팅 Into 함수가 출력 객체의 타입, 참조, 실패 반환값을 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { fitCircleToPointsInto } from '../../../src/fitting/fit-circle-to-points-into';
import { fitLineToPointsInto } from '../../../src/fitting/fit-line-to-points-into';
import { fitMinimumAreaRectInto } from '../../../src/fitting/fit-minimum-area-rect-into';
import { principalDirectionsInto } from '../../../src/fitting/principal-directions-into';

const points = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 1 },
];

test('원, 직선, 사각형, 주축 피팅은 전달된 인스턴스와 구체 타입을 보존한다', () => {
  class CircleOutput {
    cx = 0;
    cy = 0;
    r = 0;
    label = '원';
  }

  class LineOutput {
    ox = 0;
    oy = 0;
    dx = 0;
    dy = 0;
    label = '직선';
  }

  class RectOutput {
    cx = 0;
    cy = 0;
    width = 0;
    height = 0;
    angle = 0;
    label = '사각형';
  }

  class DirectionsOutput {
    primary = { x: 0, y: 0 };
    secondary = { x: 0, y: 0 };
    label = '주축';
  }

  const circle = new CircleOutput();
  const line = new LineOutput();
  const rect = new RectOutput();
  const directions = new DirectionsOutput();

  const circleResult = fitCircleToPointsInto(circle, points);
  const lineResult = fitLineToPointsInto(line, points);
  const rectResult = fitMinimumAreaRectInto(rect, points);
  const directionsResult = principalDirectionsInto(directions, points);

  expectTypeOf(circleResult).toEqualTypeOf<CircleOutput | false>();
  expectTypeOf(lineResult).toEqualTypeOf<LineOutput | false>();
  expectTypeOf(rectResult).toEqualTypeOf<RectOutput | false>();
  expectTypeOf(directionsResult).toEqualTypeOf<DirectionsOutput | false>();
  expect(circleResult).toBe(circle);
  expect(lineResult).toBe(line);
  expect(rectResult).toBe(rect);
  expect(directionsResult).toBe(directions);
});
