/**
 * matrix builder rotationAroundPoint 함수 단위 테스트.
 *
 * rotationAroundPointInto / rotationAroundPoint
 */

import { describe, expect, test } from 'vitest';
import { rotationAroundPoint } from '../../../src/matrix/rotation-around-point';
import { rotationAroundPointInto } from '../../../src/matrix/rotation-around-point-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('matrix builder - rotationAroundPointInto', () => {
  test('angle=0이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    rotationAroundPointInto(out, { x: 50, y: 30 }, 0);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('원점 기준 rotation은 rotationMatrixInto와 같다', () => {
    const out = makeMatrix();
    rotationAroundPointInto(out, { x: 0, y: 0 }, Math.PI / 3);
    const cosA = Math.cos(Math.PI / 3);
    const sinA = Math.sin(Math.PI / 3);
    expectNearMatrix(out, { a: cosA, b: sinA, c: -sinA, d: cosA, tx: 0, ty: 0 });
  });

  test('임의 point 기준 rotation: point 자신은 변하지 않는다', () => {
    const out = makeMatrix();
    const px = 100;
    const py = 50;
    rotationAroundPointInto(out, { x: px, y: py }, Math.PI / 4);
    const resultX = out.a * px + out.c * py + out.tx;
    const resultY = out.b * px + out.d * py + out.ty;
    expect(resultX).toBeCloseTo(px);
    expect(resultY).toBeCloseTo(py);
  });

  test('임의 point 기준 rotation: 전개식 결과를 직접 확인한다', () => {
    // px=10, py=20, angle=π/2 → cos=0, sin=1
    // tx = 10*(1-0) + 20*1 = 30, ty = 20*(1-0) - 10*1 = 10
    const out = makeMatrix();
    rotationAroundPointInto(out, { x: 10, y: 20 }, Math.PI / 2);
    expect(out.a).toBeCloseTo(0);
    expect(out.b).toBeCloseTo(1);
    expect(out.c).toBeCloseTo(-1);
    expect(out.d).toBeCloseTo(0);
    expect(out.tx).toBeCloseTo(30);
    expect(out.ty).toBeCloseTo(10);
  });

  test('tuple XYInput point를 처리한다', () => {
    const out = makeMatrix();
    rotationAroundPointInto(out, [0, 0], Math.PI / 4);
    const cosA = Math.cos(Math.PI / 4);
    const sinA = Math.sin(Math.PI / 4);
    expectNearMatrix(out, { a: cosA, b: sinA, c: -sinA, d: cosA, tx: 0, ty: 0 });
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(rotationAroundPointInto(out, { x: 0, y: 0 }, 0)).toBe(out);
  });

  test('subclass 확장 타입도 반환한다', () => {
    const out = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'rap' };
    const result = rotationAroundPointInto(out, { x: 0, y: 0 }, 0);
    expect(result).toBe(out);
    expect(result.tag).toBe('rap');
  });
});

describe('matrix builder - rotationAroundPoint', () => {
  test('새 object로 rotation-around-point matrix를 반환한다', () => {
    const result = rotationAroundPoint({ x: 10, y: 20 }, Math.PI / 2);
    expect(result.tx).toBeCloseTo(30);
    expect(result.ty).toBeCloseTo(10);
  });
});
