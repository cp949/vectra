/**
 * editor-geometry.zoomAwareTolerance — screen pixel tolerance를 world snapping tolerance로 변환한다.
 *
 * 검증: valid zoom 산식(baseTolerance / zoom), invalid zoom(0 / 음수 / NaN / ±Infinity) Infinity fallback,
 * invalid zoom branch는 baseTolerance와 무관, valid zoom에서 baseTolerance non-finite 전파, -0 보존 정책.
 */

import { describe, expect, test } from 'vitest';
import { zoomAwareTolerance } from '../../../src/editor-geometry/zoom-aware-tolerance';

describe('editor-geometry - zoomAwareTolerance', () => {
  test('zoom 1은 baseTolerance를 그대로 반환한다', () => {
    expect(zoomAwareTolerance(12, 1)).toBe(12);
  });

  test('zoom 2는 baseTolerance를 절반으로 줄인다', () => {
    expect(zoomAwareTolerance(12, 2)).toBe(6);
  });

  test('zoom 0.5는 baseTolerance를 두 배로 키운다', () => {
    expect(zoomAwareTolerance(12, 0.5)).toBe(24);
  });

  test('zoom이 0이면 Infinity를 반환한다', () => {
    expect(zoomAwareTolerance(12, 0)).toBe(Infinity);
    expect(zoomAwareTolerance(12, -0)).toBe(Infinity);
  });

  test('zoom이 음수면 baseTolerance 부호와 무관하게 Infinity를 반환한다', () => {
    expect(zoomAwareTolerance(12, -1)).toBe(Infinity);
    expect(zoomAwareTolerance(-12, -2)).toBe(Infinity);
  });

  test('zoom이 NaN이면 Infinity를 반환한다', () => {
    expect(zoomAwareTolerance(12, Number.NaN)).toBe(Infinity);
  });

  test('zoom이 Infinity 또는 -Infinity면 Infinity를 반환한다', () => {
    expect(zoomAwareTolerance(12, Infinity)).toBe(Infinity);
    expect(zoomAwareTolerance(12, -Infinity)).toBe(Infinity);
  });

  test('invalid zoom branch는 baseTolerance가 non-finite여도 Infinity를 반환한다', () => {
    expect(zoomAwareTolerance(Number.NaN, 0)).toBe(Infinity);
    expect(zoomAwareTolerance(Infinity, -1)).toBe(Infinity);
    expect(zoomAwareTolerance(-Infinity, Number.NaN)).toBe(Infinity);
  });

  test('valid zoom에서 baseTolerance NaN은 NaN으로 전파된다', () => {
    expect(zoomAwareTolerance(Number.NaN, 2)).toBeNaN();
  });

  test('valid zoom에서 baseTolerance Infinity / -Infinity는 그대로 전파된다', () => {
    expect(zoomAwareTolerance(Infinity, 2)).toBe(Infinity);
    expect(zoomAwareTolerance(-Infinity, 2)).toBe(-Infinity);
  });

  test('valid zoom에서 baseTolerance -0은 -0으로 남는다', () => {
    expect(Object.is(zoomAwareTolerance(-0, 1), -0)).toBe(true);
  });

  test('valid zoom에서 baseTolerance +0은 +0을 반환한다', () => {
    expect(Object.is(zoomAwareTolerance(0, 1), 0)).toBe(true);
  });
});
