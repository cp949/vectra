import type { PathCommand } from '../types/index';
import { NO_SHORTHAND, readFlag, readNum } from './svg-path-tokenizer.internal';

/** 반사 상태 타입 */
type ShorthandState =
  | typeof NO_SHORTHAND
  | { prevX2: number; prevY2: number } // C/S 이후
  | { prevX1: number; prevY1: number }; // Q/T 이후

/** 파서 내부 상태 */
interface ParserState {
  /** 현재 x 좌표 */
  cx: number;
  /** 현재 y 좌표 */
  cy: number;
  /** 현재 subpath 시작 x (Z 이후 복원에 사용) */
  subpathStartX: number;
  /** 현재 subpath 시작 y */
  subpathStartY: number;
  /** 현재 command letter */
  cmd: string;
  /** S/T 반사 상태 */
  shorthand: ShorthandState;
  /** subpath가 시작되었는지 여부 */
  hasSubpath: boolean;
}

/**
 * token 배열을 순회하여 canonical absolute PathCommand[]로 변환한다.
 *
 * strict와 loose 두 모드의 공통 파싱 본문이다. 차이는 실패 처리뿐이다.
 * - `'strict'`: 실패 지점에서 즉시 `null`을 반환한다 (전체 실패).
 * - `'loose'`: 실패 지점에서 루프를 중단하고 그때까지 수집된 result를 반환한다
 *   (partial success). 이 모드는 `null`을 반환하지 않는다.
 *
 * 실패 지점은 unknown command letter, M/m 파라미터 부족, subpath 없는 상태의 non-M
 * command, subpath 없는 상태의 숫자 반복, processCommand 실패다.
 *
 * @param tokens canonical 변환 대상 token 배열
 * @param mode 실패 처리 정책. `'strict'`는 전체 실패, `'loose'`는 partial success
 */
function parseTokensCore(tokens: string[], mode: 'strict' | 'loose'): PathCommand[] | null {
  const result: PathCommand[] = [];
  const state: ParserState = {
    cx: 0,
    cy: 0,
    subpathStartX: 0,
    subpathStartY: 0,
    cmd: '',
    shorthand: NO_SHORTHAND,
    hasSubpath: false,
  };

  const idx = { i: 0 };

  while (idx.i < tokens.length) {
    const tok = tokens[idx.i];

    // command letter 토큰이면 현재 command를 갱신한다
    if (/[A-Za-z]/.test(tok)) {
      // 지원하지 않는 command letter
      if (!/[MmZzLlHhVvCcSsQqTtAa]/.test(tok)) {
        if (mode === 'strict') return null;
        break;
      }
      state.cmd = tok;
      idx.i++;

      // Z/z는 파라미터가 없으므로 즉시 처리한다
      if (tok === 'Z' || tok === 'z') {
        result.push({ kind: 'close' });
        // Z 이후 current point를 subpath 시작점으로 복원한다
        state.cx = state.subpathStartX;
        state.cy = state.subpathStartY;
        // shorthand 상태를 초기화한다
        state.shorthand = NO_SHORTHAND;
        continue;
      }

      // M/m 이후 반복 처리: M은 두 번째부터 L, m은 l로 처리한다
      if (tok === 'M' || tok === 'm') {
        // 첫 pair 읽기
        const x = readNum(tokens, idx);
        const y = readNum(tokens, idx);
        // M/m 파라미터 부족
        if (x === null || y === null) {
          if (mode === 'strict') return null;
          break;
        }

        // subpath가 없는 상태에서 m은 절대 좌표로 처리한다 (SVG spec)
        const ax = tok === 'm' && state.hasSubpath ? state.cx + x : x;
        const ay = tok === 'm' && state.hasSubpath ? state.cy + y : y;

        result.push({ kind: 'move', x: ax, y: ay });
        state.cx = ax;
        state.cy = ay;
        state.subpathStartX = ax;
        state.subpathStartY = ay;
        state.hasSubpath = true;
        state.shorthand = NO_SHORTHAND;

        // M 이후 반복 pair는 L로, m 이후 반복 pair는 l로 처리한다
        state.cmd = tok === 'M' ? 'L' : 'l';
        continue;
      }

      // subpath가 없는 상태에서 M/m/Z/z 이외 command
      if (!state.hasSubpath) {
        if (mode === 'strict') return null;
        break;
      }
    } else {
      // 숫자 token: 현재 command를 반복한다
      // subpath 없는 상태에서 숫자 반복
      if (!state.hasSubpath && state.cmd !== '') {
        if (mode === 'strict') return null;
        break;
      }
    }

    // current command에 따라 파라미터를 읽고 command를 생성한다
    if (!processCommand(tokens, idx, state, result)) {
      if (mode === 'strict') return null;
      break;
    }
  }

  return result;
}

