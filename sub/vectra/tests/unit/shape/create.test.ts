import { describe, expect, expectTypeOf, test } from 'vitest';
import { boundsFrom } from '../../../src/bounds/bounds-from';
import { createCircle } from '../../../src/circle/create-circle';
import { createPolygon } from '../../../src/polygon/create-polygon';
import { polygonFrom } from '../../../src/polygon/polygon-from';
import { createPolyline } from '../../../src/polyline/create-polyline';
import { polylineFrom } from '../../../src/polyline/polyline-from';
import { createRect } from '../../../src/rect/create-rect';
import { rectFrom } from '../../../src/rect/rect-from';
import type { RectWritable } from '../../../src/types';

describe('shape create/xFrom factories', () => {
  // 대표 factory: seed 형태 + source/component 복사 + writable 반환 타입을 한 번만 고정한다.
  test('createRect()는 zero seed를 만들고 rectFrom은 source/component를 복사한다', () => {
    expectTypeOf(createRect()).toEqualTypeOf<RectWritable>();
    expectTypeOf(rectFrom(1, 2, 3, 4)).toEqualTypeOf<RectWritable>();
    expect(createRect()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(rectFrom(1, 2, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    expect(rectFrom([5, 6, 7, 8])).toEqual({ x: 5, y: 6, width: 7, height: 8 });
  });

  // 대표 factory: nested source의 leaf 컴포넌트가 복사되어 source 참조와 분리되는지 확인한다.
  test('boundsFrom은 nested source min/max를 새 객체로 복사한다', () => {
    const src = { min: [3, 4] as const, max: [7, 8] as const };
    expect(boundsFrom(src)).toEqual({ min: { x: 3, y: 4 }, max: { x: 7, y: 8 } });
    expect(boundsFrom(src).min).not.toBe(src.min);
  });

  test('createCircle()는 zero seed를 만들고 circleFrom은 source/component를 복사한다', () => {
    expect(createCircle()).toEqual({ center: { x: 0, y: 0 }, radius: 0 });
  });

  // points factory 정책: 기본은 points 배열과 leaf 모두 deep clone 하여 source 변형이 전파되지 않는다.
  test('polylineFrom은 기본적으로 points 배열과 leaf를 복사한다', () => {
    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polylineFrom(points);
    expect(result).toEqual({
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    });
    expect(result.points).not.toBe(points);
    expect(result.points[0]).not.toBe(points[0]);
  });

  // points factory 정책: clonePoints false이면 해석된 points 배열을 그대로 공유한다.
  test('polylineFrom은 clonePoints false이면 해석된 points 배열을 공유한다', () => {
    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const source = { points };
    const result = polylineFrom(source, { clonePoints: false });
    expect(result).toEqual({ points });
    expect(result.points).toBe(points);
  });

  test('createPolygon()는 빈 list seed를 만들고 polygonFrom은 source를 복사한다', () => {
    expect(createPolygon()).toEqual({ points: [] });

    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polygonFrom({ points });
    expect(result).toEqual({
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    });
    expect(result.points).not.toBe(points);
  });

  test('polygonFrom은 clonePoints false이면 해석된 points 배열을 공유한다', () => {
    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polygonFrom(points, { clonePoints: false });
    expect(result).toEqual({ points });
    expect(result.points).toBe(points);
  });

  test('createPolyline()는 빈 list seed를 만든다', () => {
    expect(createPolyline()).toEqual({ points: [] });
  });
});
