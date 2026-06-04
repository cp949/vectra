import type { SegmentLike, SegmentTuple, XYInput } from '../types';
import { readX, readY } from './xy';

function isSegmentTuple(line: SegmentLike): line is SegmentTuple {
  return Array.isArray(line);
}

/** segment input에서 시작 endpoint를 읽는다. */
export function readSegmentA(line: SegmentLike): XYInput {
  return isSegmentTuple(line) ? line[0] : line.a;
}

/** segment input에서 끝 endpoint를 읽는다. */
export function readSegmentB(line: SegmentLike): XYInput {
  return isSegmentTuple(line) ? line[1] : line.b;
}

/**
 * segment 위 closest point를 scalar 좌표로 반환한다. zero-length segment는 시작점을 반환한다.
 *
 * t를 [0, 1]로 clamp한다. validation 없음. 호출자가 유효한 좌표를 보장한다. projection은 좌표를
 * normalize해 finite 좌표 차이 overflow가 NaN으로 번지는 것을 피한다. cross-domain 공유 raw-coord
 * kernel이며 segment/triangle leaf의 closest-point 환원이 같은 source를 호출하도록 보장한다.
 *
 * @param ax segment 시작점 x
 * @param ay segment 시작점 y
 * @param bx segment 끝점 x
 * @param by segment 끝점 y
 * @param px 기준 point x
 * @param py 기준 point y
 */
export function segmentClosestPointXY(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number
): { x: number; y: number } {
  const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(px), Math.abs(py));
  if (scale === 0) return { x: ax, y: ay };

  const sax = ax / scale;
  const say = ay / scale;
  const dx = bx / scale - sax;
  const dy = by / scale - say;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: ax, y: ay };
  const t = Math.max(0, Math.min(1, ((px / scale - sax) * dx + (py / scale - say) * dy) / lenSq));
  return { x: ax * (1 - t) + bx * t, y: ay * (1 - t) + by * t };
}

/**
 * point가 segment 위에 있으면 true를 반환한다.
 *
 * zero-length segment는 endpoint와 point 사이 거리로 판정한다. 공개 containsPoint 구현과 공유하는
 * internal helper이다.
 *
 * @param seg 포함 여부를 판정할 segment
 * @param px 판정할 point의 x 좌표
 * @param py 판정할 point의 y 좌표
 * @param epsilon 허용할 거리 오차
 */
export function segmentContainsPoint(seg: SegmentLike, px: number, py: number, epsilon: number): boolean {
  const ax = readX(readSegmentA(seg));
  const ay = readY(readSegmentA(seg));
  const dx = readX(readSegmentB(seg)) - ax;
  const dy = readY(readSegmentB(seg)) - ay;
  const lenSq = dx * dx + dy * dy;
  const qx = px - ax;
  const qy = py - ay;
  let distSq: number;
  if (lenSq === 0) {
    distSq = qx * qx + qy * qy;
  } else {
    const t = Math.max(0, Math.min(1, (qx * dx + qy * dy) / lenSq));
    const cx = t * dx - qx;
    const cy = t * dy - qy;
    distSq = cx * cx + cy * cy;
  }
  return distSq <= epsilon * epsilon;
}
