import {
  readOrientedRectAngle,
  readOrientedRectSize,
  validateOrientedRectSizeAndAngle,
} from '../internal/oriented-rect';
import { readX, readY } from '../internal/xy';
import type { OrientedRectLike } from '../types';

/**
 * oriented rect의 local 단위 axis pair를 새 plain object로 반환한다.
 *
 * `xAxis = (cos(angle), sin(angle))`, `yAxis = (-sin(angle), cos(angle))`인 orthonormal pair를
 * `{ xAxis, yAxis }`로 반환한다. size 값은 axis 계산에 직접 쓰지 않지만 invalid oriented rect input을
 * 같은 정책으로 거부한다. size 두 성분이나 angle이 non-finite이면 `RangeError`다.
 *
 * @param rect axis를 읽을 oriented rect
 */
export function axes(rect: OrientedRectLike): {
  xAxis: { x: number; y: number };
  yAxis: { x: number; y: number };
} {
  const size = readOrientedRectSize(rect);
  const width = readX(size);
  const height = readY(size);
  const angle = readOrientedRectAngle(rect);
  validateOrientedRectSizeAndAngle(width, height, angle);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    xAxis: { x: cos, y: sin },
    yAxis: { x: -sin, y: cos },
  };
}
