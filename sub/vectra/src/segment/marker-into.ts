import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, SegmentMarkerOptions, XYObjectWritable } from '../types';

const DEFAULT_LENGTH = 10;
const DEFAULT_WIDTH = 8;

/** finite positive가 아니면 RangeError로 fail-fast한다. */
function requireFinitePositive(value: number, name: string): void {
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError(`segment.markerInto: ${name}는 finite positive number여야 한다 (받음: ${value})`);
  }
}

/** marker type literal이 아니면 RangeError로 fail-fast한다. */
function requireMarkerType(value: string): asserts value is 'arrow' | 'tick' {
  if (value !== 'arrow' && value !== 'tick') {
    throw new RangeError(`segment.markerInto: type은 "arrow" 또는 "tick"이어야 한다 (받음: ${String(value)})`);
  }
}

/** marker endpoint literal이 아니면 RangeError로 fail-fast한다. */
function requireMarkerAt(value: string): asserts value is 'end' | 'start' | 'both' {
  if (value !== 'end' && value !== 'start' && value !== 'both') {
    throw new RangeError(`segment.markerInto: at은 "end", "start", "both" 중 하나여야 한다 (받음: ${String(value)})`);
  }
}

/**
 * endpoint marker geometry point를 outPoints에 push한다.
 *
 * `ux/uy`는 marker가 향하는 단위 방향, `nx/ny`는 그 수직 단위 방향이다.
 * arrow는 `[leftBarb, tip, rightBarb]` chevron 3점, tick은 endpoint 중심 perpendicular 2점이다.
 */
function pushMarkerPoints(
  outPoints: XYObjectWritable[],
  tipX: number,
  tipY: number,
  ux: number,
  uy: number,
  nx: number,
  ny: number,
  type: 'arrow' | 'tick',
  length: number,
  width: number
): void {
  if (type === 'tick') {
    const half = length / 2;
    outPoints.push({ x: tipX + half * nx, y: tipY + half * ny });
    outPoints.push({ x: tipX - half * nx, y: tipY - half * ny });
    return;
  }
  const baseX = tipX - length * ux;
  const baseY = tipY - length * uy;
  const half = width / 2;
  outPoints.push({ x: baseX + half * nx, y: baseY + half * ny });
  outPoints.push({ x: tipX, y: tipY });
  outPoints.push({ x: baseX - half * nx, y: baseY - half * ny });
}

/**
 * segment endpoint marker geometry point를 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * renderer/state와 무관한 순수 point geometry만 만든다. outPoints는 먼저 clear된 뒤 새 plain
 * `{ x, y }` point가 push된다. `at: "both"`는 start marker point를 먼저, 이어서 end marker point를
 * push한다. arrow는 endpoint당 `[leftBarb, tip, rightBarb]` 3점, tick은 endpoint 중심
 * perpendicular 2점을 push한다.
 *
 * marker 방향 기준: `at: "end"`는 `a → b` 방향으로 tip을 `b`에 둔다. `at: "start"`는 `b → a`
 * 방향으로 tip을 `a`에 둔다. perpendicular 법선은 marker 방향의 좌측(`(-uy, ux)`)이다.
 *
 * zero-length segment나 non-finite 좌표(NaN/±Infinity) segment는 방향이 정의되지 않으므로 빈
 * array를 반환한다(그릴 marker 없음). `length`/`width`가 finite positive가 아니면 `RangeError`로
 * fail-fast한다(zero-length/non-finite 검사보다 먼저 검증한다). `type`/`at`이 허용 literal이 아니면
 * `RangeError`를 던진다. input/output aliasing이 가능하므로 source 좌표를 clear 전에 snapshot한다.
 *
 * @param outPoints marker point를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param line marker를 만들 segment
 * @param options marker type/at/length/width 옵션. 생략 시 end arrow, length 10, width 8
 */
export function markerInto(
  outPoints: XYObjectWritable[],
  line: SegmentLike,
  options?: SegmentMarkerOptions
): XYObjectWritable[] {
  const type = options?.type ?? 'arrow';
  const at = options?.at ?? 'end';
  const length = options?.length ?? DEFAULT_LENGTH;
  const width = options?.width ?? DEFAULT_WIDTH;
  requireMarkerType(type);
  requireMarkerAt(at);
  requireFinitePositive(length, 'length');
  requireFinitePositive(width, 'width');

  // aliasing 안전: clear 전에 source 좌표를 snapshot한다.
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);

  outPoints.length = 0;
  // zero-length segment는 방향이 없고, non-finite 좌표(NaN/±Infinity)는 valid 방향을 만들 수
  // 없으므로 그릴 marker가 없다.
  if (!(len > 0) || !Number.isFinite(len)) return outPoints;

  const ux = dx / len;
  const uy = dy / len;

  if (at === 'start' || at === 'both') {
    // start marker는 b → a 방향으로 tip을 a에 둔다.
    pushMarkerPoints(outPoints, ax, ay, -ux, -uy, uy, -ux, type, length, width);
  }
  if (at === 'end' || at === 'both') {
    // end marker는 a → b 방향으로 tip을 b에 둔다.
    pushMarkerPoints(outPoints, bx, by, ux, uy, -uy, ux, type, length, width);
  }
  return outPoints;
}
