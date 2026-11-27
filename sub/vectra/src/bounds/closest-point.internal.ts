/** 좌표를 닫힌 축 범위로 제한하고 NaN은 산술 결과에 남긴다. */
export function clampCoordinate(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
