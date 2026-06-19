import type { PathCommand } from '../types/index';
import type { DrawSegment } from './path-segments.internal';
import { splitLineEndpoint } from './path-slice-shared.internal';

/**
 * line/close curve type의 split writer. segment를 t 위치에서 둘로 나눠 outA/outB에 push한다.
 */

export function writeLineSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'line' },
  t: number
): void {
  const mid = splitLineEndpoint(seg.fromX, seg.fromY, seg.command.x, seg.command.y, t);
  outA.push({ kind: 'line', x: mid.x, y: mid.y });
  outB.push({ kind: 'move', x: mid.x, y: mid.y });
  outB.push({ kind: 'line', x: seg.command.x, y: seg.command.y });
}

export function writeCloseSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'close' },
  t: number
): void {
  const mid = splitLineEndpoint(seg.fromX, seg.fromY, seg.subpathStartX, seg.subpathStartY, t);
  // outA는 split 지점까지의 line만, outB는 split 지점에서 시작해 subpath start로 가는
  // line + 원본 close (close는 이미 subpath start에 도달했으므로 zero-length no-op)
  outA.push({ kind: 'line', x: mid.x, y: mid.y });
  outB.push({ kind: 'move', x: mid.x, y: mid.y });
  outB.push({ kind: 'line', x: seg.subpathStartX, y: seg.subpathStartY });
  outB.push(seg.command);
}
