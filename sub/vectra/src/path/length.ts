import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import { polylineTotalLength } from '../internal/polyline';
import type { CenterArcWritable, PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';

/**
 * path commands의 총 arc-length를 반환한다.
 *
 * 내부적으로 drawing segment별로 arc-length를 합산한다.
 * MoveCommand는 arc-length에 기여하지 않으므로 다중 subpath 간 gap은 포함되지 않는다.
 * empty path, move-only path는 0을 반환한다.
 *
 * @param commands arc-length를 계산할 path command sequence
 * @param options flatten 허용 오차와 subdivision 깊이 상한
 * @returns path의 총 arc-length (단위: 좌표 단위)
 */
export function length(commands: readonly PathCommand[], options?: PathMeasurementOptions): number {
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

  let total = 0;

  forEachDrawSegment(commands, (seg) => {
    if (seg.kind === 'line') {
      // line segment: 두 endpoint 사이 유클리드 거리
      total += Math.hypot(seg.command.x - seg.fromX, seg.command.y - seg.fromY);
    } else if (seg.kind === 'close') {
      // close segment: current → subpath start 사이 유클리드 거리
      total += Math.hypot(seg.subpathStartX - seg.fromX, seg.subpathStartY - seg.fromY);
    } else if (seg.kind === 'quadratic') {
      const cmd = seg.command;
      quadraticFlattenInto(
        segBuf,
        { x: seg.fromX, y: seg.fromY },
        { x: cmd.x1, y: cmd.y1 },
        { x: cmd.x, y: cmd.y },
        flatOpts
      );
      total += polylineTotalLength(segBuf);
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
      total += polylineTotalLength(segBuf);
    } else if (seg.kind === 'arc') {
      // endpoint form → center form 변환 후 flatten하여 arc-length 계산
      endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
      arcFlattenInto(segBuf, centerArcBuf, flatOpts);
      total += polylineTotalLength(segBuf);
    }
  });

  return total;
}
