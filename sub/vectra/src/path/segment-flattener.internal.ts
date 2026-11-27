import type { PointWritable } from '../types/flat-shapes.internal';
import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import type { CenterArcWritable, PathMeasurementOptions } from '../types/index';
import { cubicCurveFromSegment, quadraticCurveFromSegment, type DrawSegment } from './path-segments.internal';

/**
 * drawing segment를 flatten polyline으로 바꾸는 재사용 도구.
 * `createSegmentFlattener`가 만든다.
 */
export interface SegmentFlattener {
  /**
   * segment를 flatten한 polyline을 반환한다.
   *
   * - line / close: 시작점과 끝점 2개
   * - quadratic / cubic / arc: 시작점부터 끝점까지 flatten한 점들
   *
   * 반환 배열은 flattener가 소유한 재사용 buffer다.
   * 다음 `flatten` 호출에서 덮어써진다.
   * 호출자는 배열을 보관하지 않는다. 오래 쓸 값은 복사한다.
   */
  flatten(seg: DrawSegment): PointWritable[];

  /**
   * 마지막 arc segment의 endpoint→center 변환 결과.
   * arc `flatten` 직후에만 유효하다. 다른 kind를 flatten해도 값은 그대로 남는다.
   * split처럼 center form이 필요한 호출자가 읽는다.
   */
  readonly centerArc: CenterArcWritable;
}

/**
 * segment flatten 정책을 한곳에 모은 flattener를 만든다.
 *
 * - `flatness` 기본값은 0.5, `maxRecursion` 기본값은 32다. 이 module만 기본값을 채운다.
 * - 옵션을 생략한 경우에 기본값을 쓴다.
 * - flatten buffer와 arc center buffer를 함수 로컬로 소유한다. 모듈 레벨 상태는 없다.
 *
 * @param options flatten 허용 오차와 subdivision 깊이 상한
 */
export function createSegmentFlattener(options?: PathMeasurementOptions): SegmentFlattener {
  const { flatness, maxRecursion } = options ?? { flatness: 0.5, maxRecursion: 32 };
  const flatOpts = { flatness, maxRecursion };
  const segBuf: PointWritable[] = [];
  const centerArc: CenterArcWritable = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  };

  function flatten(seg: DrawSegment): PointWritable[] {
    if (seg.kind === 'line') {
      segBuf.length = 0;
      segBuf.push({ x: seg.fromX, y: seg.fromY });
      segBuf.push({ x: seg.command.x, y: seg.command.y });
    } else if (seg.kind === 'close') {
      segBuf.length = 0;
      segBuf.push({ x: seg.fromX, y: seg.fromY });
      segBuf.push({ x: seg.subpathStartX, y: seg.subpathStartY });
    } else if (seg.kind === 'quadratic') {
      quadraticFlattenInto(segBuf, quadraticCurveFromSegment(seg), flatOpts);
    } else if (seg.kind === 'cubic') {
      cubicFlattenInto(segBuf, cubicCurveFromSegment(seg), flatOpts);
    } else {
      endpointArcToCenterInto(centerArc, { x: seg.fromX, y: seg.fromY }, seg.command);
      arcFlattenInto(segBuf, centerArc, flatOpts);
    }
    return segBuf;
  }

  return { flatten, centerArc };
}
