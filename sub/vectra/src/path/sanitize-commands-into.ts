import type { PathCommand } from '../types/index';
import { removeCollinearCommandsInto } from './remove-collinear-commands-into';

/** sanitize 옵션. */
export interface SanitizeCommandsOptions {
  /** 연속된 동일 endpoint drawing command를 제거한다. 기본값 false. */
  removeDuplicates?: boolean;
  /** 직선 구간 collinear 중간 LineCommand를 제거한다. 기본값 false. */
  removeCollinear?: boolean;
  /**
   * duplicate / collinear 판정 tolerance.
   *
   * - `removeDuplicates`: 직전 endpoint와의 |Δx|, |Δy|가 모두 tolerance 이하면 duplicate로 본다.
   * - `removeCollinear`: `removeCollinearCommandsInto`의 angleTolerance(radian)로 사용한다.
   *
   * 기본값 `1e-10` (`removeCollinearCommandsInto` 기본값과 일치).
   */
  tolerance?: number;
}

/** drawing endpoint command의 끝점 좌표를 반환한다. close/move는 caller가 별도로 처리한다. */
function endpointOf(cmd: PathCommand): { x: number; y: number } | undefined {
  if (cmd.kind === 'line' || cmd.kind === 'quadratic' || cmd.kind === 'cubic' || cmd.kind === 'arc') {
    return { x: cmd.x, y: cmd.y };
  }
  return undefined;
}

/**
 * commands를 정리하여 out에 기록하고 out을 반환한다.
 *
 * cleanup canonical facade. options 조합으로 duplicate / collinear 제거를 켜고 끈다.
 * 옵션이 모두 false / 미지정이면 입력 command를 그대로 복사한다 (`out.length = 0` 후 push).
 *
 * - `removeDuplicates`: drawing command(`line`/`quadratic`/`cubic`/`arc`)의 끝점이 직전 current
 *   point와 `|Δx|, |Δy| ≤ tolerance`이면 그 command를 제거한다. `MoveCommand`는 subpath 경계라
 *   대상에서 제외한다. `CloseCommand`는 subpath closure semantics를 유지하기 위해 보존한다.
 * - `removeCollinear`: 입력을 `removeCollinearCommandsInto`에 위임해 collinear LineCommand 중간점을
 *   제거한다. 위임 함수 동작과 동일하며 `tolerance`는 `angleTolerance`로 전달된다.
 * - 두 옵션이 동시에 true이면 duplicate 제거를 먼저 적용한 뒤 collinear 제거를 적용한다.
 * - `out.length = 0` 후 push 방식으로 채운다.
 * - `out`과 `commands`가 같은 배열이어도 안전하다 (aliasing 허용).
 * - empty commands → out clear만.
 * - non-finite 좌표는 비교식이 false로 떨어져 그대로 보존된다. throw 없음.
 *
 * topology 판단, self-intersection 정리, subpath reorder 같은 topology-level cleanup은
 * 수행하지 않는다.
 *
 * @param out cleanup 결과를 기록할 mutable PathCommand 배열
 * @param commands 정리할 입력 command sequence (absolute 전제)
 * @param options removeDuplicates / removeCollinear / tolerance
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function sanitizeCommandsInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  options?: SanitizeCommandsOptions
): Out {
  const removeDuplicates = options?.removeDuplicates ?? false;
  const removeCollinear = options?.removeCollinear ?? false;
  const tolerance = options?.tolerance ?? 1e-10;

  // aliasing 대비: out === commands인 경우 clear 전에 snapshot
  const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;

  out.length = 0;

  if (snapshot.length === 0) {
    return out;
  }

  // 1단계: 입력을 reference 그대로 또는 duplicate 제거 적용해 stage1 array로 모은다.
  let stage1: PathCommand[];
  if (removeDuplicates) {
    stage1 = [];
    // 직전 current point 추적. 첫 Move가 없으면 origin(0,0) 가정.
    let curX = 0;
    let curY = 0;
    let prevWasMove = false;
    let subX = 0;
    let subY = 0;
    let subpathOpen = false;
    for (const cmd of snapshot) {
      if (cmd.kind === 'move') {
        stage1.push(cmd);
        curX = cmd.x;
        curY = cmd.y;
        subX = cmd.x;
        subY = cmd.y;
        prevWasMove = true;
        subpathOpen = false;
        continue;
      }
      if (cmd.kind === 'close') {
        stage1.push(cmd);
        // close 후 current = subpath start (`forEachDrawSegment` 정책 일치)
        if (!prevWasMove && subpathOpen) {
          curX = subX;
          curY = subY;
        }
        subpathOpen = false;
        prevWasMove = false;
        continue;
      }
      const ep = endpointOf(cmd);
      // ep는 drawing command에서만 정의된다. 위 두 분기에서 close/move를 이미 처리했으므로
      // 여기서는 항상 line/quadratic/cubic/arc이며 ep가 정의된다.
      if (ep !== undefined && Math.abs(ep.x - curX) <= tolerance && Math.abs(ep.y - curY) <= tolerance) {
        // duplicate: drop. current point는 그대로.
        prevWasMove = false;
        continue;
      }
      stage1.push(cmd);
      if (!subpathOpen) {
        subX = curX;
        subY = curY;
        subpathOpen = true;
      }
      curX = (cmd as { x: number }).x;
      curY = (cmd as { y: number }).y;
      prevWasMove = false;
    }
  } else {
    stage1 = snapshot.slice();
  }

  // 2단계: collinear 제거 위임 또는 그대로 out에 push.
  if (removeCollinear) {
    removeCollinearCommandsInto(out, stage1, { angleTolerance: tolerance });
  } else {
    for (const cmd of stage1) {
      out.push(cmd as Out[number]);
    }
  }

  return out;
}
