/** 타원 내부 샘플링의 분포와 반지름 검사 및 RNG 소비를 검증한다. */

import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { pointInEllipseInto } from '../../../src/random/point-in-ellipse-into';

describe('pointInEllipseInto', () => {
  test('rx<=0 → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 0, ry: 5 }, () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('rx<0 → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: -1, ry: 5 }, () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('ry<=0 → false, out 미수정', () => {
    const out = { x: 3, y: 4 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 3, ry: 0 }, () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('ry<0 → false, out 미수정', () => {
    const out = { x: 3, y: 4 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 3, ry: -2 }, () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('NaN rx → pass-through (true 반환, out.x에 NaN 기록, out.y는 ry 정상 반영)', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: NaN, ry: 5 }, () => 0.5);
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    // radiusY=5는 정상값이므로 y 축 계산은 유한값 반환
    expect(Number.isNaN(out.y)).toBe(false);
  });

  test('Infinity rx → pass-through (true 반환, out에 Infinity 기록)', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: Infinity, ry: 5 }, () => 0.5);
    expect(result).toBe(true);
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('-Infinity rx → false (degenerate), out 미수정', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: -Infinity, ry: 5 }, () => 0.5);
    // -Infinity <= 0 → degenerate 분기
    expect(result).toBe(false);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('NaN ry → pass-through (true 반환, out.y에 NaN 기록)', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 3, ry: NaN }, () => 0.5);
    expect(result).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('Infinity ry → pass-through (true 반환, out에 Infinity 기록)', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 3, ry: Infinity }, () => 0.5);
    expect(result).toBe(true);
    expect(Number.isFinite(out.y)).toBe(false);
  });

  test('-Infinity ry → false (degenerate), out 미수정', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: 0, cy: 0, rx: 3, ry: -Infinity }, () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('NaN 중심 좌표 → pass-through (true 반환)', () => {
    const out = { x: 0, y: 0 };
    const result = pointInEllipseInto(out, { cx: NaN, cy: NaN, rx: 3, ry: 5 }, () => 0.5);
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(true);
    expect(Number.isNaN(out.y)).toBe(true);
  });

  test('area-uniform 공식 검증: 고정 rng로 좌표 계산 확인', () => {
    const out = { x: 0, y: 0 };
    // rng=[0.5, 0.25] → theta=0.5*2*PI=PI, r=sqrt(0.25)=0.5
    // cx=1, cy=2, radiusX=3, radiusY=5
    // x = 1 + cos(PI)*0.5*3 = 1 - 1.5 = -0.5
    // y = 2 + sin(PI)*0.5*5 ≈ 2
    let call = 0;
    const rng = () => (call++ === 0 ? 0.5 : 0.25);
    const result = pointInEllipseInto(out, { cx: 1, cy: 2, rx: 3, ry: 5 }, rng);
    expect(result).toBe(true);
    const theta = 0.5 * 2 * Math.PI;
    const r = Math.sqrt(0.25);
    expect(out.x).toBeCloseTo(1 + Math.cos(theta) * r * 3);
    expect(out.y).toBeCloseTo(2 + Math.sin(theta) * r * 5);
  });

  test('결정론: 같은 seed → 같은 결과', () => {
    const ellipse = { cx: 0, cy: 0, rx: 3, ry: 5 };
    const rng1 = createRng('S3-RM-029-pointInEllipseInto-determinism');
    const rng2 = createRng('S3-RM-029-pointInEllipseInto-determinism');
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointInEllipseInto(out1, ellipse, rng1);
    pointInEllipseInto(out2, ellipse, rng2);
    expect(out1.x).toBe(out2.x);
    expect(out1.y).toBe(out2.y);
  });

  test('area-uniform 통계 검증: 4사분면 sample 비율 ~25% each, tolerance 3%', () => {
    const rng = createRng('S3-RM-029-pointInEllipseInto');
    const ellipse = { cx: 0, cy: 0, rx: 3, ry: 5 };
    const N = 10000;
    const counts = [0, 0, 0, 0]; // [x>=0,y>=0], [x<0,y>=0], [x>=0,y<0], [x<0,y<0]
    let allInside = true;
    const out = { x: 0, y: 0 };
    for (let i = 0; i < N; i++) {
      pointInEllipseInto(out, ellipse, rng);
      const rx = 3;
      const ry = 5;
      if ((out.x / rx) ** 2 + (out.y / ry) ** 2 > 1) {
        allInside = false;
      }
      if (out.x >= 0 && out.y >= 0) counts[0]++;
      else if (out.x < 0 && out.y >= 0) counts[1]++;
      else if (out.x >= 0 && out.y < 0) counts[2]++;
      else counts[3]++;
    }
    expect(allInside).toBe(true);
    const tolerance = 0.03;
    for (const count of counts) {
      expect(Math.abs(count / N - 0.25)).toBeLessThan(tolerance);
    }
  });
});
