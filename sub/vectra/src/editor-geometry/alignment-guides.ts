/**
 * alignmentGuides — bounds 배열의 alignment guide line collection을 새 배열로 반환하는 companion.
 */

import type { BoundsLike } from '../types';
import { alignmentGuidesInto } from './alignment-guides-into';
import type { AlignmentGuideResult, AlignmentKind } from './types';

/**
 * bounds 배열에 대한 alignment guide line collection을 새 배열로 반환한다.
 *
 * `alignmentGuidesInto`의 allocating companion이다.
 * 동일 좌표에 align되는 item은 단일 guide의 itemIndices에 모은다.
 * value order는 입력 bounds insertion order를 따르고, 같은 value의 itemIndices는 오름차순이다.
 * 빈 입력 또는 단일 item이면 빈 배열을 반환한다.
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작)으로 그대로 결과에 담는다.
 * 호출마다 새 result object를 담은 새 배열을 반환한다.
 *
 * @param bounds alignment 대상 bounds 배열
 * @param kind alignment 종류
 * @returns alignment guide 결과 배열
 */
export function alignmentGuides(bounds: readonly BoundsLike[], kind: AlignmentKind): AlignmentGuideResult[] {
  const out: AlignmentGuideResult[] = [];
  alignmentGuidesInto(out, bounds, kind);
  return out;
}
