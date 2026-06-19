import { polylineTotalLength } from '../internal/polyline';
import type { CenterArcWritable, PathCommand, XYObjectWritable } from '../types/index';
import { type DrawSegment, flattenDrawSegmentInto } from './path-segments.internal';

/**
 * splitAtLengthInto에서 두 path command sequence(outA, outB)를 만들기 위한 path-local
 * slicing 공유 helper. public domain barrel은 사용하지 않고, curve domain의 t-at-length /
 * split helper를 직접 호출한다.
 */

/**
 * line segment를 t 위치에서 split해 두 line endpoint를 만든다.
 *
 * `t`는 segment의 두 endpoint를 잇는 직선 비례 위치다 (curve t와 동일 의미).
 */
export function splitLineEndpoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  t: number
): { x: number; y: number } {
  return { x: fromX + t * (toX - fromX), y: fromY + t * (toY - fromY) };
}

export function measureSegmentLength(
  seg: DrawSegment,
  segBuf: XYObjectWritable[],
  centerArcBuf: CenterArcWritable,
  flatOpts: { flatness: number; maxRecursion: number }
): number {
  flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
  return polylineTotalLength(segBuf);
}

export function appendCommandsBeforeSegment(
  outA: PathCommand[],
  commands: readonly PathCommand[],
  scanIndex: number,
  seg: DrawSegment
): number {
  let nextIndex = scanIndex;
  while (nextIndex < commands.length && commands[nextIndex] !== seg.command) {
    outA.push(commands[nextIndex]);
    nextIndex += 1;
  }
  return nextIndex;
}

export function appendRemainingCommands(
  outB: PathCommand[],
  commands: readonly PathCommand[],
  splitIndex: number
): void {
  for (let i = splitIndex; i < commands.length; i++) {
    outB.push(commands[i]);
  }
}
