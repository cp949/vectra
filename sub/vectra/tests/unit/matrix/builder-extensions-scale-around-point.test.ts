/**
 * matrix builder scaleAroundPoint 함수 단위 테스트.
 *
 * scaleAroundPointInto / scaleAroundPoint
 */

import { describe, expect, test } from 'vitest';
import { scaleAroundPoint } from '../../../src/matrix/scale-around-point';
import { scaleAroundPointInto } from '../../../src/matrix/scale-around-point-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('matrix builder - scaleAroundPointInto', () => {
  test('uniform scale: 원점 기준 scale은 scalingInto와 같다', () => {
    const out = makeMatrix();
    scaleAroundPointInto(out, { x: 0, y: 0 }, { x: 2, y: 2 });
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
  });

  test('uniform scale: 임의 point 기준 scale', () => {
    // point=(100,50), scale=2 → tx=100*(1-2)=-100, ty=50*(1-2)=-50
    const out = makeMatrix();
    scaleAroundPointInto(out, { x: 100, y: 50 }, { x: 2, y: 2 });
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: -100, ty: -50 });
  });

  test('non-uniform scale: 축마다 다른 배율을 적용한다', () => {
    // point=(10,20), scale={x:3,y:2} → tx=10*(1-3)=-20, ty=20*(1-2)=-20
    const out = makeMatrix();
    scaleAroundPointInto(out, { x: 10, y: 20 }, { x: 3, y: 2 });
    expectNearMatrix(out, { a: 3, b: 0, c: 0, d: 2, tx: -20, ty: -20 });
  });

  test('scale=1이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    scaleAroundPointInto(out, { x: 50, y: 50 }, { x: 1, y: 1 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(scaleAroundPointInto(out, { x: 0, y: 0 }, { x: 1, y: 1 })).toBe(out);
  });

  test('subclass 확장 타입도 반환한다', () => {
    const out = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0, tag: 'sap' };
    const result = scaleAroundPointInto(out, { x: 0, y: 0 }, { x: 1, y: 1 });
    expect(result).toBe(out);
    expect(result.tag).toBe('sap');
  });

  test('point를 transform하면 point 자신은 변하지 않는다', () => {
    // scale around (px, py): (px, py)에 적용하면 (px, py)가 되어야 한다
    const out = makeMatrix();
    const px = 30;
    const py = 40;
    scaleAroundPointInto(out, { x: px, y: py }, { x: 3, y: 3 });
    const resultX = out.a * px + out.c * py + out.tx;
    const resultY = out.b * px + out.d * py + out.ty;
    expect(resultX).toBeCloseTo(px);
    expect(resultY).toBeCloseTo(py);
  });
});

describe('matrix builder - scaleAroundPoint', () => {
  test('새 object로 scale-around-point matrix를 반환한다', () => {
    const result = scaleAroundPoint({ x: 100, y: 50 }, { x: 2, y: 2 });
    expectNearMatrix(result, { a: 2, b: 0, c: 0, d: 2, tx: -100, ty: -50 });
  });

  test('축마다 다른 배율도 처리한다', () => {
    const result = scaleAroundPoint({ x: 0, y: 0 }, { x: 3, y: 5 });
    expectNearMatrix(result, { a: 3, b: 0, c: 0, d: 5, tx: 0, ty: 0 });
  });
});
