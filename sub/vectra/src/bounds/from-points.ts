import type { BoundsWritable, XYInput } from '../types';
import { createBounds } from './create-bounds';
import { fromPointsInto } from './from-points-into';

/**
 * points를 모두 포함하는 bounds를 새 plain bounds object로 반환한다.
 *
 * 빈 배열은 sentinel empty bounds를 반환한다. 단일 point는 point bounds를 반환한다.
 *
 * @param points bounds에 포함시킬 point 목록
 */
export function fromPoints(points: readonly XYInput[]): BoundsWritable {
  return fromPointsInto(createBounds(), points);
}
