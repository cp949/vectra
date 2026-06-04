import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import { pointDist, polylineTotalLength } from '../internal/polyline';
import type {
  CenterArcWritable,
  PathCommand,
  PathMeasurementOptions,
  PathPropertiesResult,
  XYObjectWritable,
} from '../types/index';
import type { DrawSegment } from './path-segments.internal';
import { forEachDrawSegment } from './path-segments.internal';

/**
 * segment의 flatten polyline을 segBuf에 구성한다.
 *
 * - line/close: 시작점과 끝점 2개 push
 * - quadratic/cubic/arc: flatten 함수가 out.length=0 후 시작점부터 끝점까지 push
 */
function buildSegmentPoints(
  segBuf: XYObjectWritable[],
  seg: DrawSegment,
  flatOpts: { flatness: number; maxRecursion: number },
  centerArcBuf: CenterArcWritable
): void {
  if (seg.kind === 'line') {
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.command.x, y: seg.command.y });
  } else if (seg.kind === 'close') {
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.subpathStartX, y: seg.subpathStartY });
  } else if (seg.kind === 'quadratic') {
    const cmd = seg.command;
    quadraticFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'cubic') {
    const cmd = seg.command;
    cubicFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x2, y: cmd.y2 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'arc') {
    endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
    arcFlattenInto(segBuf, centerArcBuf, flatOpts);
  }
}

/** segment polyline의 두 점을 잇는 edge 방향을 단위 벡터로 result에 기록한다. */
function writeTangent(result: PathPropertiesResult, ax: number, ay: number, bx: number, by: number): void {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    // zero-length edge: tangent 정의 불가. zero vector를 기록한다. caller 책임.
    result.tangentX = 0;
    result.tangentY = 0;
  } else {
    result.tangentX = dx / len;
    result.tangentY = dy / len;
  }
  result.angle = Math.atan2(result.tangentY, result.tangentX);
}

/**
 * segment polyline에서 localTarget 위치의 점과 그 점이 놓인 edge 방향을 result에 기록한다.
 * 호출자가 points.length >= 2를 보장한다. 마지막 edge까지 누적이 모자라도 마지막 edge에서 보간한다.
 */
function sampleSegment(result: PathPropertiesResult, points: readonly XYObjectWritable[], localTarget: number): void {
  const n = points.length;
  let acc = 0;
  for (let i = 1; i < n; i++) {
    const ax = points[i - 1].x;
    const ay = points[i - 1].y;
    const bx = points[i].x;
    const by = points[i].y;
    const edgeLen = pointDist(ax, ay, bx, by);
    if (i === n - 1 || acc + edgeLen >= localTarget) {
      const t = edgeLen === 0 ? 0 : Math.max(0, Math.min(1, (localTarget - acc) / edgeLen));
      result.x = ax + t * (bx - ax);
      result.y = ay + t * (by - ay);
      writeTangent(result, ax, ay, bx, by);
      return;
    }
    acc += edgeLen;
  }
}

/**
 * path start로부터 distance 위치의 point·접선·draw segment index를 반환한다.
 *
 * draw segment가 없으면 (empty path, Move-only) undefined를 반환한다.
 * distance는 [0, totalLength]로 clamp된다.
 * `distance <= 0` → 첫 draw segment 시작점, `distance >= totalLength` → 마지막 draw segment 끝점.
 * `segmentIndex`는 `forEachDrawSegment` 순회 순서 기준 0-based index다.
 * MoveCommand와 no-op CloseCommand는 visitor 미호출이므로 index에서 제외된다.
 *
 * 접선은 segment를 flatten한 polyline에서 sample 점이 놓인 edge 방향의 단위 벡터다.
 * line/close는 두 endpoint 방향, quadratic/cubic/arc는 flatten edge 방향을 사용한다.
 * zero-length edge에서는 tangent를 정의할 수 없으므로 zero vector를 기록한다 (caller 책임).
 * `angle`은 `atan2(tangentY, tangentX)` radian이다.
 *
 * @param commands 측정할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function propertiesAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): PathPropertiesResult | undefined {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  // segment별 flatten polyline을 담는 함수 로컬 임시 버퍼 — 모듈 레벨 상태 금지
  const segBuf: XYObjectWritable[] = [];
  // distance >= totalLength 처리를 위한 마지막 segment polyline 스냅샷
  const lastBuf: XYObjectWritable[] = [];
  const centerArcBuf: CenterArcWritable = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  };

  const result: PathPropertiesResult = { x: 0, y: 0, tangentX: 0, tangentY: 0, angle: 0, segmentIndex: 0 };

  let drawIndex = -1;
  let cumulativeLen = 0;
  let found = false;
  let lastSegmentIndex = -1;

  forEachDrawSegment(commands, (seg) => {
    if (found) return;

    drawIndex += 1;
    buildSegmentPoints(segBuf, seg, flatOpts, centerArcBuf);

    const segLen = polylineTotalLength(segBuf);

    // distance <= 0은 첫 segment 시작점. 내부 segment 경계는 다음 segment 시작점으로 귀속한다.
    if (distance <= 0 || distance < cumulativeLen + segLen) {
      const localTarget = Math.max(0, distance - cumulativeLen);
      result.segmentIndex = drawIndex;
      sampleSegment(result, segBuf, localTarget);
      found = true;
      return;
    }

    cumulativeLen += segLen;
    // distance >= totalLength 대비 마지막 segment polyline 보존
    lastBuf.length = 0;
    for (const p of segBuf) lastBuf.push({ x: p.x, y: p.y });
    lastSegmentIndex = drawIndex;
  });

  // drawing segment가 없는 empty / move-only path
  if (drawIndex < 0) return undefined;

  if (!found) {
    // distance >= totalLength → 마지막 draw segment 끝점 properties
    result.segmentIndex = lastSegmentIndex;
    sampleSegment(result, lastBuf, Number.POSITIVE_INFINITY);
  }

  return result;
}
