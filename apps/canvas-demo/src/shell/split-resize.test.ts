import { describe, expect, it } from 'vitest';
import { calculatePanelHeight, calculateSplitPercent } from './split-resize';

describe('calculateSplitPercent', () => {
  it('포인터 위치를 컨테이너 기준 에디터 너비 비율로 변환한다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 650 })).toBeCloseTo(55);
  });

  it('에디터가 최소 너비보다 작아지지 않도록 제한한다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 200 })).toBe(30);
  });

  it('Canvas가 최소 너비보다 작아지지 않도록 제한한다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 950 })).toBe(70);
  });
});

describe('calculatePanelHeight', () => {
  it('위로 드래그하면 하단 패널 높이를 늘린다', () => {
    expect(
      calculatePanelHeight({
        containerTop: 100,
        containerHeight: 600,
        pointerClientY: 420,
      })
    ).toBe(280);
  });

  it('하단 패널 최소 높이를 유지한다', () => {
    expect(
      calculatePanelHeight({
        containerTop: 100,
        containerHeight: 600,
        pointerClientY: 620,
      })
    ).toBe(96);
  });
});
