import type { EllipseWritable, XYInput, XYObjectWritable } from '../types';
import { createEllipse } from './create-ellipse';
import { fromFociInto } from './from-foci-into';

/**
 * 두 초점과 초점까지의 거리 합으로 x축 정렬 ellipse를 plain object로 반환한다.
 *
 * fromFociInto의 allocating companion이다.
 * invalid 조건(입력에 NaN/±Infinity 포함, sumOfDistances <= 0, 삼각형 부등식 위반)이면 undefined를 반환한다.
 *
 * @param focusA 첫 번째 초점
 * @param focusB 두 번째 초점
 * @param sumOfDistances 타원 위 임의의 점에서 두 초점까지 거리의 합 (= 2a)
 */
export function fromFoci(
  focusA: XYInput,
  focusB: XYInput,
  sumOfDistances: number
): EllipseWritable<XYObjectWritable> | undefined {
  const result = fromFociInto(createEllipse(), focusA, focusB, sumOfDistances);
  return result === false ? undefined : result;
}
