import type { XYInput } from '../types';
import { pixelAlignInto } from './pixel-align-into';

/**
 * point를 device pixel에 맞게 정렬한 새 객체를 반환한다.
 *
 * allocating companion.
 *
 * devicePixelRatio가 양의 유한수가 아니면(0, 음수, NaN) NaN을 기록한다.
 *
 * @param point 정렬할 입력 좌표
 * @param options.devicePixelRatio 장치 픽셀 비율 (기본값 1)
 */
export function pixelAlign(point: XYInput, options?: { devicePixelRatio?: number }): { x: number; y: number } {
  return pixelAlignInto({ x: 0, y: 0 }, point, options);
}
