/**
 * editor-geometry pixel-align 단위 테스트
 *
 * pixelAlignInto / pixelAlign 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { pixelAlign } from '../../../src/editor-geometry/pixel-align';
import { pixelAlignInto } from '../../../src/editor-geometry/pixel-align-into';

describe('editor-geometry - pixelAlignInto', () => {
  test('정수 좌표는 변경되지 않는다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 10, y: 20 });
    expect(out.x).toBe(10);
    expect(out.y).toBe(20);
  });

  test('소수 좌표를 가장 가까운 정수로 반올림한다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 10.7, y: 20.3 });
    expect(out.x).toBe(11);
    expect(out.y).toBe(20);
  });

  test('devicePixelRatio 2에서 0.5단위로 반올림한다', () => {
    const out = { x: 0, y: 0 };
    // 10.3 * 2 = 20.6 → round(20.6) = 21 → 21/2 = 10.5
    // 20.7 * 2 = 41.4 → round(41.4) = 41 → 41/2 = 20.5
    pixelAlignInto(out, { x: 10.3, y: 20.7 }, { devicePixelRatio: 2 });
    expect(out.x).toBe(10.5);
    expect(out.y).toBe(20.5);
  });

  test('devicePixelRatio 3에서 1/3단위로 반올림한다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 10.4, y: 20.5 }, { devicePixelRatio: 3 });
    // 10.4 * 3 = 31.2 → round 31 / 3 ≈ 10.333...
    expect(out.x).toBeCloseTo(31 / 3, 10);
    // 20.5 * 3 = 61.5 → round 62 / 3 ≈ 20.666...
    expect(out.y).toBeCloseTo(62 / 3, 10);
  });

  test('음수 좌표도 올바르게 처리한다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: -10.3, y: -20.7 });
    expect(out.x).toBe(-10);
    expect(out.y).toBe(-21);
  });

  test('tuple out에 기록한다', () => {
    const out = [0, 0] as [number, number];
    pixelAlignInto(out, [10.7, 20.3] as const);
    expect(out[0]).toBe(11);
    expect(out[1]).toBe(20);
  });

  test('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(pixelAlignInto(out, { x: 1, y: 2 })).toBe(out);
  });

  test('out === point aliasing이 안전하다', () => {
    const p = { x: 10.7, y: 20.3 };
    pixelAlignInto(p, p);
    expect(p.x).toBe(11);
    expect(p.y).toBe(20);
  });

  test('devicePixelRatio가 0이면 NaN을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 1, y: 2 }, { devicePixelRatio: 0 });
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });

  test('devicePixelRatio가 음수이면 NaN을 기록한다 (silent 부호 반전 방지)', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 1, y: 2 }, { devicePixelRatio: -2 });
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });

  test('devicePixelRatio가 NaN이면 NaN을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pixelAlignInto(out, { x: 1, y: 2 }, { devicePixelRatio: Number.NaN });
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });
});

describe('editor-geometry - pixelAlign', () => {
  test('소수 좌표를 가장 가까운 정수로 반올림한다', () => {
    const result = pixelAlign({ x: 10.7, y: 20.3 });
    expect(result.x).toBe(11);
    expect(result.y).toBe(20);
  });

  test('devicePixelRatio 2에서 0.5단위로 반올림한다', () => {
    // 20.7 * 2 = 41.4 → round(41.4) = 41 → 41/2 = 20.5
    const result = pixelAlign({ x: 10.3, y: 20.7 }, { devicePixelRatio: 2 });
    expect(result.x).toBe(10.5);
    expect(result.y).toBe(20.5);
  });

  test('결과 객체를 새로 반환한다 (입력과 다른 객체)', () => {
    const point = { x: 10.7, y: 20.3 };
    const result = pixelAlign(point);
    expect(result).not.toBe(point);
  });
});
