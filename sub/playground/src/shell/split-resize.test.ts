import { describe, expect, it } from 'vitest';
import { calculatePanelHeight, calculateSplitPercent } from './split-resize';

describe('calculateSplitPercent', () => {
  it('포인터 위치를 editor 너비 비율로 변환한다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 650 })).toBeCloseTo(55);
  });

  it('editor와 preview 최소 너비를 위해 30% 아래로 줄이지 않는다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 200 })).toBe(30);
  });

  it('editor와 preview 최소 너비를 위해 70% 위로 키우지 않는다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 1000, pointerClientX: 950 })).toBe(70);
  });

  it('컨테이너 너비가 없으면 기본 50%를 반환한다', () => {
    expect(calculateSplitPercent({ containerLeft: 100, containerWidth: 0, pointerClientX: 950 })).toBe(50);
  });
});

describe('calculatePanelHeight', () => {
  it('포인터 위치를 하단 panel 높이로 변환한다', () => {
    expect(calculatePanelHeight({ containerTop: 100, containerHeight: 800, pointerClientY: 700 })).toBe(200);
  });

  it('console panel 최소 높이를 유지한다', () => {
    expect(calculatePanelHeight({ containerTop: 100, containerHeight: 800, pointerClientY: 860 })).toBe(96);
  });

  it('console panel 최대 높이를 컨테이너 60%로 제한한다', () => {
    expect(calculatePanelHeight({ containerTop: 100, containerHeight: 800, pointerClientY: 200 })).toBe(480);
  });

  it('컨테이너 높이가 없으면 최소 높이를 반환한다', () => {
    expect(calculatePanelHeight({ containerTop: 100, containerHeight: 0, pointerClientY: 200 })).toBe(96);
  });
});
