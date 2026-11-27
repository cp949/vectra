/** 각 도형의 생성 함수와 반환 타입을 시험한다. */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { circleFrom } from '../../../src/circle/circle-from';
import { createCircle } from '../../../src/circle/create-circle';
import { createPolygon } from '../../../src/polygon/create-polygon';
import { polygonFrom } from '../../../src/polygon/polygon-from';
import { createPolyline } from '../../../src/polyline/create-polyline';
import { polylineFrom } from '../../../src/polyline/polyline-from';
import { createRect } from '../../../src/rect/create-rect';
import { rectFrom } from '../../../src/rect/rect-from';
import type { CircleWritable, PolylineWritable, RectWritable } from '../../../src/types/flat-shapes.internal';

describe('shape create/xFrom factories', () => {
  test('createRect는 기본 사각형을 만들고 rectFrom은 새 객체에 필드를 복사한다', () => {
    const source = { x: 1, y: 2, width: 3, height: 4 };
    const result = rectFrom(source);
    expectTypeOf(createRect()).toEqualTypeOf<RectWritable>();
    expectTypeOf(result).toEqualTypeOf<RectWritable>();
    expect(createRect()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  test('createCircle은 빈 원을 만들고 circleFrom은 새 객체에 필드를 복사한다', () => {
    const source = { cx: 1, cy: 2, r: 3 };
    const result = circleFrom(source);
    expectTypeOf(createCircle()).toEqualTypeOf<CircleWritable>();
    expectTypeOf(result).toEqualTypeOf<CircleWritable>();
    expect(createCircle()).toEqual({ cx: 0, cy: 0, r: 0 });
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  // points factory 정책: 기본은 points 배열과 leaf 모두 deep clone 하여 source 변형이 전파되지 않는다.
  test('polylineFrom은 기본적으로 points 배열과 leaf를 복사한다', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const result = polylineFrom(points);
    expectTypeOf(result).toEqualTypeOf<PolylineWritable>();
    expect(result).toEqual(points);
    expect(result).not.toBe(points);
    expect(result[0]).not.toBe(points[0]);
  });

  test('polylineFrom은 clonePoints가 false이면 입력 배열을 공유한다', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const result = polylineFrom(points, { clonePoints: false });
    expect(result).toBe(points);
  });

  test('createPolygon은 빈 배열을 만들고 polygonFrom은 좌표를 복사한다', () => {
    expect(createPolygon()).toEqual([]);

    const points = [1, 2, 3, 4] as const;
    const result = polygonFrom(points);
    expect(result).toEqual(points);
    expect(result).not.toBe(points);
  });

  test('polygonFrom은 clonePoints가 false이면 입력 배열을 공유한다', () => {
    const points = [1, 2, 3, 4];
    expect(polygonFrom(points, { clonePoints: false })).toBe(points);
  });

  test('createPolyline()는 빈 list seed를 만든다', () => {
    const first = createPolyline();
    const second = createPolyline();
    expect(first).toEqual([]);
    expect(first).not.toBe(second);
  });
});
