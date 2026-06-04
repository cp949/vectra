import { writeXY } from '../internal/xy';
import type { OrientedRectWritable, XYInput, XYWritable } from '../types';
import { computeMinimumAreaRect } from './minimum-area-rect.internal';
import { materializeFinitePoints, resolveFitEpsilon } from './pca2.internal';
import type { FitOptions } from './types';

/**
 * point collection을 감싸는 최소 area oriented rectangle을 `out`에 기록하고 성공 여부를 반환한다.
 *
 * exact duplicate를 제거한 unique point의 convex hull을 만들고, 각 hull edge axis로 hull point를
 * projection해 `width * height`가 최소인 oriented rect를 고른다. `out.center`는 선택된 candidate의
 * projection interval midpoint를 world-space로 복원한 값이다. `out.size.x`는 edge axis 방향 width,
 * `out.size.y`는 perpendicular axis 방향 height이며 둘 다 strict positive다. `out.angle`은 edge axis의
 * `atan2(y, x)`다. 같은 area candidate는 convex hull edge 순회에서 먼저 발견한 candidate를 유지한다.
 *
 * 최소 sample은 non-collinear unique point 3개다. unique point가 3 미만이거나, point set이
 * collinear이거나, hull area / candidate extent가 `epsilon` 이하인 degenerate이거나, 유효한 candidate가
 * 없으면 `false`를 반환하고 `out`을 수정하지 않는다. zero-area oriented rect는 만들지 않는다.
 *
 * point 좌표가 NaN/Infinity/-Infinity이거나 `options.epsilon`이 invalid하면 `RangeError`. `epsilon`은
 * unique/collinear/degenerate extent 판정에만 쓰고 finite 검증에는 쓰지 않는다.
 *
 * `out.center`/`out.size`가 input point와 같은 object여도 alias-safe하다(모든 point 좌표를 먼저 읽고
 * 결과를 계산한 뒤에만 `out`을 쓴다). 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param out oriented rect를 기록할 writable output
 * @param points oriented rect로 감쌀 point collection
 * @param options `epsilon`을 담은 fitting 옵션. 미지정 시 `epsilon`은 `1e-9`
 */
export function fitMinimumAreaRectInto<Out extends OrientedRectWritable<XYWritable, XYWritable>>(
  out: Out,
  points: readonly XYInput[],
  options?: FitOptions
): Out | false {
  const epsilon = resolveFitEpsilon(options, 'options');
  const { xs, ys } = materializeFinitePoints(points, 'points');
  const rect = computeMinimumAreaRect(xs, ys, epsilon);
  if (rect === undefined) {
    return false;
  }
  writeXY(out.center, rect.centerX, rect.centerY);
  writeXY(out.size, rect.sizeX, rect.sizeY);
  out.angle = rect.angle;
  return out;
}
