/** 예제 탐색 메뉴가 열린 상태의 너비 (px) */
export const EXAMPLE_NAV_OPEN_WIDTH = 280;

/** 예제 탐색 메뉴 열림 여부를 실제 layout 너비로 변환한다 */
export function getExampleNavWidth(isOpen: boolean): number {
  return isOpen ? EXAMPLE_NAV_OPEN_WIDTH : 0;
}
