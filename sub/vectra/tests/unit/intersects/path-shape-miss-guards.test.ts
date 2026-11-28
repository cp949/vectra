/**
 * path와 도형 사이 boolean 교차 판정의 miss 경로를 확인하는 테스트.
 * 그릴 선분이 없는 path, 도형과 떨어진 closed path, 시작 vertex가 도형 안에 있는 path를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { intersectsPathBounds } from '../../../src/intersects/intersects-path-bounds';
import { intersectsPathCircle } from '../../../src/intersects/intersects-path-circle';
import { intersectsPathEllipse } from '../../../src/intersects/intersects-path-ellipse';
import { intersectsPathPolygon } from '../../../src/intersects/intersects-path-polygon';
import { intersectsPathRect } from '../../../src/intersects/intersects-path-rect';
import { intersectsPathTriangle } from '../../../src/intersects/intersects-path-triangle';
import type { PathCommand } from '../../../src/types';
import { bigSquarePath } from './_helpers/path-intersection-fixtures';

// move만 있어 flatten 결과가 비는 path. commands는 비어 있지 않다.
const moveOnlyPath: PathCommand[] = [{ kind: 'move', x: 1, y: 1 }];

// bigSquarePath(0..10)와 겹치지 않는 영역에 둔 도형들
const farBounds = { minX: 30, minY: 30, maxX: 32, maxY: 32 };
const farRect = { x: 30, y: 30, width: 2, height: 2 };
const farCircle = { cx: 31, cy: 31, r: 1 };
const farEllipse = { cx: 31, cy: 31, rx: 2, ry: 1 };
const farTriangle = { x1: 30, y1: 30, x2: 34, y2: 30, x3: 32, y3: 34 };

describe('그릴 선분이 없는 path', () => {
  test('intersectsPathBounds는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathBounds(moveOnlyPath, { minX: 0, minY: 0, maxX: 2, maxY: 2 })).toBe(false);
  });

  test('intersectsPathRect는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathRect(moveOnlyPath, { x: 0, y: 0, width: 2, height: 2 })).toBe(false);
  });

  test('intersectsPathCircle은 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathCircle(moveOnlyPath, { cx: 1, cy: 1, r: 2 })).toBe(false);
  });

  test('intersectsPathEllipse는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathEllipse(moveOnlyPath, { cx: 1, cy: 1, rx: 2, ry: 2 })).toBe(false);
  });

  test('intersectsPathTriangle은 move만 있는 path에서 false를 반환한다', () => {
    const triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 4 };
    expect(intersectsPathTriangle(moveOnlyPath, triangle)).toBe(false);
  });

  test('intersectsPathPolygon은 move만 있는 path에서 false를 반환한다', () => {
    const polygon = [0, 0, 4, 0, 2, 4];
    expect(intersectsPathPolygon(moveOnlyPath, polygon)).toBe(false);
  });
});

describe('도형과 떨어진 closed path', () => {
  test('intersectsPathBounds는 closed path가 bounds와 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsPathBounds(bigSquarePath, farBounds)).toBe(false);
  });

  test('intersectsPathRect는 closed path가 rect와 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsPathRect(bigSquarePath, farRect)).toBe(false);
  });

  test('intersectsPathCircle은 closed path가 circle과 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsPathCircle(bigSquarePath, farCircle)).toBe(false);
  });

  test('intersectsPathEllipse는 closed path가 ellipse와 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsPathEllipse(bigSquarePath, farEllipse)).toBe(false);
  });

  test('intersectsPathTriangle은 closed path가 삼각형과 떨어져 있으면 false를 반환한다', () => {
    expect(intersectsPathTriangle(bigSquarePath, farTriangle)).toBe(false);
  });
});

describe('통째로 도형 안에 있는 open path', () => {
  // 모든 vertex가 도형 안에 있어 edge가 도형 경계와 교차하지 않는다. vertex 포함 검사만 true를 만든다.
  const openFromOrigin: PathCommand[] = [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 0.5, y: 0.5 },
  ];

  test('intersectsPathBounds는 모든 vertex가 bounds 안에 있으면 true를 반환한다', () => {
    expect(intersectsPathBounds(openFromOrigin, { minX: -1, minY: -1, maxX: 1, maxY: 1 })).toBe(true);
  });

  test('intersectsPathRect는 모든 vertex가 rect 안에 있으면 true를 반환한다', () => {
    expect(intersectsPathRect(openFromOrigin, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('intersectsPathCircle은 모든 vertex가 circle 안에 있으면 true를 반환한다', () => {
    expect(intersectsPathCircle(openFromOrigin, { cx: 0, cy: 0, r: 1 })).toBe(true);
  });

  test('intersectsPathTriangle은 모든 vertex가 삼각형 안에 있으면 true를 반환한다', () => {
    const triangle = { x1: -4, y1: -4, x2: 4, y2: -4, x3: 0, y3: 4 };
    expect(intersectsPathTriangle(openFromOrigin, triangle)).toBe(true);
  });
});

describe('closed path 경계에서 epsilon 이내로 벗어난 triangle 꼭짓점', () => {
  // 변 교차 검사는 정확한 기하로 판정하고 꼭짓점 포함 검사는 DEFAULT_EPSILON(1e-9) 허용오차를 둔다.
  // 꼭짓점이 경계 바깥 1e-10에 있으면 변은 만나지 않지만 포함 검사는 true를 반환한다.
  test('b 꼭짓점이 경계 바깥 1e-10이면 true를 반환한다', () => {
    const triangle = { x1: -5, y1: 4, x2: -1e-10, y2: 5, x3: -5, y3: 6 };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(true);
  });

  test('c 꼭짓점이 경계 바깥 1e-10이면 true를 반환한다', () => {
    const triangle = { x1: -5, y1: 4, x2: -5, y2: 6, x3: -1e-10, y3: 5 };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(true);
  });

  test('꼭짓점이 경계 바깥 1e-8이면 false를 반환한다', () => {
    const triangle = { x1: -5, y1: 4, x2: -1e-8, y2: 5, x3: -5, y3: 6 };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(false);
  });
});
