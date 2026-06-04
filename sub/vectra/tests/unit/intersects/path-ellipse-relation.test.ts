/**
 * path × ellipse approximate boolean relation 단위 테스트.
 *
 * 대상 함수:
 *  - intersectsPathEllipse
 *
 * empty path/empty ellipse, flattened edge two-point crossing, tangent boundary touch,
 * path vertex 내부 포함, closed path containment fallback, open path containment 제외,
 * tuple/object 입력 동등성, non-finite(NaN/±Infinity) 입력을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathEllipse } from '../../../src/intersects/intersects-path-ellipse';
import type { EllipseLike, PathCommand } from '../../../src/types';

// 중심 (0,0), rx=4, ry=2 ellipse (object 입력)
const ellipse: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 4, radiusY: 2 };
// 동일 ellipse tuple 입력
const ellipseTuple: EllipseLike = [{ x: 0, y: 0 }, 4, 2];

// ellipse를 가로지르는 수평 open path (-10,0)→(10,0)
const crossingPath: PathCommand[] = [
  { kind: 'move', x: -10, y: 0 },
  { kind: 'line', x: 10, y: 0 },
];

describe('intersectsPathEllipse', () => {
  describe('빈 입력', () => {
    test('empty path는 false를 반환한다', () => {
      expect(intersectsPathEllipse([], ellipse)).toBe(false);
    });

    test('empty ellipse (radiusX ≤ 0)는 false를 반환한다', () => {
      const empty: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 2 };
      expect(intersectsPathEllipse(crossingPath, empty)).toBe(false);
    });

    test('empty ellipse (radiusY ≤ 0)는 false를 반환한다', () => {
      const empty: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 4, radiusY: -1 };
      expect(intersectsPathEllipse(crossingPath, empty)).toBe(false);
    });
  });

  describe('교차 hit', () => {
    test('flattened edge가 ellipse를 두 점으로 통과하면 true를 반환한다', () => {
      expect(intersectsPathEllipse(crossingPath, ellipse)).toBe(true);
    });

    test('edge가 ellipse boundary에 접하면(tangent) true를 반환한다', () => {
      // y=2 수평 edge는 ellipse 위쪽 꼭짓점 (0,2)에 접한다
      const tangentPath: PathCommand[] = [
        { kind: 'move', x: -10, y: 2 },
        { kind: 'line', x: 10, y: 2 },
      ];
      expect(intersectsPathEllipse(tangentPath, ellipse)).toBe(true);
    });

    test('path vertex가 ellipse 내부에 있으면 true를 반환한다', () => {
      // 시작 vertex (0,0)이 ellipse 중심 — 내부
      const insidePath: PathCommand[] = [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 100, y: 100 },
      ];
      expect(intersectsPathEllipse(insidePath, ellipse)).toBe(true);
    });

    test('closed path가 ellipse를 감싸면 true를 반환한다', () => {
      // ellipse(rx=4,ry=2)를 둘러싸는 큰 정사각형 closed path. edge는 ellipse와 교차하지 않고
      // 모든 vertex가 외부지만 ellipse 중심이 polygon 내부 → containment fallback
      const surroundingClosed: PathCommand[] = [
        { kind: 'move', x: -10, y: -10 },
        { kind: 'line', x: 10, y: -10 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'line', x: -10, y: 10 },
        { kind: 'close' },
      ];
      expect(intersectsPathEllipse(surroundingClosed, ellipse)).toBe(true);
    });
  });

  describe('비교차', () => {
    test('open path가 ellipse를 감싸는 좌표여도 close가 없으면 false를 반환한다', () => {
      // 위 closed case와 같은 vertex지만 close command가 없어 containment fallback 제외
      const surroundingOpen: PathCommand[] = [
        { kind: 'move', x: -10, y: -10 },
        { kind: 'line', x: 10, y: -10 },
        { kind: 'line', x: 10, y: 10 },
        { kind: 'line', x: -10, y: 10 },
      ];
      expect(intersectsPathEllipse(surroundingOpen, ellipse)).toBe(false);
    });

    test('ellipse에서 완전히 떨어진 path는 false를 반환한다', () => {
      const farPath: PathCommand[] = [
        { kind: 'move', x: 100, y: 100 },
        { kind: 'line', x: 200, y: 100 },
      ];
      expect(intersectsPathEllipse(farPath, ellipse)).toBe(false);
    });
  });

  describe('입력 형태 동등성', () => {
    test('tuple ellipse와 object ellipse가 같은 결과를 낸다', () => {
      expect(intersectsPathEllipse(crossingPath, ellipseTuple)).toBe(intersectsPathEllipse(crossingPath, ellipse));
      expect(intersectsPathEllipse(crossingPath, ellipseTuple)).toBe(true);
    });
  });

  describe('non-finite 입력', () => {
    test('ellipse center가 NaN이면 false를 반환한다', () => {
      const nan: EllipseLike = { center: { x: Number.NaN, y: 0 }, radiusX: 4, radiusY: 2 };
      expect(intersectsPathEllipse(crossingPath, nan)).toBe(false);
    });

    test('ellipse radiusX가 +Infinity이면 false를 반환한다', () => {
      const inf: EllipseLike = { center: { x: 0, y: 0 }, radiusX: Number.POSITIVE_INFINITY, radiusY: 2 };
      expect(intersectsPathEllipse(crossingPath, inf)).toBe(false);
    });

    test('ellipse radiusY가 -Infinity이면 false를 반환한다', () => {
      const inf: EllipseLike = { center: { x: 0, y: 0 }, radiusX: 4, radiusY: Number.NEGATIVE_INFINITY };
      expect(intersectsPathEllipse(crossingPath, inf)).toBe(false);
    });
  });
});
