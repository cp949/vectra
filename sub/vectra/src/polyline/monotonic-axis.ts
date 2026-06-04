import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, PolylineMonotonicAxis, PolylineMonotonicAxisOptions } from '../types';

/**
 * polyline의 x 좌표열과 y 좌표열이 각각 단조인지 독립적으로 판정한다.
 *
 * path의 전체 진행 방향이 아니라 축별 좌표열만 본다. non-strict 기본값은 같은 축의 모든
 * consecutive delta가 `>= 0`이거나 모두 `<= 0`이면 단조로 보고 repeated 좌표(delta `0`)를
 * 허용한다. `options.strict`가 `true`면 모든 delta가 `> 0`이거나 `< 0`이어야 하며 delta `0`이
 * 하나라도 있으면 해당 축은 탈락한다.
 *
 * empty / single-point polyline은 strict 여부와 무관하게 vacuously 단조이므로 `'both'`다.
 * finite validation은 하지 않는다. `NaN` delta는 비교가 모두 `false`이므로 해당 축이 탈락하고,
 * `Infinity` / `-Infinity`는 JS 비교 결과를 그대로 사용한다. signed-zero `-0` delta는 `+0`과 동일하게
 * 취급한다(non-strict 유지, strict 탈락).
 *
 * @param polyline 축별 단조 여부를 판정할 polyline
 * @param options 단조 판정 옵션. `strict` 기본값 `false`(non-strict)
 */
export function monotonicAxis(polyline: PolylineLike, options?: PolylineMonotonicAxisOptions): PolylineMonotonicAxis {
  const points = readPolylinePoints(polyline);
  const n = points.length;
  if (n < 2) return 'both';

  const strict = options?.strict ?? false;

  // 각 축이 증가/감소 방향과 계속 일치하는지 추적한다. 두 플래그가 모두 false면 그 축은 탈락이다.
  let xInc = true;
  let xDec = true;
  let yInc = true;
  let yDec = true;

  let prevX = readX(points[0]);
  let prevY = readY(points[0]);

  for (let i = 1; i < n; i++) {
    const cx = readX(points[i]);
    const cy = readY(points[i]);
    const dx = cx - prevX;
    const dy = cy - prevY;
    prevX = cx;
    prevY = cy;

    if (strict) {
      xInc = xInc && dx > 0;
      xDec = xDec && dx < 0;
      yInc = yInc && dy > 0;
      yDec = yDec && dy < 0;
    } else {
      xInc = xInc && dx >= 0;
      xDec = xDec && dx <= 0;
      yInc = yInc && dy >= 0;
      yDec = yDec && dy <= 0;
    }
  }

  const xMono = xInc || xDec;
  const yMono = yInc || yDec;

  if (xMono && yMono) return 'both';
  if (xMono) return 'x';
  if (yMono) return 'y';
  return 'none';
}
