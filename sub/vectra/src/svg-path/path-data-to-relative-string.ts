/**
 * canonical absolute PathCommand[] → relative (lowercase) SVG path data string 직렬화.
 *
 * domain barrel(./index)을 import하지 않는다.
 */

import type { PathCommand, SvgPathStringifyOptions } from '../types/index';
import { formatArcPrefix, formatNumber } from './svg-path-format.internal';

/** serializer가 추적하는 path state */
interface RelativeSerializeState {
  /** current point x */
  cx: number;
  /** current point y */
  cy: number;
  /** 현재 subpath 시작 x (close 후 복원에 사용) */
  startX: number;
  /** 현재 subpath 시작 y */
  startY: number;
}

/**
 * 단일 PathCommand를 relative SVG path segment 문자열로 변환하고 state를 갱신한다.
 *
 * @param cmd 변환할 PathCommand
 * @param state current point와 subpath start. 호출 후 갱신된다.
 * @param precision formatNumber에 전달할 소수점 자릿수
 * @returns relative command 문자열 (예: "m 10 20", "z")
 */
function serializeCommand(cmd: PathCommand, state: RelativeSerializeState, precision: number | undefined): string {
  const f = (n: number): string => formatNumber(n, precision);

  switch (cmd.kind) {
    case 'move': {
      const dx = cmd.x - state.cx;
      const dy = cmd.y - state.cy;
      state.cx = cmd.x;
      state.cy = cmd.y;
      // move는 새 subpath의 시작점이 된다
      state.startX = cmd.x;
      state.startY = cmd.y;
      return `m ${f(dx)} ${f(dy)}`;
    }

    case 'line': {
      const dx = cmd.x - state.cx;
      const dy = cmd.y - state.cy;
      state.cx = cmd.x;
      state.cy = cmd.y;
      return `l ${f(dx)} ${f(dy)}`;
    }

    case 'quadratic': {
      // control point도 command 시작점(current) 기준 상대 좌표로 출력한다
      const dx1 = cmd.x1 - state.cx;
      const dy1 = cmd.y1 - state.cy;
      const dx = cmd.x - state.cx;
      const dy = cmd.y - state.cy;
      state.cx = cmd.x;
      state.cy = cmd.y;
      return `q ${f(dx1)} ${f(dy1)} ${f(dx)} ${f(dy)}`;
    }

    case 'cubic': {
      const dx1 = cmd.x1 - state.cx;
      const dy1 = cmd.y1 - state.cy;
      const dx2 = cmd.x2 - state.cx;
      const dy2 = cmd.y2 - state.cy;
      const dx = cmd.x - state.cx;
      const dy = cmd.y - state.cy;
      state.cx = cmd.x;
      state.cy = cmd.y;
      return `c ${f(dx1)} ${f(dy1)} ${f(dx2)} ${f(dy2)} ${f(dx)} ${f(dy)}`;
    }

    case 'arc': {
      const dx = cmd.x - state.cx;
      const dy = cmd.y - state.cy;
      state.cx = cmd.x;
      state.cy = cmd.y;
      return `a ${formatArcPrefix(cmd, precision)} ${f(dx)} ${f(dy)}`;
    }

    case 'close': {
      // Z 이후 current point는 subpath start로 복원
      state.cx = state.startX;
      state.cy = state.startY;
      return 'z';
    }
  }
}

/**
 * canonical absolute PathCommand[] 배열을 relative SVG path data string으로 직렬화한다.
 *
 * - 출력은 m/l/q/c/a/z lowercase command만 포함한다. 절대 shorthand(`S/T/H/V`)는 출력하지 않는다.
 * - current point 초기값은 `(0, 0)`이다. 첫 move는 `(0, 0)` 기준 dx dy로 출력된다.
 * - close 이후 current point는 현재 subpath 시작점(`MoveCommand` 위치)으로 복원된다.
 * - Q/C/A의 control point와 arc endpoint는 command 시작점(current point) 기준 상대 좌표이다.
 * - `ArcCommand.xRotation`(radian)은 degree로 변환하여 출력한다.
 * - `largeArc/sweep` boolean은 `"1"/"0"`으로 출력한다.
 * - `NaN` 또는 `Infinity` field는 `""` (빈 문자열)로 출력한다. caller가 upstream에서 검증해야 한다.
 * - command 사이는 single space로 구분한다.
 * - input `commands`를 mutate하지 않는다.
 *
 * @param commands 직렬화할 PathCommand 배열
 * @param options 포맷팅 옵션 (precision: 소수점 자릿수)
 * @returns relative SVG path data string (빈 배열이면 `""`)
 */
export function pathDataToRelativeString(commands: readonly PathCommand[], options?: SvgPathStringifyOptions): string {
  if (commands.length === 0) return '';

  const precision = options?.precision;
  const state: RelativeSerializeState = { cx: 0, cy: 0, startX: 0, startY: 0 };
  const parts: string[] = [];

  for (const cmd of commands) {
    parts.push(serializeCommand(cmd, state, precision));
  }

  return parts.join(' ');
}
