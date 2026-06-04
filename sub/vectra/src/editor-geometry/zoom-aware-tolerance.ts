/**
 * screen pixel snapping tolerance를 world 좌표 snapping tolerance로 변환한다.
 *
 * zoom이 양의 유한수이면 baseTolerance / zoom을 반환한다. zoom이 0, 음수, NaN,
 * Infinity, -Infinity이면 baseTolerance 값과 무관하게 Infinity를 반환한다.
 * baseTolerance는 validation하지 않는다. valid zoom에서 baseTolerance가 NaN/Infinity/-Infinity이면
 * division 결과로 전파되고, -0은 -0으로 남는다.
 *
 * @param baseTolerance screen pixel 기준 tolerance
 * @param zoom current viewport zoom scale
 */
export function zoomAwareTolerance(baseTolerance: number, zoom: number): number {
  if (zoom > 0 && Number.isFinite(zoom)) {
    return baseTolerance / zoom;
  }
  return Infinity;
}
