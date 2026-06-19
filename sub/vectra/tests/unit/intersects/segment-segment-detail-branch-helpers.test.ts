/**
 * segment-segment-geometry.internal 분기 helper characterization 테스트.
 *
 * Phase 3 분할(03-01)에서 추출된 공유 numeric primitive의 현재 동작을 golden으로 고정한다.
 * 목적은 behavior-preserving 검증 — 분할 전후 numeric 결과가 한 글자도 다르지 않음을 회귀 차단한다.
 *
 * pointPointDist: finite Sterbenz 직접 거리 + overflow scale fallback(huge → Infinity).
 * pointLineDist: 점-직선 거리 finite 경로 + dominant-axis residual max 선택.
 * parameterOnSegmentPoint: dominant axis 선택(x/y) + degenerate(dx===dy===0 → NaN) + overflow scale fallback.
 * interpolateCoord: finite 보간(start + t*(end-start)) + overflow scale 보간.
 */

import { describe, expect, test } from 'vitest';
import {
  interpolateCoord,
  parameterOnSegmentPoint,
  pointLineDist,
  pointPointDist,
} from '../../../src/intersects/segment-segment-geometry.internal';

describe('pointPointDist', () => {
  test('finite 직접 거리는 Sterbenz exact 값을 반환한다', () => {
    expect(pointPointDist(0, 0, 3, 4)).toBe(5);
  });

  test('동일 점 거리는 0이다', () => {
    expect(pointPointDist(7, -2, 7, -2)).toBe(0);
  });

  test('거리가 double 범위를 넘는 huge 좌표는 scale fallback에서 Infinity로 수렴한다', () => {
    expect(pointPointDist(1.5e308, 0, 0, 1.5e308)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('pointLineDist', () => {
  test('x축 직선에서 위로 1만큼 떨어진 점의 거리는 1이다', () => {
    expect(pointLineDist(0, 1, 0, 0, 2, 0)).toBeCloseTo(1, 12);
  });

  test('직선 위 점의 거리는 0이다', () => {
    expect(pointLineDist(1, 0, 0, 0, 2, 0)).toBeCloseTo(0, 12);
  });

  test('대좌표 직선에서 dominant-axis residual 경로가 finite 거리를 산출한다', () => {
    expect(pointLineDist(1e200, 1e200, 0, 0, 1e308, 0)).toBe(1e200);
  });
});

describe('parameterOnSegmentPoint', () => {
  test('x-dominant segment에서 중점 parameter는 0.5다', () => {
    expect(parameterOnSegmentPoint(1, 0, 0, 0, 2, 0)).toBe(0.5);
  });

  test('y-dominant segment에서 parameter는 y 비율로 계산된다', () => {
    expect(parameterOnSegmentPoint(0, 1, 0, 0, 0, 4)).toBe(0.25);
  });

  test('degenerate(dx===0 && dy===0) segment에서 점 자기 자신은 NaN을 반환한다', () => {
    expect(parameterOnSegmentPoint(5, 5, 5, 5, 5, 5)).toBeNaN();
  });

  test('overflow 좌표는 scale fallback에서 정규화된 parameter를 반환한다', () => {
    expect(parameterOnSegmentPoint(5e307, 0, 0, 0, 1e308, 0)).toBe(0.5);
  });
});

describe('interpolateCoord', () => {
  test('finite 보간은 start + t*(end-start)다', () => {
    expect(interpolateCoord(0, 10, 0.3)).toBeCloseTo(3, 12);
  });

  test('start와 end가 같으면 t에 무관하게 start를 반환한다', () => {
    expect(interpolateCoord(7, 7, 0.8)).toBe(7);
  });

  test('end-start가 overflow(non-finite)면 scale 보간 경로로 계산한다', () => {
    expect(interpolateCoord(-1e308, 1e308, 0.5)).toBe(0);
    expect(interpolateCoord(-1e308, 1e308, 0.25)).toBe(-5e307);
  });
});
