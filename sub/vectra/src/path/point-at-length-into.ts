import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import { polylineSampleAtLengthInto, polylineTotalLength } from '../internal/polyline';
import { writeXY } from '../internal/xy';
import type {
  CenterArcWritable,
  PathCommand,
  PathMeasurementOptions,
  XYObjectWritable,
  XYWritable,
} from '../types/index';
import type { DrawSegment } from './path-segments.internal';
import { forEachDrawSegment } from './path-segments.internal';

/**
 * segment의 flatten 결과를 segBuf에 기록하는 private helper.
 *
 * - line/close: 시작점과 끝점 2개 push
 * - quadratic/cubic/arc: flatten 함수가 out.length=0 후 시작점부터 끝점까지 push
 *
 * @param segBuf flatten 결과를 기록할 배열 (기존 내용은 덮어쓰인다)
 * @param seg 처리할 drawing segment
 * @param flatOpts flatten flatness / maxRecursion 옵션
 * @param centerArcBuf arc endpoint→center 변환용 재사용 버퍼
 */
function buildSegmentPoints(
  segBuf: XYObjectWritable[],
  seg: DrawSegment,
  flatOpts: { flatness: number; maxRecursion: number },
  centerArcBuf: CenterArcWritable
): void {
  if (seg.kind === 'line') {
    // line: 시작점과 끝점 두 개로 구성
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.command.x, y: seg.command.y });
  } else if (seg.kind === 'close') {
    // close: current → subpath start
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.subpathStartX, y: seg.subpathStartY });
  } else if (seg.kind === 'quadratic') {
    const cmd = seg.command;
    // quadraticFlattenInto가 out.length=0 후 시작점부터 끝점까지 push
    quadraticFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'cubic') {
    const cmd = seg.command;
    // cubicFlattenInto가 out.length=0 후 시작점부터 끝점까지 push
    cubicFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x2, y: cmd.y2 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'arc') {
    // endpoint form → center form 변환 후 arcFlattenInto로 push
    endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
    arcFlattenInto(segBuf, centerArcBuf, flatOpts);
  }
}

/**
 * path의 arc-length offset 위치에 해당하는 point를 out에 기록한다.
 *
 * distance는 [0, totalLength]로 clamp된다.
 * MoveCommand는 arc-length에 기여하지 않으므로 다중 subpath 간 gap은 포함되지 않는다.
 * empty path(drawing segment 없음)이면 false를 반환하고 out을 수정하지 않는다.
 * distance <= 0이면 첫 번째 drawing segment의 시작점을 기록한다.
 *
 * @param out point를 기록할 writable output
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 허용 오차와 subdivision 깊이 상한
 * @returns 기록 성공 시 true, drawing segment 없으면 false
 */
export function pointAtLengthInto(
  out: XYWritable,
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): boolean {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  // segment별 flatten 결과를 담는 함수 로컬 임시 버퍼 — 모듈 레벨 상태 금지
  const segBuf: XYObjectWritable[] = [];
  // arc endpoint→center 변환 결과를 담는 함수 로컬 재사용 구조체
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

  let hasDrawing = false;
  let cumulativeLen = 0;
  let found = false;
  // distance >= totalLength 처리를 위해 마지막 점을 추적
  let lastX = 0;
  let lastY = 0;

  forEachDrawSegment(commands, (seg) => {
    // 이미 target을 찾은 경우 나머지 segment는 skip
    if (found) return;

    hasDrawing = true;

    // 이 segment의 flatten 결과를 segBuf에 구성
    buildSegmentPoints(segBuf, seg, flatOpts, centerArcBuf);

    const segLen = polylineTotalLength(segBuf);

    // distance <= 0 이거나 이 segment 범위 내에 target이 있으면 이 segment에서 sampling
    if (distance <= cumulativeLen + segLen) {
      const localTarget = Math.max(0, distance - cumulativeLen);
      if (segLen === 0) {
        // zero-length segment → 시작점 기록
        writeXY(out, segBuf[0].x, segBuf[0].y);
      } else {
        polylineSampleAtLengthInto(out, segBuf, localTarget);
      }
      found = true;
      return;
    }

    cumulativeLen += segLen;
    // distance >= totalLength 처리를 위해 마지막 점 저장
    const last = segBuf[segBuf.length - 1];
    lastX = last.x;
    lastY = last.y;
  });

  // drawing segment가 없는 empty/move-only path
  if (!hasDrawing) return false;

  if (!found) {
    // distance >= totalLength → 마지막 점 기록
    writeXY(out, lastX, lastY);
  }

  return true;
}
