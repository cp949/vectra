import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, PathCommand } from '../types/index';

/** `fromEllipseInto` / `fromEllipse` 옵션. */
export interface PathFromEllipseOptions {
  /** sample 개수. 1 이상 정수. 기본 `64`. */
  segments?: number;
  /** 첫 sample 각도, radian. 기본 `0` (+x 축). */
  startAngle?: number;
  /** true = SVG y-down clockwise. 기본 `true`. */
  clockwise?: boolean;
}

/**
 * ellipse를 angle-uniform polygonal approximation으로 변환하여 out에 기록하고 out을 반환한다.
 *
 * 결과 구성: `Move(첫 점) + Line × (segments - 1) + Close`, 총 `segments + 1` command.
 *
 * 공식: `cx + cos(θ) * radiusX`, `cy + sin(θ) * radiusY`. arc-length uniform이 아니라 parametric
 * angle uniform이다. 한쪽 radius가 훨씬 크면 sample 간격이 불균등해진다. `ellipse.pointsInto`와
 * 동일 sampling 전략이다.
 *
 * `ellipseCommandsInto`는 4 cubic Bezier 근사로 ellipse를 매끄럽게 표현한다. 이 함수는 polygonal
 * approximation이라 cubic 근사와는 다른 함수다. caller가 segment 개수를 직접 제어하고 싶을 때 쓴다.
 *
 * - `segments` validation: `Number.isInteger && segments >= 1`이 아니면 `RangeError`. `out`은 수정하지
 *   않는다 (`out.length = 0`도 수행하지 않음).
 * - 기본값: `segments = 64`, `startAngle = 0`, `clockwise = true`.
 * - empty ellipse(`radiusX <= 0 || radiusY <= 0`) → out clear만. polygonal approximation이라 zero-extent
 *   입력에는 빈 path가 일관적이다. `pointsInto`는 center 좌표를 segments만큼 기록하는 정책이지만,
 *   path domain에서는 빈 path를 반환한다.
 * - non-finite center/radii/startAngle은 비교/산술 결과 NaN을 그대로 좌표에 전파한다. throw 없음.
 *
 * `out.length = 0` 후 push 방식으로 채운다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param ellipse 변환할 ellipse input
 * @param options segments / startAngle / clockwise
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromEllipseInto<Out extends PathCommand[]>(
  out: Out,
  ellipse: EllipseLike,
  options?: PathFromEllipseOptions
): Out {
  const segments = options?.segments ?? 64;
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('fromEllipseInto: segments must be an integer >= 1');
  }

  const startAngle = options?.startAngle ?? 0;
  const clockwise = options?.clockwise ?? true;
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);

  out.length = 0;

  if (rx <= 0 || ry <= 0) {
    return out;
  }

  const step = ((clockwise ? 1 : -1) * (2 * Math.PI)) / segments;

  // 첫 점은 MoveCommand
  const firstX = cx + Math.cos(startAngle) * rx;
  const firstY = cy + Math.sin(startAngle) * ry;
  out.push({ kind: 'move', x: firstX, y: firstY } as Out[number]);

  for (let i = 1; i < segments; i++) {
    const angle = startAngle + step * i;
    out.push({ kind: 'line', x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry } as Out[number]);
  }

  out.push({ kind: 'close' } as Out[number]);
  return out;
}
