/** split resize 계산 입력 */
interface SplitPercentInput {
  /** 분할 컨테이너의 viewport 기준 왼쪽 좌표 */
  readonly containerLeft: number;
  /** 분할 컨테이너의 너비 */
  readonly containerWidth: number;
  /** pointer event의 viewport 기준 X 좌표 */
  readonly pointerClientX: number;
}

/** 하단 패널 높이 계산 입력 */
interface PanelHeightInput {
  /** 분할 컨테이너의 viewport 기준 위쪽 좌표 */
  readonly containerTop: number;
  /** 분할 컨테이너의 높이 */
  readonly containerHeight: number;
  /** pointer event의 viewport 기준 Y 좌표 */
  readonly pointerClientY: number;
}

/** 에디터와 Canvas가 유지할 최소 너비 비율 */
const MIN_SPLIT_PERCENT = 30;

/** 하단 console 패널 최소 높이 */
const MIN_PANEL_HEIGHT = 96;

/** 하단 console 패널 최대 높이 비율 */
const MAX_PANEL_HEIGHT_RATIO = 0.6;

/** 에디터 / Canvas 분할 비율을 계산한다 */
export function calculateSplitPercent(input: SplitPercentInput): number {
  if (input.containerWidth <= 0) {
    return 50;
  }

  const rawPercent = ((input.pointerClientX - input.containerLeft) / input.containerWidth) * 100;
  const maxSplitPercent = 100 - MIN_SPLIT_PERCENT;

  return Math.min(maxSplitPercent, Math.max(MIN_SPLIT_PERCENT, rawPercent));
}

/** 위/아래 분할에서 하단 패널 높이를 계산한다 */
export function calculatePanelHeight(input: PanelHeightInput): number {
  if (input.containerHeight <= 0) {
    return MIN_PANEL_HEIGHT;
  }

  const rawHeight = input.containerTop + input.containerHeight - input.pointerClientY;
  const maxHeight = input.containerHeight * MAX_PANEL_HEIGHT_RATIO;

  return Math.min(maxHeight, Math.max(MIN_PANEL_HEIGHT, rawHeight));
}
