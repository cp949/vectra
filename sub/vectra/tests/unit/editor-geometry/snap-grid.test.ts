/**
 * editor-geometry snap-grid 단위 테스트
 *
 * snapPointToGridInto / snapPointToGrid 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapPointToGrid } from '../../../src/editor-geometry/snap-grid';
import { snapPointToGridInto } from '../../../src/editor-geometry/snap-grid-into';

describe('editor-geometry - snapPointToGridInto', () => {
  test('grid 경계값에서 out에 정확히 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = snapPointToGridInto(out, { x: 10, y: 10 }, { x: 10, y: 10 });
    expect(result).toBe(out);
    expect(out.x).toBe(10);
    expect(out.y).toBe(10);
  });

  test('grid 중간 좌표를 가장 가까운 grid point로 snap한다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: 13, y: 17 }, { x: 10, y: 10 });
    expect(out.x).toBe(10);
    expect(out.y).toBe(20);
  });

  test('음수 좌표도 올바르게 snap한다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: -13, y: -17 }, { x: 10, y: 10 });
    expect(out.x).toBe(-10);
    expect(out.y).toBe(-20);
  });

  test('비대칭 gridSize(x/y 독립)를 처리한다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: 13, y: 13 }, { x: 10, y: 5 });
    expect(out.x).toBe(10);
    expect(out.y).toBe(15);
  });

  test('offset이 있으면 grid origin으로 사용한다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: 13, y: 13 }, { x: 10, y: 10 }, { offsetX: 3, offsetY: 3 });
    expect(out.x).toBe(13);
    expect(out.y).toBe(13);
  });

  test('out을 반환한다', () => {
    const out = { x: 0, y: 0 };
    const result = snapPointToGridInto(out, { x: 5, y: 5 }, { x: 10, y: 10 });
    expect(result).toBe(out);
  });

  test('out === point aliasing이 안전하다', () => {
    const p = { x: 13, y: 17 };
    snapPointToGridInto(p, p, { x: 10, y: 10 });
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });

  test('gridSize가 음수이면 NaN을 기록한다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: 5, y: 5 }, { x: -10, y: -10 });
    expect(out.x).toBeNaN();
    expect(out.y).toBeNaN();
  });

  test('gridSize.x만 음수이면 x만 NaN이다', () => {
    const out = { x: 0, y: 0 };
    snapPointToGridInto(out, { x: 13, y: 17 }, { x: -10, y: 10 });
    expect(out.x).toBeNaN();
    expect(out.y).toBe(20);
  });
});

describe('editor-geometry - snapPointToGrid', () => {
  test('grid 경계값에서 정확히 snap한다', () => {
    const result = snapPointToGrid({ x: 10, y: 10 }, { x: 10, y: 10 });
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(10);
    expect(result.y).toBe(10);
    expect(result.source).toBe('grid');
    expect(result.distance).toBe(0);
  });

  test('grid 중간 좌표를 가장 가까운 grid point로 snap한다', () => {
    const result = snapPointToGrid({ x: 13, y: 17 }, { x: 10, y: 10 });
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
    expect(result.source).toBe('grid');
  });

  test('항상 snapped: true를 반환한다', () => {
    const result = snapPointToGrid({ x: 99.9, y: 99.9 }, { x: 100, y: 100 });
    expect(result.snapped).toBe(true);
  });

  test('음수 좌표도 올바르게 snap한다', () => {
    const result = snapPointToGrid({ x: -13, y: -17 }, { x: 10, y: 10 });
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(-10);
    expect(result.y).toBe(-20);
  });

  test('비대칭 gridSize(x/y 독립)를 처리한다', () => {
    const result = snapPointToGrid({ x: 13, y: 13 }, { x: 10, y: 5 });
    expect(result.x).toBe(10);
    expect(result.y).toBe(15);
  });

  test('offset이 있으면 grid origin으로 사용한다', () => {
    const result = snapPointToGrid({ x: 13, y: 13 }, { x: 10, y: 10 }, { offsetX: 3, offsetY: 3 });
    expect(result.x).toBe(13);
    expect(result.y).toBe(13);
  });

  test('distance를 올바르게 계산한다', () => {
    const result = snapPointToGrid({ x: 13, y: 16 }, { x: 10, y: 10 });
    // snap x: 10 (diff 3), snap y: 20 (diff 4) → distance = 5
    expect(result.distance).toBeCloseTo(5, 10);
  });

  test('snap 위치가 일치하면 distance는 0이다', () => {
    const result = snapPointToGrid({ x: 20, y: 30 }, { x: 10, y: 10 });
    expect(result.distance).toBe(0);
  });

  test('gridSize가 0이면 NaN을 반환한다', () => {
    const result = snapPointToGrid({ x: 5, y: 5 }, { x: 0, y: 0 });
    expect(result.x).toBeNaN();
    expect(result.y).toBeNaN();
  });

  test('gridSize가 음수이면 NaN과 NaN distance를 반환한다', () => {
    const result = snapPointToGrid({ x: 5, y: 5 }, { x: -10, y: -10 });
    expect(result.x).toBeNaN();
    expect(result.y).toBeNaN();
    expect(result.distance).toBeNaN();
  });

  test('gridSize가 NaN이면 NaN을 반환한다', () => {
    const result = snapPointToGrid({ x: 5, y: 5 }, { x: Number.NaN, y: Number.NaN });
    expect(result.x).toBeNaN();
    expect(result.y).toBeNaN();
  });
});