/**
 * token 배열을 순회하여 canonical absolute PathCommand[]로 변환한다.
 * 실패하면 null을 반환한다.
 */
export function parseTokens(tokens: string[]): PathCommand[] | null {
  return parseTokensCore(tokens, 'strict');
}

/**
 * 현재 command를 처리하여 result에 추가한다.
 * 실패하면 false를 반환한다.
 */
function processCommand(tokens: string[], idx: { i: number }, state: ParserState, result: PathCommand[]): boolean {
  const cmd = state.cmd;

  switch (cmd) {
    case 'L':
    case 'l': {
      const x = readNum(tokens, idx);
      const y = readNum(tokens, idx);
      if (x === null || y === null) return false;
      const ax = cmd === 'l' ? state.cx + x : x;
      const ay = cmd === 'l' ? state.cy + y : y;
      result.push({ kind: 'line', x: ax, y: ay });
      state.cx = ax;
      state.cy = ay;
      state.shorthand = NO_SHORTHAND;
      return true;
    }

    case 'H':
    case 'h': {
      const x = readNum(tokens, idx);
      if (x === null) return false;
      const ax = cmd === 'h' ? state.cx + x : x;
      result.push({ kind: 'line', x: ax, y: state.cy });
      state.cx = ax;
      state.shorthand = NO_SHORTHAND;
      return true;
    }

    case 'V':
    case 'v': {
      const y = readNum(tokens, idx);
      if (y === null) return false;
      const ay = cmd === 'v' ? state.cy + y : y;
      result.push({ kind: 'line', x: state.cx, y: ay });
      state.cy = ay;
      state.shorthand = NO_SHORTHAND;
      return true;
    }

    case 'Q':
    case 'q': {
      const x1r = readNum(tokens, idx);
      const y1r = readNum(tokens, idx);
      const xr = readNum(tokens, idx);
      const yr = readNum(tokens, idx);
      if (x1r === null || y1r === null || xr === null || yr === null) return false;
      const x1 = cmd === 'q' ? state.cx + x1r : x1r;
      const y1 = cmd === 'q' ? state.cy + y1r : y1r;
      const ax = cmd === 'q' ? state.cx + xr : xr;
      const ay = cmd === 'q' ? state.cy + yr : yr;
      result.push({ kind: 'quadratic', x1, y1, x: ax, y: ay });
      state.shorthand = { prevX1: x1, prevY1: y1 };
      state.cx = ax;
      state.cy = ay;
      return true;
    }

    case 'T':
    case 't': {
      const xr = readNum(tokens, idx);
      const yr = readNum(tokens, idx);
      if (xr === null || yr === null) return false;
      const ax = cmd === 't' ? state.cx + xr : xr;
      const ay = cmd === 't' ? state.cy + yr : yr;
      // 이전이 Q/T이면 control point를 반사한다
      let x1: number;
      let y1: number;
      if (state.shorthand !== NO_SHORTHAND && 'prevX1' in state.shorthand) {
        x1 = 2 * state.cx - state.shorthand.prevX1;
        y1 = 2 * state.cy - state.shorthand.prevY1;
      } else {
        x1 = state.cx;
        y1 = state.cy;
      }
      result.push({ kind: 'quadratic', x1, y1, x: ax, y: ay });
      state.shorthand = { prevX1: x1, prevY1: y1 };
      state.cx = ax;
      state.cy = ay;
      return true;
    }

    case 'C':
    case 'c': {
      const x1r = readNum(tokens, idx);
      const y1r = readNum(tokens, idx);
      const x2r = readNum(tokens, idx);
      const y2r = readNum(tokens, idx);
      const xr = readNum(tokens, idx);
      const yr = readNum(tokens, idx);
      if (x1r === null || y1r === null || x2r === null || y2r === null || xr === null || yr === null) return false;
      const x1 = cmd === 'c' ? state.cx + x1r : x1r;
      const y1 = cmd === 'c' ? state.cy + y1r : y1r;
      const x2 = cmd === 'c' ? state.cx + x2r : x2r;
      const y2 = cmd === 'c' ? state.cy + y2r : y2r;
      const ax = cmd === 'c' ? state.cx + xr : xr;
      const ay = cmd === 'c' ? state.cy + yr : yr;
      result.push({ kind: 'cubic', x1, y1, x2, y2, x: ax, y: ay });
      state.shorthand = { prevX2: x2, prevY2: y2 };
      state.cx = ax;
      state.cy = ay;
      return true;
    }

    case 'S':
    case 's': {
      const x2r = readNum(tokens, idx);
      const y2r = readNum(tokens, idx);
      const xr = readNum(tokens, idx);
      const yr = readNum(tokens, idx);
      if (x2r === null || y2r === null || xr === null || yr === null) return false;
      const x2 = cmd === 's' ? state.cx + x2r : x2r;
      const y2 = cmd === 's' ? state.cy + y2r : y2r;
      const ax = cmd === 's' ? state.cx + xr : xr;
      const ay = cmd === 's' ? state.cy + yr : yr;
      // 이전이 C/S이면 second control point를 반사한다
      let x1: number;
      let y1: number;
      if (state.shorthand !== NO_SHORTHAND && 'prevX2' in state.shorthand) {
        x1 = 2 * state.cx - state.shorthand.prevX2;
        y1 = 2 * state.cy - state.shorthand.prevY2;
      } else {
        x1 = state.cx;
        y1 = state.cy;
      }
      result.push({ kind: 'cubic', x1, y1, x2, y2, x: ax, y: ay });
      state.shorthand = { prevX2: x2, prevY2: y2 };
      state.cx = ax;
      state.cy = ay;
      return true;
    }

    case 'A':
    case 'a': {
      const rxRaw = readNum(tokens, idx);
      const ryRaw = readNum(tokens, idx);
      const xRotDeg = readNum(tokens, idx);
      const largeArc = readFlag(tokens, idx);
      const sweep = readFlag(tokens, idx);
      const xr = readNum(tokens, idx);
      const yr = readNum(tokens, idx);
      if (
        rxRaw === null ||
        ryRaw === null ||
        xRotDeg === null ||
        largeArc === null ||
        sweep === null ||
        xr === null ||
        yr === null
      )
        return false;

      const rx = Math.abs(rxRaw);
      const ry = Math.abs(ryRaw);
      // degree → radian 변환
      const xRotation = xRotDeg * (Math.PI / 180);
      const ax = cmd === 'a' ? state.cx + xr : xr;
      const ay = cmd === 'a' ? state.cy + yr : yr;

      // zero radius는 endpoint로의 직선으로 변환한다
      if (rx === 0 || ry === 0) {
        result.push({ kind: 'line', x: ax, y: ay });
        state.cx = ax;
        state.cy = ay;
        state.shorthand = NO_SHORTHAND;
        return true;
      }

      // start == end인 arc는 no-op (command push 없음)
      if (ax === state.cx && ay === state.cy) {
        state.shorthand = NO_SHORTHAND;
        return true;
      }

      result.push({ kind: 'arc', rx, ry, xRotation, largeArc, sweep, x: ax, y: ay });
      state.cx = ax;
      state.cy = ay;
      state.shorthand = NO_SHORTHAND;
      return true;
    }

    default:
      // 지원하지 않는 command
      return false;
  }
}

/**
 * token 배열을 순회하여 canonical absolute PathCommand[]로 변환한다.
 *
 * strict의 `parseTokens`와 달리, 오류 발생 시 전체 실패 대신 해당 지점까지의
 * 결과를 반환한다 (partial success). unknown command letter나 processCommand 실패
 * 시 그 지점에서 break하고 지금까지 수집된 result를 반환한다.
 *
 * null을 반환하지 않는다 — 0개 command 파싱 결과도 빈 배열로 반환한다.
 */
export function parseTokensLoose(tokens: string[]): PathCommand[] {
  // loose 모드는 항상 배열을 반환한다 — null 분기는 strict 전용
  return parseTokensCore(tokens, 'loose') ?? [];
}
