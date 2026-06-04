import { polylineTotalLength } from '../internal/polyline';
import type { CenterArcWritable, PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import type { DrawSegment } from './path-segments.internal';
import { createCenterArcBuf, flattenDrawSegmentInto, forEachDrawSegment } from './path-segments.internal';

function drawSegmentHasFiniteMeasurementInput(seg: DrawSegment): boolean {
  if (!Number.isFinite(seg.fromX) || !Number.isFinite(seg.fromY)) return false;

  if (seg.kind === 'line') {
    return Number.isFinite(seg.command.x) && Number.isFinite(seg.command.y);
  }
  if (seg.kind === 'close') {
    return Number.isFinite(seg.subpathStartX) && Number.isFinite(seg.subpathStartY);
  }
  if (seg.kind === 'quadratic') {
    const cmd = seg.command;
    return Number.isFinite(cmd.x1) && Number.isFinite(cmd.y1) && Number.isFinite(cmd.x) && Number.isFinite(cmd.y);
  }
  if (seg.kind === 'cubic') {
    const cmd = seg.command;
    return (
      Number.isFinite(cmd.x1) &&
      Number.isFinite(cmd.y1) &&
      Number.isFinite(cmd.x2) &&
      Number.isFinite(cmd.y2) &&
      Number.isFinite(cmd.x) &&
      Number.isFinite(cmd.y)
    );
  }

  const cmd = seg.command;
  return (
    Number.isFinite(cmd.rx) &&
    Number.isFinite(cmd.ry) &&
    Number.isFinite(cmd.xRotation) &&
    Number.isFinite(cmd.x) &&
    Number.isFinite(cmd.y)
  );
}

/**
 * path의 drawing segment 수를 반환한다.
 *
 * MoveCommand는 segment를 만들지 않으므로 포함하지 않는다. close/quadratic/cubic/arc가 drawing
 * segment로 들어가면 각각 1개로 센다. 좌표를 flatten하지 않으므로 weight 구조 검증처럼 geometry
 * measurement 전에 끝나야 하는 분기에 사용한다.
 *
 * @param commands segment 수를 셀 path command sequence
 */
export function drawingSegmentCount(commands: readonly PathCommand[]): number {
  let count = 0;
  forEachDrawSegment(commands, () => {
    count++;
  });
  return count;
}

/**
 * path의 drawing segment별 arc-length를 순서대로 배열로 반환한다.
 *
 * MoveCommand는 segment를 만들지 않으므로 결과에 포함되지 않는다. close/quadratic/cubic/arc가
 * drawing segment로 들어가면 각각 1개 entry를 가진다. finite command의 length는 default
 * flatten(`flatness=0.5`, `maxRecursion=32`)으로 계산하며 `path.length`/`path.pointAtLengthInto`와
 * 동일 flatten 정책이라 누적 offset이 일관되게 매핑된다.
 *
 * 결과 배열의 합은 finite command sequence에서 `path.length`와 같고, 길이는 drawing segment count다.
 * NaN/Infinity command는 flatten에 진입하지 않고 해당 segment length를 non-finite로 전파한다.
 *
 * @param commands arc-length를 계산할 path command sequence
 * @param options flatten 허용 오차와 subdivision 깊이 상한
 */
export function drawingSegmentLengths(commands: readonly PathCommand[], options?: PathMeasurementOptions): number[] {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  // segment별 flatten 결과를 담는 함수 로컬 임시 버퍼 — 모듈 레벨 상태 금지
  const segBuf: XYObjectWritable[] = [];
  // arc endpoint→center 변환 결과를 담는 함수 로컬 재사용 구조체
  const centerArcBuf: CenterArcWritable = createCenterArcBuf();

  const lengths: number[] = [];
  forEachDrawSegment(commands, (seg) => {
    if (!drawSegmentHasFiniteMeasurementInput(seg)) {
      lengths.push(Number.NaN);
      return;
    }

    flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
    lengths.push(polylineTotalLength(segBuf));
  });

  return lengths;
}
