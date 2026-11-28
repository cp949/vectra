/**
 * handle geometry 단위 테스트.
 *
 * resizeHandlesInto / rotateHandlesInto / anchorPointInto / anchorPoint와
 * allocating companion(resizeHandles / rotateHandles)의
 * 좌표 정확성, ordering, out 초기화, 평평한 경계, degenerate 처리, plain object allocation을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { anchorPoint } from '../../../src/editor-geometry/anchor-point';
import { anchorPointInto } from '../../../src/editor-geometry/anchor-point-into';
import { resizeHandles } from '../../../src/editor-geometry/resize-handles';
import { resizeHandlesInto } from '../../../src/editor-geometry/resize-handles-into';
import { rotateHandles } from '../../../src/editor-geometry/rotate-handles';
import { rotateHandlesInto } from '../../../src/editor-geometry/rotate-handles-into';
import type { AnchorKind, HandlePoint } from '../../../src/editor-geometry/types';
import type { PointWritable } from '../../../src/types/flat-shapes.internal';

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 테스트용 PointWritable factory */
function makeXY(): PointWritable {
  return { x: 0, y: 0 };
}

/** HandlePoint 배열에서 id 목록만 추출 */
function ids(handles: HandlePoint[]): string[] {
  return handles.map((h) => h.id);
}

/** HandlePoint 배열에서 { id, x, y } snapshot 추출 */
function snapshot(handles: HandlePoint[]) {
  return handles.map((h) => ({ id: h.id, x: h.point.x, y: h.point.y }));
}

// ---------------------------------------------------------------------------
// resizeHandlesInto
// ---------------------------------------------------------------------------

