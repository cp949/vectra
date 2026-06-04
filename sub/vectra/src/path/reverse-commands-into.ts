import type { PathCommand } from '../types/index';

/**
 * reverseCommandsInto 옵션.
 *
 * 현재 정책 knob이 없다. path2.md 확정 surface가 `options?` 파라미터를
 * signature로 고정했으므로 타입을 유지한다. 향후 정책 옵션은 이 타입에 추가한다.
 */
export interface ReverseCommandsOptions {
  /** 예약됨. 현재 동작에 영향을 주지 않는다. */
  readonly reserved?: never;
}

/** 한 subpath의 reverse 대상 정보. */
interface Subpath {
  /** subpath 시작점 (MoveCommand 위치) */
  startX: number;

  /** subpath 시작점 y */
  startY: number;

  /** Move를 제외한 drawing command 순서 */
  draws: Exclude<PathCommand, { kind: 'move' } | { kind: 'close' }>[];

  /** CloseCommand로 끝나는 subpath인지 */
  closed: boolean;
}

/** subpath 단위로 분리한다. 첫 command가 Move가 아니면 암묵적 origin move를 가정한다. */
function splitForReverse(commands: readonly PathCommand[]): Subpath[] {
  const subpaths: Subpath[] = [];
  let current: Subpath | null = null;

  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      current = { startX: cmd.x, startY: cmd.y, draws: [], closed: false };
      subpaths.push(current);
      continue;
    }

    if (current === null) {
      // normalizeCommandsInto 정책과 일치: 암묵적 origin move
      current = { startX: 0, startY: 0, draws: [], closed: false };
      subpaths.push(current);
    }

    if (cmd.kind === 'close') {
      current.closed = true;
      continue;
    }

    current.draws.push(cmd);
  }

  return subpaths;
}

/**
 * path를 반대 방향으로 뒤집어 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * subpath 순서를 뒤집고, 각 subpath 내부 command도 반전한다. subpath 구조와
 * Close 의미를 보존한다.
 *
 * - reverse 후 새 subpath start는 원래 subpath의 마지막 draw endpoint이다.
 * - CloseCommand가 있는 subpath는 반전 후에도 CloseCommand로 닫는다. 원래
 *   `M→L→L→Z`는 반전 후에도 `M→L→L→Z` 형태이며, 반전된 시작 Move와 종료
 *   CloseCommand가 원래 implicit close edge의 역방향을 표현한다. 따라서
 *   재반전하면 정규화된 원본과 같다 (reverse∘reverse = identity).
 * - cubic은 control point 순서를 swap, quadratic은 control point를 유지하며
 *   endpoint만 이전 anchor로 바꾼다. arc는 endpoint를 바꾸고 sweep flag를 flip한다.
 * - Move만 있는 single point subpath는 그대로 둔다.
 * - 첫 command가 MoveCommand가 아니면 암묵적 origin move를 가정한다.
 * - empty commands → out을 clear만 하고 반환한다.
 * - 결과 command는 새 object다. 입력 command reference는 보존하지 않는다.
 * - out과 commands가 같은 배열이어도 안전하다 (clear 전에 subpath를 분해한다).
 *
 * @param out 반전 결과를 기록할 mutable PathCommand 배열
 * @param commands 반전할 입력 command sequence (absolute 전제)
 * @param _options 예약된 옵션. 현재 동작에 영향을 주지 않는다.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function reverseCommandsInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  _options?: ReverseCommandsOptions
): Out {
  // clear 전에 분해해 aliasing(out === commands)을 안전하게 처리
  const subpaths = commands.length === 0 ? [] : splitForReverse(commands);

  out.length = 0;

  // subpath 순서를 뒤집어 출력
  for (let s = subpaths.length - 1; s >= 0; s--) {
    const sp = subpaths[s];

    if (sp.draws.length === 0) {
      // Move만 있는 single point subpath → 그대로
      out.push({ kind: 'move', x: sp.startX, y: sp.startY } as Out[number]);
      continue;
    }

    // 새 시작점 = 원래 마지막 draw endpoint
    const last = sp.draws[sp.draws.length - 1];
    out.push({ kind: 'move', x: last.x, y: last.y } as Out[number]);

    // draw를 역순으로 순회. draw i는 prevPoint(i) → draws[i].endpoint를 그린다.
    // 반전 시 draws[i]는 draws[i].endpoint → prevPoint(i)로 향한다.
    for (let i = sp.draws.length - 1; i >= 0; i--) {
      const d = sp.draws[i];
      // i번째 draw의 시작점 = i-1번째 endpoint, 또는 subpath start
      const prevX = i === 0 ? sp.startX : sp.draws[i - 1].x;
      const prevY = i === 0 ? sp.startY : sp.draws[i - 1].y;

      if (d.kind === 'line') {
        out.push({ kind: 'line', x: prevX, y: prevY } as Out[number]);
      } else if (d.kind === 'quadratic') {
        out.push({ kind: 'quadratic', x1: d.x1, y1: d.y1, x: prevX, y: prevY } as Out[number]);
      } else if (d.kind === 'cubic') {
        // control point 순서 swap
        out.push({ kind: 'cubic', x1: d.x2, y1: d.y2, x2: d.x1, y2: d.y1, x: prevX, y: prevY } as Out[number]);
      } else {
        // arc: endpoint를 시작점으로, sweep 방향 flip
        out.push({
          kind: 'arc',
          rx: d.rx,
          ry: d.ry,
          xRotation: d.xRotation,
          largeArc: d.largeArc,
          sweep: !d.sweep,
          x: prevX,
          y: prevY,
        } as Out[number]);
      }
    }

    if (sp.closed) {
      out.push({ kind: 'close' } as Out[number]);
    }
  }

  return out;
}
