import type { EllipseLike, SegmentWritable, XYObjectWritable } from '../types';
import { fociInto } from './foci-into';

/**
 * ellipse의 두 초점을 plain object {a, b} 형태로 반환한다.
 *
 * fociInto의 allocating companion이다.
 * 원(rx == ry) 또는 empty ellipse(rx <= 0 || ry <= 0)이면 두 초점 모두 center를 반환한다.
 *
 * @param ellipse 초점을 계산할 ellipse
 */
export function foci(ellipse: EllipseLike): SegmentWritable<XYObjectWritable, XYObjectWritable> {
  return fociInto({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } }, ellipse);
}
