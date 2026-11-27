import { createZeroSegment } from '../internal/segment';
import type { Ellipse, SegmentWritable } from '../types/flat-shapes.internal';
import { fociInto } from './foci-into';

/**
 * ellipse의 두 초점을 plain object {x1, y1, x2, y2} 형태로 반환한다.
 *
 * fociInto의 allocating companion이다.
 * 원(rx == ry) 또는 empty ellipse(rx <= 0 || ry <= 0)이면 두 초점 모두 center를 반환한다.
 *
 * @param ellipse 초점을 계산할 ellipse
 */
export function foci(ellipse: Ellipse): SegmentWritable {
  return fociInto(createZeroSegment(), ellipse);
}
