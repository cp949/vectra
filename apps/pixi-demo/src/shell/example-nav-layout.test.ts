import { describe, expect, it } from 'vitest';
import { EXAMPLE_NAV_OPEN_WIDTH, getExampleNavWidth } from './example-nav-layout';

describe('example nav layout', () => {
  it('열린 상태에서는 메뉴 너비를 유지한다', () => {
    expect(getExampleNavWidth(true)).toBe(EXAMPLE_NAV_OPEN_WIDTH);
  });

  it('닫힌 상태에서는 메뉴 너비를 0으로 접는다', () => {
    expect(getExampleNavWidth(false)).toBe(0);
  });
});
