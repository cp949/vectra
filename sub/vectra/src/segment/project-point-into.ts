import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYInput, XYWritable } from '../types';

/**
 * unclamped t로 계산한 projection point를 out에 기록하고 out을 반환한다. zero-length segment는 시작점을 기록한다.
 *
 * @param out projection point를 기록할 writable output
 * @param line 대상 segment
 * @param point segment에 투영할 point
 */
export function projectPointInto<Out extends XYWritable>(out: Out, line: SegmentLike, point: XYInput): Out {
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const dx = readX(readSegmentB(line)) - ax;
  const dy = readY(readSegmentB(line)) - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return writeXY(out, ax, ay);
  const px = readX(point) - ax;
  const py = readY(point) - ay;
  const t = (px * dx + py * dy) / lenSq;
  return writeXY(out, ax + t * dx, ay + t * dy);
}
