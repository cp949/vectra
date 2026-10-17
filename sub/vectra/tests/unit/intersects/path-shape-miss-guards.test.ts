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
const farBounds = { min: { x: 30, y: 30 }, max: { x: 32, y: 32 } };
const farRect = { x: 30, y: 30, width: 2, height: 2 };
const farCircle = { center: { x: 31, y: 31 }, radius: 1 };
const farEllipse = { center: { x: 31, y: 31 }, radiusX: 2, radiusY: 1 };
const farTriangle = { a: { x: 30, y: 30 }, b: { x: 34, y: 30 }, c: { x: 32, y: 34 } };

describe('그릴 선분이 없는 path', () => {
  test('intersectsPathBounds는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathBounds(moveOnlyPath, { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } })).toBe(false);
  });

  test('intersectsPathRect는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathRect(moveOnlyPath, { x: 0, y: 0, width: 2, height: 2 })).toBe(false);
  });

  test('intersectsPathCircle은 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathCircle(moveOnlyPath, { center: { x: 1, y: 1 }, radius: 2 })).toBe(false);
  });

  test('intersectsPathEllipse는 move만 있는 path에서 false를 반환한다', () => {
    expect(intersectsPathEllipse(moveOnlyPath, { center: { x: 1, y: 1 }, radiusX: 2, radiusY: 2 })).toBe(false);
  });

  test('intersectsPathTriangle은 move만 있는 path에서 false를 반환한다', () => {
    const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } };
    expect(intersectsPathTriangle(moveOnlyPath, triangle)).toBe(false);
  });

  test('intersectsPathPolygon은 move만 있는 path에서 false를 반환한다', () => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 4 },
    ];
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
    expect(intersectsPathBounds(openFromOrigin, { min: { x: -1, y: -1 }, max: { x: 1, y: 1 } })).toBe(true);
  });

  test('intersectsPathRect는 모든 vertex가 rect 안에 있으면 true를 반환한다', () => {
    expect(intersectsPathRect(openFromOrigin, { x: -1, y: -1, width: 2, height: 2 })).toBe(true);
  });

  test('intersectsPathCircle은 모든 vertex가 circle 안에 있으면 true를 반환한다', () => {
    expect(intersectsPathCircle(openFromOrigin, { center: { x: 0, y: 0 }, radius: 1 })).toBe(true);
  });

  test('intersectsPathTriangle은 모든 vertex가 삼각형 안에 있으면 true를 반환한다', () => {
    const triangle = { a: { x: -4, y: -4 }, b: { x: 4, y: -4 }, c: { x: 0, y: 4 } };
    expect(intersectsPathTriangle(openFromOrigin, triangle)).toBe(true);
  });
});

describe('closed path 경계에서 epsilon 이내로 벗어난 triangle 꼭짓점', () => {
  // 변 교차 검사는 정확한 기하로 판정하고 꼭짓점 포함 검사는 DEFAULT_EPSILON(1e-9) 허용오차를 둔다.
  // 꼭짓점이 경계 바깥 1e-10에 있으면 변은 만나지 않지만 포함 검사는 true를 반환한다.
  test('b 꼭짓점이 경계 바깥 1e-10이면 true를 반환한다', () => {
    const triangle = { a: { x: -5, y: 4 }, b: { x: -1e-10, y: 5 }, c: { x: -5, y: 6 } };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(true);
  });

  test('c 꼭짓점이 경계 바깥 1e-10이면 true를 반환한다', () => {
    const triangle = { a: { x: -5, y: 4 }, b: { x: -5, y: 6 }, c: { x: -1e-10, y: 5 } };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(true);
  });

  test('꼭짓점이 경계 바깥 1e-8이면 false를 반환한다', () => {
    const triangle = { a: { x: -5, y: 4 }, b: { x: -1e-8, y: 5 }, c: { x: -5, y: 6 } };
    expect(intersectsPathTriangle(bigSquarePath, triangle)).toBe(false);
  });
});