describe('resizeHandlesInto', () => {
  describe('handle 수와 ordering', () => {
    test('항상 8개 handle을 기록한다', () => {
      const out: HandlePoint[] = [];
      const count = resizeHandlesInto(out, { minX: 0, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      expect(count).toBe(8);
      expect(out).toHaveLength(8);
    });

    test('ordering이 nw,n,ne,e,se,s,sw,w (clockwise from top-left)이다', () => {
      const out: HandlePoint[] = [];
      resizeHandlesInto(out, { minX: 0, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      expect(ids(out)).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']);
    });
  });

  describe('좌표 정확성', () => {
    test('object Bounds — 각 handle 좌표가 올바르다', () => {
      const out: HandlePoint[] = [];
      resizeHandlesInto(out, { minX: 10, minY: 20, maxX: 110, maxY: 80 }, makeXY);
      expect(snapshot(out)).toEqual([
        { id: 'nw', x: 10, y: 20 },
        { id: 'n', x: 60, y: 20 },
        { id: 'ne', x: 110, y: 20 },
        { id: 'e', x: 110, y: 50 },
        { id: 'se', x: 110, y: 80 },
        { id: 's', x: 60, y: 80 },
        { id: 'sw', x: 10, y: 80 },
        { id: 'w', x: 10, y: 50 },
      ]);
    });
  });

  describe('out 초기화', () => {
    test('호출 시 out.length를 0으로 초기화한 뒤 push한다', () => {
      const out: HandlePoint[] = [];
      // 첫 번째 호출
      resizeHandlesInto(out, { minX: 0, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      // 두 번째 호출 — out에 기존 항목이 있어도 초기화 후 8개만 남아야 한다
      resizeHandlesInto(out, { minX: 5, minY: 5, maxX: 50, maxY: 30 }, makeXY);
      expect(out).toHaveLength(8);
      expect(out[0].point.x).toBe(5);
    });
  });

  describe('zero-size bounds', () => {
    test('width=0, height=0인 bounds에서도 8개를 기록한다', () => {
      const out: HandlePoint[] = [];
      resizeHandlesInto(out, { minX: 50, minY: 50, maxX: 50, maxY: 50 }, makeXY);
      expect(out).toHaveLength(8);
      // 모든 handle이 동일 좌표여야 한다
      for (const h of out) {
        expect(h.point.x).toBe(50);
        expect(h.point.y).toBe(50);
      }
    });
  });

  describe('NaN propagation', () => {
    test('NaN 좌표를 가진 bounds는 NaN을 그대로 전파한다', () => {
      const out: HandlePoint[] = [];
      resizeHandlesInto(out, { minX: Number.NaN, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      expect(out).toHaveLength(8);
      expect(Number.isNaN(out[0].point.x)).toBe(true); // nw.x = NaN
    });
  });
});

// ---------------------------------------------------------------------------
// resizeHandles (companion)
// ---------------------------------------------------------------------------

describe('resizeHandles', () => {
  test('8개 handle을 fixed order로 반환한다', () => {
    const result = resizeHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 });
    expect(result).toHaveLength(8);
    expect(ids(result)).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']);
  });

  test('각 point가 plain object이고 좌표가 올바르다', () => {
    const result = resizeHandles({ minX: 10, minY: 20, maxX: 110, maxY: 80 });
    expect(snapshot(result)).toEqual([
      { id: 'nw', x: 10, y: 20 },
      { id: 'n', x: 60, y: 20 },
      { id: 'ne', x: 110, y: 20 },
      { id: 'e', x: 110, y: 50 },
      { id: 'se', x: 110, y: 80 },
      { id: 's', x: 60, y: 80 },
      { id: 'sw', x: 10, y: 80 },
      { id: 'w', x: 10, y: 50 },
    ]);
  });

  test('각 point는 서로 다른 object다', () => {
    const result = resizeHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 });
    const points = result.map((h) => h.point);
    const unique = new Set(points);
    expect(unique.size).toBe(8);
  });

  test('degenerate bounds(width=0,height=0)에서도 8개를 반환한다', () => {
    const result = resizeHandles({ minX: 50, minY: 50, maxX: 50, maxY: 50 });
    expect(result).toHaveLength(8);
    for (const h of result) {
      expect(h.point).toEqual({ x: 50, y: 50 });
    }
  });

  test('호출마다 새 배열을 반환한다', () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 60 };
    expect(resizeHandles(bounds)).not.toBe(resizeHandles(bounds));
  });

  test('NaN 좌표를 그대로 전파하고 throw하지 않는다', () => {
    const result = resizeHandles({ minX: Number.NaN, minY: 0, maxX: 100, maxY: 60 });
    expect(result).toHaveLength(8);
    expect(Number.isNaN(result[0].point.x)).toBe(true);
  });

  test('Infinity 좌표를 그대로 전파한다', () => {
    const result = resizeHandles({ minX: 0, minY: 0, maxX: Number.POSITIVE_INFINITY, maxY: 60 });
    expect(result).toHaveLength(8);
    // 'ne' handle x = maxX = +Infinity
    expect(result.some((h) => h.point.x === Number.POSITIVE_INFINITY)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// rotateHandlesInto
// ---------------------------------------------------------------------------

describe('rotateHandlesInto', () => {
  describe('handle 수와 id', () => {
    test('1개 handle을 기록한다', () => {
      const out: HandlePoint[] = [];
      const count = rotateHandlesInto(out, { minX: 0, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      expect(count).toBe(1);
      expect(out).toHaveLength(1);
      expect(out[0].id).toBe('rotate');
    });
  });

  describe('좌표 정확성', () => {
    test('기본 offset=0이면 top-center 위치 (minY)에 위치한다', () => {
      const out: HandlePoint[] = [];
      rotateHandlesInto(out, { minX: 10, minY: 20, maxX: 110, maxY: 80 }, makeXY);
      expect(out[0].point.x).toBe(60); // (10+110)/2
      expect(out[0].point.y).toBe(20); // minY (offset=0 → 위로 0 이동)
    });

    test('offset>0이면 top-center보다 offset만큼 위(-y 방향)에 위치한다', () => {
      const out: HandlePoint[] = [];
      rotateHandlesInto(out, { minX: 10, minY: 20, maxX: 110, maxY: 80 }, makeXY, { offset: 30 });
      expect(out[0].point.x).toBe(60); // (10+110)/2
      expect(out[0].point.y).toBe(-10); // 20 - 30
    });
  });

  describe('out 초기화', () => {
    test('호출 시 out을 초기화한 뒤 1개만 남긴다', () => {
      const out: HandlePoint[] = [];
      rotateHandlesInto(out, { minX: 0, minY: 0, maxX: 100, maxY: 60 }, makeXY);
      rotateHandlesInto(out, { minX: 5, minY: 5, maxX: 50, maxY: 30 }, makeXY);
      expect(out).toHaveLength(1);
    });
  });
});

// ---------------------------------------------------------------------------
// rotateHandles (companion)
// ---------------------------------------------------------------------------

describe('rotateHandles', () => {
  test('단일 rotate handle을 반환한다', () => {
    const result = rotateHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rotate');
  });

  test('기본 offset=0이면 top-center {x:50,y:0}을 반환한다', () => {
    const result = rotateHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 });
    expect(result[0].point).toEqual({ x: 50, y: 0 });
  });

  test('offset=30이면 {x:50,y:-30}을 반환한다', () => {
    const result = rotateHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 }, { offset: 30 });
    expect(result[0].point).toEqual({ x: 50, y: -30 });
  });

  test('호출마다 새 배열을 반환한다', () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 60 };
    expect(rotateHandles(bounds)).not.toBe(rotateHandles(bounds));
  });

  test('호출마다 새 point object를 반환한다', () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 60 };
    const a = rotateHandles(bounds);
    const c = rotateHandles(bounds);
    expect(a[0].point).not.toBe(c[0].point);
  });

  test('NaN 좌표를 그대로 전파하고 throw하지 않는다', () => {
    const result = rotateHandles({ minX: Number.NaN, minY: 0, maxX: 100, maxY: 60 });
    expect(result).toHaveLength(1);
    expect(Number.isNaN(result[0].point.x)).toBe(true);
  });

  test('Infinity offset을 그대로 전파한다', () => {
    const result = rotateHandles({ minX: 0, minY: 0, maxX: 100, maxY: 60 }, { offset: Number.POSITIVE_INFINITY });
    // y = minY - offset = 0 - Infinity = -Infinity
    expect(result[0].point.y).toBe(Number.NEGATIVE_INFINITY);
  });
});

// ---------------------------------------------------------------------------
// anchorPointInto
// ---------------------------------------------------------------------------

describe('anchorPointInto', () => {
  const bounds = { minX: 10, minY: 20, maxX: 110, maxY: 80 };
  // midX = 60, midY = 50

  describe('9개 anchor 좌표', () => {
    const cases: [AnchorKind, number, number][] = [
      ['top-left', 10, 20],
      ['top', 60, 20],
      ['top-right', 110, 20],
      ['left', 10, 50],
      ['center', 60, 50],
      ['right', 110, 50],
      ['bottom-left', 10, 80],
      ['bottom', 60, 80],
      ['bottom-right', 110, 80],
    ];

    test.each(cases)('%s anchor 좌표가 올바르다', (anchor, expectedX, expectedY) => {
      const out: PointWritable = { x: 0, y: 0 };
      const result = anchorPointInto(out, bounds, anchor);
      expect(result).toBe(true);
      expect(out.x).toBe(expectedX);
      expect(out.y).toBe(expectedY);
    });
  });

  describe('zero-size bounds', () => {
    test('width=0, height=0이면 모든 anchor가 동일 좌표이다', () => {
      const out: PointWritable = { x: 0, y: 0 };
      anchorPointInto(out, { minX: 50, minY: 50, maxX: 50, maxY: 50 }, 'center');
      expect(out.x).toBe(50);
      expect(out.y).toBe(50);
    });
  });
});

// ---------------------------------------------------------------------------
// anchorPoint
// ---------------------------------------------------------------------------

describe('anchorPoint', () => {
  const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 60 };

  describe('9개 anchor 좌표', () => {
    const cases: [AnchorKind, number, number][] = [
      ['top-left', 0, 0],
      ['top', 50, 0],
      ['top-right', 100, 0],
      ['left', 0, 30],
      ['center', 50, 30],
      ['right', 100, 30],
      ['bottom-left', 0, 60],
      ['bottom', 50, 60],
      ['bottom-right', 100, 60],
    ];

    test.each(cases)('%s anchor 좌표가 올바르다', (anchor, expectedX, expectedY) => {
      const result = anchorPoint(bounds, anchor);
      expect(result).toBeDefined();
      expect(result?.x).toBe(expectedX);
      expect(result?.y).toBe(expectedY);
    });
  });

  describe('zero-size bounds', () => {
    test('zero-size bounds에서도 결과를 반환한다', () => {
      const result = anchorPoint({ minX: 30, minY: 40, maxX: 30, maxY: 40 }, 'bottom-right');
      expect(result).toEqual({ x: 30, y: 40 });
    });
  });
});

describe('rotateHandles - 옵션 필드', () => {
  test('offset이 빠진 옵션 객체에 0을 쓰지 않고 y를 NaN으로 기록한다', () => {
    const bounds = { minX: 0, minY: 10, maxX: 20, maxY: 30 };
    // @ts-expect-error offset은 필수 필드다.
    const [handle] = rotateHandles(bounds, {});
    expect(handle.point.x).toBe(10);
    expect(handle.point.y).toBeNaN();
  });
});
